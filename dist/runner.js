"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.runner = exports.runner_stream = exports.runner_process = void 0;
var child_process_1 = require("child_process");
var fs = require("fs");
var os = require("os");
var path = require("path");
var nodeapi_1 = require("@openiap/nodeapi");
var agent_1 = require("./agent");
var yaml = require("js-yaml");
var util_1 = require("./util");
var ctrossspawn = require('cross-spawn');
var info = nodeapi_1.config.info, err = nodeapi_1.config.err;
var runner_process = /** @class */ (function () {
    function runner_process() {
    }
    return runner_process;
}());
exports.runner_process = runner_process;
var runner_stream = /** @class */ (function () {
    function runner_stream() {
    }
    return runner_stream;
}());
exports.runner_stream = runner_stream;
var lastping = new Date();
var runner = /** @class */ (function () {
    function runner() {
    }
    runner.notifyStream = function (client, streamid, message, addtobuffer) {
        if (addtobuffer === void 0) { addtobuffer = true; }
        return __awaiter(this, void 0, void 0, function () {
            var s, now, minutes, _loop_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        s = runner.streams.find(function (x) { return x.id == streamid; });
                        if (s == null)
                            return [2 /*return*/];
                        if (message != null && !Buffer.isBuffer(message)) {
                            message = Buffer.from(message + "\n");
                        }
                        s.stream.push(message);
                        if (addtobuffer)
                            agent_1.agent.emit("stream", s, message);
                        if (process.env.DEBUG != null && process.env.DEBUG != "") {
                            if (message != null) {
                                console.log(message.toString());
                            }
                        }
                        if (addtobuffer && message != null) {
                            if (s.buffer == null)
                                s.buffer = Buffer.from("");
                            if (Buffer.isBuffer(message)) {
                                s.buffer = Buffer.concat([s.buffer, message]);
                            }
                            else {
                                s.buffer = Buffer.concat([s.buffer, Buffer.from(message)]);
                            }
                            if (s.buffer.length > 1000000) {
                                // keep first 500k and remove rest
                                s.buffer = s.buffer.subarray(0, 500000);
                            }
                        }
                        now = new Date();
                        minutes = (now.getTime() - lastping.getTime()) / 60000;
                        if (minutes > 5) {
                            lastping = now;
                        }
                        _loop_1 = function (i) {
                            var streamqueue, error_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        streamqueue = runner.commandstreams[i];
                                        if (!(streamqueue != null && streamqueue != "")) return [3 /*break*/, 8];
                                        if (minutes > 5) { // backwars compatibility with older builds of openflow 1.5
                                            client.QueueMessage({ queuename: streamqueue, data: { "command": "ping" } }, true).catch(function (error) {
                                                console.error("notifyStream: " + error.message);
                                                var index = runner.commandstreams.indexOf(streamqueue);
                                                if (index > -1)
                                                    runner.commandstreams.splice(index, 1);
                                            }).then(function (result) {
                                                if (result != null && result.command == "timeout") {
                                                    console.log("notifyStream, remove streamqueue " + streamqueue);
                                                    var index = runner.commandstreams.indexOf(streamqueue);
                                                    if (index > -1)
                                                        runner.commandstreams.splice(index, 1);
                                                }
                                            });
                                        }
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 6, , 7]);
                                        if (!(message == null)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "completed", "data": message }, correlationId: streamid })];
                                    case 2:
                                        _b.sent();
                                        return [3 /*break*/, 5];
                                    case 3: return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": message }, correlationId: streamid })];
                                    case 4:
                                        _b.sent();
                                        _b.label = 5;
                                    case 5: return [3 /*break*/, 7];
                                    case 6:
                                        error_1 = _b.sent();
                                        console.log("notifyStream, remove streamqueue " + streamqueue);
                                        runner.commandstreams.splice(i, 1);
                                        return [3 /*break*/, 7];
                                    case 7: return [3 /*break*/, 9];
                                    case 8:
                                        runner.commandstreams.splice(i, 1);
                                        _b.label = 9;
                                    case 9: return [2 /*return*/];
                                }
                            });
                        };
                        i = runner.commandstreams.length - 1;
                        _a.label = 1;
                    case 1:
                        if (!(i >= 0)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i--;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    runner.removestream = function (client, streamid, success, buffer) {
        var s = runner.streams.find(function (x) { return x.id == streamid; });
        if (s != null) {
            s.stream.push(null);
            runner.streams = runner.streams.filter(function (x) { return x.id != streamid; });
            agent_1.agent.emit("streamremoved", s);
            var data = { "command": "runpackage", success: success, "completed": true, "data": buffer };
            try {
                var _loop_2 = function (i) {
                    var streamqueue = runner.commandstreams[i];
                    if (streamqueue != null && streamqueue != "") {
                        console.log("removestream streamid/correlationId: " + streamid + " streamqueue: " + streamqueue);
                        client.QueueMessage({ queuename: streamqueue, data: data, correlationId: streamid }).catch(function (error) {
                            console.log("removestream, remove streamqueue " + streamqueue);
                            var index = runner.commandstreams.indexOf(streamqueue);
                            if (index > -1)
                                runner.commandstreams.splice(index, 1);
                        });
                    }
                };
                for (var i = runner.commandstreams.length - 1; i >= 0; i--) {
                    _loop_2(i);
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    };
    runner.runit = function (client, packagepath, streamid, command, parameters, clearstream, env) {
        if (env === void 0) { env = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b, _c;
                        try {
                            if (clearstream) {
                                var xvfb = runner.findXvfbPath();
                                if (xvfb != null && xvfb != "") {
                                    var shellcommand = command;
                                    var _parameters = parameters;
                                    command = xvfb;
                                    parameters = [];
                                    parameters.push("--server-args=\"-screen 0 1920x1080x24 -ac\"");
                                    parameters.push("--auto-servernum");
                                    parameters.push("--server-num=1");
                                    parameters.push(shellcommand);
                                    parameters = parameters.concat(_parameters);
                                }
                            }
                            console.log('Running command:', command + " " + parameters.join(" "));
                            var childProcess = (0, child_process_1.spawn)(command, parameters, { cwd: packagepath, env: __assign(__assign({}, process.env), env) });
                            agent_1.agent.emit("runit", { streamid: streamid, command: command, parameters: parameters, cwd: packagepath, env: __assign(__assign({}, process.env), env) });
                            var pid_1 = childProcess.pid;
                            var p_1 = { id: streamid, pid: pid_1, p: childProcess, forcekilled: false };
                            runner.processs.push(p_1);
                            runner.notifyStream(client, streamid, "Child process started as pid ".concat(pid_1));
                            var catchoutput = function (data) {
                                if (data != null) {
                                    var s = data.toString();
                                    if (s.startsWith("Debugger listening"))
                                        return;
                                    if (s.startsWith("Debugger attached"))
                                        return;
                                    if (s.startsWith("Waiting for the debugger to"))
                                        return;
                                }
                                runner.notifyStream(client, streamid, data);
                            };
                            (_a = childProcess.stdio[1]) === null || _a === void 0 ? void 0 : _a.on('data', catchoutput);
                            (_b = childProcess.stdio[2]) === null || _b === void 0 ? void 0 : _b.on('data', catchoutput);
                            (_c = childProcess.stdio[3]) === null || _c === void 0 ? void 0 : _c.on('data', catchoutput);
                            childProcess.on('close', function (code) {
                                // @ts-ignore
                                if (code == false || code == null) {
                                    runner.notifyStream(client, streamid, "Child process ".concat(pid_1, " exited"));
                                    code = 0;
                                }
                                else {
                                    runner.notifyStream(client, streamid, "Child process ".concat(pid_1, " exited with code ").concat(code));
                                    p_1.forcekilled = true;
                                }
                                runner.processs = runner.processs.filter(function (x) { return x.pid != pid_1; });
                                if (clearstream == true) {
                                    runner.removestream(client, streamid, true, "");
                                }
                                resolve(code);
                            });
                        }
                        catch (error) {
                            reject(error);
                        }
                    })];
            });
        });
    };
    runner.findInPath = function (exec) {
        try {
            var command = void 0;
            switch (process.platform) {
                case 'linux':
                case 'darwin':
                    command = 'which';
                    break;
                case 'win32':
                    command = 'where.exe';
                    break;
                default:
                    throw new Error("Unsupported platform: ".concat(process.platform));
            }
            var result = ctrossspawn.sync(command, [exec], { stdio: 'pipe' });
            if (result.status === 0) {
                var stdout = result.stdout.toString();
                var lines = stdout.split(/\r?\n/).filter(function (line) { return line.trim() !== ''; })
                    .filter(function (line) { return line.toLowerCase().indexOf("windowsapps\\python3.exe") == -1; })
                    .filter(function (line) { return line.toLowerCase().indexOf("windowsapps\\python.exe") == -1; });
                if (lines.length > 0)
                    return lines[0];
            }
            else {
                if (result.stderr != null && result.stderr.toString() != "") {
                }
                if (result.stdout != null && result.stdout.toString() != "") {
                }
            }
            return "";
        }
        catch (error) {
            return "";
        }
    };
    runner.findInPath2 = function (exec) {
        try {
            var command = void 0;
            switch (process.platform) {
                case 'linux':
                case 'darwin':
                    command = 'which ' + exec;
                    break;
                case 'win32':
                    command = 'where ' + exec;
                    break;
                default:
                    throw new Error("Unsupported platform: ".concat(process.platform));
            }
            var stdout = (0, child_process_1.execSync)(command, { stdio: 'pipe' }).toString();
            var lines = stdout.split(/\r?\n/).filter(function (line) { return line.trim() !== ''; })
                .filter(function (line) { return line.toLowerCase().indexOf("windowsapps\\python3.exe") == -1; })
                .filter(function (line) { return line.toLowerCase().indexOf("windowsapps\\python.exe") == -1; });
            if (lines.length > 0)
                return lines[0];
            return "";
        }
        catch (error) {
            return "";
        }
    };
    runner._kill = function (pid) {
        return __awaiter(this, void 0, void 0, function () {
            var isWindows;
            return __generator(this, function (_a) {
                isWindows = process.platform === 'win32';
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (isWindows) {
                            (0, child_process_1.exec)("taskkill /PID ".concat(pid, " /T /F"), function (err, stdout, stderr) {
                                if (err)
                                    reject(err);
                                else
                                    resolve(stdout);
                            });
                        }
                        else {
                            (0, child_process_1.exec)("kill -9 ".concat(pid), function (err, stdout, stderr) {
                                if (err)
                                    reject(err);
                                else
                                    resolve(stdout);
                            });
                        }
                    })];
            });
        });
    };
    runner.killProcessAndChildren = function (client, streamid, pid) {
        return __awaiter(this, void 0, void 0, function () {
            var subpids, i, error_2, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        subpids = runner.findChildProcesses(pid);
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < subpids.length)) return [3 /*break*/, 8];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, runner.killProcessAndChildren(client, streamid, subpids[i])];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, runner.notifyStream(client, streamid, "Send SIGTERM to child process " + subpids[i] + " of process " + pid)];
                    case 4:
                        _a.sent();
                        console.log("Send SIGTERM to child process " + subpids[i] + " of process " + pid);
                        return [4 /*yield*/, runner._kill(subpids[i])];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        runner.notifyStream(client, streamid, "Failed to kill sub process " + subpids[i] + " " + error_2.message);
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_3 = _a.sent();
                        runner.notifyStream(client, streamid, "Failed to kill sub process " + pid + " " + error_3.message);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    runner.kill = function (client, streamid) {
        return __awaiter(this, void 0, void 0, function () {
            var p, i, pid, killDate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        p = runner.processs.filter(function (x) { return x.id == streamid; });
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < p.length)) return [3 /*break*/, 16];
                        pid = p[i].p.pid;
                        return [4 /*yield*/, runner.killProcessAndChildren(client, streamid, pid)];
                    case 2:
                        _a.sent();
                        runner.notifyStream(client, streamid, "Send SIGTERM to process " + pid);
                        console.log("Send SIGTERM to process " + pid);
                        return [4 /*yield*/, (0, util_1.sleep)(10)];
                    case 3:
                        _a.sent();
                        p[i].forcekilled = true;
                        p[i].p.kill('SIGTERM');
                        killDate = new Date();
                        _a.label = 4;
                    case 4:
                        if (!(p[i].p.exitCode == null)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, util_1.sleep)(10)];
                    case 5:
                        _a.sent();
                        if (new Date().getTime() - killDate.getTime() > 5000) {
                            return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 4];
                    case 6:
                        if (!(p[i].p.exitCode == null)) return [3 /*break*/, 10];
                        runner.notifyStream(client, streamid, "Send SIGINT to process " + pid);
                        console.log("Send SIGINT to process " + pid);
                        return [4 /*yield*/, (0, util_1.sleep)(10)];
                    case 7:
                        _a.sent();
                        p[i].forcekilled = true;
                        p[i].p.kill('SIGINT');
                        killDate = new Date();
                        _a.label = 8;
                    case 8:
                        if (!(p[i].p.exitCode == null)) return [3 /*break*/, 10];
                        return [4 /*yield*/, (0, util_1.sleep)(10)];
                    case 9:
                        _a.sent();
                        if (new Date().getTime() - killDate.getTime() > 5000) {
                            return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 8];
                    case 10:
                        if (!(p[i].p.exitCode == null)) return [3 /*break*/, 14];
                        runner.notifyStream(client, streamid, "Send SIGKILL to process " + pid);
                        console.log("Send SIGKILL to process " + pid);
                        return [4 /*yield*/, (0, util_1.sleep)(10)];
                    case 11:
                        _a.sent();
                        p[i].forcekilled = true;
                        p[i].p.kill('SIGKILL');
                        killDate = new Date();
                        _a.label = 12;
                    case 12:
                        if (!(p[i].p.exitCode == null)) return [3 /*break*/, 14];
                        return [4 /*yield*/, (0, util_1.sleep)(10)];
                    case 13:
                        _a.sent();
                        if (new Date().getTime() - killDate.getTime() > 5000) {
                            return [3 /*break*/, 14];
                        }
                        return [3 /*break*/, 12];
                    case 14:
                        if (p[i].p.exitCode == null) {
                            runner.notifyStream(client, streamid, "Failed to kill process " + pid);
                        }
                        _a.label = 15;
                    case 15:
                        i++;
                        return [3 /*break*/, 1];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    runner.findPythonPath = function () {
        var result = runner.findInPath("python3");
        if (result == "")
            result = runner.findInPath("python");
        return result;
    };
    runner.findCondaPath = function () {
        var result = runner.findInPath("conda");
        if (result == "")
            result = runner.findInPath("micromamba");
        return result;
    };
    runner.findPwShPath = function () {
        var result = runner.findInPath("pwsh");
        if (result == "")
            result = runner.findInPath("powershell");
        return result;
    };
    runner.findDotnetPath = function () {
        return runner.findInPath("dotnet");
    };
    runner.findXvfbPath = function () {
        return runner.findInPath("xvfb-run");
    };
    runner.findNodePath = function () {
        return runner.findInPath("node");
    };
    runner.findNPMPath = function () {
        var child = (process.platform === 'win32' ? 'npm.cmd' : 'npm');
        return runner.findInPath(child);
    };
    runner.findChromiumPath = function () {
        var result = runner.findInPath("chromium-browser");
        if (result == "")
            result = runner.findInPath("chromium");
        return result;
    };
    runner.findChromePath = function () {
        var result = runner.findInPath("google-chrome");
        if (result == "")
            result = runner.findInPath("chrome");
        return result;
    };
    runner.Generatenpmrc = function (client, packagepath, streamid) {
        return __awaiter(this, void 0, void 0, function () {
            var npmrcFile, HTTP_PROXY, HTTPS_PROXY, NO_PROXY, NPM_REGISTRY, NPM_TOKEN, content;
            return __generator(this, function (_a) {
                npmrcFile = path.join(packagepath, ".npmrc");
                if (fs.existsSync(npmrcFile))
                    return [2 /*return*/];
                HTTP_PROXY = process.env.HTTP_PROXY;
                HTTPS_PROXY = process.env.HTTPS_PROXY;
                NO_PROXY = process.env.NO_PROXY;
                NPM_REGISTRY = process.env.NPM_REGISTRY;
                NPM_TOKEN = process.env.NPM_TOKEN;
                if (HTTP_PROXY == null || HTTP_PROXY == "" || HTTP_PROXY == "undefined" || HTTP_PROXY == "null")
                    HTTP_PROXY = "";
                if (HTTPS_PROXY == null || HTTPS_PROXY == "" || HTTPS_PROXY == "undefined" || HTTPS_PROXY == "null")
                    HTTPS_PROXY = "";
                if (NO_PROXY == null || NO_PROXY == "" || NO_PROXY == "undefined" || NO_PROXY == "null")
                    NO_PROXY = "";
                if (NPM_REGISTRY == null || NPM_REGISTRY == "" || NPM_REGISTRY == "undefined" || NPM_REGISTRY == "null")
                    NPM_REGISTRY = "";
                if (NPM_TOKEN == null || NPM_TOKEN == "" || NPM_TOKEN == "undefined" || NPM_TOKEN == "null")
                    NPM_TOKEN = "";
                if (HTTP_PROXY != "" || HTTPS_PROXY != "" || NPM_REGISTRY != "") {
                    content = "";
                    if (HTTP_PROXY != "")
                        content += "proxy=" + HTTP_PROXY + "\n";
                    if (HTTPS_PROXY != "")
                        content += "https-proxy=" + HTTPS_PROXY + "\n";
                    if (NO_PROXY != "")
                        content += "noproxy=" + NO_PROXY + "\n";
                    if (NPM_REGISTRY != null && NPM_REGISTRY != "") {
                        content += "\n" + "registry=" + NPM_REGISTRY;
                        if (NPM_TOKEN != null && NPM_TOKEN != "") {
                            content += "\n" + NPM_REGISTRY.replace("https:", "").replace("http:", "") + ":_authToken=" + NPM_TOKEN;
                        }
                    }
                    else {
                        content += "\n" + "registry=http://registry.npmjs.org/";
                        if (NPM_TOKEN != null && NPM_TOKEN != "") {
                            content += "\n" + "//registry.npmjs.org/:_authToken=" + NPM_TOKEN;
                        }
                    }
                    fs.writeFileSync(npmrcFile, content);
                }
                return [2 /*return*/];
            });
        });
    };
    runner.pipinstall = function (client, packagepath, streamid, pythonpath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (fs.existsSync(path.join(packagepath, "requirements.txt.done")))
                            return [2 /*return*/];
                        if (!fs.existsSync(path.join(packagepath, "requirements.txt"))) return [3 /*break*/, 3];
                        runner.notifyStream(client, streamid, "************************");
                        runner.notifyStream(client, streamid, "**** Running pip install");
                        runner.notifyStream(client, streamid, "************************");
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, pythonpath, ["-m", "pip", "install", "-r", path.join(packagepath, "requirements.txt")], false)];
                    case 1:
                        if (!((_a.sent()) == 0)) return [3 /*break*/, 3];
                        // WHY is this needed ???
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, pythonpath, ["-m", "pip", "install", "--upgrade", "protobuf"], false)];
                    case 2:
                        // WHY is this needed ???
                        _a.sent();
                        fs.writeFileSync(path.join(packagepath, "requirements.txt.done"), "done");
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    runner.condaenv = function (packagepath, condapath) {
        return __awaiter(this, void 0, void 0, function () {
            var CONDA_PREFIX;
            return __generator(this, function (_a) {
                CONDA_PREFIX = process.env.CONDA_PREFIX;
                if (CONDA_PREFIX == null || CONDA_PREFIX == "")
                    CONDA_PREFIX = "";
                return [2 /*return*/];
            });
        });
    };
    runner.condainstall = function (client, packagepath, streamid, condapath) {
        return __awaiter(this, void 0, void 0, function () {
            var envname, envfile, fileContents, data, param, param_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        envname = null;
                        envfile = "";
                        if (fs.existsSync(path.join(packagepath, "conda.yaml")))
                            envfile = "conda.yaml";
                        if (fs.existsSync(path.join(packagepath, "conda.yml")))
                            envfile = "conda.yml";
                        if (fs.existsSync(path.join(packagepath, "environment.yml")))
                            envfile = "environment.yml";
                        if (fs.existsSync(path.join(packagepath, "environment.yaml")))
                            envfile = "environment.yaml";
                        if (envfile != "") {
                            fileContents = fs.readFileSync(path.join(packagepath, envfile), 'utf8');
                            data = yaml.load(fileContents);
                            if (data != null)
                                envname = data.name;
                            if (envname == null || envname == "") {
                                data.name = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                                envname = data.name;
                                console.error("No name found in conda environment file, auto generated name: " + envname);
                                fileContents = yaml.dump(data);
                                fs.writeFileSync(path.join(packagepath, envfile), fileContents);
                            }
                        }
                        if (envname == null)
                            return [2 /*return*/, envname];
                        if (!fs.existsSync(path.join(packagepath, envfile)))
                            return [2 /*return*/, envname];
                        param = ["env", "create", "-f", path.join(packagepath, envfile)];
                        if (condapath.indexOf("micromamba") != -1) {
                            param = ["env", "create", "-y", "-f", path.join(packagepath, envfile)];
                        }
                        if (!fs.existsSync("/opt/conda/envs/")) return [3 /*break*/, 4];
                        if (!fs.existsSync("/opt/conda/envs/" + envname)) return [3 /*break*/, 2];
                        param_1 = ["env", "update", "-f", path.join(packagepath, envfile)];
                        if (condapath.indexOf("micromamba") != -1) {
                            param_1 = ["env", "update", "-y", "-f", path.join(packagepath, envfile)];
                        }
                        runner.notifyStream(client, streamid, "*******************************");
                        runner.notifyStream(client, streamid, "**** Running update environment");
                        runner.notifyStream(client, streamid, "*******************************");
                        console.log(condapath, param_1.join(" "));
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, condapath, param_1, false)];
                    case 1:
                        if ((_a.sent()) == 0) {
                            return [2 /*return*/, envname];
                        }
                        throw new Error("Failed to update environment");
                    case 2:
                        console.log(condapath, param.join(" "));
                        runner.notifyStream(client, streamid, "*******************************");
                        runner.notifyStream(client, streamid, "**** Running create environment");
                        runner.notifyStream(client, streamid, "*******************************");
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, condapath, param, false)];
                    case 3:
                        if ((_a.sent()) == 0) {
                            return [2 /*return*/, envname];
                        }
                        throw new Error("Failed to create environment");
                    case 4:
                        runner.notifyStream(client, streamid, "*******************************");
                        runner.notifyStream(client, streamid, "**** Running create environment");
                        runner.notifyStream(client, streamid, "*******************************");
                        console.log(condapath, param.join(" "));
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, condapath, param, false)];
                    case 5:
                        if ((_a.sent()) == 0) {
                            return [2 /*return*/, envname];
                        }
                        throw new Error("Failed to create environment");
                }
            });
        });
    };
    runner.npminstall = function (client, packagepath, streamid) {
        return __awaiter(this, void 0, void 0, function () {
            var nodePath, npmpath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, runner.Generatenpmrc(client, packagepath, streamid)];
                    case 1:
                        _a.sent();
                        if (!fs.existsSync(path.join(packagepath, "package.json"))) return [3 /*break*/, 3];
                        console.log("************************");
                        console.log("**** Running npm install");
                        console.log("************************");
                        nodePath = runner.findNodePath();
                        runner.notifyStream(client, streamid, "************************");
                        runner.notifyStream(client, streamid, "**** Running npm install");
                        runner.notifyStream(client, streamid, "************************");
                        npmpath = runner.findNPMPath();
                        if (npmpath == "")
                            throw new Error("Failed locating NPM, is it installed and in the path?");
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, npmpath, ["install"], false)];
                    case 2:
                        if ((_a.sent()) == 0) {
                            return [2 /*return*/, true];
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/, false];
                }
            });
        });
    };
    runner.runpythonscript = function (script) {
        return __awaiter(this, void 0, void 0, function () {
            var pythonpath;
            return __generator(this, function (_a) {
                pythonpath = runner.findPythonPath();
                if (pythonpath == null)
                    throw new Error("Python not found");
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var childProcess = (0, child_process_1.spawn)(pythonpath, [script], { cwd: process.cwd() });
                        var pid = childProcess.pid;
                        var output = "";
                        var catchoutput = function (data) {
                            if (data != null) {
                                var s = data.toString();
                                output += s;
                            }
                        };
                        childProcess.stdout.on('data', catchoutput);
                        childProcess.stderr.on('data', catchoutput);
                        childProcess.stdout.on('close', function (code) {
                            if (code == false || code == null) {
                                resolve(output);
                            }
                            else {
                                reject(output);
                            }
                        });
                    })];
            });
        });
    };
    runner.runpythoncode = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var tempfilename;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tempfilename = path.join(os.tmpdir(), "temp.py");
                        fs.writeFileSync(tempfilename, code);
                        return [4 /*yield*/, this.runpythonscript(tempfilename)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    runner.findChildProcesses = function (pid) {
        var isWindows = process.platform === 'win32';
        try {
            if (isWindows) {
                var stdout = (0, child_process_1.execSync)("wmic process where (ParentProcessId=".concat(pid, ") get ProcessId"), { encoding: 'utf-8' });
                var pids = stdout.split(/\r?\n/).slice(1).filter(function (line) { return line.trim() !== ''; }).map(function (line) { return line.trim(); });
                return pids;
            }
            else {
                var stdout = (0, child_process_1.execSync)("pgrep -P ".concat(pid), { encoding: 'utf-8' });
                // Adjusted error handling for Unix-like systems
                var pids = stdout.split(/\n/).filter(function (pid) { return pid !== ''; });
                return pids;
            }
        }
        catch (error) {
            // Handle errors here
            throw error;
        }
    };
    runner.processs = [];
    runner.streams = [];
    runner.commandstreams = [];
    return runner;
}());
exports.runner = runner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUF1RjtBQUV2Rix1QkFBeUI7QUFDekIsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qiw0Q0FBbUQ7QUFDbkQsaUNBQWdDO0FBQ2hDLDhCQUFnQztBQUVoQywrQkFBK0I7QUFFL0IsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRW5DLElBQUEsSUFBSSxHQUFVLGdCQUFNLEtBQWhCLEVBQUUsR0FBRyxHQUFLLGdCQUFNLElBQVgsQ0FBWTtBQUM3QjtJQUFBO0lBS0EsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMWSx3Q0FBYztBQU0zQjtJQUFBO0lBU0EsQ0FBQztJQUFELG9CQUFDO0FBQUQsQ0FBQyxBQVRELElBU0M7QUFUWSxzQ0FBYTtBQVUxQixJQUFJLFFBQVEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzFCO0lBQUE7SUEyZkEsQ0FBQztJQXZmdUIsbUJBQVksR0FBaEMsVUFBaUMsTUFBZSxFQUFFLFFBQWdCLEVBQUUsT0FBd0IsRUFBRSxXQUEyQjtRQUEzQiw0QkFBQSxFQUFBLGtCQUEyQjs7Ozs7O3dCQUMvRyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsRUFBRSxJQUFJLFFBQVEsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFBO3dCQUNwRCxJQUFHLENBQUMsSUFBSSxJQUFJOzRCQUFFLHNCQUFPO3dCQUNyQixJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUM5QyxPQUFPLEdBQUcsTUFBTSxDQUFDLElB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