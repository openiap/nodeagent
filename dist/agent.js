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
var globalpackageid = process.env.forcedpackageid || process.env.packageid || "";
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
                            if (buffer.length < 300) {
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
                    if (!(globalpackageid != "" && globalpackageid != null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, packagemanager_1.packagemanager.reloadpackage(client, globalpackageid, force)];
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
                    if (globalpackageid != "" && globalpackageid != null) {
                        exists = res.schedules.find(function (x) { return x.packageid == globalpackageid; });
                        if (exists == null) {
                            res.schedules.push({ id: "localrun", name: "localrun", packageid: globalpackageid, enabled: true, cron: "", env: { "localrun": true } });
                        }
                        log("packageid is set, run package " + globalpackageid);
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
                                    if (stream.schedulename == schedule.name) {
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
                                                    if (stream.schedulename == schedule.name) {
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
                                                    if (stream.schedulename == schedule.name) {
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
                                    if (stream.schedulename == schedule.name) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FBK0Q7QUFDL0QsbUNBQWtDO0FBQ2xDLG1EQUFrRDtBQUNsRCxnQ0FBa0M7QUFFbEMsdUJBQXdCO0FBQ3hCLDJCQUE2QjtBQUM3Qix1QkFBd0I7QUFDeEIsaUNBQWdDO0FBRWhDLElBQUksSUFBSSxHQUFRLElBQUksQ0FBQztBQUNyQixJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7SUFDN0IseURBQXlEO0lBQ3pELHVDQUF1QztDQUN4QztBQUVELElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQztBQUVqRixTQUFTLEdBQUcsQ0FBQyxPQUFlO0lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckIsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1FBQ2hCLElBQUk7WUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3BCO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtLQUNGO0FBQ0gsQ0FBQztBQUNELFNBQVMsTUFBTSxDQUFDLE9BQXVCO0lBQ3JDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkIsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1FBQ2hCLElBQUk7WUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ2hDO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtLQUNGO0FBQ0gsQ0FBQztBQUVELE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLGNBQVEsT0FBTyxDQUFDLElBQUks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