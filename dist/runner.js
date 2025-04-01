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
var Logger_1 = require("./Logger");
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
                        //if(process.env.DEBUG != null && process.env.DEBUG != "") {
                        if (message != null) {
                            Logger_1.Logger.instrumentation.info(message.toString(), { streamid: streamid });
                        }
                        //}
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
                                                Logger_1.Logger.instrumentation.error("notifyStream: " + error.message, { streamid: streamid });
                                                var index = runner.commandstreams.indexOf(streamqueue);
                                                if (index > -1)
                                                    runner.commandstreams.splice(index, 1);
                                            }).then(function (result) {
                                                if (result != null && result.command == "timeout") {
                                                    Logger_1.Logger.instrumentation.info("notifyStream, remove streamqueue " + streamqueue, { streamid: streamid });
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
                                        Logger_1.Logger.instrumentation.info("notifyStream, remove streamqueue " + streamqueue, { streamid: streamid });
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
    runner.streamexists = function (streamid) {
        var s = runner.streams.find(function (x) { return x.id == streamid; });
        if (s != null) {
            return true;
        }
        return false;
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
                        Logger_1.Logger.instrumentation.info("removestream streamid/correlationId: " + streamid + " streamqueue: " + streamqueue, { streamid: streamid });
                        client.QueueMessage({ queuename: streamqueue, data: data, correlationId: streamid }).catch(function (error) {
                            Logger_1.Logger.instrumentation.info("removestream, remove streamqueue " + streamqueue, { streamid: streamid });
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
                Logger_1.Logger.instrumentation.error(error, { streamid: streamid });
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
                            var message = 'Running command:' + command + " " + parameters.join(" ") + "\n" +
                                'In Working directory:' + packagepath;
                            Logger_1.Logger.instrumentation.info(message, { streamid: streamid });
                            runner.notifyStream(client, streamid, message);
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
                        Logger_1.Logger.instrumentation.info("Send SIGTERM to child process " + subpids[i] + " of process " + pid, { streamid: streamid, pid: pid });
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
                        Logger_1.Logger.instrumentation.info("Send SIGTERM to process " + pid, { streamid: streamid, pid: pid });
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
                        Logger_1.Logger.instrumentation.info("Send SIGINT to process " + pid, { streamid: streamid, pid: pid });
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
                        Logger_1.Logger.instrumentation.info("Send SIGKILL to process " + pid, { streamid: streamid, pid: pid });
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
        var child = (process.platform === 'win32' ? 'pwsh.exe' : 'pwsh');
        var result = runner.findInPath(child);
        if (result == "") {
            child = (process.platform === 'win32' ? 'powershell.exe' : 'powershell');
            result = runner.findInPath("powershell");
        }
        return result;
    };
    runner.findShellPath = function () {
        var shell = 'bash';
        var result = runner.findInPath(shell);
        if (result == "") {
            shell = 'sh';
            result = runner.findInPath(shell);
        }
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
    runner.findJavaPath = function () {
        var child = (process.platform === 'win32' ? 'java.exe' : 'java');
        return runner.findInPath(child);
    };
    runner.findPhpPath = function () {
        var child = (process.platform === 'win32' ? 'php.exe' : 'php');
        return runner.findInPath(child);
    };
    runner.findComposerPath = function () {
        var child = (process.platform === 'win32' ? 'composer.exe' : 'composer');
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
                                Logger_1.Logger.instrumentation.error("No name found in conda environment file, auto generated name: " + envname, { streamid: streamid });
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
                        Logger_1.Logger.instrumentation.info(condapath + " " + param_1.join(" "), { streamid: streamid });
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, condapath, param_1, false)];
                    case 1:
                        if ((_a.sent()) == 0) {
                            return [2 /*return*/, envname];
                        }
                        throw new Error("Failed to update environment");
                    case 2:
                        Logger_1.Logger.instrumentation.info(condapath + " " + param.join(" "), { streamid: streamid });
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
                        Logger_1.Logger.instrumentation.info(condapath + " " + param.join(" "), { streamid: streamid });
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
                        nodePath = runner.findNodePath();
                        runner.notifyStream(client, streamid, "************************");
                        runner.notifyStream(client, streamid, "**** Running npm install");
                        runner.notifyStream(client, streamid, "************************");
                        npmpath = runner.findNPMPath();
                        if (npmpath == "")
                            throw new Error("Failed locating NPM, is it installed and in the path?");
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, npmpath, ["install", "--omit=dev", "--verbose"], false)];
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
    runner.composerinstall = function (client, packagepath, streamid) {
        return __awaiter(this, void 0, void 0, function () {
            var npmpath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fs.existsSync(path.join(packagepath, "composer.json"))) return [3 /*break*/, 2];
                        runner.notifyStream(client, streamid, "*****************************");
                        runner.notifyStream(client, streamid, "**** Running composer install");
                        runner.notifyStream(client, streamid, "*****************************");
                        npmpath = runner.findComposerPath();
                        if (npmpath == "")
                            throw new Error("Failed locating composer, is it installed and in the path?");
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, npmpath, ["install"], false)];
                    case 1:
                        if ((_a.sent()) == 0) {
                            return [2 /*return*/, true];
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, false];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUF1RjtBQUV2Rix1QkFBeUI7QUFDekIsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qiw0Q0FBbUQ7QUFDbkQsaUNBQWdDO0FBQ2hDLDhCQUFnQztBQUVoQywrQkFBK0I7QUFDL0IsbUNBQWtDO0FBRWxDLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUVuQyxJQUFBLElBQUksR0FBVSxnQkFBTSxLQUFoQixFQUFFLEdBQUcsR0FBSyxnQkFBTSxJQUFYLENBQVk7QUFDN0I7SUFBQTtJQUtBLENBQUM7SUFBRCxxQkFBQztBQUFELENBQUMsQUFMRCxJQUtDO0FBTFksd0NBQWM7QUFNM0I7SUFBQTtJQVNBLENBQUM7SUFBRCxvQkFBQztBQUFELENBQUMsQUFURCxJQVNDO0FBVFksc0NBQWE7QUFVMUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUMxQjtJQUFBO0lBaW5CQSxDQUFDO0lBN21CdUIsbUJBQVksR0FBaEMsVUFBaUMsTUFBZSxFQUFFLFFBQWdCLEVBQUUsT0FBd0IsRUFBRSxXQUEyQjtRQUEzQiw0QkFBQSxFQUFBLGtCQUEyQjs7Ozs7O3dCQUMvRyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsRUFBRSxJQUFJLFFBQVEsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFBO3dCQUNwRCxJQUFHLENBQUMsSUFBSSxJQUFJOzRCQUFFLHNCQUFPO3dCQUNyQixJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUM5QyxPQUFPLEdB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