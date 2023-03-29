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
var agenttools_1 = require("./agenttools");
var runner_1 = require("./runner");
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
var args = process.argv.slice(2);
process.on('SIGINT', function () { process.exit(0); });
process.on('SIGTERM', function () { process.exit(0); });
process.on('SIGQUIT', function () { process.exit(0); });
var serviceName = "";
var command = "";
var verbose = false;
var service = false;
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
    var scriptPath = path.join(__dirname, script);
    if (!fs.existsSync(scriptPath)) {
        scriptPath = path.join(__dirname, "dist", script);
    }
    if (!fs.existsSync(scriptPath)) {
        console.log("Failed locating " + script);
        return;
    }
    if (os.platform() === 'win32') {
        var Service = require('node-windows').Service;
        var svc_1 = new Service({
            name: serviceName,
            description: serviceName,
            script: scriptPath
        });
        svc_1.on('install', function () {
            console.log("Service \"".concat(serviceName, "\" installed successfully."));
            svc_1.start();
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
    }
    else {
        var svcPath = "/etc/systemd/system/".concat(svcName, ".service");
        if (fs.existsSync(svcPath)) {
            UninstallService(svcName, serviceName);
        }
        var nodepath = runner_1.runner.findNodePath();
        var svcContent = "\n      [Unit]\n      Description=".concat(serviceName, "\n      After=network.target\n\n      [Service]\n      Type=simple\n      ExecStart=").concat(nodepath, " ").concat(scriptPath, "\n      \n      Restart=on-failure\n\n      [Install]\n      WantedBy=multi-user.target\n   ");
        fs.writeFileSync(svcPath, svcContent);
        if (verbose)
            console.log("Service file created at \"".concat(svcPath, "\"."));
        Run("systemctl enable ".concat(serviceName, ".service"));
        Run("systemctl start ".concat(serviceName, ".service"));
        console.log("Service \"".concat(serviceName, "\" installed successfully."));
        console.log("sudo systemctl status ".concat(svcName, ".service\nsudo journalctl -efu ").concat(svcName));
    }
}
function UninstallService(svcName, serviceName) {
    if (os.platform() === 'win32') {
        var Service = require('node-windows').Service;
        var scriptPath = path.join(__dirname, "agent.js");
        if (!fs.existsSync(scriptPath)) {
            scriptPath = path.join(__dirname, "dist", "agent.js");
        }
        var svc = new Service({
            name: serviceName,
            description: serviceName,
            script: scriptPath
        });
        svc.on('uninstall', function () {
            console.log("Service \"".concat(serviceName, "\" uninstalled successfully."));
        });
        svc.uninstall();
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
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var nodepath, scriptPath, configfile, assistentConfig, reuse, _a, tokenkey, signinurl, jwt;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (serviceName == "" || serviceName == null) {
                        serviceName = "nodeagent";
                    }
                    if (service) {
                        nodepath = runner_1.runner.findNodePath();
                        scriptPath = path.join(__dirname, "agent.js");
                        console.log("run " + scriptPath);
                        RunStreamed(nodepath, [scriptPath], true);
                        return [2 /*return*/];
                    }
                    else {
                        console.log("Not running as service");
                    }
                    if (!(command === 'install' || command == "")) return [3 /*break*/, 4];
                    configfile = path.join(os.homedir(), ".openiap", "config.json");
                    console.log("Working with " + configfile);
                    assistentConfig = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
                    if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
                        assistentConfig = require(path.join(os.homedir(), ".openiap", "config.json"));
                    }
                    assistentConfig.apiurl = prompts("apiurl (Enter for ".concat(assistentConfig.apiurl, ")? "), assistentConfig.apiurl);
                    if (assistentConfig.apiurl == null)
                        process.exit(0);
                    if (assistentConfig.jwt != null && assistentConfig.jwt != "") {
                        reuse = prompts("Reuse existing token (Enter for yes)? (yes/no) ", { value: "yes", autocomplete: function () { return ["yes", "no"]; } });
                        if (reuse == null)
                            process.exit(0);
                        if (reuse == "no") {
                            assistentConfig.jwt = "";
                        }
                    }
                    if (!(assistentConfig.jwt == null || assistentConfig.jwt == "")) return [3 /*break*/, 3];
                    return [4 /*yield*/, agenttools_1.agenttools.AddRequestToken(assistentConfig.apiurl)];
                case 1:
                    _a = _b.sent(), tokenkey = _a[0], signinurl = _a[1];
                    console.log("Please open ".concat(signinurl, " in your browser and login with your OpenIAP account"));
                    return [4 /*yield*/, agenttools_1.agenttools.WaitForToken(assistentConfig.apiurl, tokenkey)];
                case 2:
                    jwt = _b.sent();
                    assistentConfig.jwt = jwt;
                    _b.label = 3;
                case 3:
                    if (!fs.existsSync(path.join(os.homedir(), ".openiap")))
                        fs.mkdirSync(path.join(os.homedir(), ".openiap"), { recursive: true });
                    fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(assistentConfig));
                    console.log("Installing service \"".concat(serviceName, "\"..."));
                    installService(serviceName, serviceName, 'agent.js');
                    return [3 /*break*/, 5];
                case 4:
                    if (command === 'uninstall') {
                        console.log("Uninstalling service \"".concat(serviceName, "\"..."));
                        UninstallService(serviceName, serviceName);
                    }
                    _b.label = 5;
                case 5:
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSwyQ0FBMEM7QUFFMUMsbUNBQWtDO0FBRWxDLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7QUFDM0MsYUFBYTtBQUNiLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDOUMsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLGVBQWUsQ0FBQztJQUNuRCxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7SUFDcEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO0NBQ3ZCLENBQUMsQ0FBQztBQUNILElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLGNBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLGNBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQy9DLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLGNBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRS9DLElB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