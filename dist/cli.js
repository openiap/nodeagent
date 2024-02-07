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
// console.log(JSON.stringify(process.env.PATH, null, 2));
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
                    // if (!fs.existsSync(path.join(packagemanager.homedir(), ".openiap"))) fs.mkdirSync(path.join(packagemanager.homedir(), ".openiap"), { recursive: true });
                    // fs.writeFileSync(path.join(packagemanager.homedir(), ".openiap", "config.json"), JSON.stringify(assistantConfig));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSw0Q0FBMkM7QUFDM0MsaUNBQWdDO0FBQ2hDLDJDQUEwQztBQUMxQyxtREFBa0Q7QUFDbEQsbUNBQWtDO0FBQ2xDLDJDQUE4RDtBQUU5RCwwREFBMEQ7QUFDMUQsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztBQUMzQyxhQUFhO0FBQ2IsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsZUFBZSxDQUFDO0lBQ25ELEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztJQUNwQixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07Q0FDdkIsQ0FBQyxDQUFDO0FBQ0gsSUFBSSxlQUFlLEdBQVEsRUFBRSxRQUFRLEVBQUUsNEJBQTRCLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDNUYsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsY0FBUSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0MsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsY0FBUSxP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