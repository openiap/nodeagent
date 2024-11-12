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
    runner.getExecutablePath = function (baseFolder, command) {
        var arch = os.arch(); // e.g., 'x64', 'arm64', 'ia32'
        var platform = os.platform(); // e.g., 'linux', 'darwin', 'win32'
        var isWindows = platform === 'win32';
        var extensions = isWindows ? ['.exe', '.cmd', '.com'] : [''];
        var platformArch = "".concat(platform, "-").concat(arch);
        var executables = [];
        // Helper function to check if a file is executable
        var isExecutable = function (file) {
            var ext = path.extname(file).toLowerCase();
            if (isWindows) {
                return extensions.includes(ext);
            }
            else {
                try {
                    var stats = fs.statSync(file);
                    return stats.isFile() && (stats.mode & 73);
                }
                catch (_a) {
                    return false;
                }
            }
        };
        // List all files in the base folder
        var files = fs.readdirSync(baseFolder);
        // Collect all executable files
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var filePath = path.join(baseFolder, file);
            if (isExecutable(filePath)) {
                executables.push(file);
            }
        }
        // If only one executable is found, return it
        if (executables.length === 1) {
            return path.join(baseFolder, executables[0]);
        }
        // Try to find an exact match with platform-arch
        var exactMatches = executables.filter(function (file) {
            return file.includes(platformArch);
        });
        if (exactMatches.length === 1) {
            return path.join(baseFolder, exactMatches[0]);
        }
        // If no exact match, try to find a match with just the platform
        var platformMatches = executables.filter(function (file) {
            return file.includes(platform);
        });
        if (platformMatches.length === 1) {
            return path.join(baseFolder, platformMatches[0]);
        }
        // If still ambiguous, return an error with the list of executables found
        throw new Error("Multiple executables found: ".concat(executables.join(', '), ". Unable to determine the correct one."));
    };
    runner.runit = function (client, packagepath, streamid, command, parameters, clearstream, env) {
        if (env === void 0) { env = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b, _c;
                        try {
                            var usingxvf = false;
                            //if (clearstream) {
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
                                usingxvf = true;
                            }
                            //}
                            console.log('Running command:', command + " " + parameters.join(" "));
                            console.log('In Working directory:', packagepath);
                            // const childProcess = spawn(command, parameters, { cwd: packagepath, env: { ...process.env, ...env } })
                            var childProcess = ctrossspawn(command, parameters, { cwd: packagepath, env: __assign(__assign({}, process.env), env) });
                            agent_1.agent.emit("runit", { streamid: streamid, command: command, parameters: parameters, cwd: packagepath, env: __assign(__assign({}, process.env), env) });
                            var pid_1 = childProcess.pid;
                            var p_1 = { id: streamid, pid: pid_1, p: childProcess, forcekilled: false };
                            runner.processs.push(p_1);
                            if (usingxvf) {
                                runner.notifyStream(client, streamid, "Child process started as pid ".concat(pid_1, " using xvfb"));
                            }
                            else {
                                runner.notifyStream(client, streamid, "Child process started as pid ".concat(pid_1));
                            }
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
    runner.findCargoPath = function () {
        var child = (process.platform === 'win32' ? 'cargo.cmd' : 'cargo');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUF1RjtBQUV2Rix1QkFBeUI7QUFDekIsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qiw0Q0FBbUQ7QUFDbkQsaUNBQWdDO0FBQ2hDLDhCQUFnQztBQUVoQywrQkFBK0I7QUFFL0IsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRW5DLElBQUEsSUFBSSxHQUFVLGdCQUFNLEtBQWhCLEVBQUUsR0FBRyxHQUFLLGdCQUFNLElBQVgsQ0FBWTtBQUM3QjtJQUFBO0lBS0EsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMWSx3Q0FBYztBQU0zQjtJQUFBO0lBU0EsQ0FBQztJQUFELG9CQUFDO0FBQUQsQ0FBQyxBQVRELElBU0M7QUFUWSxzQ0FBYTtBQVUxQixJQUFJLFFBQVEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzFCO0lBQUE7SUFxa0JBLENBQUM7SUFqa0J1QixtQkFBWSxHQUFoQyxVQUFpQyxNQUFlLEVBQUUsUUFBZ0IsRUFBRSxPQUF3QixFQUFFLFdBQTJCO1FBQTNCLDRCQUFBLEVBQUEsa0JBQTJCOzs7Ozs7d0JBQy9HLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxFQUFFLElBQUksUUFBUSxFQUFoQixDQUFnQixDQUFDLENBQUE7d0JBQ3BELElBQUcsQ0FBQyxJQUFJLElBQUk7NEJBQUUsc0JBQU87d0JBQ3JCLElBQUksT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQzlDLE9BQU8sR0FBRyxNQUFNLENBQUMs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