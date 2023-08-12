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
var nodeapi_1 = require("@openiap/nodeapi");
var runner_1 = require("./runner");
var packagemanager_1 = require("./packagemanager");
var cron = require("node-cron");
var os = require("os");
var path = require("path");
var fs = require("fs");
var stream_1 = require("stream");
var elog = null;
if (os.platform() === 'win32') {
    // var EventLogger = require('node-windows').EventLogger;
    // elog = new EventLogger('nodeagent');
}
function log(message) {
    console.log(message);
    if (elog != null) {
        try {
            elog.info(message);
        }
        catch (error) {
        }
    }
}
function _error(message) {
    console.error(message);
    if (elog != null) {
        try {
            elog.error(message.toString());
        }
        catch (error) {
        }
    }
}
process.on('SIGINT', function () { process.exit(0); });
process.on('SIGTERM', function () { process.exit(0); });
process.on('SIGQUIT', function () { process.exit(0); });
console.log(JSON.stringify(process.env.PATH, null, 2));
log("Agent starting!!!");
var client = new nodeapi_1.openiap();
client.allowconnectgiveup = false;
client.agent = "nodeagent";
var myproject = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
client.version = myproject.version;
console.log("version: " + client.version);
var assistantConfig = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
var agentid = "";
// When injected from docker, use the injected agentid
var dockeragent = false;
if (process.env.agentid != "" && process.env.agentid != null) {
    agentid = process.env.agentid;
    dockeragent = true;
}
var localqueue = "";
var languages = ["nodejs"];
function reloadAndParseConfig() {
    nodeapi_1.config.doDumpStack = true;
    assistantConfig = {};
    assistantConfig.apiurl = process.env["apiurl"];
    if (assistantConfig.apiurl == null || assistantConfig.apiurl == "") {
        assistantConfig.apiurl = process.env["grpcapiurl"];
    }
    if (assistantConfig.apiurl == null || assistantConfig.apiurl == "") {
        assistantConfig.apiurl = process.env["wsapiurl"];
    }
    assistantConfig.jwt = process.env["jwt"];
    if (dockeragent) {
        return true;
    }
    if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
        assistantConfig = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
        process.env["NODE_ENV"] = "production";
        if (assistantConfig.apiurl) {
            process.env["apiurl"] = assistantConfig.apiurl;
            client.url = assistantConfig.apiurl;
        }
        if (assistantConfig.jwt) {
            process.env["jwt"] = assistantConfig.jwt;
            client.jwt = assistantConfig.jwt;
        }
        if (assistantConfig.agentid != null && assistantConfig.agentid != "") {
            agentid = assistantConfig.agentid;
        }
        return true;
    }
    else {
        if (assistantConfig.apiurl == null || assistantConfig.apiurl == "") {
            log("failed locating config to load from " + path.join(os.homedir(), ".openiap", "config.json"));
            process.exit(1);
            return false;
        }
    }
    return true;
}
function init() {
    // var client = new openiap();
    nodeapi_1.config.doDumpStack = true;
    if (!reloadAndParseConfig()) {
        return;
    }
    try {
        var pypath = runner_1.runner.findPythonPath();
        if (pypath != null && pypath != "") {
            languages.push("python");
        }
    }
    catch (error) {
    }
    try {
        var pypath = runner_1.runner.findDotnetPath();
        if (pypath != null && pypath != "") {
            languages.push("dotnet");
        }
    }
    catch (error) {
    }
    try {
        var pwshpath = runner_1.runner.findPwShPath();
        if (pwshpath != null && pwshpath != "") {
            languages.push("powershell");
        }
    }
    catch (error) {
    }
    client.onConnected = onConnected;
    client.onDisconnected = onDisconnected;
    client.connect().then(function (user) {
        log("connected");
    }).catch(function (err) {
        _error(err);
    });
}
var lastreload = new Date();
function onConnected(client) {
    return __awaiter(this, void 0, void 0, function () {
        var u, watchid, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 5]);
                    u = new URL(client.url);
                    process.env.apiurl = client.url;
                    return [4 /*yield*/, RegisterAgent()];
                case 1:
                    _a.sent();
                    if (client.client == null || client.client.user == null) {
                        log('connected, but not signed in, close connection again');
                        return [2 /*return*/, client.Close()];
                    }
                    // await reloadpackages(false)
                    console.log("registering watch on agents");
                    return [4 /*yield*/, client.Watch({ paths: [], collectionname: "agents" }, function (operation, document) { return __awaiter(_this, void 0, void 0, function () {
                            var error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 12, , 13]);
                                        if (!(document._type == "package")) return [3 /*break*/, 6];
                                        if (!(operation == "insert")) return [3 /*break*/, 2];
                                        log("package " + document.name + " inserted, reload packages");
                                        return [4 /*yield*/, reloadpackages(false)];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 5];
                                    case 2:
                                        if (!(operation == "replace")) return [3 /*break*/, 4];
                                        log("package " + document.name + " updated.");
                                        log("Remove package " + document._id);
                                        packagemanager_1.packagemanager.removepackage(document._id);
                                        if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder))
                                            fs.mkdirSync(packagemanager_1.packagemanager.packagefolder, { recursive: true });
                                        log("Write  " + document._id + ".json");
                                        fs.writeFileSync(path.join(packagemanager_1.packagemanager.packagefolder, document._id + ".json"), JSON.stringify(document, null, 2));
                                        log("Get package " + document._id);
                                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(client, document._id)];
                                    case 3:
                                        _a.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        if (operation == "delete") {
                                            log("package " + document.name + " deleted, cleanup after package");
                                            packagemanager_1.packagemanager.removepackage(document._id);
                                        }
                                        _a.label = 5;
                                    case 5: return [3 /*break*/, 11];
                                    case 6:
                                        if (!(document._type == "agent")) return [3 /*break*/, 10];
                                        if (!(document._id == agentid)) return [3 /*break*/, 8];
                                        if (lastreload.getTime() + 1000 > new Date().getTime()) {
                                            log("agent changed, but last reload was less than 1 second ago, do nothing");
                                            return [2 /*return*/];
                                        }
                                        lastreload = new Date();
                                        log("agent changed, reload config");
                                        return [4 /*yield*/, RegisterAgent()];
                                    case 7:
                                        _a.sent();
                                        return [3 /*break*/, 9];
                                    case 8:
                                        log("Another agent was changed, do nothing");
                                        _a.label = 9;
                                    case 9: return [3 /*break*/, 11];
                                    case 10:
                                        log("unknown type " + document._type + " changed, do nothing");
                                        _a.label = 11;
                                    case 11: return [3 /*break*/, 13];
                                    case 12:
                                        error_2 = _a.sent();
                                        _error(error_2);
                                        return [3 /*break*/, 13];
                                    case 13: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    watchid = _a.sent();
                    log("watch registered with id " + watchid);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 4:
                    _a.sent();
                    process.exit(0);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function onDisconnected(client) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            log("Disconnected");
            return [2 /*return*/];
        });
    });
}
;
function localrun(packageid, env, schedule) {
    return __awaiter(this, void 0, void 0, function () {
        var streamid, stream, buffer, error_3;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    stream = new stream_1.Stream.Readable({
                        read: function (size) { }
                    });
                    buffer = "";
                    stream.on('data', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        var s;
                        return __generator(this, function (_a) {
                            if (data == null)
                                return [2 /*return*/];
                            s = data.toString().replace(/\n$/, "");
                            if (buffer == "") {
                                buffer += s;
                                log(s);
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    stream.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            log("process ended");
                            return [2 /*return*/];
                        });
                    }); });
                    log("run package " + packageid);
                    return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(client, packageid, streamid, "", stream, true, env, schedule)];
                case 1:
                    _a.sent();
                    log("run complete");
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    _error(error_3);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function reloadpackages(force) {
    return __awaiter(this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    log("reloadpackages");
                    if (!(process.env.packageid != "" && process.env.packageid != null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, packagemanager_1.packagemanager.reloadpackage(client, process.env.packageid, force)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, packagemanager_1.packagemanager.reloadpackages(client, languages, force)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_4 = _a.sent();
                    _error(error_4);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
var schedules = [];
function RegisterAgent() {
    return __awaiter(this, void 0, void 0, function () {
        var u, chromium, chrome, daemon, data, res, keys, i, config, exists, _loop_1, p, _loop_2, p, _loop_3, p, error_5;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    u = new URL(client.url);
                    log("Registering agent with " + u.hostname + " as " + client.client.user.username);
                    chromium = runner_1.runner.findChromiumPath() != "";
                    chrome = runner_1.runner.findChromePath() != "";
                    daemon = undefined;
                    if (!dockeragent)
                        daemon = true;
                    data = JSON.stringify({ hostname: os.hostname(), os: os.platform(), arch: os.arch(), username: os.userInfo().username, version: myproject.version, "languages": languages, chrome: chrome, chromium: chromium, daemon: daemon, "maxpackages": 50 });
                    return [4 /*yield*/, client.CustomCommand({
                            id: agentid, command: "registeragent",
                            data: data
                        })];
                case 1:
                    res = _a.sent();
                    if (res != null)
                        res = JSON.parse(res);
                    if (res != null && res.environment != null) {
                        keys = Object.keys(res.environment);
                        for (i = 0; i < keys.length; i++) {
                            process.env[keys[i]] = res.environment[keys[i]];
                        }
                    }
                    if (!(res != null && res.slug != "" && res._id != null && res._id != "")) return [3 /*break*/, 3];
                    return [4 /*yield*/, client.RegisterQueue({ queuename: res.slug + "agent" }, onQueueMessage)];
                case 2:
                    localqueue = _a.sent();
                    agentid = res._id;
                    config = { agentid: agentid, jwt: res.jwt, apiurl: client.url };
                    if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
                        config = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
                    }
                    config.agentid = agentid;
                    // if (process.env["apiurl"] != null && process.env["apiurl"] != "") {
                    //   log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)")
                    // } else {
                    if (res.jwt != null && res.jwt != "") {
                        process.env.jwt = res.jwt;
                    }
                    if (client.url != null && client.url != "") {
                        config.apiurl = client.url;
                    }
                    if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder))
                        fs.mkdirSync(packagemanager_1.packagemanager.packagefolder, { recursive: true });
                    fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config));
                    // }
                    if (res.schedules == null || !Array.isArray(res.schedules))
                        res.schedules = [];
                    if (process.env.packageid != "" && process.env.packageid != null) {
                        exists = res.schedules.find(function (x) { return x.id == "localrun"; });
                        if (exists == null) {
                            res.schedules.push({ id: "localrun", name: "localrun", packageid: process.env.packageid, enabled: true, cron: "", env: { "localrun": true } });
                        }
                        log("packageid is set, run package " + process.env.packageid);
                    }
                    _loop_1 = function () {
                        var _schedule = res.schedules[p];
                        var schedule = schedules.find(function (x) { return x.name == _schedule.name && x.packageid == _schedule.packageid; });
                        if (schedule != null && schedule != _schedule) {
                            _schedule.task = schedule.task;
                            if (_schedule.env == null)
                                _schedule.env = {};
                            if (schedule.env == null)
                                schedule.env = {};
                            if (JSON.stringify(_schedule.env) != JSON.stringify(schedule.env)) {
                                try {
                                    _schedule.task.stop();
                                    _schedule.task.restartcounter = 0;
                                    _schedule.task.lastrestart = new Date();
                                }
                                catch (error) {
                                }
                                _schedule.task = null;
                            }
                        }
                    };
                    for (p = 0; p < res.schedules.length; p++) {
                        _loop_1();
                    }
                    _loop_2 = function () {
                        var _schedule = schedules[p];
                        var schedule = res.schedules.find(function (x) { return x.name == _schedule.name && x.packageid == _schedule.packageid; });
                        if (schedule == null) {
                            try {
                                if (_schedule.task != null) {
                                    _schedule.task.stop();
                                    _schedule.task = null;
                                }
                            }
                            catch (error) {
                            }
                        }
                    };
                    for (p = 0; p < schedules.length; p++) {
                        _loop_2();
                    }
                    schedules = res.schedules;
                    _loop_3 = function () {
                        var schedule = res.schedules[p];
                        if (schedule.packageid == null || schedule.packageid == "") {
                            log("Schedule " + schedule.name + " has no packageid, skip");
                            return "continue";
                        }
                        if (schedule.cron != null && schedule.cron != "") {
                            if (!schedule.enabled) {
                                if (schedule.task != null) {
                                    schedule.task.stop();
                                    schedule.task = null;
                                }
                                log("Schedule " + schedule.name + " (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid + " if running");
                                for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                    var stream = runner_1.runner.streams[s];
                                    if (stream.packageid == schedule.packageid) {
                                        runner_1.runner.kill(client, stream.id);
                                    }
                                }
                            }
                            else {
                                log("Schedule " + schedule.name + " (" + schedule.id + ") running every " + schedule.cron);
                                if (schedule.task == null) {
                                    schedule.task = cron.schedule(schedule.cron, function () { return __awaiter(_this, void 0, void 0, function () {
                                        var s, stream;
                                        return __generator(this, function (_a) {
                                            if (schedule.enabled) {
                                                log("Schedule " + schedule.name + " (" + schedule.id + ") enabled, run now");
                                                localrun(schedule.packageid, schedule.env, schedule);
                                                // await packagemanager.runpackage(client, schedule.packageid, streamid, "", null, false, schedule.env);
                                            }
                                            else {
                                                log("Schedule " + +" (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid + " if running");
                                                for (s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                                    stream = runner_1.runner.streams[s];
                                                    if (stream.packageid == schedule.packageid) {
                                                        runner_1.runner.kill(client, stream.id);
                                                    }
                                                }
                                            }
                                            return [2 /*return*/];
                                        });
                                    }); });
                                }
                            }
                        }
                        else {
                            if (schedule.enabled) {
                                // const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                                // await packagemanager.runpackage(client, schedule.packageid, streamid, "", null, false, schedule.env);
                                if (schedule.task == null) {
                                    log("Schedule " + schedule.name + " enabled, run now");
                                    schedule.task = {
                                        timeout: null,
                                        lastrestart: new Date(),
                                        restartcounter: 0,
                                        stop: function () {
                                            if (schedule.task.timeout != null) {
                                                clearTimeout(schedule.task.timeout);
                                                for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                                    var stream = runner_1.runner.streams[s];
                                                    if (stream.packageid == schedule.packageid) {
                                                        runner_1.runner.kill(client, stream.id);
                                                    }
                                                }
                                            }
                                        },
                                        start: function () {
                                            if (schedule.task.timeout != null) {
                                                log("Schedule " + schedule.name + " (" + schedule.id + ") already running");
                                                return;
                                            }
                                            log("Schedule " + schedule.name + " (" + schedule.id + ") started");
                                            schedule.task.stop();
                                            schedule.task.timeout = setTimeout(function () {
                                                localrun(schedule.packageid, schedule.env, schedule).then(function () {
                                                    try {
                                                        schedule.task.timeout = null;
                                                        log("Schedule " + schedule.name + " (" + schedule.id + ") finished");
                                                        var minutes = (new Date().getTime() - schedule.task.lastrestart.getTime()) / 1000 / 60;
                                                        if (minutes < 5) {
                                                            schedule.task.restartcounter++;
                                                        }
                                                        else {
                                                            schedule.task.restartcounter = 0;
                                                        }
                                                        schedule.task.lastrestart = new Date();
                                                        if (schedule.task.restartcounter < 5) {
                                                            var exists = schedules.find(function (x) { return x.name == schedule.name && x.packageid == schedule.packageid; });
                                                            if (exists != null && schedule.task != null) {
                                                                log("Schedule " + schedule.name + " (" + schedule.id + ") restarted again after " + minutes + " minutes (" + schedule.task.restartcounter + " times)");
                                                                schedule.task.start();
                                                            }
                                                        }
                                                        else {
                                                            log("Schedule " + schedule.name + " (" + schedule.id + ") restarted too many times, stop! (" + schedule.task.restartcounter + " times)");
                                                        }
                                                    }
                                                    catch (error) {
                                                        console.error(error);
                                                    }
                                                }).catch(function (error) {
                                                    try {
                                                        console.error(error);
                                                        schedule.task.timeout = null;
                                                    }
                                                    catch (e) {
                                                        console.error(e);
                                                    }
                                                });
                                                ;
                                            }, 100);
                                        }
                                    };
                                    schedule.task.start();
                                }
                                else {
                                    log("Schedule " + schedule.name + " (" + schedule.id + ") allready running");
                                }
                            }
                            else {
                                log("Schedule " + schedule.name + " disabled, kill all instances of package " + schedule.packageid + " if running");
                                for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                    var stream = runner_1.runner.streams[s];
                                    if (stream.packageid == schedule.packageid) {
                                        runner_1.runner.kill(client, stream.id);
                                    }
                                }
                            }
                        }
                    };
                    for (p = 0; p < res.schedules.length; p++) {
                        _loop_3();
                    }
                    log("Registed agent as " + res.name + " (" + agentid + ") and queue " + localqueue + " ( from " + res.slug + " )");
                    return [3 /*break*/, 4];
                case 3:
                    log("Registrering agent seems to have failed without an error !?!");
                    if (res == null) {
                        log("res is null");
                    }
                    else {
                        log(JSON.stringify(res, null, 2));
                    }
                    _a.label = 4;
                case 4:
                    if (!(res.jwt != null && res.jwt != "")) return [3 /*break*/, 6];
                    return [4 /*yield*/, client.Signin({ jwt: res.jwt })];
                case 5:
                    _a.sent();
                    log('Re-authenticated to ' + u.hostname + ' as ' + client.client.user.username);
                    _a.label = 6;
                case 6:
                    reloadAndParseConfig();
                    return [3 /*break*/, 8];
                case 7:
                    error_5 = _a.sent();
                    _error(error_5);
                    process.env["apiurl"] = "";
                    process.env["jwt"] = "";
                    try {
                        client.Close();
                    }
                    catch (error) {
                    }
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
var num_workitemqueue_jobs = 0;
var max_workitemqueue_jobs = 1;
if (process.env.maxjobs != null && process.env.maxjobs != null) {
    max_workitemqueue_jobs = parseInt(process.env.maxjobs);
}
var commandstreams = [];
function onQueueMessage(msg, payload, user, jwt) {
    return __awaiter(this, void 0, void 0, function () {
        var streamid_1, streamqueue, dostream, packagepath, workitem, stream2, buffer, wipayload, wijson, wipath, original, files, env, i_1, file, exitcode, error_6, error_7, error_8, packagepath, stream, buffer, wipath, wijson, env, error_9, error_10, error_11, processcount, i, processcount, counter, s, _message, processcount, processes, i, p, error_12;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 48, , 49]);
                    streamid_1 = msg.correlationId;
                    if (payload != null && payload.payload != null && payload.command == null)
                        payload = payload.payload;
                    if (payload.streamid != null && payload.streamid != "")
                        streamid_1 = payload.streamid;
                    streamqueue = msg.replyto;
                    if (payload.queuename != null && payload.queuename != "") {
                        streamqueue = payload.queuename;
                    }
                    dostream = true;
                    if (payload.stream == "false" || payload.stream == false) {
                        dostream = false;
                    }
                    if (!(payload.command == null || payload.command == "" || payload.command == "invoke")) return [3 /*break*/, 20];
                    if (num_workitemqueue_jobs >= max_workitemqueue_jobs) {
                        return [2 /*return*/, { "command": payload.command, "success": false, error: "Busy running " + num_workitemqueue_jobs + " jobs ( max " + max_workitemqueue_jobs + " )" }];
                    }
                    num_workitemqueue_jobs++;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 17, 19, 20]);
                    if (streamid_1 == null || streamid_1 == "") {
                        dostream = false;
                        streamid_1 = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    }
                    if (payload.wiq == null) {
                        console.log("payload missing wiq", JSON.stringify(payload, null, 2));
                        return [2 /*return*/, { "command": payload.command, "success": false, error: "payload missing wiq" }];
                    }
                    if (payload.packageid == null) {
                        console.log("payload missing packageid", JSON.stringify(payload, null, 2));
                        return [2 /*return*/, { "command": payload.command, "success": false, error: "payload missing packageid" }];
                    }
                    return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(client, payload.packageid)];
                case 2:
                    _a.sent();
                    packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.packageid));
                    if (!(packagepath == "")) return [3 /*break*/, 5];
                    log("Package " + payload.packageid + " not found");
                    if (!dostream) return [3 /*break*/, 4];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("Package " + payload.packageid + " not found") }, correlationId: streamid_1 })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, { "command": "runpackage", "success": false, "completed": true, error: "Package " + payload.packageid + " not found" }];
                case 5: return [4 /*yield*/, client.PopWorkitem({ wiq: payload.wiq, includefiles: false, compressed: false })];
                case 6:
                    workitem = _a.sent();
                    if (!(workitem == null)) return [3 /*break*/, 9];
                    log("No more workitems for " + payload.wiq);
                    if (!dostream) return [3 /*break*/, 8];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("No more workitems for " + payload.wiq) }, correlationId: streamid_1 })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [2 /*return*/, { "command": "runpackage", "success": false, "completed": true, error: "No more workitems for " + payload.wiq }];
                case 9:
                    stream2 = new stream_1.Stream.Readable({
                        read: function (size) { }
                    });
                    buffer = "";
                    stream2.on('data', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (!dostream) {
                                if (data != null)
                                    buffer += data.toString();
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    stream2.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                        var data;
                        return __generator(this, function (_a) {
                            data = { "command": "runpackage", "success": true, "completed": true, "data": buffer };
                            if (buffer == "")
                                delete data.data;
                            return [2 /*return*/];
                        });
                    }); });
                    wipayload = {};
                    wijson = "";
                    wipath = path.join(packagepath, "workitem.json");
                    if (fs.existsSync(wipath)) {
                        fs.unlinkSync(wipath);
                    }
                    original = [];
                    files = fs.readdirSync(packagepath);
                    files.forEach(function (file) {
                        var filename = path.join(packagepath, file);
                        if (fs.lstatSync(filename).isFile())
                            original.push(file);
                    });
                    env = { "packageid": "", "workitemid": workitem._id };
                    if (workitem.payload != null && workitem.payload != "") {
                        try {
                            wijson = JSON.stringify(workitem.payload);
                            env = Object.assign(env, workitem.payload);
                            wipayload = JSON.parse(wijson);
                            console.log("dump payload to: ", wipath);
                            fs.writeFileSync(wipath, wijson);
                        }
                        catch (error) {
                            console.log("parsing payload: " + (error.message != null) ? error.message : error);
                            console.log(workitem.payload);
                        }
                    }
                    for (i_1 = 0; i_1 < workitem.files.length; i_1++) {
                        file = workitem.files[i_1];
                        if (file.filename == "output.txt")
                            continue;
                        // const reply = await client.DownloadFile({ id: file._id, folder: packagepath });
                        console.log("Downloaded file: ", file.filename);
                        fs.writeFileSync(path.join(packagepath, file.filename), file.file);
                    }
                    return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(client, payload.packageid, streamid_1, streamqueue, stream2, true, env)];
                case 10:
                    exitcode = _a.sent();
                    if (exitcode != 0) {
                        throw new Error("exitcode: " + exitcode);
                    }
                    _a.label = 11;
                case 11:
                    _a.trys.push([11, 15, , 16]);
                    workitem.state = "successful";
                    if (fs.existsSync(wipath)) {
                        console.log("loading", wipath);
                        try {
                            wipayload = JSON.parse(fs.readFileSync(wipath).toString());
                            if (fs.existsSync(wipath)) {
                                fs.unlinkSync(wipath);
                            }
                        }
                        catch (error) {
                            console.log(error.message ? error.message : error);
                        }
                    }
                    workitem.payload = JSON.stringify(wipayload);
                    fs.writeFileSync(path.join(packagepath, "output.txt"), buffer);
                    files = fs.readdirSync(packagepath);
                    files = files.filter(function (x) { return original.indexOf(x) == -1; });
                    files.forEach(function (file) {
                        var filename = path.join(packagepath, file);
                        if (fs.lstatSync(filename).isFile()) {
                            console.log("adding file: ", file);
                            workitem.files.push({ filename: file, file: fs.readFileSync(filename), _id: null, compressed: false });
                            fs.unlinkSync(filename);
                        }
                    });
                    return [4 /*yield*/, client.UpdateWorkitem({ workitem: workitem })];
                case 12:
                    _a.sent();
                    if (!(dostream == true && streamqueue != "")) return [3 /*break*/, 14];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": true, "completed": true }, correlationId: streamid_1 })];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_6 = _a.sent();
                    _error(error_6);
                    dostream = false;
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/, { "command": "runpackage", "success": true, "completed": false }];
                case 17:
                    error_7 = _a.sent();
                    console.log(error_7);
                    if (fs.existsSync(wipath)) {
                        console.log("loading", wipath);
                        try {
                            wipayload = JSON.parse(fs.readFileSync(wipath).toString());
                            if (fs.existsSync(wipath)) {
                                fs.unlinkSync(wipath);
                            }
                        }
                        catch (error) {
                            console.log(error.message ? error.message : error);
                        }
                    }
                    console.log("!!!error: ", error_7.message ? error_7.message : error_7);
                    fs.writeFileSync(path.join(packagepath, "output.txt"), buffer);
                    files = fs.readdirSync(packagepath);
                    files = files.filter(function (x) { return original.indexOf(x) == -1; });
                    files.forEach(function (file) {
                        var filename = path.join(packagepath, file);
                        if (fs.lstatSync(filename).isFile()) {
                            console.log("adding file: ", file);
                            workitem.files.push({ filename: file, file: fs.readFileSync(filename), _id: null, compressed: false });
                            fs.unlinkSync(filename);
                        }
                    });
                    workitem.payload = JSON.stringify(wipayload);
                    workitem.errormessage = (error_7.message != null) ? error_7.message : error_7;
                    workitem.state = "retry";
                    workitem.errortype = "application";
                    return [4 /*yield*/, client.UpdateWorkitem({ workitem: workitem })];
                case 18:
                    _a.sent();
                    return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_7.message) }];
                case 19:
                    num_workitemqueue_jobs--;
                    if (num_workitemqueue_jobs < 0)
                        num_workitemqueue_jobs = 0;
                    return [7 /*endfinally*/];
                case 20:
                    if (user == null || jwt == null || jwt == "") {
                        console.log("not authenticated");
                        return [2 /*return*/, { "command": payload.command, "success": false, error: "not authenticated" }];
                    }
                    log("onQueueMessage " + msg.correlationId);
                    log("command: " + payload.command + " streamqueue: " + streamqueue + " dostream: " + dostream);
                    if (streamqueue == null)
                        streamqueue = "";
                    if (!(payload.command == "runpackage")) return [3 /*break*/, 44];
                    if (payload.id == null || payload.id == "")
                        throw new Error("id is required");
                    _a.label = 21;
                case 21:
                    _a.trys.push([21, 23, , 26]);
                    return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(client, payload.id)];
                case 22:
                    _a.sent();
                    return [3 /*break*/, 26];
                case 23:
                    error_8 = _a.sent();
                    console.log(error_8.message ? error_8.message : error_8);
                    if (!dostream) return [3 /*break*/, 25];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": false, "completed": true, "error": error_8.message ? error_8.message : error_8, "payload": wipayload }, correlationId: streamid_1 })];
                case 24:
                    _a.sent();
                    _a.label = 25;
                case 25: throw error_8;
                case 26:
                    packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
                    if (!(packagepath == "")) return [3 /*break*/, 29];
                    log("Package " + payload.id + " not found");
                    if (!dostream) return [3 /*break*/, 28];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("Package " + payload.id + " not found") }, correlationId: streamid_1 })];
                case 27:
                    _a.sent();
                    _a.label = 28;
                case 28: return [2 /*return*/, { "command": "runpackage", "success": false, "completed": true, error: "Package " + payload.id + " not found" }];
                case 29:
                    stream = new stream_1.Stream.Readable({
                        read: function (size) { }
                    });
                    buffer = "";
                    stream.on('data', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (!dostream) {
                                if (data != null)
                                    buffer += data.toString();
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    stream.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                        var data;
                        return __generator(this, function (_a) {
                            data = { "command": "runpackage", "success": true, "completed": true, "data": buffer };
                            if (buffer == "")
                                delete data.data;
                            return [2 /*return*/];
                        });
                    }); });
                    wipath = path.join(packagepath, "workitem.json");
                    wijson = JSON.stringify(payload.payload, null, 2);
                    if (fs.existsSync(wipath)) {
                        fs.unlinkSync(wipath);
                    }
                    env = { "packageid": "" };
                    if (payload.payload != null) {
                        console.log("dump payload to: ", wipath);
                        env = Object.assign(env, payload.payload);
                        fs.writeFileSync(wipath, wijson);
                    }
                    wipayload = {};
                    _a.label = 30;
                case 30:
                    _a.trys.push([30, 37, , 43]);
                    return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(client, payload.id, streamid_1, streamqueue, stream, true, env)];
                case 31:
                    _a.sent();
                    if (fs.existsSync(wipath)) {
                        console.log("loading", wipath);
                        try {
                            wipayload = JSON.parse(fs.readFileSync(wipath).toString());
                            if (fs.existsSync(wipath)) {
                                fs.unlinkSync(wipath);
                            }
                        }
                        catch (error) {
                            console.log(error.message ? error.message : error);
                        }
                    }
                    _a.label = 32;
                case 32:
                    _a.trys.push([32, 35, , 36]);
                    if (!(dostream == true && streamqueue != "")) return [3 /*break*/, 34];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": true, "completed": true, "payload": wipayload }, correlationId: streamid_1 })];
                case 33:
                    _a.sent();
                    _a.label = 34;
                case 34: return [3 /*break*/, 36];
                case 35:
                    error_9 = _a.sent();
                    _error(error_9);
                    dostream = false;
                    return [3 /*break*/, 36];
                case 36: return [3 /*break*/, 43];
                case 37:
                    error_10 = _a.sent();
                    _a.label = 38;
                case 38:
                    _a.trys.push([38, 41, , 42]);
                    if (!(dostream == true && streamqueue != "")) return [3 /*break*/, 40];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": false, "completed": true, "error": error_10.message ? error_10.message : error_10, "payload": wipayload }, correlationId: streamid_1 })];
                case 39:
                    _a.sent();
                    _a.label = 40;
                case 40: return [3 /*break*/, 42];
                case 41:
                    error_11 = _a.sent();
                    _error(error_11);
                    dostream = false;
                    return [3 /*break*/, 42];
                case 42: return [3 /*break*/, 43];
                case 43: return [2 /*return*/, { "command": "runpackage", "success": true, "completed": false, "payload": wipayload }];
                case 44:
                    if (payload.command == "kill") {
                        if (payload.id == null || payload.id == "")
                            payload.id = payload.streamid;
                        if (payload.id == null || payload.id == "")
                            throw new Error("id is required");
                        runner_1.runner.kill(client, payload.id);
                        return [2 /*return*/, { "command": "kill", "success": true }];
                    }
                    if (payload.command == "killall") {
                        processcount = runner_1.runner.processs.length;
                        for (i = processcount; i >= 0; i--) {
                            runner_1.runner.kill(client, runner_1.runner.processs[i].id);
                        }
                        return [2 /*return*/, { "command": "killall", "success": true, "count": processcount }];
                    }
                    if (payload.command == "addcommandstreamid") {
                        if (payload.streamqueue == null || payload.streamqueue == "")
                            payload.streamqueue = msg.replyto;
                        if (commandstreams.indexOf(payload.streamqueue) == -1)
                            commandstreams.push(payload.streamqueue);
                    }
                    if (payload.command == "removecommandstreamid") {
                        if (payload.streamqueue == null || payload.streamqueue == "")
                            payload.streamqueue = msg.replyto;
                        if (commandstreams.indexOf(payload.streamqueue) != -1)
                            commandstreams.splice(commandstreams.indexOf(payload.streamqueue), 1);
                    }
                    if (!(payload.command == "setstreamid")) return [3 /*break*/, 47];
                    if (payload.id == null || payload.id == "")
                        payload.id = payload.streamid;
                    if (payload.id == null || payload.id == "")
                        throw new Error("id is required");
                    if (payload.streamqueue == null || payload.streamqueue == "")
                        payload.streamqueue = msg.replyto;
                    if (payload.streamqueue == null || payload.streamqueue == "")
                        throw new Error("streamqueue is required");
                    processcount = runner_1.runner.streams.length;
                    counter = 0;
                    if (runner_1.runner.commandstreams.indexOf(payload.streamqueue) == -1 && payload.streamqueue != null && payload.streamqueue != "") {
                        runner_1.runner.commandstreams.push(payload.streamqueue);
                    }
                    s = runner_1.runner.streams.find(function (x) { return x.id == streamid_1; });
                    if (!((s === null || s === void 0 ? void 0 : s.buffer) != null && (s === null || s === void 0 ? void 0 : s.buffer.length) > 0)) return [3 /*break*/, 46];
                    _message = Buffer.from(s.buffer);
                    return [4 /*yield*/, client.QueueMessage({ queuename: payload.streamqueue, data: { "command": "stream", "data": _message }, correlationId: streamid_1 })];
                case 45:
                    _a.sent();
                    _a.label = 46;
                case 46: 
                // runner.notifyStream(client, payload.id, s.buffer, false)
                return [2 /*return*/, { "command": "setstreamid", "success": true, "count": counter, }];
                case 47:
                    if (payload.command == "listprocesses") {
                        if (runner_1.runner.commandstreams.indexOf(msg.replyto) == -1 && msg.replyto != null && msg.replyto != "") {
                            runner_1.runner.commandstreams.push(msg.replyto);
                        }
                        processcount = runner_1.runner.streams.length;
                        processes = [];
                        for (i = processcount; i >= 0; i--) {
                            p = runner_1.runner.streams[i];
                            if (p == null)
                                continue;
                            processes.push({
                                "id": p.id,
                                "streamqueues": runner_1.runner.commandstreams,
                                "packagename": p.packagename,
                                "packageid": p.packageid,
                                "schedulename": p.schedulename,
                            });
                        }
                        return [2 /*return*/, { "command": "listprocesses", "success": true, "count": processcount, "processes": processes }];
                    }
                    return [3 /*break*/, 49];
                case 48:
                    error_12 = _a.sent();
                    console.error(error_12);
                    console.log({ "command": payload.command, "success": false, error: JSON.stringify(error_12.message) });
                    return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_12.message) }];
                case 49: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    init();
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FBK0Q7QUFDL0QsbUNBQWtDO0FBQ2xDLG1EQUFrRDtBQUNsRCxnQ0FBa0M7QUFFbEMsdUJBQXdCO0FBQ3hCLDJCQUE2QjtBQUM3Qix1QkFBd0I7QUFDeEIsaUNBQWdDO0FBRWhDLElBQUksSUFBSSxHQUFRLElBQUksQ0FBQztBQUNyQixJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7SUFDN0IseURBQXlEO0lBQ3pELHVDQUF1QztDQUN4QztBQUVELFNBQVMsR0FBRyxDQUFDLE9BQWU7SUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7UUFDaEIsSUFBSTtZQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDcEI7UUFBQyxPQUFPLEtBQUssRUFBRTtTQUVmO0tBQ0Y7QUFDSCxDQUFDO0FBQ0QsU0FBUyxNQUFNLENBQUMsT0FBdUI7SUFDckMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2QixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7UUFDaEIsSUFBSTtZQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDaEM7UUFBQyxPQUFPLEtBQUssRUFBRTtTQUVmO0tBQ0Y7QUFDSCxDQUFDO0FBRUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsY0FBUSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0MsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsY0FBUSxPQUFPLENBQUMs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