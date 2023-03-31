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
var runner = /** @class */ (function () {
    function runner() {
    }
    runner.addstream = function (streamid, stream) {
        var s = runner.streams.find(function (x) { return x.id == streamid; });
        if (s != null)
            throw new Error("Stream " + streamid + " already exists");
        s = new runner_stream();
        s.id = streamid;
        s.stream = stream;
        runner.streams.push(s);
        return s;
    };
    runner.notifyStream = function (client, streamid, message) {
        return __awaiter(this, void 0, void 0, function () {
            var s, p, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        s = this.ensurestream(streamid);
                        if (message != null && !Buffer.isBuffer(message)) {
                            message = Buffer.from(message + "\n");
                        }
                        s.stream.push(message);
                        p = this.processs.find(function (x) { return x.id == streamid; });
                        if (!(p != null && p.streamqueue != null && p.streamqueue != "")) return [3 /*break*/, 7];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!(message == null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, client.QueueMessage({ queuename: p.streamqueue, data: { "command": "completed", "data": message }, correlationId: streamid })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, client.QueueMessage({ queuename: p.streamqueue, data: { "command": "stream", "data": message }, correlationId: streamid })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error(error_1.message);
                        p.streamqueue = "";
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    runner.removestream = function (streamid) {
        var s = runner.streams.find(function (x) { return x.id == streamid; });
        if (s != null) {
            s.stream.push(null);
            runner.streams = runner.streams.filter(function (x) { return x.id != streamid; });
        }
    };
    runner.ensurestream = function (streamid) {
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
    runner.runit = function (client, packagepath, streamid, streamqueue, command, parameters, clearstream) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b, _c;
                        try {
                            // , stdio: ['pipe', 'pipe', 'pipe']
                            // , stdio: 'pipe'
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
                            var childProcess = (0, child_process_1.spawn)(command, parameters, { cwd: packagepath, env: __assign(__assign({}, process.env), { log_with_colors: "false" }) });
                            var pid_1 = childProcess.pid;
                            var p_1 = { id: streamid, pid: pid_1, p: childProcess, forcekilled: false, streamqueue: streamqueue };
                            runner.notifyStream(client, streamid, "Child process started as pid ".concat(pid_1));
                            runner.processs.push(p_1);
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
                            // childProcess.stdout.on('data', catchoutput);
                            // childProcess.stderr.on('data', catchoutput);
                            childProcess.stdout.on('close', function (code) {
                                if (code == false || code == null) {
                                    runner.notifyStream(client, streamid, "Child process ".concat(pid_1, " exited"));
                                }
                                else {
                                    runner.notifyStream(client, streamid, "Child process ".concat(pid_1, " exited with code ").concat(code));
                                    p_1.forcekilled = true;
                                }
                                runner.processs = runner.processs.filter(function (x) { return x.pid != pid_1; });
                                if (clearstream == true) {
                                    runner.removestream(streamid);
                                }
                                resolve(!p_1.forcekilled);
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
                    command = 'which ' + exec;
                    break;
                case 'win32':
                    command = 'where ' + exec;
                    break;
                default:
                    throw new Error("Unsupported platform: ".concat(process.platform));
            }
            var stdout = (0, child_process_1.execSync)(command, { stdio: 'pipe' }).toString();
            return stdout.trim() || "";
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
        // const child = (process.platform === 'win32' ? 'npm.cmd' : 'npm')
        return runner.findInPath("npm");
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
    runner.pipinstall = function (client, packagepath, streamid, streamqueue, pythonpath) {
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
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, streamqueue, pythonpath, ["-m", "pip", "install", "-r", path.join(packagepath, "requirements.txt")], false)];
                    case 1:
                        if (!((_a.sent()) == true)) return [3 /*break*/, 3];
                        // WHY is this needed ???
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, streamqueue, pythonpath, ["-m", "pip", "install", "--upgrade", "protobuf"], false)];
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
    runner.npminstall = function (client, packagepath, streamid, streamqueue) {
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
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, streamqueue, npmpath, ["install"], false)];
                    case 2:
                        if ((_a.sent()) == true) {
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
    return runner;
}());
exports.runner = runner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUFnRjtBQUNoRixpQ0FBMEM7QUFDMUMsdUJBQXlCO0FBQ3pCLHVCQUF5QjtBQUN6QiwyQkFBNkI7QUFDN0IsNENBQW1EO0FBQzNDLElBQUEsSUFBSSxHQUFVLGdCQUFNLEtBQWhCLEVBQUUsR0FBRyxHQUFLLGdCQUFNLElBQVgsQ0FBWTtBQUM3QjtJQUFBO0lBTUEsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQU5ELElBTUM7QUFOWSx3Q0FBYztBQU8zQjtJQUFBO0lBR0EsQ0FBQztJQUFELG9CQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFIWSxzQ0FBYTtBQUkxQjtJQUFBO0lBbU9BLENBQUM7SUFoT2lCLGdCQUFTLEdBQXZCLFVBQXdCLFFBQWdCLEVBQUUsTUFBZ0I7UUFDdEQsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsRUFBRSxJQUFJLFFBQVEsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFBO1FBQ2xELElBQUksQ0FBQyxJQUFJLElBQUk7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsR0FBRyxRQUFRLEdBQUcsaUJBQWlCLENBQUMsQ0FBQTtRQUN4RSxDQUFDLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUN4QixDQUFDLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztRQUNoQixDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNsQixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFDbUIsbUJBQVksR0FBaEMsVUFB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