#!/usr/bin/env node
var os = require('os');
var path = require('path');
var fs = require('fs');
var childProcess = require('child_process');
var args = process.argv.slice(2);
var serviceName = "";
var command = "";
for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === 'install' || arg === '/install' || arg === '-install' || arg === 'i' || arg === '/i' || arg === '-i') {
        command = 'install';
    }
    else if (arg === 'uninstall' || arg === '/uninstall' || arg === '-uninstall' || arg === 'u' || arg === '/u' || arg === '-u') {
        command = 'uninstall';
    }
    else if (arg === 'remove' || arg === '/remove' || arg === '-remove') {
        command = 'uninstall';
    }
    else if (arg === '-servicename' || arg === '/servicename') {
        serviceName = args[i + 1];
    }
    else if (arg.startsWith('-servicename=') || arg.startsWith('/servicename=')) {
        serviceName = arg.split('=')[1];
    }
    else if (!serviceName) {
        serviceName = arg;
    }
}
if (serviceName == "" || serviceName == null) {
    serviceName = "nodeagent";
}
if (command === 'install' || command == "") {
    console.log("Installing service \"".concat(serviceName, "\"..."));
    installService(serviceName, serviceName, 'agent.js');
}
else if (command === 'uninstall') {
    console.log("Uninstalling service \"".concat(serviceName, "\"..."));
    UninstallService(serviceName, serviceName);
}
function installService(svcName, serviceName, script) {
    var scriptPath = path.join(__dirname, script);
    if (!fs.existsSync(scriptPath)) {
        scriptPath = path.join(__dirname, "dist", script);
    }
    if (!fs.existsSync(scriptPath)) {
        console.log("Failed locating " + script);
        return;
    }
    if (os.platform() === 'win32') {
        var svcDescription = "".concat(serviceName);
        var svcPath = "node ".concat(scriptPath);
        var svcRegPath = "HKLM\\SYSTEM\\CurrentControlSet\\Services\\".concat(svcName);
        var cmd = "sc create \"".concat(svcName, "\" binPath=\"").concat(svcPath, "\" DisplayName=\"").concat(serviceName, "\" Description=\"").concat(svcDescription, "\" start=auto");
        var output = childProcess.execSync(cmd).toString();
        console.log(output);
        var regCmd = "reg add ".concat(svcRegPath, " /v DependOnService /t REG_MULTI_SZ /d EventLog /f");
        var regOutput = childProcess.execSync(regCmd).toString();
        console.log(regOutput);
        console.log("Service \"".concat(serviceName, "\" installed successfully."));
    }
    else {
        var svcPath = "/etc/systemd/system/".concat(svcName, ".service");
        var svcContent = "\n      [Unit]\n      Description=".concat(serviceName, "\n      After=network.target\n\n      [Service]\n      Type=simple\n      ExecStart=/usr/bin/node ").concat(scriptPath, "\n      \n      Restart=on-failure\n\n      [Install]\n      WantedBy=multi-user.target\n   ");
        fs.writeFileSync(svcPath, svcContent);
        console.log("Service file created at \"".concat(svcPath, "\"."));
        var cmd = "systemctl enable ".concat(serviceName, ".service");
        var output = childProcess.execSync(cmd).toString();
        console.log(output);
        try {
            var cmd2 = "systemctl start ".concat(serviceName, ".service");
            var output2 = childProcess.execSync(cmd2).toString();
            console.log(output2);
        }
        catch (error) {
        }
        console.log("Service \"".concat(serviceName, "\" installed successfully."));
        console.log("to validate use\nsudo systemctl status ".concat(svcName, ".service"));
    }
}
function UninstallService(svcName, serviceName) {
    if (os.platform() === 'win32') {
        var svcRegPath = "HKLM\\SYSTEM\\CurrentControlSet\\Services\\".concat(svcName);
        var cmd = "sc delete \"".concat(svcName, "\"");
        var output = childProcess.execSync(cmd).toString();
        console.log(output);
        var regCmd = "reg delete ".concat(svcRegPath, " /f");
        var regOutput = childProcess.execSync(regCmd).toString();
        console.log(regOutput);
        console.log("Service \"".concat(serviceName, "\" uninstalled successfully."));
    }
    else {
        var svcPath = "/etc/systemd/system/".concat(svcName, ".service");
        try {
            var cmd2 = "systemctl stop ".concat(serviceName, ".service");
            var output2 = childProcess.execSync(cmd2).toString();
            console.log(output2);
        }
        catch (error) {
        }
        var cmd = "systemctl disable ".concat(serviceName, ".service");
        var output = childProcess.execSync(cmd).toString();
        console.log(output);
        fs.unlinkSync(svcPath);
        console.log("Service file removed at \"".concat(svcPath, "\"."));
        console.log("Service \"".concat(serviceName, "\" uninstalled successfully."));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRTlDLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRW5DLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNyQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDcEMsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxHQUFHLEtBQUssVUFBVSxJQUFJLEdBQUcsS0FBSyxVQUFVLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDaEgsT0FBTyxHQUFHLFNBQVMsQ0FBQztLQUNyQjtTQUFNLElBQUksR0FBRyxLQUFLLFdBQVcsSUFBSSxHQUFHLEtBQUssWUFBWSxJQUFJLEdBQUcsS0FBSyxZQUFZLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDN0gsT0FBTyxHQUFHLFdBQVcsQ0FBQztLQUN2QjtTQUFNLElBQUksR0FBRyxLQUFLLFFBQVEsSUFBSSxHQUFHLEtBQUss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