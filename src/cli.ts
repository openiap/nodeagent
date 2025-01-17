#!/usr/bin/env node

import { openiap } from "@openiap/nodeapi";
import { agent } from "./agent";
import { agenttools } from "./agenttools";
import { packagemanager } from "./packagemanager";
import { runner } from "./runner";
import { FindFreePort } from "./PortMapper";
import { Logger } from "./Logger";

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
let hostport:string = null;
let localport:string = null;
let myproject = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
Logger.instrumentation.info(myproject.name + "@" + myproject.version, {});

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-noop' || arg === '/noop') {
    process.exit(0);
  } else if (arg === '-v' || arg === '-verbose' || arg === '/v' || arg === '/verbose') {
    Logger.instrumentation.info("Verbose mode enabled.", {});
    verbose = true;
  } else if (arg === '-svc' || arg === "-svr" || arg === '-service' || arg === '/svc' || arg === '/service') {
    service = true;
  } else if (arg === '-p' || arg === '/p') {
    localport = args[i + 1];
  } else if (arg.startsWith('-p=') || arg.startsWith('/p=')) {
    localport = arg.split('=')[1];
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
  } else if (arg.indexOf(":") > -1) {
    hostport = arg;
} else if (!serviceName) {
    serviceName = arg;
  }
}
function Run(cmd: string) {
  try {
    Logger.instrumentation.info(cmd, {});
    const output = childProcess.execSync(cmd).toString();
    if (verbose) Logger.instrumentation.info(output, {});
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
    Logger.instrumentation.info(s, {});
  });
  child.stderr.on('data', (data: any) => {
    Logger.instrumentation.error(data, {});
  });
  child.on('close', (code: any) => {
    Logger.instrumentation.info(`child process exited with code ${code}`, {});
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
      Logger.instrumentation.info("Failed locating " + script, {svcName, serviceName})
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
      Logger.instrumentation.info("Install using " + scriptPath, {svcName, serviceName})
      svc.on('alreadyinstalled', () => {
        Logger.instrumentation.info("Service already installed", {svcName, serviceName});
        svc.start();
      });
      svc.on('install', () => {
        Logger.instrumentation.info(`Service "${serviceName}" installed successfully.`, {svcName, serviceName});
        svc.start();
      });
      svc.on('start', () => {
        Logger.instrumentation.info(`Service "${serviceName}" started successfully.`, {svcName, serviceName});
        resolve();
      });
      svc.on('error', () => {
        reject();
      });
      svc.on('stop', () => {
        reject();
      });
      // svc.on('install', () => { Logger.instrumentation.info("Service installed"); });
      svc.on('alreadyinstalled', () => { Logger.instrumentation.info("Service already installed", {svcName, serviceName}); });
      svc.on('invalidinstallation', () => { Logger.instrumentation.info("Service invalid installation", {svcName, serviceName}); });
      svc.on('uninstall', () => { Logger.instrumentation.info("Service uninstalled", {svcName, serviceName}); });
      svc.on('alreadyuninstalled', () => { Logger.instrumentation.info("Service already uninstalled", {svcName, serviceName}); });
      svc.on('start', () => { Logger.instrumentation.info("Service started", {svcName, serviceName}); });
      svc.on('stop', () => { Logger.instrumentation.info("Service stopped", {svcName, serviceName}); });
      svc.on('error', () => { Logger.instrumentation.info("Service error", {svcName, serviceName}); });
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


      if (verbose) Logger.instrumentation.info(`Service file created at "${plistPath}".`, {svcName, serviceName});
      Run(`launchctl load ${plistPath}`);
      Logger.instrumentation.info(`Service "${serviceName}" installed successfully.`, {svcName, serviceName});
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
      if (verbose) Logger.instrumentation.info(`Service file created at "${svcPath}".`, {svcName, serviceName});
      Run(`systemctl enable ${serviceName}.service`)
      Run(`systemctl start ${serviceName}.service`)

      Logger.instrumentation.info(`Service "${serviceName}" installed successfully.`, {svcName, serviceName});
      Logger.instrumentation.info(`sudo systemctl status ${svcName}.service\nsudo journalctl -efu ${svcName}`, {svcName, serviceName})
      resolve();
    }
  });
}

