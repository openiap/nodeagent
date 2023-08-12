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
var stream_1 = require("stream");
var fs = require("fs");
var os = require("os");
var path = require("path");
var nodeapi_1 = require("@openiap/nodeapi");
// import { spawnSync } from 'cross-spawn';
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
                                                runner.commandstreams.splice(i, 1);
                                            }).then(function (result) {
                                                if (result != null && result.command == "timeout") {
                                                    console.error("notifyStream: " + result.command);
                                                    runner.commandstreams.splice(i, 1);
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
                                        console.error("notifyStream: " + error_1.message);
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
                    case 4:
                        if (!addtobuffer)
                            return [2 /*return*/];
                        if (s.buffer == null)
                            s.buffer = "";
                        s.buffer += message;
                        if (s.buffer.length > 1000000) {
                            s.buffer = s.buffer.substring(s.buffer.length - 1000000);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    runner.removestream = function (client, streamid, success, buffer) {
        var s = runner.streams.find(function (x) { return x.id == streamid; });
        if (s != null) {
            s.stream.push(null);
            runner.streams = runner.streams.filter(function (x) { return x.id != streamid; });
            var data = { "command": "runpackage", success: success, "completed": true, "data": buffer };
            try {
                for (var i = 0; i < runner.commandstreams.length; i++) {
                    var streamqueue = runner.commandstreams[i];
                    if (streamqueue != null && streamqueue != "") {
                        console.log("removestream streamid/correlationId: " + streamid + " streamqueue: " + streamqueue);
                        client.QueueMessage({ queuename: streamqueue, data: data, correlationId: streamid }).catch(function (error) {
                            console.error(error);
                        });
                    }
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    };
    runner.ensurestream = function (streamid, streamqueue) {
        var s = runner.streams.find(function (x) { return x.id == streamid; });
        if (s == null) {
            s = new runner_stream();
            s.stream = new stream_1.Stream.Readable();
            s.stream.read = function () { };
            s.id = streamid;
            runner.streams.push(s);
        }
        return s;
    };
    runner.runit = function (client, packagepath, streamid, command, parameters, clearstream, env) {
        if (env === void 0) { env = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b, _c;
                        try {
                            console.log('runit: Running command:', command);
                            // , stdio: ['pipe', 'pipe', 'pipe']
                            // , stdio: 'pipe'
                            // if(command.indexOf(" ") > -1 && !command.startsWith('"')) {
                            //     command = '"' + command + '"'
                            // }
                            if (clearstream) {
                                var xvfb = runner.findXvfbPath();
                                if (xvfb != null && xvfb != "") {
                                    var shellcommand = command;
                                    var _parameters = parameters;
                                    // var shellcommand = '"' + command + '" "' + parameters.join(" ") + '"';
                                    command = xvfb;
                                    parameters = [];
                                    // parameters.push(`-e`);
                                    // parameters.push(`/tmp/xvfb.log`);
                                    parameters.push("--server-args=\"-screen 0 1920x1080x24 -ac\"");
                                    // parameters.push(`--server-args="-ac"`);
                                    // xvfb-run --auto-servernum --server-num=1 
                                    parameters.push("--auto-servernum");
                                    parameters.push("--server-num=1");
                                    parameters.push(shellcommand);
                                    parameters = parameters.concat(_parameters);
                                }
                            }
                            console.log('Running command:', command);
                            if (parameters != null && Array.isArray(parameters))
                                console.log('With parameters:', parameters.join(" "));
                            var childProcess = (0, child_process_1.spawn)(command, parameters, { cwd: packagepath, env: __assign(__assign({}, process.env), env) });
                            console.log('Current working directory:', packagepath);
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
                            // childProcess.stdout.on('exit', (code: number) => {
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
                if (result.stderr != null)
                    console.log(result.stderr.toString());
                if (result.stdout != null)
                    console.log(result.stdout.toString());
            }
            return "";
        }
        catch (error) {
            return "";
            // throw error;
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
            // throw error;
        }
    };
    runner.kill = function (client, streamid) {
        var p = runner.processs.filter(function (x) { return x.id == streamid; });
        for (var i = 0; i < p.length; i++) {
            runner.notifyStream(client, streamid, "Sent kill signal to process " + p[i].p.pid);
            p[i].forcekilled = true;
            p[i].p.kill();
        }
    };
    runner.findPythonPath = function () {
        var result = runner.findInPath("python3");
        if (result == "")
            result = runner.findInPath("python");
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
    runner.npminstall = function (client, packagepath, streamid) {
        return __awaiter(this, void 0, void 0, function () {
            var nodePath, npmpath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fs.existsSync(path.join(packagepath, "npm.install.done"))) return [3 /*break*/, 1];
                        return [2 /*return*/, false];
                    case 1:
                        if (!fs.existsSync(path.join(packagepath, "package.json"))) return [3 /*break*/, 3];
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
                            fs.writeFileSync(path.join(packagepath, "npm.install.done"), "done");
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
    runner.processs = [];
    runner.streams = [];
    runner.commandstreams = [];
    return runner;
}());
exports.runner = runner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUFnRjtBQUNoRixpQ0FBMEM7QUFDMUMsdUJBQXlCO0FBQ3pCLHVCQUF5QjtBQUN6QiwyQkFBNkI7QUFDN0IsNENBQW1EO0FBQ25ELDJDQUEyQztBQUMzQyxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFFbkMsSUFBQSxJQUFJLEdBQVUsZ0JBQU0sS0FBaEIsRUFBRSxHQUFHLEdBQUssZ0JBQU0sSUFBWCxDQUFZO0FBQzdCO0lBQUE7SUFLQSxDQUFDO0lBQUQscUJBQUM7QUFBRCxDQUFDLEFBTEQsSUFLQztBQUxZLHdDQUFjO0FBTTNCO0lBQUE7SUFTQSxDQUFDO0lBQUQsb0JBQUM7QUFBRCxDQUFDLEFBVEQsSUFTQztBQVRZLHNDQUFhO0FBVTFCLElBQUksUUFBUSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDMUI7SUFBQTtJQXVUQSxDQUFDO0lBblR1QixtQkFBWSxHQUFoQyxVQUFpQyxNQUFlLEVBQUUsUUFBZ0IsRUFBRSxPQUF3QixFQUFFLFdBQTJCO1FBQTNCLDRCQUFBLEVBQUEsa0JBQTJCOzs7Ozs7d0JBRS9HLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxFQUFFLElBQUksUUFBUSxFQUFoQixDQUFnQixDQUFDLENBQUE7d0JBQ3BELElBQUcsQ0FBQyxJQUFJLElBQUk7NEJBQUUsc0JBQU87d0JBQ3JCLElBQUksT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQzlDLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8s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