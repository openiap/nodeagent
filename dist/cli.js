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
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var scriptPath, Service, svc_1, svcPath, nodepath, svcContent;
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
                        script: scriptPath
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
                    return [3 /*break*/, 4];
                case 1:
                    svcPath = "/etc/systemd/system/".concat(svcName, ".service");
                    if (!fs.existsSync(svcPath)) return [3 /*break*/, 3];
                    return [4 /*yield*/, UninstallService(svcName, serviceName)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    nodepath = runner_1.runner.findNodePath();
                    svcContent = "\n        [Unit]\n        Description=".concat(serviceName, "\n        After=network.target\n  \n        [Service]\n        Type=simple\n        ExecStart=").concat(nodepath, " ").concat(scriptPath, "\n        \n        Restart=on-failure\n  \n        [Install]\n        WantedBy=multi-user.target\n     ");
                    fs.writeFileSync(svcPath, svcContent);
                    if (verbose)
                        console.log("Service file created at \"".concat(svcPath, "\"."));
                    Run("systemctl enable ".concat(serviceName, ".service"));
                    Run("systemctl start ".concat(serviceName, ".service"));
                    console.log("Service \"".concat(serviceName, "\" installed successfully."));
                    console.log("sudo systemctl status ".concat(svcName, ".service\nsudo journalctl -efu ").concat(svcName));
                    resolve();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); });
}
function UninstallService(svcName, serviceName) {
    return new Promise(function (resolve, reject) {
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
                    if (!(command === 'install' || command == "")) return [3 /*break*/, 5];
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
                    return [4 /*yield*/, installService(serviceName, serviceName, 'agent.js')];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 5:
                    if (!(command === 'uninstall')) return [3 /*break*/, 7];
                    console.log("Uninstalling service \"".concat(serviceName, "\"..."));
                    return [4 /*yield*/, UninstallService(serviceName, serviceName)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSwyQ0FBMEM7QUFFMUMsbUNBQWtDO0FBRWxDLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7QUFDM0MsYUFBYTtBQUNiLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDOUMsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLGVBQWUsQ0FBQztJQUNuRCxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7SUFDcEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO0NBQ3ZCLENBQUMsQ0FBQztBQUNILElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLGNBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLGNBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQy9DLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLGNBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRS9DLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNyQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDakIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUNwQyxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEIsSUFBSSxHQUFHLEtBQUssT0FBTyxJQUFJLEdBQUcsS0FBSyxPQUFPLEVBQUU7UUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtTQUFNLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssVUFBVSxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtRQUNuRixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDckMsT0FBTyxHQUFHLElBQUksQ0FBQztLQUNoQjtTQUFNLElBQUksR0FBRyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssTUFBTSxJQUFJLEdBQUcsS0FBSyxVQUFVLElBQUksR0FBRyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssVUFBVSxFQUFFO1FBQ3pHLE9BQU8sR0FBRyxJQUFJLENBQUM7S0FDaEI7U0FBTSxJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksR0FBRyxLQUFLLFVBQVUsSUFBSSxHQUFHLEtBQUssVUFBVSxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ3ZILE9BQU8sR0FBRyxTQUFTLENBQUM7S0FDckI7U0FBTSxJQUFJLEdBQUcsS0FBSyxXQUFXLElBQUksR0FBRyxLQUFLLFlBQVksSUFBSSxHQUFHLEtBQUssWUFBWSxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQzdILE9BQU8sR0FBRyxXQUFXLENBQUM7S0FDdkI7U0FBTSxJQUFJLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLLFNBQVMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1FBQ3JFLE9BQU8sR0FBRyxXQUFXLENBQUM7S0FDdkI7U0FBTSxJQUFJLEdBQUcsS0FBSyxjQUFjLElBQUksR0FBRyxLQUFLLGNBQWMsRUFBRTtRQUMzRCxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUMzQjtTQUFNLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFO1FBQzdFLFdBQVcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pDO1NBQU0sSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUN2QixXQUFXLEdBQUcsR0FBRyxDQUFDO0tBQ25CO0NBQ0Y7QUFDRCxTQUFTLEdBQUcsQ0FBQyxHQUFXO0lBQ3RCLElBQUk7UUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckQsSUFBRyxPQUFPO1lBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxPQUFPLE1BQU0sQ0FBQTtLQUNkO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN6QjtBQUNILENBQUM7QUFDRCxTQUFTLFdBQVcsQ0FBQyxPQUFlLEVBQUUsSUFBYyxFQUFDLElBQVk7SUFDL0QsSUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDaEQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBUTtRQUMvQixJQUFHLElBQUksSUFBSSxJQUFJO1lBQUUsT0FBTztRQUN4QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBUTtRQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxJQUFRO1FBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMseUNBQWtDLElBQUksQ0FBRSxDQUFDLENBQUM7UUFDdEQsSUFBRyxJQUFJO1lBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFDRCxTQUFTLGNBQWMsQ0FBQyxPQUFlLEVBQUUsV0FBbUIsRUFBRSxNQUFjO0lBQTVFLGlCQStFQztJQTlFQyxPQUFPLElBQUksT0FBTyxDQUFDLFVBQU8sT0FBTyxFQUFFLE1BQU07Ozs7O29CQUNuQyxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQzlDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUM5QixVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3FCQUNuRDtvQkFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsQ0FBQTt3QkFDeEMsTUFBTSxFQUFFLENBQUM7d0JBQ1Qsc0JBQU87cUJBQ1I7eUJBRUcsQ0FBQSxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxDQUFBLEVBQXpCLHdCQUF5QjtvQkFDckIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUM7b0JBRTFDLFFBQU0sSUFBSSxPQUFPLENBQUM7d0JBQ3RCLElBQUksRUFBQyxXQUFXO3dCQUNoQixXQUFXLEVBQUUsV0FBVzt3QkFDeEIsTUFBTSxFQUFFLFVBQVU7cUJBQ25CLENBQUMsQ0FBQztvQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxDQUFBO29CQUMxQyxLQUFHLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFO3dCQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7d0JBQ3pDLEtBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDaEIsQ0FBQyxDQUFDLENBQUM7b0JBQ0QsS0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUU7d0JBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQVksV0FBVywrQkFBMkIsQ0FBQyxDQUFDO3dCQUNoRSxLQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2QsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsS0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7d0JBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxXQUFXLDZCQUF5QixDQUFDLENBQUM7d0JBQzlELE9BQU8sRUFBRSxDQUFDO29CQUNaLENBQUMsQ0FBQyxDQUFDO29CQUNILEtBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO3dCQUNkLE1BQU0sRUFBRSxDQUFDO29CQUNYLENBQUMsQ0FBQyxDQUFDO29CQUNILEtBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFO3dCQUNiLE1BQU0sRUFBRSxDQUFDO29CQUNYLENBQUMsQ0FBQyxDQUFDO29CQUNILGtFQUFrRTtvQkFDbEUsS0FBRyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxjQUFRLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoRixLQUFHLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLGNBQVEsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RGLEtBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLGNBQVEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25FLEtBQUcsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsY0FBUSxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEYsS0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsY0FBUSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0QsS0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsY0FBUSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUQsS0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsY0FBUSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pELEtBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7O29CQUdSLE9BQU8sR0FBRyw4QkFBdUIsT0FBTyxhQUFVLENBQUM7eUJBQ3RELEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQXRCLHdCQUFzQjtvQkFDdkIscUJBQU0sZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxFQUFBOztvQkFBNUMsU0FBNEMsQ0FBQzs7O29CQUUzQyxRQUFRLEdBQUcsZUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUMvQixVQUFVLEdBQUcsZ0RBRUgsV0FBVywyR0FLYixRQUFRLGNBQUksVUFBVSw2R0FNcEMsQ0FBQztvQkFDRCxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDdEMsSUFBRyxPQUFPO3dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQTRCLE9BQU8sUUFBSSxDQUFDLENBQUM7b0JBQ2pFLEdBQUcsQ0FBQywyQkFBb0IsV0FBVyxhQUFVLENBQUMsQ0FBQTtvQkFDOUMsR0FBRyxDQUFDLDBCQUFtQixXQUFXLGFBQVUsQ0FBQyxDQUFBO29CQUU3QyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFZLFdBQVcsK0JBQTJCLENBQUMsQ0FBQztvQkFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBeUIsT0FBTyw0Q0FBa0MsT0FBTyxDQUFFLENBQUMsQ0FBQTtvQkFDeEYsT0FBTyxFQUFFLENBQUM7Ozs7O1NBRWIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsT0FBZSxFQUFFLFdBQW1CO0lBQzVELE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtRQUNqQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7WUFDN0IsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNoRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDOUIsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN2RDtZQUNDLElBQU0sR0FBRyxHQUFHLElBQUksT0FBTyxDQUFDO2dCQUN4QixJQUFJLEVBQUMsV0FBVztnQkFDaEIsV0FBVyxFQUFFLFdBQVc7Z0JBQ3hCLE1BQU0sRUFBRSxVQUFVO2FBQ25CLENBQUMsQ0FBQztZQUNILEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFDO2dCQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFZLFdBQVcsaUNBQTZCLENBQUMsQ0FBQztnQkFDbEUsT0FBTyxFQUFFLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQztZQUNILEdBQUcsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUM7Z0JBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQVksV0FBVyw0QkFBd0IsQ0FBQyxDQUFDO2dCQUM3RCxPQUFPLEVBQUUsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDO1lBQ0gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUM7Z0JBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxXQUFXLHlCQUFxQixDQUFDLENBQUM7Z0JBQzFELE1BQU0sRUFBRSxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUM7WUFFSCxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7U0FHakI7YUFBTTtZQUNMLElBQU0sT0FBTyxHQUFHLDhCQUF1QixPQUFPLGFBQVUsQ0FBQztZQUN6RCxJQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3pCLEdBQUcsQ0FBQyx5QkFBa0IsV0FBVyxhQUFVLENBQUMsQ0FBQTtnQkFDNUMsR0FBRyxDQUFDLDRCQUFxQixXQUFXLGFBQVUsQ0FBQyxDQUFBO2dCQUMvQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUE0QixPQUFPLFFBQUksQ0FBQyxDQUFDO2FBQ3REO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxXQUFXLGlDQUE2QixDQUFDLENBQUM7WUFDbEUsT0FBTyxFQUFFLENBQUM7U0FDWDtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQWUsSUFBSTs7Ozs7O29CQUNqQixJQUFJLFdBQVcsSUFBSSxFQUFFLElBQUksV0FBVyxJQUFJLElBQUksRUFBRTt3QkFDNUMsV0FBVyxHQUFHLFdBQVcsQ0FBQTtxQkFDMUI7b0JBQ0QsSUFBSSxPQUFPLEVBQUU7d0JBQ1AsUUFBUSxHQUFHLGVBQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQTt3QkFDaEMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsQ0FBQTt3QkFDaEMsV0FBVyxDQUFDLFFBQVEsRUFBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO3dCQUN4QyxzQkFBTztxQkFDUjt5QkFBTTt3QkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUE7cUJBQ3RDO3lCQUNHLENBQUEsT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLElBQUksRUFBRSxDQUFBLEVBQXRDLHdCQUFzQztvQkFDcEMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLENBQUE7b0JBQ3JDLGVBQWUsR0FBUSxFQUFFLFFBQVEsRUFBRSw0QkFBNEIsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDNUYsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQyxFQUFFO3dCQUNyRSxlQUFlLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO3FCQUMvRTtvQkFDRCxlQUFlLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyw0QkFBcUIsZUFBZSxDQUFDLE1BQU0sUUFBSyxFQUFFLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDM0csSUFBSSxlQUFlLENBQUMsTUFBTSxJQUFJLElBQUk7d0JBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFcEQsSUFBSSxlQUFlLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxlQUFlLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRTt3QkFDeEQsS0FBSyxHQUFHLE9BQU8sQ0FBQyxpREFBaUQsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLGNBQU0sT0FBQSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBYixDQUFhLEVBQUUsQ0FBQyxDQUFDO3dCQUM1SCxJQUFJLEtBQUssSUFBSSxJQUFJOzRCQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ25DLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTs0QkFDakIsZUFBZSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7eUJBQzFCO3FCQUVGO3lCQUVHLENBQUEsZUFBZSxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksZUFBZSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUEsRUFBeEQsd0JBQXdEO29CQUM1QixxQkFBTSx1QkFBVSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUE7O29CQUFoRixLQUF3QixTQUF3RCxFQUEvRSxRQUFRLFFBQUEsRUFBRSxTQUFTLFFBQUE7b0JBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQWUsU0FBUyx5REFBc0QsQ0FBQyxDQUFBO29CQUMvRSxxQkFBTSx1QkFBVSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFBOztvQkFBckUsR0FBRyxHQUFHLFNBQStEO29CQUMzRSxlQUFlLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQzs7O29CQUU1QixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQ2hJLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztvQkFFdEcsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBdUIsV0FBVyxVQUFNLENBQUMsQ0FBQztvQkFDdEQscUJBQU0sY0FBYyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUE7O29CQUExRCxTQUEwRCxDQUFDOzs7eUJBQ2xELENBQUEsT0FBTyxLQUFLLFdBQVcsQ0FBQSxFQUF2Qix3QkFBdUI7b0JBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQXlCLFdBQVcsVUFBTSxDQUFDLENBQUM7b0JBQ3hELHFCQUFNLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBQTs7b0JBQWhELFNBQWdELENBQUM7OztvQkFFbkQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7Q0FDakI7QUFDRCxJQUFJLEVBQUUsQ0FBQyJ9