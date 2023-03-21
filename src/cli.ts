#!/usr/bin/env node

import { agenttools } from "./agenttools";

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

let serviceName = "";
let command = "";
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === 'install' || arg === '/install' || arg === '-install' || arg === 'i' || arg === '/i' || arg === '-i') {
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

function installService(svcName: string, serviceName: string, script: string): void {
  let scriptPath = path.join(__dirname, script);
  if(!fs.existsSync(scriptPath)) {
    scriptPath = path.join(__dirname, "dist", script);
  }
  if(!fs.existsSync(scriptPath)) {
    console.log("Failed locating " + script)
    return;
  }

  if (os.platform() === 'win32') {
    const svcDescription = `${serviceName}`;
    const svcPath = `node ${scriptPath}`;
    const svcRegPath = `HKLM\\SYSTEM\\CurrentControlSet\\Services\\${svcName}`;

    const cmd = `sc create "${svcName}" binPath="${svcPath}" DisplayName="${serviceName}" Description="${svcDescription}" start=auto`;
    const output = childProcess.execSync(cmd).toString();
    console.log(output);

    const regCmd = `reg add ${svcRegPath} /v DependOnService /t REG_MULTI_SZ /d EventLog /f`;
    const regOutput = childProcess.execSync(regCmd).toString();
    console.log(regOutput);

    console.log(`Service "${serviceName}" installed successfully.`);
  } else {
    const svcPath = `/etc/systemd/system/${svcName}.service`;
    const svcContent = `
      [Unit]
      Description=${serviceName}
      After=network.target

      [Service]
      Type=simple
      ExecStart=/usr/bin/node ${scriptPath}
      
      Restart=on-failure

      [Install]
      WantedBy=multi-user.target
   `;

    fs.writeFileSync(svcPath, svcContent);
    console.log(`Service file created at "${svcPath}".`);

    const cmd = `systemctl enable ${serviceName}.service`;
    const output = childProcess.execSync(cmd).toString();
    console.log(output);

    try {
      const cmd2 = `systemctl start ${serviceName}.service`;
      const output2 = childProcess.execSync(cmd2).toString();
      console.log(output2);
    } catch (error) {
    }


    console.log(`Service "${serviceName}" installed successfully.`);
    console.log(`to validate use\nsudo systemctl status ${svcName}.service\nsudo journalctl -efu ${svcName}`)
  }
}

function UninstallService(svcName:string, serviceName:string):void {
  if (os.platform() === 'win32') {
    const svcRegPath = `HKLM\\SYSTEM\\CurrentControlSet\\Services\\${svcName}`;

    const cmd = `sc delete "${svcName}"`;
    const output = childProcess.execSync(cmd).toString();
    console.log(output);

    const regCmd = `reg delete ${svcRegPath} /f`;
    const regOutput = childProcess.execSync(regCmd).toString();
    console.log(regOutput);

    console.log(`Service "${serviceName}" uninstalled successfully.`);
  } else {
    const svcPath = `/etc/systemd/system/${svcName}.service`;

    try {
      const cmd2 = `systemctl stop ${serviceName}.service`;
      const output2 = childProcess.execSync(cmd2).toString();
      console.log(output2);
    } catch (error) {
    }

    const cmd = `systemctl disable ${serviceName}.service`;
    const output = childProcess.execSync(cmd).toString();
    console.log(output);

    fs.unlinkSync(svcPath);
    console.log(`Service file removed at "${svcPath}".`);

    console.log(`Service "${serviceName}" uninstalled successfully.`);
  }
}

async function main() {
  if(serviceName == "" || serviceName == null) {
    serviceName = "nodeagent"
  }
  if (command === 'install' || command == "") {
    var configfile = path.join(os.homedir(), ".openiap", "config.json");
    console.log("Working with " + configfile)
    var assistentConfig: any = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
    if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
      assistentConfig = require(path.join(os.homedir(), ".openiap", "config.json"));
    }
    assistentConfig.apiurl = prompts(`apiurl (Enter for ${assistentConfig.apiurl})? `, assistentConfig.apiurl);
    if(assistentConfig.apiurl == null) process.exit(0);

    if(assistentConfig.jwt != null && assistentConfig.jwt != "") {
      var reuse = prompts(`Reuse existing token (Enter for yes)? (yes/no) `, {value: "yes", autocomplete: ()=> ["yes", "no"]});
      if(reuse == null) process.exit(0);
      if(reuse == "no") {
        assistentConfig.jwt = "";
      }
  
    }

    if(assistentConfig.jwt == null || assistentConfig.jwt == "") {
      const [tokenkey, signinurl] = await agenttools.AddRequestToken(assistentConfig.apiurl)
      console.log(`Please open ${signinurl} in your browser and login with your OpenIAP account`)
      const jwt = await agenttools.WaitForToken(assistentConfig.apiurl, tokenkey);
      assistentConfig.jwt = jwt;
    }
    if (!fs.existsSync(path.join(os.homedir(), ".openiap"))) fs.mkdirSync(path.join(os.homedir(), ".openiap"));
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