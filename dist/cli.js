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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFOUMsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFbkMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUNwQyxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEIsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsS0FBSyxVQUFVLElBQUksR0FBRyxLQUFLLFVBQVUsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtRQUNoSCxPQUFPLEdBQUcsU0FBUyxDQUFDO0tBQ3JCO1NBQU0sSUFBSSxHQUFHLEtBQUssV0FBVyxJQUFJLEdBQUcsS0FBSyxZQUFZLElBQUksR0FBRyxLQUFLLFlBQVksSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtRQUM3SCxPQUFPLEdBQUcsV0FBVyxDQUFDO0tBQ3ZCO1NBQU0sSUFBSSxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsS0FBSyxT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