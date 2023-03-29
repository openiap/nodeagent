#!/usr/bin/env node

import { agenttools } from "./agenttools";
import { packagemanager } from "./packagemanager";
import { runner } from "./runner";

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
const args = process.argv.slice(2);
process.on('SIGINT', ()=> { process.exit(0) })
process.on('SIGTERM', ()=> { process.exit(0) })
process.on('SIGQUIT', ()=> { process.exit(0) })

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
    if(verbose) console.log(output);
    return output
  } catch (error) {
    return error.toString();
  }
}
function RunStreamed(command: string, args: string[],exit:boolean) {
  const child = childProcess.spawn(command, args);
  child.stdout.on('data', (data:any) => {
    if(data == null) return;
    var s = data.toString().replace(/\n$/, "");
    console.log(s);
  });
  child.stderr.on('data', (data:any) => {
    console.error(data);
  });
  child.on('close', (code:any) => {
    console.log(`child process exited with code ${code}`);
    if(exit) process.exit(0);
  });
}
function installService(svcName: string, serviceName: string, script: string): void {
  let scriptPath = path.join(__dirname, script);
  if (!fs.existsSync(scriptPath)) {
    scriptPath = path.join(__dirname, "dist", script);
  }
  if (!fs.existsSync(scriptPath)) {
    console.log("Failed locating " + script)
    return;
  }

  if (os.platform() === 'win32') {
    const svcDescription = `${serviceName}`;
    const svcPath = `node ${scriptPath}`;
    const svcRegPath = `HKLM\\SYSTEM\\CurrentControlSet\\Services\\${svcName}`;
    
    Run(`sc create "${svcName}" binPath="${svcPath}" DisplayName="${serviceName}" Description="${svcDescription}" start=auto`)
    Run(`reg add ${svcRegPath} /v DependOnService /t REG_MULTI_SZ /d EventLog /f`)
    Run(`net start ${svcName}`)
    console.log(`Service "${serviceName}" installed successfully.`);
  } else {
    const svcPath = `/etc/systemd/system/${svcName}.service`;
    if(fs.existsSync(svcPath)) {
      UninstallService(svcName, serviceName);
    }
    var nodepath = runner.findNodePath();
    const svcContent = `
      [Unit]
      Description=${serviceName}
      After=network.target

      [Service]
      Type=simple
      ExecStart=${nodepath} ${scriptPath}
      
      Restart=on-failure

      [Install]
      WantedBy=multi-user.target
   `;
    fs.writeFileSync(svcPath, svcContent);
    if(verbose) console.log(`Service file created at "${svcPath}".`);
    Run(`systemctl enable ${serviceName}.service`)
    Run(`systemctl start ${serviceName}.service`)

    console.log(`Service "${serviceName}" installed successfully.`);
    console.log(`sudo systemctl status ${svcName}.service\nsudo journalctl -efu ${svcName}`)
  }
}

function UninstallService(svcName: string, serviceName: string): void {
  if (os.platform() === 'win32') {
    const svcRegPath = `HKLM\\SYSTEM\\CurrentControlSet\\Services\\${svcName}`;

    Run(`net stop ${svcName}`)
    Run(`sc delete "${svcName}"`)
    Run(`reg delete ${svcRegPath} /f`)
    console.log(`Service "${serviceName}" uninstalled successfully.`);
  } else {
    const svcPath = `/etc/systemd/system/${svcName}.service`;
    if(fs.existsSync(svcPath)) {
      Run(`systemctl stop ${serviceName}.service`)
      Run(`systemctl disable ${serviceName}.service`)
      fs.unlinkSync(svcPath);
      console.log(`Service file removed at "${svcPath}".`);
    }
    console.log(`Service "${serviceName}" uninstalled successfully.`);
  }
}

async function main() {
  if (serviceName == "" || serviceName == null) {
    serviceName = "nodeagent"
  }
  if (service) {
    let nodepath = runner.findNodePath()
    let scriptPath = path.join(__dirname, "agent.js");
    console.log("run " + scriptPath)
    RunStreamed(nodepath,[scriptPath], true)
    return;
  } else {
    console.log("Not running as service")
  }
  if (command === 'install' || command == "") {
    var configfile = path.join(os.homedir(), ".openiap", "config.json");
    console.log("Working with " + configfile)
    var assistentConfig: any = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
    if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
      assistentConfig = require(path.join(os.homedir(), ".openiap", "config.json"));
    }
    assistentConfig.apiurl = prompts(`apiurl (Enter for ${assistentConfig.apiurl})? `, assistentConfig.apiurl);
    if (assistentConfig.apiurl == null) process.exit(0);

    if (assistentConfig.jwt != null && assistentConfig.jwt != "") {
      var reuse = prompts(`Reuse existing token (Enter for yes)? (yes/no) `, { value: "yes", autocomplete: () => ["yes", "no"] });
      if (reuse == null) process.exit(0);
      if (reuse == "no") {
        assistentConfig.jwt = "";
      }

    }

    if (assistentConfig.jwt == null || assistentConfig.jwt == "") {
      const [tokenkey, signinurl] = await agenttools.AddRequestToken(assistentConfig.apiurl)
      console.log(`Please open ${signinurl} in your browser and login with your OpenIAP account`)
      const jwt = await agenttools.WaitForToken(assistentConfig.apiurl, tokenkey);
      assistentConfig.jwt = jwt;
    }
    if (!fs.existsSync(path.join(os.homedir(), ".openiap"))) fs.mkdirSync(path.join(os.homedir(), ".openiap"), { recursive: true });
    fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(assistentConfig));

    console.log(`Installing service "${serviceName}"...`);
    installService(serviceName, serviceName, 'agent.js');
  } else if (command === 'uninstall') {
    console.log(`Uninstalling service "${serviceName}"...`);
    UninstallService(serviceName, serviceName);
  }
  process.exit(0);
}
main();