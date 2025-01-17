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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSw0Q0FBMkM7QUFDM0MsaUNBQWdDO0FBQ2hDLDJDQUEwQztBQUMxQyxtREFBa0Q7QUFDbEQsbUNBQWtDO0FBQ2xDLDJDQUE0QztBQUM1QyxtQ0FBa0M7QUFFbEMsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztBQUMzQyxhQUFhO0FBQ2IsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsZUFBZSxDQUFDO0lBQ25ELEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztJQUNwQixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07Q0FDdkIsQ0FBQyxDQUFDO0FBQ0gsSUFBSSxlQUFlLEdBQVEsRUFBRSxRQUFRLEVBQUUsNEJBQTRCLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDNUYsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsY0FBUSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0MsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsY0FBUSxP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