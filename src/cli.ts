#!/usr/bin/env node

import { agenttools } from "./agenttools";
import { packagemanager } from "./packagemanager";
import { runner } from "./runner";

// console.log(JSON.stringify(process.env.PATH, null, 2));
const os = require('os');
const path = require('path');
const prompts = require('./prompt-sync')();
// @ts-ignore
const fs = require('fs');
const childProcess = require('child_process');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var assistantConfig: any = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
const args = process.argv.slice(2);
process.on('SIGINT', () => { process.exit(0) })
process.on('SIGTERM', () => { process.exit(0) })
process.on('SIGQUIT', () => { process.exit(0) })

let serviceName = "";
let command = "";
let verbose = false;
let service = false;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-noop' || arg === '/noop') {
    process.exit(0);
  } else if (arg === '-v' || arg === '-verbose' || arg === '/v' || arg === '/verbose') {
    console.log("Verbose mode enabled.");
    verbose = true;
  } else if (arg === '-svc' || arg === "-svr" || arg === '-service' || arg === '/svc' || arg === '/service') {
    service = true;
  } else if (arg === 'install' || arg === '/install' || arg === '-install' || arg === 'i' || arg === '/i' || arg === '-i') {
    command = 'install';
  } else if (arg === 'uninstall' || arg === '/uninstall' || arg === '-uninstall' || arg === 'u' || arg === '/u' || arg === '-u') {
    command = 'uninstall';
  } else if (arg === 'remove' || arg === '/remove' || arg === '-remove') {
    command = 'uninstall';
  } else if (arg === '-servicename' || arg === '/servicename') {
    serviceName = args[i + 1];
  } else if (arg.startsWith('-servicename=') || arg.startsWith('/servicename=')) {
    serviceName = arg.split('=')[1];
  } else if (!serviceName) {
    serviceName = arg;
  }
}
function Run(cmd: string) {
  try {
    console.log(cmd);
    const output = childProcess.execSync(cmd).toString();
    if (verbose) console.log(output);
    return output
  } catch (error) {
    return error.toString();
  }
}
function RunStreamed(command: string, args: string[], exit: boolean) {
  const child = childProcess.spawn(command, args);
  child.stdout.on('data', (data: any) => {
    if (data == null) return;
    var s = data.toString().replace(/\n$/, "");
    console.log(s);
  });
  child.stderr.on('data', (data: any) => {
    console.error(data);
  });
  child.on('close', (code: any) => {
    console.log(`child process exited with code ${code}`);
    if (exit) process.exit(0);
  });
}
function installService(svcName: string, serviceName: string, script: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    let scriptPath = path.join(__dirname, script);
    if (!fs.existsSync(scriptPath)) {
      scriptPath = path.join(__dirname, "dist", script);
    }
    if (!fs.existsSync(scriptPath)) {
      console.log("Failed locating " + script)
      reject();
      return;
    }
    if (os.platform() === 'win32') {
      const Service = require('node-windows').Service;

      const svc = new Service({
        name: serviceName,
        description: serviceName,
        script: scriptPath,
        env: [{ name: "apiurl", value: assistantConfig.apiurl }, { name: "jwt", value: assistantConfig.jwt }]
      });
      console.log("Install using " + scriptPath)
      svc.on('alreadyinstalled', () => {
        console.log("Service already installed");
        svc.start();
      });
      svc.on('install', () => {
        console.log(`Service "${serviceName}" installed successfully.`);
        svc.start();
      });
      svc.on('start', () => {
        console.log(`Service "${serviceName}" started successfully.`);
        resolve();
      });
      svc.on('error', () => {
        reject();
      });
      svc.on('stop', () => {
        reject();
      });
      // svc.on('install', () => { console.log("Service installed"); });
      svc.on('alreadyinstalled', () => { console.log("Service already installed"); });
      svc.on('invalidinstallation', () => { console.log("Service invalid installation"); });
      svc.on('uninstall', () => { console.log("Service uninstalled"); });
      svc.on('alreadyuninstalled', () => { console.log("Service already uninstalled"); });
      svc.on('start', () => { console.log("Service started"); });
      svc.on('stop', () => { console.log("Service stopped"); });
      svc.on('error', () => { console.log("Service error"); });
      svc.install();
    } else if ( process.platform === 'darwin' ) {

      const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${serviceName}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${runner.findNodePath()}</string>
    <string>${scriptPath}</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
  <key>apiurl</key>
  <string>${assistantConfig.apiurl}</string>
  <key>jwt</key>
  <string>${assistantConfig.jwt}</string>
  <key>NODE</key>
  <string>production</string>
  <key>PATH</key>
  <string>${process.env.PATH}</string>
</dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/var/log/nodeagent.log</string>
  <key>StandardErrorPath</key>
  <string>/var/log/nodeagent.log</string>
  </dict>
</plist>`;
      const plistPath = `/Library/LaunchDaemons/${serviceName}.plist`;
      if (fs.existsSync(plistPath)) {
        await UninstallService(svcName, serviceName);
      }
      fs.writeFileSync(plistPath, plist);


      if (verbose) console.log(`Service file created at "${plistPath}".`);
      Run(`launchctl load ${plistPath}`);
      console.log(`Service "${serviceName}" installed successfully.`);
      Run(`launchctl start ${serviceName}`);
      resolve();
    } else {
      const svcPath = `/etc/systemd/system/${svcName}.service`;
      if (fs.existsSync(svcPath)) {
        await UninstallService(svcName, serviceName);
      }
      var nodepath = runner.findNodePath();
      const svcContent = `
        [Unit]
        Description=${serviceName}
        After=network.target
  
        [Service]
        Type=simple
        ExecStart=${nodepath} ${scriptPath}
        Environment=NODE_ENV=production
        Environment=PATH=${process.env.PATH}
        Environment=apiurl=${assistantConfig.apiurl}
        Environment=jwt=${assistantConfig.jwt}        
        
        Restart=on-failure
  
        [Install]
        WantedBy=multi-user.target
     `;
      fs.writeFileSync(svcPath, svcContent);
      if (verbose) console.log(`Service file created at "${svcPath}".`);
      Run(`systemctl enable ${serviceName}.service`)
      Run(`systemctl start ${serviceName}.service`)

      console.log(`Service "${serviceName}" installed successfully.`);
      console.log(`sudo systemctl status ${svcName}.service\nsudo journalctl -efu ${svcName}`)
      resolve();
    }
  });
}

function UninstallService(svcName: string, serviceName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (os.platform() === 'win32') {
      const Service = require('node-windows').Service;
      let scriptPath = path.join(__dirname, "agent.js");
      if (!fs.existsSync(scriptPath)) {
        scriptPath = path.join(__dirname, "dist", "agent.js");
      }
      const svc = new Service({
        name: serviceName,
        description: serviceName,
        script: scriptPath
      });
      svc.on('uninstall', function () {
        console.log(`Service "${serviceName}" uninstalled successfully.`);
        resolve();
      });
      svc.on('alreadyuninstalled', function () {
        console.log(`Service "${serviceName}" already uninstalled.`);
        resolve();
      });
      svc.on('error', function () {
        console.log(`Service "${serviceName}" uninstall failed.`);
        reject();
      });

      svc.uninstall();
    } else if ( process.platform === 'darwin' ) {
      const plistPath = `/Library/LaunchDaemons/${serviceName}.plist`;
      if(fs.existsSync(plistPath)) {
        console.log(`Unload service at "${plistPath}".`);
        Run(`launchctl stop ${plistPath}`);
        Run(`launchctl unload ${plistPath}`);
        // delete plist file
        fs.unlinkSync(plistPath);  
        console.log(`Service "${serviceName}" uninstalled successfully.`);
      } else {
        console.log(`Service "${serviceName}" already uninstalled.`);
      }
      resolve();
  } else {
      const svcPath = `/etc/systemd/system/${svcName}.service`;
      if (fs.existsSync(svcPath)) {
        Run(`systemctl stop ${serviceName}.service`)
        Run(`systemctl disable ${serviceName}.service`)
        fs.unlinkSync(svcPath);
        console.log(`Service file removed at "${svcPath}".`);
      }
      console.log(`Service "${serviceName}" uninstalled successfully.`);
      resolve();
    }
  });
}

async function main() {
  if (serviceName == "" || serviceName == null) {
    serviceName = "nodeagent"
  }
  if (service) {
    let nodepath = runner.findNodePath()
    let scriptPath = path.join(__dirname, "agent.js");
    console.log("run " + scriptPath)
    RunStreamed(nodepath, [scriptPath], true)
    return;
  } else {
    console.log("Not running as service")
  }
  const home_configfile = path.join(os.homedir(), ".openiap", "config.json")
  const win32_configfile = path.join("C:\\WINDOWS\\system32\\config\\systemprofile\\", ".openiap", "config.json")
  const darwin_configfile = "/var/root/.openiap/config.json"
  if (command === 'install' || command == "") {
    if (fs.existsSync(win32_configfile)) {
      console.log("Parsing config from " + win32_configfile)
      assistantConfig = JSON.parse(fs.readFileSync(win32_configfile, "utf8"));
    } else if (fs.existsSync(darwin_configfile)) {
      console.log("Parsing config from " + darwin_configfile)
      assistantConfig = JSON.parse(fs.readFileSync(darwin_configfile, "utf8"));
    } else if (fs.existsSync(home_configfile)) {
      console.log("Parsing config from " + home_configfile)
      assistantConfig = JSON.parse(fs.readFileSync(home_configfile, "utf8"));
    }
    assistantConfig.apiurl = prompts(`apiurl (Enter for ${assistantConfig.apiurl})? `, assistantConfig.apiurl);
    if (assistantConfig.apiurl == null) process.exit(0);

    if (assistantConfig.jwt != null && assistantConfig.jwt != "") {
      var reuse = prompts(`Reuse existing token (Enter for yes)? (yes/no) `, { value: "yes", autocomplete: () => ["yes", "no"] });
      if (reuse == null) process.exit(0);
      if (reuse == "no") {
        assistantConfig.jwt = "";
      }

    }

    if (assistantConfig.jwt == null || assistantConfig.jwt == "") {
      const [tokenkey, signinurl] = await agenttools.AddRequestToken(assistantConfig.apiurl)
      console.log(`Please open ${signinurl} in your browser and login with your OpenIAP account`)
      const jwt = await agenttools.WaitForToken(assistantConfig.apiurl, tokenkey);
      assistantConfig.jwt = jwt;
    }
    // if (!fs.existsSync(path.join(os.homedir(), ".openiap"))) fs.mkdirSync(path.join(os.homedir(), ".openiap"), { recursive: true });
    // fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(assistantConfig));

    console.log(`Installing service "${serviceName}"...`);
    await installService(serviceName, serviceName, 'agent.js');
  } else if (command === 'uninstall') {
    console.log(`Uninstalling service "${serviceName}"...`);
    await UninstallService(serviceName, serviceName);
  }
  process.exit(0);
}
main();