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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agent = exports.agent_schedule_task = void 0;
var nodeapi_1 = require("@openiap/nodeapi");
var runner_1 = require("./runner");
var packagemanager_1 = require("./packagemanager");
var cron = require("node-cron");
var events_1 = require("events");
var os = require("os");
var path = require("path");
var fs = require("fs");
var stream_1 = require("stream");
var elog = null;
if (os.platform() === 'win32') {
    // let EventLogger = require('node-windows').EventLogger;
    // elog = new EventLogger('nodeagent');
}
var agent_schedule_task = /** @class */ (function () {
    function agent_schedule_task(copyfrom) {
    }
    return agent_schedule_task;
}());
exports.agent_schedule_task = agent_schedule_task;
var agent = /** @class */ (function () {
    function agent() {
    }
    agent.addListener = function (eventName, listener) {
        agent.eventEmitter.addListener(eventName, listener);
    };
    agent.on = function (eventName, listener) {
        agent.eventEmitter.on(eventName, listener);
    };
    agent.once = function (eventName, listener) {
        agent.eventEmitter.once(eventName, listener);
    };
    agent.off = function (eventName, listener) {
        agent.eventEmitter.off(eventName, listener);
    };
    agent.removeListener = function (eventName, listener) {
        agent.eventEmitter.removeListener(eventName, listener);
    };
    agent.removeAllListeners = function (eventName) {
        agent.eventEmitter.removeAllListeners(eventName);
    };
    agent.setMaxListeners = function (n) {
        agent.eventEmitter.setMaxListeners(n);
    };
    agent.getMaxListeners = function () {
        return agent.eventEmitter.getMaxListeners();
    };
    agent.listeners = function (eventName) {
        return agent.eventEmitter.listeners(eventName);
    };
    agent.rawListeners = function (eventName) {
        return agent.eventEmitter.rawListeners(eventName);
    };
    agent.emit = function (eventName) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return (_a = agent.eventEmitter).emit.apply(_a, __spreadArray([eventName], args, false));
    };
    agent.listenerCount = function (eventName) {
        return agent.eventEmitter.listenerCount(eventName);
    };
    agent.prependListener = function (eventName, listener) {
        agent.eventEmitter.prependListener(eventName, listener);
    };
    agent.prependOnceListener = function (eventName, listener) {
        agent.eventEmitter.prependOnceListener(eventName, listener);
    };
    agent.eventNames = function () {
        return agent.eventEmitter.eventNames();
    };
    agent.init = function (_client) {
        if (_client === void 0) { _client = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var myproject, pypath, pypath, pwshpath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setMaxListeners(500);
                        if (_client == null) {
                            agent.client = new nodeapi_1.openiap();
                            agent.client.allowconnectgiveup = false;
                            agent.client.agent = "nodeagent";
                        }
                        else {
                            agent.client = _client;
                        }
                        agent.client.on('connected', agent.onConnected);
                        agent.client.on('disconnected', agent.onDisconnected);
                        log("Agent starting!!!");
                        if (process.env.maxjobs != null && process.env.maxjobs != null) {
                            agent.max_workitemqueue_jobs = parseInt(process.env.maxjobs);
                        }
                        if (process.env.maxrestarts != null && process.env.maxrestarts != null) {
                            agent.maxrestarts = parseInt(process.env.maxrestarts);
                        }
                        if (process.env.maxrestartsminutes != null && process.env.maxrestartsminutes != null) {
                            agent.maxrestartsminutes = parseInt(process.env.maxrestartsminutes);
                        }
                        if (process.env.exitonfailedschedule != null && process.env.exitonfailedschedule != null) {
                            if (process.env.exitonfailedschedule == "0" || process.env.exitonfailedschedule.toLowerCase() == "false" || process.env.exitonfailedschedule.toLowerCase() == "no") {
                                agent.exitonfailedschedule = false;
                            }
                            else {
                                agent.exitonfailedschedule = true;
                            }
                        }
                        if (process.env.killonpackageupdate != null && process.env.killonpackageupdate != null) {
                            if (process.env.killonpackageupdate == "0" || process.env.killonpackageupdate.toLowerCase() == "false" || process.env.killonpackageupdate.toLowerCase() == "no") {
                                agent.killonpackageupdate = false;
                            }
                            else {
                                agent.killonpackageupdate = true;
                            }
                        }
                        myproject = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
                        this.client.version = myproject.version;
                        log("version: " + this.client.version);
                        // When injected from docker, use the injected agentid
                        agent.assistantConfig = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
                        agent.dockeragent = false;
                        if (process.env.agentid != "" && process.env.agentid != null) {
                            agent.agentid = process.env.agentid;
                            agent.dockeragent = true;
                        }
                        agent.localqueue = "";
                        agent.languages = ["nodejs"];
                        // let client = new openiap();
                        nodeapi_1.config.doDumpStack = true;
                        if (!agent.reloadAndParseConfig()) {
                            return [2 /*return*/];
                        }
                        try {
                            pypath = runner_1.runner.findPythonPath();
                            if (pypath != null && pypath != "") {
                                agent.languages.push("python");
                            }
                        }
                        catch (error) {
                        }
                        try {
                            pypath = runner_1.runner.findDotnetPath();
                            if (pypath != null && pypath != "") {
                                agent.languages.push("dotnet");
                            }
                        }
                        catch (error) {
                        }
                        try {
                            pwshpath = runner_1.runner.findPwShPath();
                            if (pwshpath != null && pwshpath != "") {
                                agent.languages.push("powershell");
                            }
                        }
                        catch (error) {
                        }
                        if (!(_client == null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, agent.client.connect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    agent.reloadAndParseConfig = function () {
        nodeapi_1.config.doDumpStack = true;
        agent.assistantConfig = {};
        agent.assistantConfig.apiurl = process.env["apiurl"];
        if (agent.assistantConfig.apiurl == null || agent.assistantConfig.apiurl == "") {
            agent.assistantConfig.apiurl = process.env["grpcapiurl"];
        }
        if (agent.assistantConfig.apiurl == null || agent.assistantConfig.apiurl == "") {
            agent.assistantConfig.apiurl = process.env["wsapiurl"];
        }
        agent.assistantConfig.jwt = process.env["jwt"];
        if (agent.dockeragent) {
            return true;
        }
        if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
            agent.assistantConfig = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
            process.env["NODE_ENV"] = "production";
            if (agent.assistantConfig.apiurl) {
                process.env["apiurl"] = agent.assistantConfig.apiurl;
                agent.client.url = agent.assistantConfig.apiurl;
            }
            if (agent.assistantConfig.jwt) {
                process.env["jwt"] = agent.assistantConfig.jwt;
                agent.client.jwt = agent.assistantConfig.jwt;
            }
            if (agent.assistantConfig.agentid != null && agent.assistantConfig.agentid != "") {
                agent.agentid = agent.assistantConfig.agentid;
            }
            return true;
        }
        else {
            if (agent.assistantConfig.apiurl == null || agent.assistantConfig.apiurl == "") {
                log("failed locating config to load from " + path.join(os.homedir(), ".openiap", "config.json"));
                return false;
            }
        }
        return true;
    };
    agent.onConnected = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            var u, watchid, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        u = new URL(client.url);
                        process.env.apiurl = client.url;
                        return [4 /*yield*/, agent.RegisterAgent()];
                    case 1:
                        _a.sent();
                        if (client.client == null || client.client.user == null) {
                            log('connected, but not signed in, close connection again');
                            return [2 /*return*/, client.Close()];
                        }
                        log("registering watch on agents");
                        return [4 /*yield*/, client.Watch({ paths: [], collectionname: "agents" }, function (operation, document) { return __awaiter(_this, void 0, void 0, function () {
                                var s, stream, error_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 12, , 13]);
                                            if (!(document._type == "package")) return [3 /*break*/, 6];
                                            if (!(operation == "insert")) return [3 /*break*/, 2];
                                            log("package " + document.name + " inserted, reload packages");
                                            return [4 /*yield*/, agent.reloadpackages(false)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 5];
                                        case 2:
                                            if (!(operation == "replace")) return [3 /*break*/, 4];
                                            log("package " + document.name + " (" + document._id + " ) updated.");
                                            packagemanager_1.packagemanager.removepackage(document._id);
                                            if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder))
                                                fs.mkdirSync(packagemanager_1.packagemanager.packagefolder, { recursive: true });
                                            return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, document._id)];
                                        case 3:
                                            _a.sent();
                                            if (agent.killonpackageupdate) {
                                                log("Kill all instances of package " + document.name + " (" + document._id + ") if running");
                                                for (s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                                    stream = runner_1.runner.streams[s];
                                                    if (stream.packageid == document._id) {
                                                        runner_1.runner.kill(agent.client, stream.id);
                                                    }
                                                }
                                            }
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
                                            if (!(document._id == agent.agentid)) return [3 /*break*/, 8];
                                            if (agent.lastreload.getTime() + 1000 > new Date().getTime()) {
                                                log("agent changed, but last reload was less than 1 second ago, do nothing");
                                                return [2 /*return*/];
                                            }
                                            agent.lastreload = new Date();
                                            log("agent changed, reload config");
                                            return [4 /*yield*/, agent.RegisterAgent()];
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
                        _error(error_1);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                    case 4:
                        _a.sent();
                        process.exit(0);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    agent.onDisconnected = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log("Disconnected");
                return [2 /*return*/];
            });
        });
    };
    ;
    agent.localrun = function (packageid, streamid, payload, env, schedule) {
        return __awaiter(this, void 0, void 0, function () {
            var pck, packagepath, _env, payloadfile, wipath, wijson, stream, buffer_1, exitcode, wipayload, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, packageid)];
                    case 1:
                        pck = _a.sent();
                        packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", packageid));
                        if (packagepath == "") {
                            log("Package " + packageid + " not found");
                            return [2 /*return*/, [2, "Package " + packageid + " not found", payload]];
                        }
                        _env = { "payloadfile": "" };
                        if (env != null)
                            _env = Object.assign(_env, env);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        payloadfile = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ".json";
                        wipath = path.join(packagepath, payloadfile);
                        if (fs.existsSync(wipath)) {
                            fs.unlinkSync(wipath);
                        }
                        if (payload != null) {
                            _env = Object.assign(_env, payload);
                        }
                        _env["payloadfile"] = payloadfile;
                        if (payload != null) {
                            wijson = JSON.stringify(payload, null, 2);
                            fs.writeFileSync(wipath, wijson);
                        }
                        if (streamid == null || streamid == "") {
                            streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                        }
                        stream = new stream_1.Stream.Readable({
                            read: function (size) { }
                        });
                        buffer_1 = Buffer.from("");
                        stream.on('data', function (data) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (data == null)
                                    return [2 /*return*/];
                                if (Buffer.isBuffer(data)) {
                                    buffer_1 = Buffer.concat([buffer_1, data]);
                                }
                                else {
                                    buffer_1 = Buffer.concat([buffer_1, Buffer.from(data)]);
                                }
                                if (buffer_1.length > 1000000) {
                                    // keep first 500k and remove rest
                                    buffer_1 = buffer_1.subarray(0, 500000);
                                }
                                return [2 /*return*/];
                            });
                        }); });
                        // stream.on('end', async () => { log("process ended"); });
                        log("run package " + pck.name + " (" + packageid + ")");
                        return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(agent.client, packageid, streamid, [], stream, true, _env, schedule)];
                    case 3:
                        exitcode = _a.sent();
                        wipayload = payload;
                        if (fs.existsSync(wipath)) {
                            try {
                                wipayload = JSON.parse(fs.readFileSync(wipath).toString());
                                if (fs.existsSync(wipath)) {
                                    fs.unlinkSync(wipath);
                                }
                            }
                            catch (error) {
                                log("Error loading payload from " + wipath + " " + (error.message ? error.message : error));
                            }
                        }
                        return [2 /*return*/, [exitcode, buffer_1.toString(), wipayload]];
                    case 4:
                        error_3 = _a.sent();
                        _error(error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    agent.reloadpackages = function (force) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        log("reloadpackages");
                        if (!(agent.globalpackageid != "" && agent.globalpackageid != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, packagemanager_1.packagemanager.reloadpackage(agent.client, agent.globalpackageid, force)];
                    case 1: return [2 /*return*/, [_a.sent()]];
                    case 2: return [4 /*yield*/, packagemanager_1.packagemanager.reloadpackages(agent.client, agent.languages, force)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        _error(error_4);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    agent.RegisterAgent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var u, chromium, chrome, daemon, data, res, keys_1, i_1, _a, config_1, exists, name_1, _loop_1, keys, p, _loop_2, p, _loop_3, p, error_5;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        u = new URL(agent.client.url);
                        log("Registering agent with " + u.hostname + " as " + agent.client.client.user.username);
                        chromium = runner_1.runner.findChromiumPath() != "";
                        chrome = runner_1.runner.findChromePath() != "";
                        daemon = undefined;
                        if (!agent.dockeragent)
                            daemon = true;
                        data = JSON.stringify({ hostname: os.hostname(), os: os.platform(), arch: os.arch(), username: os.userInfo().username, version: agent.myproject.version, "languages": agent.languages, chrome: chrome, chromium: chromium, daemon: daemon, "maxpackages": 50 });
                        return [4 /*yield*/, agent.client.CustomCommand({
                                id: agent.agentid, command: "registeragent",
                                data: data
                            })];
                    case 1:
                        res = _b.sent();
                        if (res != null)
                            res = JSON.parse(res);
                        if (res != null && res.environment != null) {
                            keys_1 = Object.keys(res.environment);
                            for (i_1 = 0; i_1 < keys_1.length; i_1++) {
                                process.env[keys_1[i_1]] = res.environment[keys_1[i_1]];
                            }
                        }
                        if (!(res != null && res.slug != "" && res._id != null && res._id != "")) return [3 /*break*/, 3];
                        _a = agent;
                        return [4 /*yield*/, agent.client.RegisterQueue({ queuename: res.slug + "agent" }, agent.onQueueMessage)];
                    case 2:
                        _a.localqueue = _b.sent();
                        agent.agentid = res._id;
                        config_1 = { agentid: agent.agentid, jwt: res.jwt, apiurl: agent.client.url };
                        if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
                            config_1 = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
                        }
                        config_1.agentid = agent.agentid;
                        // if (process.env["apiurl"] != null && process.env["apiurl"] != "") {
                        //   log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)")
                        // } else {
                        if (res.jwt != null && res.jwt != "") {
                            process.env.jwt = res.jwt;
                        }
                        if (agent.client.url != null && agent.client.url != "") {
                            config_1.apiurl = agent.client.url;
                        }
                        if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder))
                            fs.mkdirSync(packagemanager_1.packagemanager.packagefolder, { recursive: true });
                        fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config_1));
                        // }
                        if (res.schedules == null || !Array.isArray(res.schedules))
                            res.schedules = [];
                        if (agent.globalpackageid != "" && agent.globalpackageid != null) {
                            exists = res.schedules.find(function (x) { return x.packageid == agent.globalpackageid; });
                            if (exists == null) {
                                name_1 = process.env.forcedpackageid || "localrun";
                                res.schedules.push({ id: "localrun", name: name_1, packageid: agent.globalpackageid, enabled: true, cron: "", env: { "localrun": true } });
                            }
                            log("packageid is set, run package " + agent.globalpackageid);
                        }
                        _loop_1 = function (p) {
                            var _schedule = res.schedules[p];
                            var schedule = agent.schedules.find(function (x) { return x.name == _schedule.name && x.packageid == _schedule.packageid; });
                            if (_schedule.env == null)
                                _schedule.env = {};
                            if (_schedule.cron == null || _schedule.cron == "")
                                _schedule.cron = "";
                            if (schedule == null) {
                                agent.schedules.push(_schedule);
                            }
                            else {
                                if (schedule.env == null)
                                    schedule.env = {};
                                if (schedule.cron == null || schedule.cron == "")
                                    schedule.cron = "";
                                var updated = false;
                                // if (JSON.stringify(_schedule.env) != JSON.stringify(schedule.env) || _schedule.cron != schedule.cron || _schedule.enabled != schedule.enabled) {
                                //   updated = true;
                                // }
                                keys = Object.keys(_schedule);
                                for (var i = 0; i < keys.length; i++) {
                                    var key = keys[i];
                                    if (key == "task")
                                        continue;
                                    if (JSON.stringify(schedule[key]) != JSON.stringify(_schedule[key])) {
                                        updated = true;
                                        schedule[key] = _schedule[key];
                                    }
                                }
                                if (updated) {
                                    if (schedule.task != null) {
                                        schedule.task.restartcounter = 0;
                                        schedule.task.lastrestart = new Date();
                                    }
                                    try {
                                        log("Schedule " + _schedule.name + " (" + _schedule.id + ") updated, kill all instances of package " + _schedule.packageid + " if running");
                                        for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                            var stream = runner_1.runner.streams[s];
                                            if (stream.schedulename == _schedule.name) {
                                                runner_1.runner.kill(agent.client, stream.id);
                                            }
                                        }
                                        if (schedule.enabled && schedule.task != null) {
                                            schedule.task.start();
                                        }
                                    }
                                    catch (error) {
                                    }
                                }
                            }
                        };
                        for (p = 0; p < res.schedules.length; p++) {
                            _loop_1(p);
                        }
                        _loop_2 = function (p) {
                            var _schedule = agent.schedules[p];
                            var schedule = res.schedules.find(function (x) { return x.name == _schedule.name && x.packageid == _schedule.packageid; });
                            if (schedule == null) {
                                agent.schedules.splice(p, 1);
                                try {
                                    if (_schedule.task != null) {
                                        _schedule.task.stop();
                                        _schedule.task = null;
                                    }
                                    log("Schedule " + _schedule.name + " (" + _schedule.id + ") removed, kill all instances of package " + _schedule.packageid + " if running");
                                    for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                        var stream = runner_1.runner.streams[s];
                                        if (stream.schedulename == _schedule.name) {
                                            runner_1.runner.kill(agent.client, stream.id);
                                        }
                                    }
                                }
                                catch (error) {
                                }
                            }
                        };
                        for (p = agent.schedules.length - 1; p >= 0; p--) {
                            _loop_2(p);
                        }
                        _loop_3 = function (p) {
                            var schedule = agent.schedules[p];
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
                                            runner_1.runner.kill(agent.client, stream.id);
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
                                                    agent.localrun(schedule.packageid, null, null, schedule.env, schedule);
                                                }
                                                else {
                                                    log("Schedule " + +" (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid + " if running");
                                                    for (s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                                        stream = runner_1.runner.streams[s];
                                                        if (stream.schedulename == schedule.name) {
                                                            runner_1.runner.kill(agent.client, stream.id);
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
                                                            runner_1.runner.kill(agent.client, stream.id);
                                                        }
                                                    }
                                                }
                                            },
                                            start: function () {
                                                if (schedule.task.timeout != null) {
                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") already running");
                                                    return;
                                                }
                                                if (!schedule.enabled) {
                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") is disabled");
                                                    return;
                                                }
                                                log("Schedule " + schedule.name + " (" + schedule.id + ") started");
                                                schedule.task.stop();
                                                schedule.task.timeout = setTimeout(function () {
                                                    agent.localrun(schedule.packageid, null, null, schedule.env, schedule).then(function (result) {
                                                        if (schedule.task == null)
                                                            return;
                                                        var exitcode = result[0], output = result[1], payload = result[2];
                                                        try {
                                                            schedule.task.timeout = null;
                                                            if (exitcode != 0) {
                                                                log("Schedule " + schedule.name + " (" + schedule.id + ") finished with exitcode " + exitcode + '\n' + output);
                                                            }
                                                            else {
                                                                log("Schedule " + schedule.name + " (" + schedule.id + ") finished (exitcode " + exitcode + ")");
                                                            }
                                                            var minutes = (new Date().getTime() - schedule.task.lastrestart.getTime()) / 1000 / 60;
                                                            if (minutes < agent.maxrestartsminutes) {
                                                                schedule.task.restartcounter++;
                                                            }
                                                            else {
                                                                schedule.task.restartcounter = 0;
                                                            }
                                                            schedule.task.lastrestart = new Date();
                                                            if (schedule.task.restartcounter < agent.maxrestarts) {
                                                                var exists = agent.schedules.find(function (x) { return x.name == schedule.name && x.packageid == schedule.packageid; });
                                                                if (exists != null && schedule.task != null) {
                                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") stopped after " + minutes.toFixed(2) + " minutes (" + schedule.task.restartcounter + " of " + agent.maxrestarts + ")");
                                                                    schedule.task.start();
                                                                }
                                                            }
                                                            else {
                                                                var hascronjobs = agent.schedules.find(function (x) { return x.cron != null && x.cron != "" && x.enabled == true; });
                                                                if (hascronjobs == null && agent.exitonfailedschedule == true) {
                                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") stopped " + schedule.task.restartcounter + " times, no cron jobs running, exit agent completly!");
                                                                    process.exit(0);
                                                                }
                                                                else {
                                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") stopped " + schedule.task.restartcounter + " times, stop schedule");
                                                                }
                                                            }
                                                        }
                                                        catch (error) {
                                                            _error(error);
                                                        }
                                                    }).catch(function (error) {
                                                        try {
                                                            _error(error);
                                                            schedule.task.timeout = null;
                                                        }
                                                        catch (e) {
                                                            _error(e);
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
                                            runner_1.runner.kill(agent.client, stream.id);
                                        }
                                    }
                                }
                            }
                        };
                        // console.log("streams: " + runner.streams.length + " current schedules: " + agent.schedules.length + " new schedules: " + res.schedules.length)
                        //agent.schedules = res.schedules;
                        for (p = 0; p < agent.schedules.length; p++) {
                            _loop_3(p);
                        }
                        log("Registed agent as " + res.name + " (" + agent.agentid + ") and queue " + agent.localqueue + " ( from " + res.slug + " )");
                        return [3 /*break*/, 4];
                    case 3:
                        log("Registrering agent seems to have failed without an error !?!");
                        if (res == null) {
                            log("res is null");
                        }
                        else {
                            log(JSON.stringify(res, null, 2));
                        }
                        _b.label = 4;
                    case 4:
                        if (!(res.jwt != null && res.jwt != "")) return [3 /*break*/, 6];
                        return [4 /*yield*/, agent.client.Signin({ jwt: res.jwt })];
                    case 5:
                        _b.sent();
                        log('Re-authenticated to ' + u.hostname + ' as ' + agent.client.client.user.username);
                        _b.label = 6;
                    case 6:
                        agent.reloadAndParseConfig();
                        return [3 /*break*/, 8];
                    case 7:
                        error_5 = _b.sent();
                        _error(error_5);
                        process.env["apiurl"] = "";
                        process.env["jwt"] = "";
                        try {
                            agent.client.Close();
                        }
                        catch (error) {
                        }
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    agent.onQueueMessage = function (msg, payload, user, jwt) {
        return __awaiter(this, void 0, void 0, function () {
            var streamid_1, streamqueue_1, dostream_1, packagepath_1, original_1, workitem_1, error_6, files, env, i, file, reply, _a, exitcode, output, newpayload, error_7, error_8, error_9, processcount, i, processcount, counter, s, _message, error_10, processcount, processes, i, p, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 33, 34, 35]);
                        streamid_1 = msg.correlationId;
                        if (payload != null && payload.payload != null && payload.command == null)
                            payload = payload.payload;
                        if (payload.streamid != null && payload.streamid != "")
                            streamid_1 = payload.streamid;
                        streamqueue_1 = msg.replyto;
                        if (payload.queuename != null && payload.queuename != "") {
                            streamqueue_1 = payload.queuename;
                        }
                        dostream_1 = true;
                        if (payload.stream == "false" || payload.stream == false) {
                            dostream_1 = false;
                        }
                        if (!(payload.command == null || payload.command == "" || payload.command == "invoke")) return [3 /*break*/, 27];
                        if (agent.num_workitemqueue_jobs >= agent.max_workitemqueue_jobs) {
                            return [2 /*return*/, { "command": payload.command, "success": false, error: "Busy running " + agent.num_workitemqueue_jobs + " jobs ( max " + agent.max_workitemqueue_jobs + " )" }];
                        }
                        agent.num_workitemqueue_jobs++;
                        packagepath_1 = "";
                        original_1 = [];
                        workitem_1 = null;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 24, 26, 27]);
                        if (streamid_1 == null || streamid_1 == "") {
                            dostream_1 = false;
                            streamid_1 = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                        }
                        if (payload.wiq == null) {
                            log("payload missing wiq " + JSON.stringify(payload, null, 2));
                            return [2 /*return*/, { "command": payload.command, "success": false, error: "payload missing wiq" }];
                        }
                        if (payload.packageid == null) {
                            log("payload missing packageid " + JSON.stringify(payload, null, 2));
                            return [2 /*return*/, { "command": payload.command, "success": false, error: "payload missing packageid" }];
                        }
                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, payload.packageid)];
                    case 2:
                        _b.sent();
                        packagepath_1 = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.packageid));
                        return [4 /*yield*/, agent.client.PopWorkitem({ wiq: payload.wiq, includefiles: false, compressed: false })];
                    case 3:
                        workitem_1 = _b.sent();
                        if (!(workitem_1 == null)) return [3 /*break*/, 9];
                        log("No more workitems for " + payload.wiq);
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 7, , 8]);
                        if (!dostream_1) return [3 /*break*/, 6];
                        return [4 /*yield*/, agent.client.QueueMessage({ queuename: streamqueue_1, data: { "command": "stream", "data": Buffer.from("No more workitems for " + payload.wiq) }, correlationId: streamid_1 })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_6 = _b.sent();
                        log(error_6.message ? error_6.message : error_6);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, { "command": "invoke", "success": false, "completed": true, error: "No more workitems for " + payload.wiq }];
                    case 9:
                        files = fs.readdirSync(packagepath_1);
                        files.forEach(function (file) {
                            var filename = path.join(packagepath_1, file);
                            if (fs.lstatSync(filename).isFile())
                                original_1.push(file);
                        });
                        env = { "packageid": "", "workitemid": workitem_1._id };
                        i = 0;
                        _b.label = 10;
                    case 10:
                        if (!(i < workitem_1.files.length)) return [3 /*break*/, 13];
                        file = workitem_1.files[i];
                        if (file.filename == "output.txt")
                            return [3 /*break*/, 12];
                        return [4 /*yield*/, this.client.DownloadFile({ id: file._id, folder: packagepath_1 })];
                    case 11:
                        reply = _b.sent();
                        log("Downloaded file: " + reply.filename);
                        _b.label = 12;
                    case 12:
                        i++;
                        return [3 /*break*/, 10];
                    case 13: return [4 /*yield*/, agent.localrun(payload.packageid, streamid_1, workitem_1.payload, env, null)];
                    case 14:
                        _a = _b.sent(), exitcode = _a[0], output = _a[1], newpayload = _a[2];
                        _b.label = 15;
                    case 15:
                        _b.trys.push([15, 22, , 23]);
                        workitem_1.state = "successful";
                        if (exitcode != 0) {
                            workitem_1.state = "retry";
                        }
                        if (newpayload != null)
                            workitem_1.payload = JSON.stringify(newpayload);
                        fs.writeFileSync(path.join(packagepath_1, "output.txt"), output);
                        files = fs.readdirSync(packagepath_1);
                        files = files.filter(function (x) { return original_1.indexOf(x) == -1; });
                        files.forEach(function (file) {
                            var filename = path.join(packagepath_1, file);
                            if (fs.lstatSync(filename).isFile()) {
                                log("adding file: " + file);
                                workitem_1.files.push({ filename: file, file: fs.readFileSync(filename), _id: null, compressed: false });
                                fs.unlinkSync(filename);
                            }
                        });
                        return [4 /*yield*/, agent.client.UpdateWorkitem({ workitem: workitem_1 })];
                    case 16:
                        _b.sent();
                        _b.label = 17;
                    case 17:
                        _b.trys.push([17, 20, , 21]);
                        if (!(dostream_1 == true && streamqueue_1 != "")) return [3 /*break*/, 19];
                        return [4 /*yield*/, agent.client.QueueMessage({ queuename: streamqueue_1, data: { "command": "invoke", "success": true, "completed": true }, correlationId: streamid_1 })];
                    case 18:
                        _b.sent();
                        _b.label = 19;
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        error_7 = _b.sent();
                        log(error_7.message ? error_7.message : error_7);
                        return [3 /*break*/, 21];
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        error_8 = _b.sent();
                        _error(error_8);
                        dostream_1 = false;
                        return [3 /*break*/, 23];
                    case 23: return [2 /*return*/, { "command": "invoke", "success": true, "completed": false }];
                    case 24:
                        error_9 = _b.sent();
                        _error(error_9);
                        log("!!!error: " + error_9.message ? error_9.message : error_9);
                        workitem_1.errormessage = (error_9.message != null) ? error_9.message : error_9;
                        workitem_1.state = "retry";
                        workitem_1.errortype = "application";
                        return [4 /*yield*/, agent.client.UpdateWorkitem({ workitem: workitem_1 })];
                    case 25:
                        _b.sent();
                        return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_9.message) }];
                    case 26:
                        agent.num_workitemqueue_jobs--;
                        if (agent.num_workitemqueue_jobs < 0)
                            agent.num_workitemqueue_jobs = 0;
                        return [7 /*endfinally*/];
                    case 27:
                        if (user == null || jwt == null || jwt == "") {
                            _error("not authenticated");
                            return [2 /*return*/, { "command": payload.command, "success": false, error: "not authenticated" }];
                        }
                        log("onQueueMessage " + msg.correlationId);
                        log("command: " + payload.command + " streamqueue: " + streamqueue_1 + " dostream: " + dostream_1);
                        if (streamqueue_1 == null)
                            streamqueue_1 = "";
                        if (payload.command == "runpackage") {
                            if (payload.id == null || payload.id == "")
                                throw new Error("id is required");
                            agent.localrun(payload.id, streamid_1, payload.payload, null, null).then(function (result) {
                                var exitcode = result[0], output = result[1], payload = result[2];
                                try {
                                    var success = exitcode == 0;
                                    if (dostream_1 == true && streamqueue_1 != "")
                                        agent.client.QueueMessage({ queuename: streamqueue_1, data: { "command": "runpackage", success: success, "completed": true, exitcode: exitcode, output: output, payload: payload }, correlationId: streamid_1 });
                                }
                                catch (error) {
                                    log(error.message ? error.message : error);
                                }
                            }).catch(function (error) {
                                var output = error.output;
                                try {
                                    if (dostream_1 == true && streamqueue_1 != "")
                                        agent.client.QueueMessage({ queuename: streamqueue_1, data: { "command": "runpackage", "success": false, "completed": true, "output": output, "error": error.message ? error.message : error, "payload": payload.payload }, correlationId: streamid_1 });
                                }
                                catch (error) {
                                    log(error.message ? error.message : error);
                                }
                            });
                            return [2 /*return*/, { "command": "runpackage", "success": true, "completed": false }];
                        }
                        if (payload.command == "kill") {
                            if (payload.id == null || payload.id == "")
                                payload.id = payload.streamid;
                            if (payload.id == null || payload.id == "")
                                throw new Error("id is required");
                            runner_1.runner.kill(agent.client, payload.id);
                            return [2 /*return*/, { "command": "kill", "success": true }];
                        }
                        if (payload.command == "killall") {
                            processcount = runner_1.runner.processs.length;
                            for (i = processcount; i >= 0; i--) {
                                runner_1.runner.kill(agent.client, runner_1.runner.processs[i].id);
                            }
                            return [2 /*return*/, { "command": "killall", "success": true, "count": processcount }];
                        }
                        if (payload.command == "addcommandstreamid") {
                            if (payload.streamqueue == null || payload.streamqueue == "")
                                payload.streamqueue = msg.replyto;
                            if (runner_1.runner.commandstreams.indexOf(payload.streamqueue) == -1)
                                runner_1.runner.commandstreams.push(payload.streamqueue);
                        }
                        if (payload.command == "removecommandstreamid") {
                            if (payload.streamqueue == null || payload.streamqueue == "")
                                payload.streamqueue = msg.replyto;
                            if (runner_1.runner.commandstreams.indexOf(payload.streamqueue) != -1) {
                                console.log("remove " + payload.streamqueue + " from commandstreams");
                                runner_1.runner.commandstreams.splice(runner_1.runner.commandstreams.indexOf(payload.streamqueue), 1);
                            }
                        }
                        if (!(payload.command == "setstreamid")) return [3 /*break*/, 32];
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
                            console.log("Add streamqueue " + payload.streamqueue + " to commandstreams");
                            runner_1.runner.commandstreams.push(payload.streamqueue);
                        }
                        s = runner_1.runner.streams.find(function (x) { return x.id == streamid_1; });
                        if (!((s === null || s === void 0 ? void 0 : s.buffer) != null && (s === null || s === void 0 ? void 0 : s.buffer.length) > 0)) return [3 /*break*/, 31];
                        _message = Buffer.from(s.buffer);
                        _b.label = 28;
                    case 28:
                        _b.trys.push([28, 30, , 31]);
                        return [4 /*yield*/, agent.client.QueueMessage({ queuename: payload.streamqueue, data: { "command": "stream", "data": _message }, correlationId: streamid_1 })];
                    case 29:
                        _b.sent();
                        return [3 /*break*/, 31];
                    case 30:
                        error_10 = _b.sent();
                        log(error_10.message ? error_10.message : error_10);
                        return [3 /*break*/, 31];
                    case 31: 
                    // runner.notifyStream(agent.client, payload.id, s.buffer, false)
                    return [2 /*return*/, { "command": "setstreamid", "success": true, "count": counter, }];
                    case 32:
                        if (payload.command == "listprocesses") {
                            if (runner_1.runner.commandstreams.indexOf(msg.replyto) == -1 && msg.replyto != null && msg.replyto != "") {
                                console.log("Add streamqueue " + payload.streamqueue + " to commandstreams");
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
                                    "buffersize": (p.buffer == null ? 0 : p.buffer.length),
                                });
                            }
                            return [2 /*return*/, { "command": "listprocesses", "success": true, "count": processcount, "processes": processes }];
                        }
                        return [3 /*break*/, 35];
                    case 33:
                        error_11 = _b.sent();
                        _error(error_11);
                        log(JSON.stringify({ "command": payload.command, "success": false, error: JSON.stringify(error_11.message) }));
                        return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_11.message) }];
                    case 34:
                        log("commandstreams:" + runner_1.runner.commandstreams.length);
                        return [7 /*endfinally*/];
                    case 35: return [2 /*return*/];
                }
            });
        });
    };
    agent.assistantConfig = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
    agent.agentid = "";
    agent.localqueue = "";
    agent.languages = ["nodejs"];
    agent.dockeragent = false;
    agent.lastreload = new Date();
    agent.schedules = [];
    agent.myproject = { version: "" };
    agent.num_workitemqueue_jobs = 0;
    agent.max_workitemqueue_jobs = 1;
    agent.maxrestarts = 5;
    agent.maxrestartsminutes = 5;
    agent.killonpackageupdate = true;
    agent.exitonfailedschedule = true;
    agent.eventEmitter = new events_1.EventEmitter();
    agent.globalpackageid = "";
    return agent;
}());
exports.agent = agent;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQXlFO0FBQ3pFLG1DQUFrQztBQUNsQyxtREFBNEQ7QUFDNUQsZ0NBQWtDO0FBQ2xDLGlDQUFzQztBQUV0Qyx1QkFBd0I7QUFDeEIsMkJBQTZCO0FBQzdCLHVCQUF3QjtBQUN4QixpQ0FBZ0M7QUFFaEMsSUFBSSxJQUFJLEdBQVEsSUFBSSxDQUFDO0FBQ3JCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sRUFBRTtJQUM3Qix5REFBeUQ7SUFDekQsdUNBQXVDO0NBQ3hDO0FBRUQ7SUFDRSw2QkFBWSxRQUE2QjtJQUV6QyxDQUFDO0lBQ0gsMEJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUpZLGtEQUFtQjtBQUtoQztJQUFBO0lBOHpCQSxDQUFDO0lBNXlCZSxpQkFBVyxHQUF6QixVQUEwQixTQUEwQixFQUFFLFFBQWtDO1FBQ3RGLEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ2EsUUFBRSxHQUFoQixVQUFpQixTQUEwQixFQUFFLFFBQWtDO1FBQzdFLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ2EsVUFBSSxHQUFsQixVQUFtQixTQUEwQixFQUFFLFFBQWtDO1FBQy9FLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ2EsU0FBRyxHQUFqQixVQUFrQixTQUEwQixFQUFFLFFBQWtDO1FBQzlFLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENB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