function UninstallService(svcName: string, serviceName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (os.platform() === 'win32') {
      const Service = require('node-windows').Service;
      let scriptPath = path.join(__dirname, "runagent.js");
      if (!fs.existsSync(scriptPath)) {
        scriptPath = path.join(__dirname, "dist", "runagent.js");
      }
      const svc = new Service({
        name: serviceName,
        description: serviceName,
        script: scriptPath
      });
      svc.on('uninstall', function () {
        Logger.instrumentation.info(`Service "${serviceName}" uninstalled successfully.`, {svcName, serviceName});
        resolve();
      });
      svc.on('alreadyuninstalled', function () {
        Logger.instrumentation.info(`Service "${serviceName}" already uninstalled.`, {svcName, serviceName});
        resolve();
      });
      svc.on('error', function () {
        Logger.instrumentation.info(`Service "${serviceName}" uninstall failed.`, {svcName, serviceName});
        reject();
      });

      svc.uninstall();
    } else if ( process.platform === 'darwin' ) {
      const plistPath = `/Library/LaunchDaemons/${serviceName}.plist`;
      if(fs.existsSync(plistPath)) {
        Logger.instrumentation.info(`Unload service at "${plistPath}".`, {svcName, serviceName});
        Run(`launchctl stop ${plistPath}`);
        Run(`launchctl unload ${plistPath}`);
        // delete plist file
        fs.unlinkSync(plistPath);  
        Logger.instrumentation.info(`Service "${serviceName}" uninstalled successfully.`, {svcName, serviceName});
      } else {
        Logger.instrumentation.info(`Service "${serviceName}" already uninstalled.`, {svcName, serviceName});
      }
      resolve();
  } else {
      const svcPath = `/etc/systemd/system/${svcName}.service`;
      if (fs.existsSync(svcPath)) {
        Run(`systemctl stop ${serviceName}.service`)
        Run(`systemctl disable ${serviceName}.service`)
        fs.unlinkSync(svcPath);
        Logger.instrumentation.info(`Service file removed at "${svcPath}".`, {svcName, serviceName});
      }
      Logger.instrumentation.info(`Service "${serviceName}" uninstalled successfully.`, {svcName, serviceName});
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
    let scriptPath = path.join(__dirname, "runagent.js");
    Logger.instrumentation.info("run " + scriptPath, {serviceName})
    RunStreamed(nodepath, [scriptPath], true)
    return;
  } else if (hostport != null && hostport != "") {
    let port:number = hostport.split(":")[1] as any;
    let portname:string = hostport.split(":")[1];
    let remoteagent = hostport.split(":")[0];
    let localport = port;
    if(hostport.split(":").length > 2) {
      localport = hostport.split(":")[2] as any;
    }
    let uselocalport = localport;
    try {
      uselocalport = await FindFreePort(localport);
    } catch (error) {
      // if port is < 1024 we get an error, then find a random free port over 1024
      uselocalport = await FindFreePort(0);
    }
    if(uselocalport != localport) {
      Logger.instrumentation.info("Port " + localport + " is in use. Using " + uselocalport + " instead.", {serviceName})
      localport = uselocalport;
    }

    if(portname === null || portname === undefined || (portname as any) === "" || remoteagent == null || remoteagent == "") {
      Logger.instrumentation.info("Invalid proxy. Use format <remoteagent>:<remoteport or portname>", {serviceName})
      process.exit(1);
    }
    // is remoteport a number or string ?
    if(portname.match(/^\d+$/)) {
      portname = "PORT" + port;
      port = parseInt(port as any);
    } else {
      port = undefined;
    }
    if(!remoteagent.endsWith("agent")) {
      remoteagent += "agent";
    }
    agent.client = new openiap()
    agent.client.allowconnectgiveup = true;
    agent.client.agent = "nodeagent";
    Logger.instrumentation.info("reloadAndParseConfig", {serviceName})
    agent.reloadAndParseConfig();
    Logger.instrumentation.info("connect", {serviceName})
    await agent.client.connect();
    // Logger.instrumentation.info("ClientPortMapper")
    // const listener = new ClientPortMapper(agent.client, localport, portname, port, remoteagent);
    return;
  } else {
    Logger.instrumentation.info("Not running as service", {serviceName})
  }
  const home_configfile = path.join(packagemanager.homedir(), ".openiap", "config.json")
  const win32_configfile = path.join("C:\\WINDOWS\\system32\\config\\systemprofile\\", ".openiap", "config.json")
  const darwin_configfile = "/var/root/.openiap/config.json"
  if (command === 'install' || command == "") {
    if (fs.existsSync(win32_configfile)) {
      Logger.instrumentation.info("Parsing config from " + win32_configfile, {serviceName})
      assistantConfig = JSON.parse(fs.readFileSync(win32_configfile, "utf8"));
    } else if (fs.existsSync(darwin_configfile)) {
      Logger.instrumentation.info("Parsing config from " + darwin_configfile, {serviceName})
      assistantConfig = JSON.parse(fs.readFileSync(darwin_configfile, "utf8"));
    } else if (fs.existsSync(home_configfile)) {
      Logger.instrumentation.info("Parsing config from " + home_configfile, {serviceName})
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
      Logger.instrumentation.info(`Please open ${signinurl} in your browser and login with your OpenIAP account`, {serviceName})
      const jwt = await agenttools.WaitForToken(assistantConfig.apiurl, tokenkey);
      assistantConfig.jwt = jwt;
    }
    try {
      fs.writeFileSync(home_configfile, JSON.stringify(assistantConfig));
    } catch (error) {
      Logger.instrumentation.error("Error writing config to " + home_configfile + "\n" + error.message, {serviceName})
      
    }

    Logger.instrumentation.info(`Installing service "${serviceName}"...`, {serviceName});
    await installService(serviceName, serviceName, 'runagent.js');
  } else if (command === 'uninstall') {
    Logger.instrumentation.info(`Uninstalling service "${serviceName}"...`, {serviceName});
    await UninstallService(serviceName, serviceName);
  }
  process.exit(0);
}
main();