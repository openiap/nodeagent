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
    runner.notifyStream = function (streamid, message) {
        var s = this.ensurestream(streamid);
        if (message != null && !Buffer.isBuffer(message)) {
            message = Buffer.from(message + "\n");
        }
        s.stream.push(message);
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
    runner.runit = function (packagepath, streamid, command, parameters, clearstream) {
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
                            var p_1 = { id: streamid, pid: pid_1, p: childProcess, forcekilled: false };
                            runner.notifyStream(streamid, "Child process started as pid ".concat(pid_1));
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
                                runner.notifyStream(streamid, data);
                            };
                            (_a = childProcess.stdio[1]) === null || _a === void 0 ? void 0 : _a.on('data', catchoutput);
                            (_b = childProcess.stdio[2]) === null || _b === void 0 ? void 0 : _b.on('data', catchoutput);
                            (_c = childProcess.stdio[3]) === null || _c === void 0 ? void 0 : _c.on('data', catchoutput);
                            // childProcess.stdout.on('data', catchoutput);
                            // childProcess.stderr.on('data', catchoutput);
                            childProcess.stdout.on('close', function (code) {
                                if (code == false || code == null) {
                                    runner.notifyStream(streamid, "Child process ".concat(pid_1, " exited"));
                                }
                                else {
                                    runner.notifyStream(streamid, "Child process ".concat(pid_1, " exited with code ").concat(code));
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
    runner.kill = function (streamid) {
        var p = runner.processs.filter(function (x) { return x.id == streamid; });
        for (var i = 0; i < p.length; i++) {
            runner.notifyStream(streamid, "Sent kill signal to process " + p[i].p.pid);
            p[i].forcekilled = true;
            p[i].p.kill();
        }
    };
    runner.findPythonPath = function () {
        return runner.findInPath("python");
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
    runner.pipinstall = function (packagepath, streamid, pythonpath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (fs.existsSync(path.join(packagepath, "requirements.txt.done")))
                            return [2 /*return*/];
                        if (!fs.existsSync(path.join(packagepath, "requirements.txt"))) return [3 /*break*/, 2];
                        runner.notifyStream(streamid, "************************");
                        runner.notifyStream(streamid, "**** Running pip install");
                        runner.notifyStream(streamid, "************************");
                        return [4 /*yield*/, runner.runit(packagepath, streamid, pythonpath, ["-m", "pip", "install", "-r", path.join(packagepath, "requirements.txt")], false)];
                    case 1:
                        if ((_a.sent()) == true) {
                            fs.writeFileSync(path.join(packagepath, "requirements.txt.done"), "done");
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    runner.npminstall = function (packagepath, streamid) {
        return __awaiter(this, void 0, void 0, function () {
            var child;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fs.existsSync(path.join(packagepath, "npm.install.done"))) return [3 /*break*/, 1];
                        return [2 /*return*/, false];
                    case 1:
                        if (!fs.existsSync(path.join(packagepath, "package.json"))) return [3 /*break*/, 3];
                        runner.notifyStream(streamid, "************************");
                        runner.notifyStream(streamid, "**** Running npm install");
                        runner.notifyStream(streamid, "************************");
                        child = (process.platform === 'win32' ? 'npm.cmd' : 'npm');
                        return [4 /*yield*/, runner.runit(packagepath, streamid, child, ["install"], false)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUFnRjtBQUNoRixpQ0FBMEM7QUFDMUMsdUJBQXlCO0FBQ3pCLHVCQUF5QjtBQUN6QiwyQkFBNkI7QUFDN0IsNENBQTBDO0FBQ2xDLElBQUEsSUFBSSxHQUFVLGdCQUFNLEtBQWhCLEVBQUUsR0FBRyxHQUFLLGdCQUFNLElBQVgsQ0FBWTtBQUM3QjtJQUFBO0lBS0EsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMWSx3Q0FBYztBQU0zQjtJQUFBO0lBR0EsQ0FBQztJQUFELG9CQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFIWSxzQ0FBYTtBQUkxQjtJQUFBO0lBNk1BLENBQUM7SUExTWlCLGdCQUFTLEdBQXZCLFVBQXdCLFFBQWdCLEVBQUUsTUFBZ0I7UUFDdEQsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsRUFBRSxJQUFJLFFBQVEsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFBO1FBQ2xELElBQUksQ0FBQyxJQUFJLElBQUk7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsR0FBRyxRQUFRLEdBQUcsaUJBQWlCLENBQUMsQ0FBQTtRQUN4RSxDQUFDLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUN4QixDQUFDLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztRQUNoQixDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNsQixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFDYSxtQkFBWSxHQUExQixVQUEy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