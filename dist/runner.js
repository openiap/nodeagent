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
                            // const childProcess = spawn(command, parameters, { cwd: packagepath, env: { ...process.env, ...env } })
                            var childProcess = ctrossspawn(command, parameters, { cwd: packagepath, env: __assign(__assign({}, process.env), env) });
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
    // spawn EINVAL  - https://github.com/nodejs/node/issues/52554
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
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, npmpath, ["install", "--omit=dev", "--production", "--verbose"], false)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUF1RjtBQUV2Rix1QkFBeUI7QUFDekIsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qiw0Q0FBbUQ7QUFDbkQsaUNBQWdDO0FBQ2hDLDhCQUFnQztBQUVoQywrQkFBK0I7QUFFL0IsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRW5DLElBQUEsSUFBSSxHQUFVLGdCQUFNLEtBQWhCLEVBQUUsR0FBRyxHQUFLLGdCQUFNLElBQVgsQ0FBWTtBQUM3QjtJQUFBO0lBS0EsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMWSx3Q0FBYztBQU0zQjtJQUFBO0lBU0EsQ0FBQztJQUFELG9CQUFDO0FBQUQsQ0FBQyxBQVRELElBU0M7QUFUWSxzQ0FBYTtBQVUxQixJQUFJLFFBQVEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzFCO0lBQUE7SUE2ZkEsQ0FBQztJQXpmdUIsbUJBQVksR0FBaEMsVUFBaUMsTUFBZSxFQUFFLFFBQWdCLEVBQUUsT0FBd0IsRUFBRSxXQUEyQjtRQUEzQiw0QkFBQSxFQUFBLGtCQUEyQjs7Ozs7O3dCQUMvRyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsRUFBRSxJQUFJLFFBQVEsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFBO3dCQUNwRCxJQUFHLENBQUMsSUFBSSxJQUFJOzRCQUFFLHNCQUFPO3dCQUNyQixJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUM5QyxPQUFPLEdBQUcsTUFBTSxDQUFDLElB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