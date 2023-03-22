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
var serviceName = "";
var command = "";
var verbose = false;
var service = false;
for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === '-v' || arg === '-verbose' || arg === '/v' || arg === '/verbose') {
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
        var output = childProcess.execSync(cmd).toString();
        if (verbose)
            console.log(output);
        return output;
    }
    catch (error) {
        return error.toString();
    }
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
        Run("sc create \"".concat(svcName, "\" binPath=\"").concat(svcPath, "\" DisplayName=\"").concat(serviceName, "\" Description=\"").concat(svcDescription, "\" start=auto"));
        Run("reg add ".concat(svcRegPath, " /v DependOnService /t REG_MULTI_SZ /d EventLog /f"));
        Run("net start ".concat(svcName));
        console.log("Service \"".concat(serviceName, "\" installed successfully."));
    }
    else {
        var svcPath = "/etc/systemd/system/".concat(svcName, ".service");
        if (fs.existsSync(svcPath)) {
            UninstallService(svcName, serviceName);
        }
        var svcContent = "\n      [Unit]\n      Description=".concat(serviceName, "\n      After=network.target\n\n      [Service]\n      Type=simple\n      ExecStart=/usr/bin/node ").concat(scriptPath, "\n      \n      Restart=on-failure\n\n      [Install]\n      WantedBy=multi-user.target\n   ");
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
        var svcRegPath = "HKLM\\SYSTEM\\CurrentControlSet\\Services\\".concat(svcName);
        Run("net stop ".concat(svcName));
        Run("sc delete \"".concat(svcName, "\""));
        Run("reg delete ".concat(svcRegPath, " /f"));
        console.log("Service \"".concat(serviceName, "\" uninstalled successfully."));
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
        var scriptPath, configfile, assistentConfig, reuse, _a, tokenkey, signinurl, jwt;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (serviceName == "" || serviceName == null) {
                        serviceName = "nodeagent";
                    }
                    if (service) {
                        scriptPath = path.join(__dirname, "agent.js");
                        console.log("run " + scriptPath);
                        Run("node ".concat(scriptPath));
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
                        fs.mkdirSync(path.join(os.homedir(), ".openiap"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSwyQ0FBMEM7QUFFMUMsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztBQUMzQyxhQUFhO0FBQ2IsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5QyxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsZUFBZSxDQUFDO0lBQ25ELEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztJQUNwQixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07Q0FDdkIsQ0FBQyxDQUFDO0FBQ0gsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFbkMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNqQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDcEIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3BDLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLFVBQVUsSUFBSSxHQUFHLEtB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