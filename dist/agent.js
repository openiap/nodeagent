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
    // let EventLogger = require('node-windows').EventLogger;
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
    // let client = new openiap();
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
        var streamid, stream, buffer_1, error_3;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    stream = new stream_1.Stream.Readable({
                        read: function (size) { }
                    });
                    buffer_1 = "";
                    stream.on('data', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        var s;
                        return __generator(this, function (_a) {
                            if (data == null)
                                return [2 /*return*/];
                            s = data.toString().replace(/\n$/, "");
                            if (buffer_1.length < 300) {
                                buffer_1 += s;
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
        var u, chromium, chrome, daemon, data, res, keys, i, config_1, exists, name_1, _loop_1, p, _loop_2, p, _loop_3, p, error_5;
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
                    config_1 = { agentid: agentid, jwt: res.jwt, apiurl: client.url };
                    if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
                        config_1 = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
                    }
                    config_1.agentid = agentid;
                    // if (process.env["apiurl"] != null && process.env["apiurl"] != "") {
                    //   log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)")
                    // } else {
                    if (res.jwt != null && res.jwt != "") {
                        process.env.jwt = res.jwt;
                    }
                    if (client.url != null && client.url != "") {
                        config_1.apiurl = client.url;
                    }
                    if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder))
                        fs.mkdirSync(packagemanager_1.packagemanager.packagefolder, { recursive: true });
                    fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config_1));
                    // }
                    if (res.schedules == null || !Array.isArray(res.schedules))
                        res.schedules = [];
                    if (globalpackageid != "" && globalpackageid != null) {
                        exists = res.schedules.find(function (x) { return x.packageid == globalpackageid; });
                        if (exists == null) {
                            name_1 = process.env.forcedpackageid || "localrun";
                            res.schedules.push({ id: "localrun", name: name_1, packageid: globalpackageid, enabled: true, cron: "", env: { "localrun": true } });
                        }
                        log("packageid is set, run package " + globalpackageid);
                    }
                    _loop_1 = function (p) {
                        var _schedule = res.schedules[p];
                        var schedule = schedules.find(function (x) { return x.name == _schedule.name && x.packageid == _schedule.packageid; });
                        if (schedule != null && schedule != _schedule) {
                            _schedule.task = schedule.task;
                            if (_schedule.env == null)
                                _schedule.env = {};
                            if (schedule.env == null)
                                schedule.env = {};
                            if (_schedule.cron == null || _schedule.cron == "")
                                _schedule.cron = "";
                            if (schedule.cron == null || schedule.cron == "")
                                schedule.cron = "";
                            if (JSON.stringify(_schedule.env) != JSON.stringify(schedule.env) || _schedule.cron != schedule.cron) {
                                try {
                                    _schedule.task.stop();
                                    _schedule.task.restartcounter = 0;
                                    _schedule.task.lastrestart = new Date();
                                    log("Schedule " + _schedule.name + " (" + _schedule.id + ") updated, kill all instances of package " + _schedule.packageid + " if running");
                                    for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                        var stream = runner_1.runner.streams[s];
                                        if (stream.schedulename == _schedule.name) {
                                            runner_1.runner.kill(client, stream.id);
                                        }
                                    }
                                }
                                catch (error) {
                                }
                                _schedule.task = null;
                            }
                        }
                    };
                    for (p = 0; p < res.schedules.length; p++) {
                        _loop_1(p);
                    }
                    _loop_2 = function (p) {
                        var _schedule = schedules[p];
                        var schedule = res.schedules.find(function (x) { return x.name == _schedule.name && x.packageid == _schedule.packageid; });
                        if (schedule == null) {
                            try {
                                if (_schedule.task != null) {
                                    _schedule.task.stop();
                                    _schedule.task = null;
                                }
                                log("Schedule " + _schedule.name + " (" + _schedule.id + ") removed, kill all instances of package " + _schedule.packageid + " if running");
                                for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                    var stream = runner_1.runner.streams[s];
                                    if (stream.schedulename == _schedule.name) {
                                        runner_1.runner.kill(client, stream.id);
                                    }
                                }
                            }
                            catch (error) {
                            }
                        }
                    };
                    for (p = 0; p < schedules.length; p++) {
                        _loop_2(p);
                    }
                    schedules = res.schedules;
                    _loop_3 = function (p) {
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
                                                    if (schedule.task == null)
                                                        return;
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
                        _loop_3(p);
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
        var streamid_1, streamqueue, dostream_1, packagepath_1, wipath, buffer_2, original_1, workitem_1, stream2, wipayload, wijson, payloadfile, files, env, i, file, exitcode, error_6, error_7, wipayload, files, error_8, packagepath, stream, buffer_3, payloadfile, wipath, wijson, env, wipayload, error_9, error_10, error_11, processcount, i, processcount, counter, s, _message, processcount, processes, i, p, error_12;
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
                    dostream_1 = true;
                    if (payload.stream == "false" || payload.stream == false) {
                        dostream_1 = false;
                    }
                    if (!(payload.command == null || payload.command == "" || payload.command == "invoke")) return [3 /*break*/, 20];
                    if (num_workitemqueue_jobs >= max_workitemqueue_jobs) {
                        return [2 /*return*/, { "command": payload.command, "success": false, error: "Busy running " + num_workitemqueue_jobs + " jobs ( max " + max_workitemqueue_jobs + " )" }];
                    }
                    num_workitemqueue_jobs++;
                    packagepath_1 = "";
                    wipath = "";
                    buffer_2 = "";
                    original_1 = [];
                    workitem_1 = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 17, 19, 20]);
                    if (streamid_1 == null || streamid_1 == "") {
                        dostream_1 = false;
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
                    packagepath_1 = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.packageid));
                    if (!(packagepath_1 == "")) return [3 /*break*/, 5];
                    log("Package " + payload.packageid + " not found");
                    if (!dostream_1) return [3 /*break*/, 4];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("Package " + payload.packageid + " not found") }, correlationId: streamid_1 })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, { "command": "runpackage", "success": false, "completed": true, error: "Package " + payload.packageid + " not found" }];
                case 5: return [4 /*yield*/, client.PopWorkitem({ wiq: payload.wiq, includefiles: false, compressed: false })];
                case 6:
                    workitem_1 = _a.sent();
                    if (!(workitem_1 == null)) return [3 /*break*/, 9];
                    log("No more workitems for " + payload.wiq);
                    if (!dostream_1) return [3 /*break*/, 8];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("No more workitems for " + payload.wiq) }, correlationId: streamid_1 })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [2 /*return*/, { "command": "runpackage", "success": false, "completed": true, error: "No more workitems for " + payload.wiq }];
                case 9:
                    stream2 = new stream_1.Stream.Readable({
                        read: function (size) { }
                    });
                    stream2.on('data', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (!dostream_1) {
                                if (data != null)
                                    buffer_2 += data.toString();
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    stream2.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/];
                        });
                    }); });
                    wipayload = {};
                    wijson = "";
                    payloadfile = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ".json";
                    wipath = path.join(packagepath_1, payloadfile);
                    if (fs.existsSync(wipath)) {
                        fs.unlinkSync(wipath);
                    }
                    files = fs.readdirSync(packagepath_1);
                    files.forEach(function (file) {
                        var filename = path.join(packagepath_1, file);
                        if (fs.lstatSync(filename).isFile())
                            original_1.push(file);
                    });
                    env = { "packageid": "", "workitemid": workitem_1._id, payloadfile: payloadfile };
                    if (workitem_1.payload != null && workitem_1.payload != "") {
                        try {
                            wijson = JSON.stringify(workitem_1.payload);
                            env = Object.assign(env, workitem_1.payload);
                            wipayload = JSON.parse(wijson);
                            console.log("dump payload to: ", wipath);
                            fs.writeFileSync(wipath, wijson);
                        }
                        catch (error) {
                            console.log("parsing payload: " + (error.message != null) ? error.message : error);
                            console.log(workitem_1.payload);
                        }
                    }
                    else {
                        delete env.payloadfile;
                    }
                    for (i = 0; i < workitem_1.files.length; i++) {
                        file = workitem_1.files[i];
                        if (file.filename == "output.txt")
                            continue;
                        // const reply = await client.DownloadFile({ id: file._id, folder: packagepath });
                        console.log("Downloaded file: ", file.filename);
                        fs.writeFileSync(path.join(packagepath_1, file.filename), file.file);
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
                    workitem_1.state = "successful";
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
                    workitem_1.payload = JSON.stringify(wipayload);
                    fs.writeFileSync(path.join(packagepath_1, "output.txt"), buffer_2);
                    files = fs.readdirSync(packagepath_1);
                    files = files.filter(function (x) { return original_1.indexOf(x) == -1; });
                    files.forEach(function (file) {
                        var filename = path.join(packagepath_1, file);
                        if (fs.lstatSync(filename).isFile()) {
                            console.log("adding file: ", file);
                            workitem_1.files.push({ filename: file, file: fs.readFileSync(filename), _id: null, compressed: false });
                            fs.unlinkSync(filename);
                        }
                    });
                    return [4 /*yield*/, client.UpdateWorkitem({ workitem: workitem_1 })];
                case 12:
                    _a.sent();
                    if (!(dostream_1 == true && streamqueue != "")) return [3 /*break*/, 14];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": true, "completed": true }, correlationId: streamid_1 })];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_6 = _a.sent();
                    _error(error_6);
                    dostream_1 = false;
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/, { "command": "runpackage", "success": true, "completed": false }];
                case 17:
                    error_7 = _a.sent();
                    console.log(error_7);
                    wipayload = {};
                    if (wipath != "" && fs.existsSync(wipath)) {
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
                    if (buffer_2 != "") {
                        fs.writeFileSync(path.join(packagepath_1, "output.txt"), buffer_2);
                    }
                    files = fs.readdirSync(packagepath_1);
                    files = files.filter(function (x) { return original_1.indexOf(x) == -1; });
                    files.forEach(function (file) {
                        var filename = path.join(packagepath_1, file);
                        if (fs.lstatSync(filename).isFile()) {
                            console.log("adding file: ", file);
                            workitem_1.files.push({ filename: file, file: fs.readFileSync(filename), _id: null, compressed: false });
                            fs.unlinkSync(filename);
                        }
                    });
                    workitem_1.payload = JSON.stringify(wipayload);
                    workitem_1.errormessage = (error_7.message != null) ? error_7.message : error_7;
                    workitem_1.state = "retry";
                    workitem_1.errortype = "application";
                    return [4 /*yield*/, client.UpdateWorkitem({ workitem: workitem_1 })];
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
                    log("command: " + payload.command + " streamqueue: " + streamqueue + " dostream: " + dostream_1);
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
                    if (!dostream_1) return [3 /*break*/, 25];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": false, "completed": true, "error": error_8.message ? error_8.message : error_8, "payload": {} }, correlationId: streamid_1 })];
                case 24:
                    _a.sent();
                    _a.label = 25;
                case 25: throw error_8;
                case 26:
                    packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
                    if (!(packagepath == "")) return [3 /*break*/, 29];
                    log("Package " + payload.id + " not found");
                    if (!dostream_1) return [3 /*break*/, 28];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("Package " + payload.id + " not found") }, correlationId: streamid_1 })];
                case 27:
                    _a.sent();
                    _a.label = 28;
                case 28: return [2 /*return*/, { "command": "runpackage", "success": false, "completed": true, error: "Package " + payload.id + " not found" }];
                case 29:
                    stream = new stream_1.Stream.Readable({
                        read: function (size) { }
                    });
                    buffer_3 = "";
                    stream.on('data', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (!dostream_1) {
                                if (data != null)
                                    buffer_3 += data.toString();
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    stream.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/];
                        });
                    }); });
                    payloadfile = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ".json";
                    wipath = path.join(packagepath, payloadfile);
                    wijson = JSON.stringify(payload.payload, null, 2);
                    if (fs.existsSync(wipath)) {
                        fs.unlinkSync(wipath);
                    }
                    env = { "packageid": "", payloadfile: payloadfile };
                    if (payload.payload != null) {
                        console.log("dump payload to: ", wipath);
                        env = Object.assign(env, payload.payload);
                        fs.writeFileSync(wipath, wijson);
                    }
                    else {
                        delete env.payloadfile;
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
                    if (!(dostream_1 == true && streamqueue != "")) return [3 /*break*/, 34];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": true, "completed": true, "payload": wipayload }, correlationId: streamid_1 })];
                case 33:
                    _a.sent();
                    _a.label = 34;
                case 34: return [3 /*break*/, 36];
                case 35:
                    error_9 = _a.sent();
                    _error(error_9);
                    dostream_1 = false;
                    return [3 /*break*/, 36];
                case 36: return [3 /*break*/, 43];
                case 37:
                    error_10 = _a.sent();
                    _a.label = 38;
                case 38:
                    _a.trys.push([38, 41, , 42]);
                    if (!(dostream_1 == true && streamqueue != "")) return [3 /*break*/, 40];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": false, "completed": true, "error": error_10.message ? error_10.message : error_10, "payload": wipayload }, correlationId: streamid_1 })];
                case 39:
                    _a.sent();
                    _a.label = 40;
                case 40: return [3 /*break*/, 42];
                case 41:
                    error_11 = _a.sent();
                    _error(error_11);
                    dostream_1 = false;
                    return [3 /*break*/, 42];
                case 42: return [3 /*break*/, 43];
                case 43:
                    if (buffer_3 != "" && buffer_3 != null) {
                        return [2 /*return*/, { "command": "runpackage", "success": true, "completed": false, "output": buffer_3, "payload": wipayload }];
                    }
                    return [2 /*return*/, { "command": "runpackage", "success": true, "completed": false, "payload": wipayload }];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FBeUU7QUFDekUsbUNBQWtDO0FBQ2xDLG1EQUFrRDtBQUNsRCxnQ0FBa0M7QUFFbEMsdUJBQXdCO0FBQ3hCLDJCQUE2QjtBQUM3Qix1QkFBd0I7QUFDeEIsaUNBQWdDO0FBRWhDLElBQUksSUFBSSxHQUFRLElBQUksQ0FBQztBQUNyQixJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7SUFDN0IseURBQXlEO0lBQ3pELHVDQUF1QztDQUN4QztBQUVELElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQztBQUVqRixTQUFTLEdBQUcsQ0FBQyxPQUFlO0lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckIsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1FBQ2hCLElBQUk7WUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3BCO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtLQUNGO0FBQ0gsQ0FBQztBQUNELFNBQVMsTUFBTSxDQUFDLE9BQXVCO0lBQ3JDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkIsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1FBQ2hCLElBQUk7WUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ2hDO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtLQUNGO0FBQ0gsQ0FBQztBQUVELE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLGNBQVEsT0FBTyxDQUFDLElBQUks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