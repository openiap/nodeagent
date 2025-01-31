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
var Logger_1 = require("./Logger");
try {
    Logger_1.Logger.init();
}
catch (error) {
}
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
Logger_1.Logger.instrumentation.info(myproject.name + "@" + myproject.version, {});
for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === '-noop' || arg === '/noop') {
        process.exit(0);
    }
    else if (arg === '-v' || arg === '-verbose' || arg === '/v' || arg === '/verbose') {
        Logger_1.Logger.instrumentation.info("Verbose mode enabled.", {});
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
        Logger_1.Logger.instrumentation.info(cmd, {});
        var output = childProcess.execSync(cmd).toString();
        if (verbose)
            Logger_1.Logger.instrumentation.info(output, {});
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
        Logger_1.Logger.instrumentation.info(s, {});
    });
    child.stderr.on('data', function (data) {
        Logger_1.Logger.instrumentation.error(data, {});
    });
    child.on('close', function (code) {
        Logger_1.Logger.instrumentation.info("child process exited with code ".concat(code), {});
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
                        Logger_1.Logger.instrumentation.info("Failed locating " + script, { svcName: svcName, serviceName: serviceName });
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
                    Logger_1.Logger.instrumentation.info("Install using " + scriptPath, { svcName: svcName, serviceName: serviceName });
                    svc_1.on('alreadyinstalled', function () {
                        Logger_1.Logger.instrumentation.info("Service already installed", { svcName: svcName, serviceName: serviceName });
                        svc_1.start();
                    });
                    svc_1.on('install', function () {
                        Logger_1.Logger.instrumentation.info("Service \"".concat(serviceName, "\" installed successfully."), { svcName: svcName, serviceName: serviceName });
                        svc_1.start();
                    });
                    svc_1.on('start', function () {
                        Logger_1.Logger.instrumentation.info("Service \"".concat(serviceName, "\" started successfully."), { svcName: svcName, serviceName: serviceName });
                        resolve();
                    });
                    svc_1.on('error', function () {
                        reject();
                    });
                    svc_1.on('stop', function () {
                        reject();
                    });
                    // svc.on('install', () => { Logger.instrumentation.info("Service installed"); });
                    svc_1.on('alreadyinstalled', function () { Logger_1.Logger.instrumentation.info("Service already installed", { svcName: svcName, serviceName: serviceName }); });
                    svc_1.on('invalidinstallation', function () { Logger_1.Logger.instrumentation.info("Service invalid installation", { svcName: svcName, serviceName: serviceName }); });
                    svc_1.on('uninstall', function () { Logger_1.Logger.instrumentation.info("Service uninstalled", { svcName: svcName, serviceName: serviceName }); });
                    svc_1.on('alreadyuninstalled', function () { Logger_1.Logger.instrumentation.info("Service already uninstalled", { svcName: svcName, serviceName: serviceName }); });
                    svc_1.on('start', function () { Logger_1.Logger.instrumentation.info("Service started", { svcName: svcName, serviceName: serviceName }); });
                    svc_1.on('stop', function () { Logger_1.Logger.instrumentation.info("Service stopped", { svcName: svcName, serviceName: serviceName }); });
                    svc_1.on('error', function () { Logger_1.Logger.instrumentation.info("Service error", { svcName: svcName, serviceName: serviceName }); });
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
                        Logger_1.Logger.instrumentation.info("Service file created at \"".concat(plistPath, "\"."), { svcName: svcName, serviceName: serviceName });
                    Run("launchctl load ".concat(plistPath));
                    Logger_1.Logger.instrumentation.info("Service \"".concat(serviceName, "\" installed successfully."), { svcName: svcName, serviceName: serviceName });
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
                        Logger_1.Logger.instrumentation.info("Service file created at \"".concat(svcPath, "\"."), { svcName: svcName, serviceName: serviceName });
                    Run("systemctl enable ".concat(serviceName, ".service"));
                    Run("systemctl start ".concat(serviceName, ".service"));
                    Logger_1.Logger.instrumentation.info("Service \"".concat(serviceName, "\" installed successfully."), { svcName: svcName, serviceName: serviceName });
                    Logger_1.Logger.instrumentation.info("sudo systemctl status ".concat(svcName, ".service\nsudo journalctl -efu ").concat(svcName), { svcName: svcName, serviceName: serviceName });
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
                Logger_1.Logger.instrumentation.info("Service \"".concat(serviceName, "\" uninstalled successfully."), { svcName: svcName, serviceName: serviceName });
                resolve();
            });
            svc.on('alreadyuninstalled', function () {
                Logger_1.Logger.instrumentation.info("Service \"".concat(serviceName, "\" already uninstalled."), { svcName: svcName, serviceName: serviceName });
                resolve();
            });
            svc.on('error', function () {
                Logger_1.Logger.instrumentation.info("Service \"".concat(serviceName, "\" uninstall failed."), { svcName: svcName, serviceName: serviceName });
                reject();
            });
            svc.uninstall();
        }
        else if (process.platform === 'darwin') {
            var plistPath = "/Library/LaunchDaemons/".concat(serviceName, ".plist");
            if (fs.existsSync(plistPath)) {
                Logger_1.Logger.instrumentation.info("Unload service at \"".concat(plistPath, "\"."), { svcName: svcName, serviceName: serviceName });
                Run("launchctl stop ".concat(plistPath));
                Run("launchctl unload ".concat(plistPath));
                // delete plist file
                fs.unlinkSync(plistPath);
                Logger_1.Logger.instrumentation.info("Service \"".concat(serviceName, "\" uninstalled successfully."), { svcName: svcName, serviceName: serviceName });
            }
            else {
                Logger_1.Logger.instrumentation.info("Service \"".concat(serviceName, "\" already uninstalled."), { svcName: svcName, serviceName: serviceName });
            }
            resolve();
        }
        else {
            var svcPath = "/etc/systemd/system/".concat(svcName, ".service");
            if (fs.existsSync(svcPath)) {
                Run("systemctl stop ".concat(serviceName, ".service"));
                Run("systemctl disable ".concat(serviceName, ".service"));
                fs.unlinkSync(svcPath);
                Logger_1.Logger.instrumentation.info("Service file removed at \"".concat(svcPath, "\"."), { svcName: svcName, serviceName: serviceName });
            }
            Logger_1.Logger.instrumentation.info("Service \"".concat(serviceName, "\" uninstalled successfully."), { svcName: svcName, serviceName: serviceName });
            resolve();
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var nodepath, scriptPath, port, portname, remoteagent, localport_1, uselocalport, error_1, home_configfile, win32_configfile, darwin_configfile, reuse, _a, tokenkey, signinurl, jwt;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (serviceName == "" || serviceName == null) {
                        serviceName = "nodeagent";
                    }
                    if (!service) return [3 /*break*/, 1];
                    nodepath = runner_1.runner.findNodePath();
                    scriptPath = path.join(__dirname, "runagent.js");
                    Logger_1.Logger.instrumentation.info("run " + scriptPath, { serviceName: serviceName });
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
                        Logger_1.Logger.instrumentation.info("Port " + localport_1 + " is in use. Using " + uselocalport + " instead.", { serviceName: serviceName });
                        localport_1 = uselocalport;
                    }
                    if (portname === null || portname === undefined || portname === "" || remoteagent == null || remoteagent == "") {
                        Logger_1.Logger.instrumentation.info("Invalid proxy. Use format <remoteagent>:<remoteport or portname>", { serviceName: serviceName });
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
                    Logger_1.Logger.instrumentation.info("reloadAndParseConfig", { serviceName: serviceName });
                    agent_1.agent.reloadAndParseConfig();
                    Logger_1.Logger.instrumentation.info("connect", { serviceName: serviceName });
                    return [4 /*yield*/, agent_1.agent.client.connect()];
                case 7:
                    _b.sent();
                    // Logger.instrumentation.info("ClientPortMapper")
                    // const listener = new ClientPortMapper(agent.client, localport, portname, port, remoteagent);
                    return [2 /*return*/];
                case 8:
                    Logger_1.Logger.instrumentation.info("Not running as service", { serviceName: serviceName });
                    _b.label = 9;
                case 9:
                    home_configfile = path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json");
                    win32_configfile = path.join("C:\\WINDOWS\\system32\\config\\systemprofile\\", ".openiap", "config.json");
                    darwin_configfile = "/var/root/.openiap/config.json";
                    if (!(command === 'install' || command == "")) return [3 /*break*/, 14];
                    if (fs.existsSync(win32_configfile)) {
                        Logger_1.Logger.instrumentation.info("Parsing config from " + win32_configfile, { serviceName: serviceName });
                        assistantConfig = JSON.parse(fs.readFileSync(win32_configfile, "utf8"));
                    }
                    else if (fs.existsSync(darwin_configfile)) {
                        Logger_1.Logger.instrumentation.info("Parsing config from " + darwin_configfile, { serviceName: serviceName });
                        assistantConfig = JSON.parse(fs.readFileSync(darwin_configfile, "utf8"));
                    }
                    else if (fs.existsSync(home_configfile)) {
                        Logger_1.Logger.instrumentation.info("Parsing config from " + home_configfile, { serviceName: serviceName });
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
                    Logger_1.Logger.instrumentation.info("Please open ".concat(signinurl, " in your browser and login with your OpenIAP account"), { serviceName: serviceName });
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
                        Logger_1.Logger.instrumentation.error("Error writing config to " + home_configfile + "\n" + error.message, { serviceName: serviceName });
                    }
                    Logger_1.Logger.instrumentation.info("Installing service \"".concat(serviceName, "\"..."), { serviceName: serviceName });
                    return [4 /*yield*/, installService(serviceName, serviceName, 'runagent.js')];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 16];
                case 14:
                    if (!(command === 'uninstall')) return [3 /*break*/, 16];
                    Logger_1.Logger.instrumentation.info("Uninstalling service \"".concat(serviceName, "\"..."), { serviceName: serviceName });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSw0Q0FBMkM7QUFDM0MsaUNBQWdDO0FBQ2hDLDJDQUEwQztBQUMxQyxtREFBa0Q7QUFDbEQsbUNBQWtDO0FBQ2xDLDJDQUE0QztBQUM1QyxtQ0FBa0M7QUFDbEMsSUFBSTtJQUNGLGVBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNmO0FBQUMsT0FBTyxLQUFLLEVBQUU7Q0FDZjtBQUVELElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7QUFDM0MsYUFBYTtBQUNiLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDOUMsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLGVBQWUsQ0FBQztJQUNuRCxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7SUFDcEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO0NBQ3ZCLENBQUMsQ0FBQztBQUNILElBQUksZUFBZSxHQUFRLEVBQUUsUUFBUSxFQUFFLDRCQUE0QixFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQzVGLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLGNBQVEsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQy9DLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLGNBQVEsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2hELE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLGNBQVEsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRWhELElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNyQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDakIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNwQixJQUFJLFFBQVEsR0FBVSxJQUFJLENBQUM7QUFDM0IsSUFBSSxTQUFTLEdBQVUsSUFBSSxDQUFDO0FBQzVCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNoRyxlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRTFFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3BDLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixJQUFJLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxLQUFLLE9BQU8sRUFBRTtRQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO1NBQU0sSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxVQUFVLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssVUFBVSxFQUFFO1FBQ25GLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sR0FBRyxJQUFJLENBQUM7S0FDaEI7U0FBTSxJQUFJLEdBQUcsS0FBSyxNQUFNLElBQUksR0FBRyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssVUFBVSxJQUFJLEdBQUcsS0FBSyxNQUFNLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtRQUN6RyxPQUFPLEdBQUcsSUFBSSxDQUFDO0tBQ2hCO1NBQU0sSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDdkMsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDekI7U0FBTSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN6RCxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMvQjtTQUFNLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxHQUFHLEtBQUssVUFBVSxJQUFJLEdBQUcsS0FBSyxVQUFVLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDdkgsT0FBTyxHQUFHLFNBQVMsQ0FBQztLQUNyQjtTQUFNLElBQUksR0FBRyxLQUFLLFdBQVcsSUFBSSxHQUFHLEtBQUssWUFBWSxJQUFJLEdBQUcsS0FBSyxZQUFZLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDN0gsT0FBTyxHQUFHLFdBQVcsQ0FBQztLQUN2QjtTQUFNLElBQUksR0FBRyxLQUFLLFFBQVEsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7UUFDckUsT0FBTyxHQUFHLFdBQVcsQ0FBQztLQUN2QjtTQUFNLElBQUksR0FBRyxLQUFLLGNBQWMsSUFBSSxHQUFHLEtBQUssY0FBYyxFQUFFO1FBQzNELFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzNCO1NBQU0sSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUU7UUFDN0UsV0FBVyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakM7U0FBTSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDaEMsUUFBUSxHQUFHLEdBQUcsQ0FBQztLQUNsQjtTQUFNLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDckIsV0FBVyxHQUFHLEdBQUcsQ0FBQztLQUNuQjtDQUNGO0FBQ0QsU0FBUyxHQUFHLENBQUMsR0FBVztJQUN0QixJQUFJO1FBQ0YsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLElBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckQsSUFBSSxPQUFPO1lBQUUsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sTUFBTSxDQUFBO0tBQ2Q7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3pCO0FBQ0gsQ0FBQztBQUNELFNBQVMsV0FBVyxDQUFDLE9BQWUsRUFBRSxJQUFjLEVBQUUsSUFBYTtJQUNqRSxJQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRCxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxJQUFTO1FBQ2hDLElBQUksSUFBSSxJQUFJLElBQUk7WUFBRSxPQUFPO1FBQ3pCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNyQyxDQUFDLENBQUMsQ0FBQztJQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFDLElBQVM7UUFDaEMsZUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxJQUFTO1FBQzFCLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLHlDQUFrQyxJQUFJLENBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxJQUFJLElBQUk7WUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVCLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUNELFNBQVMsY0FBYyxDQUFDLE9BQWUsRUFBRSxXQUFtQixFQUFFLE1BQWM7SUFBNUUsaUJBZ0lDO0lBL0hDLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBTyxPQUFPLEVBQUUsTUFBTTs7Ozs7b0JBQ25DLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDOUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQzlCLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7cUJBQ25EO29CQUNELElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUM5QixlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLEVBQUUsRUFBQyxPQUFPLFNBQUEsRUFBRSxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUE7d0JBQ2hGLE1BQU0sRUFBRSxDQUFDO3dCQUNULHNCQUFPO3FCQUNSO3lCQUNHLENBQUEsRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sQ0FBQSxFQUF6Qix3QkFBeUI7b0JBQ3JCLE9BQU8sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUUxQyxRQUFNLElBQUksT0FBTyxDQUFDO3dCQUN0QixJQUFJLEVBQUUsV0FBVzt3QkFDakIsV0FBVyxFQUFFLFdBQVc7d0JBQ3hCLE1BQU0sRUFBRSxVQUFVO3dCQUNsQixHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLGVBQWUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztxQkFDdEcsQ0FBQyxDQUFDO29CQUNILGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsRUFBRSxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQTtvQkFDbEYsS0FBRyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRTt3QkFDekIsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsRUFBQyxPQUFPLFNBQUEsRUFBRSxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUM7d0JBQ2pGLEtBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDZCxDQUFDLENBQUMsQ0FBQztvQkFDSCxLQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRTt3QkFDaEIsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsb0JBQVksV0FBVywrQkFBMkIsRUFBRSxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQzt3QkFDeEcsS0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNkLENBQUMsQ0FBQyxDQUFDO29CQUNILEtBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO3dCQUNkLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLG9CQUFZLFdBQVcsNkJBQXlCLEVBQUUsRUFBQyxPQUFPLFNBQUEsRUFBRSxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUM7d0JBQ3RHLE9BQU8sRUFBRSxDQUFDO29CQUNaLENBQUMsQ0FBQyxDQUFDO29CQUNILEtBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO3dCQUNkLE1BQU0sRUFBRSxDQUFDO29CQUNYLENBQUMsQ0FBQyxDQUFDO29CQUNILEtBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFO3dCQUNiLE1BQU0sRUFBRSxDQUFDO29CQUNYLENBQUMsQ0FBQyxDQUFDO29CQUNILGtGQUFrRjtvQkFDbEYsS0FBRyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxjQUFRLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLEVBQUMsT0FBTyxTQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hILEtBQUcsQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsY0FBUSxlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5SCxLQUFHLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxjQUFRLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUMsT0FBTyxTQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNHLEtBQUcsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsY0FBUSxlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1SCxLQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxjQUFRLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUMsT0FBTyxTQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25HLEtBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLGNBQVEsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBQyxPQUFPLFNBQUEsRUFBRSxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEcsS0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsY0FBUSxlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBQyxPQUFPLFNBQUEsRUFBRSxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakcsS0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDOzs7eUJBQ0osQ0FBQSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQSxFQUE3Qix3QkFBNkI7b0JBRWpDLEtBQUssR0FBRyxpT0FLUixXQUFXLDhFQUdULGVBQU0sQ0FBQyxZQUFZLEVBQUUsb0NBQ3JCLFVBQVUsZ0hBS1osZUFBZSxDQUFDLE1BQU0sb0RBRXRCLGVBQWUsQ0FBQyxHQUFHLHVHQUluQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksc1FBV25CLENBQUM7b0JBQ0UsU0FBUyxHQUFHLGlDQUEwQixXQUFXLFdBQVEsQ0FBQzt5QkFDNUQsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBeEIsd0JBQXdCO29CQUMxQixxQkFBTSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEVBQUE7O29CQUE1QyxTQUE0QyxDQUFDOzs7b0JBRS9DLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUduQyxJQUFJLE9BQU87d0JBQUUsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsb0NBQTRCLFNBQVMsUUFBSSxFQUFFLEVBQUMsT0FBTyxTQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUMsQ0FBQyxDQUFDO29CQUM1RyxHQUFHLENBQUMseUJBQWtCLFNBQVMsQ0FBRSxDQUFDLENBQUM7b0JBQ25DLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLG9CQUFZLFdBQVcsK0JBQTJCLEVBQUUsRUFBQyxPQUFPLFNBQUEsRUFBRSxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUM7b0JBQ3hHLEdBQUcsQ0FBQywwQkFBbUIsV0FBVyxDQUFFLENBQUMsQ0FBQztvQkFDdEMsT0FBTyxFQUFFLENBQUM7OztvQkFFSixPQUFPLEdBQUcsOEJBQXVCLE9BQU8sYUFBVSxDQUFDO3lCQUNyRCxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUF0Qix3QkFBc0I7b0JBQ3hCLHFCQUFNLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBQTs7b0JBQTVDLFNBQTRDLENBQUM7OztvQkFFM0MsUUFBUSxHQUFHLGVBQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDL0IsVUFBVSxHQUFHLGdEQUVILFdBQVcsMkdBS2IsUUFBUSxjQUFJLFVBQVUsaUZBRWYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLDBDQUNkLGVBQWUsQ0FBQyxNQUFNLHVDQUN6QixlQUFlLENBQUMsR0FBRyxxSEFNdkMsQ0FBQztvQkFDRCxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxPQUFPO3dCQUFFLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLG9DQUE0QixPQUFPLFFBQUksRUFBRSxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQztvQkFDMUcsR0FBRyxDQUFDLDJCQUFvQixXQUFXLGFBQVUsQ0FBQyxDQUFBO29CQUM5QyxHQUFHLENBQUMsMEJBQW1CLFdBQVcsYUFBVSxDQUFDLENBQUE7b0JBRTdDLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLG9CQUFZLFdBQVcsK0JBQTJCLEVBQUUsRUFBQyxPQUFPLFNBQUEsRUFBRSxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUM7b0JBQ3hHLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdDQUF5QixPQUFPLDRDQUFrQyxPQUFPLENBQUUsRUFBRSxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQTtvQkFDaEksT0FBTyxFQUFFLENBQUM7Ozs7O1NBRWIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsT0FBZSxFQUFFLFdBQW1CO0lBQzVELE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtRQUNqQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7WUFDN0IsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNoRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDOUIsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQzthQUMxRDtZQUNELElBQU0sR0FBRyxHQUFHLElBQUksT0FBTyxDQUFDO2dCQUN0QixJQUFJLEVBQUUsV0FBVztnQkFDakIsV0FBVyxFQUFFLFdBQVc7Z0JBQ3hCLE1BQU0sRUFBRSxVQUFVO2FBQ25CLENBQUMsQ0FBQztZQUNILEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFO2dCQUNsQixlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxvQkFBWSxXQUFXLGlDQUE2QixFQUFFLEVBQUMsT0FBTyxTQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUMsQ0FBQyxDQUFDO2dCQUMxRyxPQUFPLEVBQUUsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDO1lBQ0gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRTtnQkFDM0IsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsb0JBQVksV0FBVyw0QkFBd0IsRUFBRSxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQztnQkFDckcsT0FBTyxFQUFFLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQztZQUNILEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO2dCQUNkLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLG9CQUFZLFdBQVcseUJBQXFCLEVBQUUsRUFBQyxPQUFPLFNBQUEsRUFBRSxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUM7Z0JBQ2xHLE1BQU0sRUFBRSxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUM7WUFFSCxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDakI7YUFBTSxJQUFLLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFHO1lBQzFDLElBQU0sU0FBUyxHQUFHLGlDQUEwQixXQUFXLFdBQVEsQ0FBQztZQUNoRSxJQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzNCLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLDhCQUFzQixTQUFTLFFBQUksRUFBRSxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQztnQkFDekYsR0FBRyxDQUFDLHlCQUFrQixTQUFTLENBQUUsQ0FBQyxDQUFDO2dCQUNuQyxHQUFHLENBQUMsMkJBQW9CLFNBQVMsQ0FBRSxDQUFDLENBQUM7Z0JBQ3JDLG9CQUFvQjtnQkFDcEIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDekIsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsb0JBQVksV0FBVyxpQ0FBNkIsRUFBRSxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQzthQUMzRztpQkFBTTtnQkFDTCxlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxvQkFBWSxXQUFXLDRCQUF3QixFQUFFLEVBQUMsT0FBTyxTQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUMsQ0FBQyxDQUFDO2FBQ3RHO1lBQ0QsT0FBTyxFQUFFLENBQUM7U0FDYjthQUFNO1lBQ0gsSUFBTSxPQUFPLEdBQUcsOEJBQXVCLE9BQU8sYUFBVSxDQUFDO1lBQ3pELElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDMUIsR0FBRyxDQUFDLHlCQUFrQixXQUFXLGFBQVUsQ0FBQyxDQUFBO2dCQUM1QyxHQUFHLENBQUMsNEJBQXFCLFdBQVcsYUFBVSxDQUFDLENBQUE7Z0JBQy9DLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZCLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLG9DQUE0QixPQUFPLFFBQUksRUFBRSxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQzthQUM5RjtZQUNELGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLG9CQUFZLFdBQVcsaUNBQTZCLEVBQUUsRUFBQyxPQUFPLFNBQUEsRUFBRSxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUM7WUFDMUcsT0FBTyxFQUFFLENBQUM7U0FDWDtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQWUsSUFBSTs7Ozs7O29CQUNqQixJQUFJLFdBQVcsSUFBSSxFQUFFLElBQUksV0FBVyxJQUFJLElBQUksRUFBRTt3QkFDNUMsV0FBVyxHQUFHLFdBQVcsQ0FBQTtxQkFDMUI7eUJBQ0csT0FBTyxFQUFQLHdCQUFPO29CQUNMLFFBQVEsR0FBRyxlQUFNLENBQUMsWUFBWSxFQUFFLENBQUE7b0JBQ2hDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFDckQsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsRUFBRSxFQUFDLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQTtvQkFDL0QsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO29CQUN6QyxzQkFBTzs7eUJBQ0UsQ0FBQSxRQUFRLElBQUksSUFBSSxJQUFJLFFBQVEsSUFBSSxFQUFFLENBQUEsRUFBbEMsd0JBQWtDO29CQUN2QyxJQUFJLEdBQVUsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQVEsQ0FBQztvQkFDNUMsUUFBUSxHQUFVLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLFdBQVcsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxjQUFZLElBQUksQ0FBQztvQkFDckIsSUFBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ2pDLFdBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBUSxDQUFDO3FCQUMzQztvQkFDRyxZQUFZLEdBQUcsV0FBUyxDQUFDOzs7O29CQUVaLHFCQUFNLElBQUEseUJBQVksRUFBQyxXQUFTLENBQUMsRUFBQTs7b0JBQTVDLFlBQVksR0FBRyxTQUE2QixDQUFDOzs7O29CQUc5QixxQkFBTSxJQUFBLHlCQUFZLEVBQUMsQ0FBQyxDQUFDLEVBQUE7O29CQURwQyw0RUFBNEU7b0JBQzVFLFlBQVksR0FBRyxTQUFxQixDQUFDOzs7b0JBRXZDLElBQUcsWUFBWSxJQUFJLFdBQVMsRUFBRTt3QkFDNUIsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVMsR0FBRyxvQkFBb0IsR0FBRyxZQUFZLEdBQUcsV0FBVyxFQUFFLEVBQUMsV0FBVyxhQUFBLEVBQUMsQ0FBQyxDQUFBO3dCQUNuSCxXQUFTLEdBQUcsWUFBWSxDQUFDO3FCQUMxQjtvQkFFRCxJQUFHLFFBQVEsS0FBSyxJQUFJLElBQUksUUFBUSxLQUFLLFNBQVMsSUFBSyxRQUFnQixLQUFLLEVBQUUsSUFBSSxXQUFXLElBQUksSUFBSSxJQUFJLFdBQVcsSUFBSSxFQUFFLEVBQUU7d0JBQ3RILGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGtFQUFrRSxFQUFFLEVBQUMsV0FBVyxhQUFBLEVBQUMsQ0FBQyxDQUFBO3dCQUM5RyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNqQjtvQkFDRCxxQ0FBcUM7b0JBQ3JDLElBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDMUIsUUFBUSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7d0JBQ3pCLElBQUksR0FBRyxRQUFRLENBQUMsSUFBVyxDQUFDLENBQUM7cUJBQzlCO3lCQUFNO3dCQUNMLElBQUksR0FBRyxTQUFTLENBQUM7cUJBQ2xCO29CQUNELElBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUNqQyxXQUFXLElBQUksT0FBTyxDQUFDO3FCQUN4QjtvQkFDRCxhQUFLLENBQUMsTUFBTSxHQUFHLElBQUksaUJBQU8sRUFBRSxDQUFBO29CQUM1QixhQUFLLENBQUMsTUFBTSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztvQkFDdkMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO29CQUNqQyxlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFDLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQTtvQkFDbEUsYUFBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7b0JBQzdCLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFDLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQTtvQkFDckQscUJBQU0sYUFBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBQTs7b0JBQTVCLFNBQTRCLENBQUM7b0JBQzdCLGtEQUFrRDtvQkFDbEQsK0ZBQStGO29CQUMvRixzQkFBTzs7b0JBRVAsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsRUFBQyxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUE7OztvQkFFaEUsZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQWMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUE7b0JBQ2hGLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0RBQWdELEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFBO29CQUN6RyxpQkFBaUIsR0FBRyxnQ0FBZ0MsQ0FBQTt5QkFDdEQsQ0FBQSxPQUFPLEtBQUssU0FBUyxJQUFJLE9BQU8sSUFBSSxFQUFFLENBQUEsRUFBdEMseUJBQXNDO29CQUN4QyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTt3QkFDbkMsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsZ0JBQWdCLEVBQUUsRUFBQyxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUE7d0JBQ3JGLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztxQkFDekU7eUJBQU0sSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7d0JBQzNDLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLGlCQUFpQixFQUFFLEVBQUMsV0FBVyxhQUFBLEVBQUMsQ0FBQyxDQUFBO3dCQUN0RixlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7cUJBQzFFO3lCQUFNLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRTt3QkFDekMsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsZUFBZSxFQUFFLEVBQUMsV0FBVyxhQUFBLEVBQUMsQ0FBQyxDQUFBO3dCQUNwRixlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO3FCQUN4RTtvQkFDRCxlQUFlLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyw0QkFBcUIsZUFBZSxDQUFDLE1BQU0sUUFBSyxFQUFFLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDM0csSUFBSSxlQUFlLENBQUMsTUFBTSxJQUFJLElBQUk7d0JBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFcEQsSUFBSSxlQUFlLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxlQUFlLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRTt3QkFDeEQsS0FBSyxHQUFHLE9BQU8sQ0FBQyxpREFBaUQsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLGNBQU0sT0FBQSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBYixDQUFhLEVBQUUsQ0FBQyxDQUFDO3dCQUM1SCxJQUFJLEtBQUssSUFBSSxJQUFJOzRCQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ25DLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTs0QkFDakIsZUFBZSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7eUJBQzFCO3FCQUVGO3lCQUVHLENBQUEsZUFBZSxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksZUFBZSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUEsRUFBeEQseUJBQXdEO29CQUM1QixxQkFBTSx1QkFBVSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUE7O29CQUFoRixLQUF3QixTQUF3RCxFQUEvRSxRQUFRLFFBQUEsRUFBRSxTQUFTLFFBQUE7b0JBQzFCLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLHNCQUFlLFNBQVMseURBQXNELEVBQUUsRUFBQyxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUE7b0JBQzlHLHFCQUFNLHVCQUFVLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUE7O29CQUFyRSxHQUFHLEdBQUcsU0FBK0Q7b0JBQzNFLGVBQWUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDOzs7b0JBRTVCLElBQUk7d0JBQ0YsRUFBRSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO3FCQUNwRTtvQkFBQyxPQUFPLEtBQUssRUFBRTt3QkFDZCxlQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxlQUFlLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBQyxXQUFXLGFBQUEsRUFBQyxDQUFDLENBQUE7cUJBRWpIO29CQUVELGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLCtCQUF1QixXQUFXLFVBQU0sRUFBRSxFQUFDLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQztvQkFDckYscUJBQU0sY0FBYyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsYUFBYSxDQUFDLEVBQUE7O29CQUE3RCxTQUE2RCxDQUFDOzs7eUJBQ3JELENBQUEsT0FBTyxLQUFLLFdBQVcsQ0FBQSxFQUF2Qix5QkFBdUI7b0JBQ2hDLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGlDQUF5QixXQUFXLFVBQU0sRUFBRSxFQUFDLFdBQVcsYUFBQSxFQUFDLENBQUMsQ0FBQztvQkFDdkYscUJBQU0sZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxFQUFBOztvQkFBaEQsU0FBZ0QsQ0FBQzs7O29CQUVuRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztDQUNqQjtBQUNELElBQUksRUFBRSxDQUFDIn0=