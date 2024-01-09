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
                        if (addtobuffer)
                            agent_1.agent.emit("stream", s, message);
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
                            // console.log('runit: Running command:', command);
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
                            // console.log('Running command:', command);
                            // if (parameters != null && Array.isArray(parameters)) console.log('With parameters:', parameters.join(" "));
                            var childProcess = (0, child_process_1.spawn)(command, parameters, { cwd: packagepath, env: __assign(__assign({}, process.env), env) });
                            // console.log('Current working directory:', packagepath);
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
                if (result.stderr != null && result.stderr.toString() != "") {
                    console.log(result.stderr.toString());
                }
                if (result.stdout != null && result.stdout.toString() != "") {
                    console.log(result.stdout.toString());
                }
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
            var envname, envfile, fileContents, data;
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
                                envname = null;
                                console.error("No name found in conda environment file, skipping conda install");
                            }
                        }
                        if (envname == null)
                            return [2 /*return*/, envname];
                        if (!fs.existsSync(path.join(packagepath, envfile)))
                            return [2 /*return*/, envname];
                        if (!fs.existsSync("/opt/conda/envs/")) return [3 /*break*/, 4];
                        if (!fs.existsSync("/opt/conda/envs/" + envname)) return [3 /*break*/, 2];
                        runner.notifyStream(client, streamid, "************************");
                        runner.notifyStream(client, streamid, "**** Updating conda env ");
                        runner.notifyStream(client, streamid, "************************");
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, condapath, ["env", "update", "-f", path.join(packagepath, envfile)], false)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, envname];
                    case 2:
                        runner.notifyStream(client, streamid, "************************");
                        runner.notifyStream(client, streamid, "**** Creating conda env ");
                        runner.notifyStream(client, streamid, "************************");
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, condapath, ["env", "update", "-f", path.join(packagepath, envfile)], false)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, envname];
                    case 4:
                        if (fs.existsSync(path.join(packagepath, "conda.yaml.done")))
                            return [2 /*return*/, envname];
                        runner.notifyStream(client, streamid, "************************");
                        runner.notifyStream(client, streamid, "**** Running conda install");
                        runner.notifyStream(client, streamid, "************************");
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, condapath, ["env", "create", "-f", path.join(packagepath, envfile)], false)];
                    case 5:
                        if ((_a.sent()) == 0) {
                            fs.writeFileSync(path.join(packagepath, "conda.yaml.done"), "done");
                        }
                        return [2 /*return*/, envname];
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
                        if (!fs.existsSync(path.join(packagepath, "npm.install.done"))) return [3 /*break*/, 2];
                        return [2 /*return*/, false];
                    case 2:
                        if (!fs.existsSync(path.join(packagepath, "package.json"))) return [3 /*break*/, 4];
                        nodePath = runner.findNodePath();
                        runner.notifyStream(client, streamid, "************************");
                        runner.notifyStream(client, streamid, "**** Running npm install");
                        runner.notifyStream(client, streamid, "************************");
                        npmpath = runner.findNPMPath();
                        if (npmpath == "")
                            throw new Error("Failed locating NPM, is it installed and in the path?");
                        return [4 /*yield*/, runner.runit(client, packagepath, streamid, npmpath, ["install"], false)];
                    case 3:
                        if ((_a.sent()) == 0) {
                            fs.writeFileSync(path.join(packagepath, "npm.install.done"), "done");
                            return [2 /*return*/, true];
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/, false];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUFnRjtBQUVoRix1QkFBeUI7QUFDekIsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qiw0Q0FBbUQ7QUFDbkQsaUNBQWdDO0FBQ2hDLDhCQUFnQztBQUVoQywyQ0FBMkM7QUFDM0MsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRW5DLElBQUEsSUFBSSxHQUFVLGdCQUFNLEtBQWhCLEVBQUUsR0FBRyxHQUFLLGdCQUFNLElBQVgsQ0FBWTtBQUM3QjtJQUFBO0lBS0EsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMWSx3Q0FBYztBQU0zQjtJQUFBO0lBU0EsQ0FBQztJQUFELG9CQUFDO0FBQUQsQ0FBQyxBQVRELElBU0M7QUFUWSxzQ0FBYTtBQVUxQixJQUFJLFFBQVEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzFCO0lBQUE7SUF5WkEsQ0FBQztJQXJadUIsbUJBQVksR0FBaEMsVUFBaUMsTUFBZSxFQUFFLFFBQWdCLEVBQUUsT0FBd0IsRUFBRSxXQUEyQjtRQUEzQiw0QkFBQSxFQUFBLGtCQUEyQjs7Ozs7O3dCQUUvRyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsRUFBRSxJQUFJLFFBQVEsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFBO3dCQUNwRCxJQUFHLENBQUMsSUFBSSxJQUFJOzRCQUFFLHNCQUFPO3dCQUNyQixJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUM5QyxPQUFPLEdBQUcsTUFBTSxDQUFDLElB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