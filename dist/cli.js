#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var nodeapi_1 = require("@openiap/nodeapi");
var agent_1 = require("./agent");
var agenttools_1 = require("./agenttools");
var packagemanager_1 = require("./packagemanager");
var runner_1 = require("./runner");
var PortMapper_1 = require("./PortMapper");
var os = require('os');
var path = require('path');
var prompts = require('./prompt-sync')();
// @ts-ignore
var fs = require('fs');
var childProcess = require('child_process');
var readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var assistantConfig = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
var args = process.argv.slice(2);
process.on('SIGINT', function () { process.exit(0); });
process.on('SIGTERM', function () { process.exit(0); });
process.on('SIGQUIT', function () { process.exit(0); });
var serviceName = "";
var command = "";
var verbose = false;
var service = false;
var hostport = null;
var localport = null;
var myproject = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
console.log(myproject.name + "@" + myproject.version);
for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === '-noop' || arg === '/noop') {
        process.exit(0);
    }
    else if (arg === '-v' || arg === '-verbose' || arg === '/v' || arg === '/verbose') {
        console.log("Verbose mode enabled.");
        verbose = true;
    }
    else if (arg === '-svc' || arg === "-svr" || arg === '-service' || arg === '/svc' || arg === '/service') {
        service = true;
    }
    else if (arg === '-p' || arg === '/p') {
        localport = args[i + 1];
    }
    else if (arg.startsWith('-p=') || arg.startsWith('/p=')) {
        localport = arg.split('=')[1];
    }
    else if (arg === 'install' || arg === '/install' || arg === '-install' || arg === 'i' || arg === '/i' || arg === '-i') {
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
    else if (arg.indexOf(":") > -1) {
        hostport = arg;
    }
    else if (!serviceName) {
        serviceName = arg;
    }
}
function Run(cmd) {
    try {
        console.log(cmd);
        var output = childProcess.execSync(cmd).toString();
        if (verbose)
            console.log(output);
        return output;
    }
    catch (error) {
        return error.toString();
    }
}
function RunStreamed(command, args, exit) {
    var child = childProcess.spawn(command, args);
    child.stdout.on('data', function (data) {
        if (data == null)
            return;
        var s = data.toString().replace(/\n$/, "");
        console.log(s);
    });
    child.stderr.on('data', function (data) {
        console.error(data);
    });
    child.on('close', function (code) {
        console.log("child process exited with code ".concat(code));
        if (exit)
            process.exit(0);
    });
}
function installService(svcName, serviceName, script) {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var scriptPath, Service, svc_1, plist, plistPath, svcPath, nodepath, svcContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    scriptPath = path.join(__dirname, script);
                    if (!fs.existsSync(scriptPath)) {
                        scriptPath = path.join(__dirname, "dist", script);
                    }
                    if (!fs.existsSync(scriptPath)) {
                        console.log("Failed locating " + script);
                        reject();
                        return [2 /*return*/];
                    }
                    if (!(os.platform() === 'win32')) return [3 /*break*/, 1];
                    Service = require('node-windows').Service;
                    svc_1 = new Service({
                        name: serviceName,
                        description: serviceName,
                        script: scriptPath,
                        env: [{ name: "apiurl", value: assistantConfig.apiurl }, { name: "jwt", value: assistantConfig.jwt }]
                    });
                    console.log("Install using " + scriptPath);
                    svc_1.on('alreadyinstalled', function () {
                        console.log("Service already installed");
                        svc_1.start();
                    });
                    svc_1.on('install', function () {
                        console.log("Service \"".concat(serviceName, "\" installed successfully."));
                        svc_1.start();
                    });
                    svc_1.on('start', function () {
                        console.log("Service \"".concat(serviceName, "\" started successfully."));
                        resolve();
                    });
                    svc_1.on('error', function () {
                        reject();
                    });
                    svc_1.on('stop', function () {
                        reject();
                    });
                    // svc.on('install', () => { console.log("Service installed"); });
                    svc_1.on('alreadyinstalled', function () { console.log("Service already installed"); });
                    svc_1.on('invalidinstallation', function () { console.log("Service invalid installation"); });
                    svc_1.on('uninstall', function () { console.log("Service uninstalled"); });
                    svc_1.on('alreadyuninstalled', function () { console.log("Service already uninstalled"); });
                    svc_1.on('start', function () { console.log("Service started"); });
                    svc_1.on('stop', function () { console.log("Service stopped"); });
                    svc_1.on('error', function () { console.log("Service error"); });
                    svc_1.install();
                    return [3 /*break*/, 7];
                case 1:
                    if (!(process.platform === 'darwin')) return [3 /*break*/, 4];
                    plist = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n<plist version=\"1.0\">\n<dict>\n  <key>Label</key>\n  <string>".concat(serviceName, "</string>\n  <key>ProgramArguments</key>\n  <array>\n    <string>").concat(runner_1.runner.findNodePath(), "</string>\n    <string>").concat(scriptPath, "</string>\n  </array>\n  <key>EnvironmentVariables</key>\n  <dict>\n  <key>apiurl</key>\n  <string>").concat(assistantConfig.apiurl, "</string>\n  <key>jwt</key>\n  <string>").concat(assistantConfig.jwt, "</string>\n  <key>NODE</key>\n  <string>production</string>\n  <key>PATH</key>\n  <string>").concat(process.env.PATH, "</string>\n</dict>\n  <key>RunAtLoad</key>\n  <true/>\n  <key>KeepAlive</key>\n  <true/>\n  <key>StandardOutPath</key>\n  <string>/var/log/nodeagent.log</string>\n  <key>StandardErrorPath</key>\n  <string>/var/log/nodeagent.log</string>\n  </dict>\n</plist>");
                    plistPath = "/Library/LaunchDaemons/".concat(serviceName, ".plist");
                    if (!fs.existsSync(plistPath)) return [3 /*break*/, 3];
                    return [4 /*yield*/, UninstallService(svcName, serviceName)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    fs.writeFileSync(plistPath, plist);
                    if (verbose)
                        console.log("Service file created at \"".concat(plistPath, "\"."));
                    Run("launchctl load ".concat(plistPath));
                    console.log("Service \"".concat(serviceName, "\" installed successfully."));
                    Run("launchctl start ".concat(serviceName));
                    resolve();
                    return [3 /*break*/, 7];
                case 4:
                    svcPath = "/etc/systemd/system/".concat(svcName, ".service");
                    if (!fs.existsSync(svcPath)) return [3 /*break*/, 6];
                    return [4 /*yield*/, UninstallService(svcName, serviceName)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    nodepath = runner_1.runner.findNodePath();
                    svcContent = "\n        [Unit]\n        Description=".concat(serviceName, "\n        After=network.target\n  \n        [Service]\n        Type=simple\n        ExecStart=").concat(nodepath, " ").concat(scriptPath, "\n        Environment=NODE_ENV=production\n        Environment=PATH=").concat(process.env.PATH, "\n        Environment=apiurl=").concat(assistantConfig.apiurl, "\n        Environment=jwt=").concat(assistantConfig.jwt, "        \n        \n        Restart=on-failure\n  \n        [Install]\n        WantedBy=multi-user.target\n     ");
                    fs.writeFileSync(svcPath, svcContent);
                    if (verbose)
                        console.log("Service file created at \"".concat(svcPath, "\"."));
                    Run("systemctl enable ".concat(serviceName, ".service"));
                    Run("systemctl start ".concat(serviceName, ".service"));
                    console.log("Service \"".concat(serviceName, "\" installed successfully."));
                    console.log("sudo systemctl status ".concat(svcName, ".service\nsudo journalctl -efu ").concat(svcName));
                    resolve();
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); });
}
function UninstallService(svcName, serviceName) {
    return new Promise(function (resolve, reject) {
        if (os.platform() === 'win32') {
            var Service = require('node-windows').Service;
            var scriptPath = path.join(__dirname, "runagent.js");
            if (!fs.existsSync(scriptPath)) {
                scriptPath = path.join(__dirname, "dist", "runagent.js");
            }
            var svc = new Service({
                name: serviceName,
                description: serviceName,
                script: scriptPath
            });
            svc.on('uninstall', function () {
                console.log("Service \"".concat(serviceName, "\" uninstalled successfully."));
                resolve();
            });
            svc.on('alreadyuninstalled', function () {
                console.log("Service \"".concat(serviceName, "\" already uninstalled."));
                resolve();
            });
            svc.on('error', function () {
                console.log("Service \"".concat(serviceName, "\" uninstall failed."));
                reject();
            });
            svc.uninstall();
        }
        else if (process.platform === 'darwin') {
            var plistPath = "/Library/LaunchDaemons/".concat(serviceName, ".plist");
            if (fs.existsSync(plistPath)) {
                console.log("Unload service at \"".concat(plistPath, "\"."));
                Run("launchctl stop ".concat(plistPath));
                Run("launchctl unload ".concat(plistPath));
                // delete plist file
                fs.unlinkSync(plistPath);
                console.log("Service \"".concat(serviceName, "\" uninstalled successfully."));
            }
            else {
                console.log("Service \"".concat(serviceName, "\" already uninstalled."));
            }
            resolve();
        }
        else {
            var svcPath = "/etc/systemd/system/".concat(svcName, ".service");
            if (fs.existsSync(svcPath)) {
                Run("systemctl stop ".concat(serviceName, ".service"));
                Run("systemctl disable ".concat(serviceName, ".service"));
                fs.unlinkSync(svcPath);
                console.log("Service file removed at \"".concat(svcPath, "\"."));
            }
            console.log("Service \"".concat(serviceName, "\" uninstalled successfully."));
            resolve();
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var nodepath, scriptPath, port, portname, remoteagent, localport_1, uselocalport, error_1, listener, home_configfile, win32_configfile, darwin_configfile, reuse, _a, tokenkey, signinurl, jwt;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (serviceName == "" || serviceName == null) {
                        serviceName = "nodeagent";
                    }
                    if (!service) return [3 /*break*/, 1];
                    nodepath = runner_1.runner.findNodePath();
                    scriptPath = path.join(__dirname, "runagent.js");
                    console.log("run " + scriptPath);
                    RunStreamed(nodepath, [scriptPath], true);
                    return [2 /*return*/];
                case 1:
                    if (!(hostport != null && hostport != "")) return [3 /*break*/, 8];
                    port = hostport.split(":")[1];
                    portname = hostport.split(":")[1];
                    remoteagent = hostport.split(":")[0];
                    localport_1 = port;
                    if (hostport.split(":").length > 2) {
                        localport_1 = hostport.split(":")[2];
                    }
                    uselocalport = localport_1;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, (0, PortMapper_1.FindFreePort)(localport_1)];
                case 3:
                    uselocalport = _b.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _b.sent();
                    return [4 /*yield*/, (0, PortMapper_1.FindFreePort)(0)];
                case 5:
                    // if port is < 1024 we get an error, then find a random free port over 1024
                    uselocalport = _b.sent();
                    return [3 /*break*/, 6];
                case 6:
                    if (uselocalport != localport_1) {
                        console.log("Port " + localport_1 + " is in use. Using " + uselocalport + " instead.");
                        localport_1 = uselocalport;
                    }
                    if (portname === null || portname === undefined || portname === "" || remoteagent == null || remoteagent == "") {
                        console.log("Invalid proxy. Use format <remoteagent>:<remoteport or portname>");
                        process.exit(1);
                    }
                    // is remoteport a number or string ?
                    if (portname.match(/^\d+$/)) {
                        portname = "PORT" + port;
                        port = parseInt(port);
                    }
                    else {
                        port = undefined;
                    }
                    if (!remoteagent.endsWith("agent")) {
                        remoteagent += "agent";
                    }
                    agent_1.agent.client = new nodeapi_1.openiap();
                    agent_1.agent.client.allowconnectgiveup = true;
                    agent_1.agent.client.agent = "nodeagent";
                    console.log("reloadAndParseConfig");
                    agent_1.agent.reloadAndParseConfig();
                    console.log("connect");
                    return [4 /*yield*/, agent_1.agent.client.connect()];
                case 7:
                    _b.sent();
                    console.log("ClientPortMapper");
                    listener = new PortMapper_1.ClientPortMapper(agent_1.agent.client, localport_1, portname, port, remoteagent);
                    return [2 /*return*/];
                case 8:
                    console.log("Not running as service");
                    _b.label = 9;
                case 9:
                    home_configfile = path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json");
                    win32_configfile = path.join("C:\\WINDOWS\\system32\\config\\systemprofile\\", ".openiap", "config.json");
                    darwin_configfile = "/var/root/.openiap/config.json";
                    if (!(command === 'install' || command == "")) return [3 /*break*/, 14];
                    if (fs.existsSync(win32_configfile)) {
                        console.log("Parsing config from " + win32_configfile);
                        assistantConfig = JSON.parse(fs.readFileSync(win32_configfile, "utf8"));
                    }
                    else if (fs.existsSync(darwin_configfile)) {
                        console.log("Parsing config from " + darwin_configfile);
                        assistantConfig = JSON.parse(fs.readFileSync(darwin_configfile, "utf8"));
                    }
                    else if (fs.existsSync(home_configfile)) {
                        console.log("Parsing config from " + home_configfile);
                        assistantConfig = JSON.parse(fs.readFileSync(home_configfile, "utf8"));
                    }
                    assistantConfig.apiurl = prompts("apiurl (Enter for ".concat(assistantConfig.apiurl, ")? "), assistantConfig.apiurl);
                    if (assistantConfig.apiurl == null)
                        process.exit(0);
                    if (assistantConfig.jwt != null && assistantConfig.jwt != "") {
                        reuse = prompts("Reuse existing token (Enter for yes)? (yes/no) ", { value: "yes", autocomplete: function () { return ["yes", "no"]; } });
                        if (reuse == null)
                            process.exit(0);
                        if (reuse == "no") {
                            assistantConfig.jwt = "";
                        }
                    }
                    if (!(assistantConfig.jwt == null || assistantConfig.jwt == "")) return [3 /*break*/, 12];
                    return [4 /*yield*/, agenttools_1.agenttools.AddRequestToken(assistantConfig.apiurl)];
                case 10:
                    _a = _b.sent(), tokenkey = _a[0], signinurl = _a[1];
                    console.log("Please open ".concat(signinurl, " in your browser and login with your OpenIAP account"));
                    return [4 /*yield*/, agenttools_1.agenttools.WaitForToken(assistantConfig.apiurl, tokenkey)];
                case 11:
                    jwt = _b.sent();
                    assistantConfig.jwt = jwt;
                    _b.label = 12;
                case 12:
                    try {
                        fs.writeFileSync(home_configfile, JSON.stringify(assistantConfig));
                    }
                    catch (error) {
                        console.error("Error writing config to " + home_configfile + "\n" + error.message);
                    }
                    console.log("Installing service \"".concat(serviceName, "\"..."));
                    return [4 /*yield*/, installService(serviceName, serviceName, 'runagent.js')];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 16];
                case 14:
                    if (!(command === 'uninstall')) return [3 /*break*/, 16];
                    console.log("Uninstalling service \"".concat(serviceName, "\"..."));
                    return [4 /*yield*/, UninstallService(serviceName, serviceName)];
                case 15:
                    _b.sent();
                    _b.label = 16;
                case 16:
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSw0Q0FBMkM7QUFDM0MsaUNBQWdDO0FBQ2hDLDJDQUEwQztBQUMxQyxtREFBa0Q7QUFDbEQsbUNBQWtDO0FBQ2xDLDJDQUE4RDtBQUU5RCxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO0FBQzNDLGFBQWE7QUFDYixJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlDLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxlQUFlLENBQUM7SUFDbkQsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO0lBQ3BCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtDQUN2QixDQUFDLENBQUM7QUFDSCxJQUFJLGVBQWUsR0FBUSxFQUFFLFFBQVEsRUFBRSw0QkFBNEIsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUM1RixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxjQUFRLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMvQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxjQUFRLE9BQU8sQ0FBQyxJQUFJ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