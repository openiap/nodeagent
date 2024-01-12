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
var Logger_1 = require("./Logger");
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
            var oidc_config, protocol, domain, apiurl, assistantConfig, url, myproject, pypath, pypath, pwshpath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        process.env.PIP_BREAK_SYSTEM_PACKAGES = "1";
                        try {
                            Logger_1.Logger.init();
                        }
                        catch (error) {
                        }
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
                        agent.client.on('signedin', agent.onSignedIn);
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
                        oidc_config = process.env.oidc_config || process.env.agent_oidc_config;
                        if ((oidc_config == null || oidc_config == "") && (process.env.oidc_userinfo_endpoint == null || process.env.oidc_userinfo_endpoint == "")) {
                            protocol = process.env.protocol || "http";
                            domain = process.env.domain || "";
                            if (domain == "") {
                                apiurl = process.env.oidc_config || process.env.apiurl || process.env.grpcapiurl || process.env.wsapiurl || "";
                                if (apiurl == "") {
                                    if (fs.existsSync(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json"))) {
                                        assistantConfig = JSON.parse(fs.readFileSync(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json"), "utf8"));
                                        apiurl = assistantConfig.apiurl;
                                    }
                                }
                                if (apiurl != "") {
                                    url = new URL(apiurl);
                                    domain = (url.hostname.indexOf("grpc") == 0) ? url.hostname.substring(5) : url.hostname;
                                    if (url.port == "443") {
                                        protocol = "https";
                                    }
                                    else if (url.protocol != "grpc:") {
                                        protocol = url.protocol.substring(0, url.protocol.length - 1);
                                    }
                                    else if (url.hostname == "pc.openiap.io") {
                                        protocol = "https";
                                    }
                                }
                            }
                            if (domain != null && domain.indexOf(".") > 0) {
                                oidc_config = protocol + "://" + domain + "/oidc/.well-known/openid-configuration";
                                console.log("auto generated oidc_config: " + oidc_config);
                                process.env.oidc_config = oidc_config;
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
        if (fs.existsSync(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json"))) {
            agent.assistantConfig = JSON.parse(fs.readFileSync(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json"), "utf8"));
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
                log("failed locating config to load from " + path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json"));
                return false;
            }
        }
        return true;
    };
    agent.onSignedIn = function (client, user) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                (_a = Logger_1.Logger.instrumentation) === null || _a === void 0 ? void 0 : _a.init(client);
                return [2 /*return*/];
            });
        });
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
                                            _a.trys.push([0, 11, , 12]);
                                            if (!(document._type == "package")) return [3 /*break*/, 5];
                                            if (!(operation == "insert")) return [3 /*break*/, 2];
                                            log("package " + document.name + " inserted, reload packages");
                                            return [4 /*yield*/, agent.reloadpackages(false)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 2:
                                            if (!(operation == "replace" || operation == "delete")) return [3 /*break*/, 4];
                                            log("package " + document.name + " (" + document._id + " ) updated.");
                                            if (agent.killonpackageupdate) {
                                                log("Kill all instances of package " + document.name + " (" + document._id + ") if running");
                                                for (s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                                    stream = runner_1.runner.streams[s];
                                                    if (stream.packageid == document._id) {
                                                        runner_1.runner.kill(agent.client, stream.id);
                                                    }
                                                }
                                            }
                                            packagemanager_1.packagemanager.removepackage(document._id);
                                            if (!(operation == "replace")) return [3 /*break*/, 4];
                                            if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder()))
                                                fs.mkdirSync(packagemanager_1.packagemanager.packagefolder(), { recursive: true });
                                            return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, document._id)];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4: return [3 /*break*/, 10];
                                        case 5:
                                            if (!(document._type == "agent")) return [3 /*break*/, 9];
                                            if (!(document._id == agent.agentid)) return [3 /*break*/, 7];
                                            if (agent.lastreload.getTime() + 1000 > new Date().getTime()) {
                                                log("agent changed, but last reload was less than 1 second ago, do nothing");
                                                return [2 /*return*/];
                                            }
                                            agent.lastreload = new Date();
                                            log("agent changed, reload config");
                                            return [4 /*yield*/, agent.RegisterAgent()];
                                        case 6:
                                            _a.sent();
                                            return [3 /*break*/, 8];
                                        case 7:
                                            log("Another agent was changed, do nothing");
                                            _a.label = 8;
                                        case 8: return [3 /*break*/, 10];
                                        case 9:
                                            log("unknown type " + document._type + " changed, do nothing");
                                            _a.label = 10;
                                        case 10: return [3 /*break*/, 12];
                                        case 11:
                                            error_2 = _a.sent();
                                            _error(error_2);
                                            return [3 /*break*/, 12];
                                        case 12: return [2 /*return*/];
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
            var b, pck, packagepath, _env, payloadfile, wipath, wijson, stream, buffer_1, exitcode, wipayload, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("connected: " + agent.client.connected + " signedin: " + agent.client.signedin);
                        b = true;
                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, packageid)];
                    case 1:
                        pck = _a.sent();
                        if (pck == null) {
                            throw new Error("Package " + packageid + " not found");
                        }
                        packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "packages", packageid));
                        console.log("connected: " + agent.client.connected + " signedin: " + agent.client.signedin);
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
                        log("registering agent queue as " + res.slug + "agent");
                        _a = agent;
                        return [4 /*yield*/, agent.client.RegisterQueue({ queuename: res.slug + "agent" }, agent.onQueueMessage)];
                    case 2:
                        _a.localqueue = _b.sent();
                        log("queue registered as " + agent.localqueue);
                        agent.agentid = res._id;
                        config_1 = { agentid: agent.agentid, jwt: res.jwt, apiurl: agent.client.url };
                        if (fs.existsSync(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json"))) {
                            config_1 = JSON.parse(fs.readFileSync(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json"), "utf8"));
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
                        if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder()))
                            fs.mkdirSync(packagemanager_1.packagemanager.packagefolder(), { recursive: true });
                        fs.writeFileSync(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json"), JSON.stringify(config_1));
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
                                            var kill, isRunning;
                                            return __generator(this, function (_a) {
                                                kill = function () {
                                                    for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                                        var stream = runner_1.runner.streams[s];
                                                        if (stream.schedulename == schedule.name) {
                                                            runner_1.runner.kill(agent.client, stream.id);
                                                        }
                                                    }
                                                };
                                                isRunning = function () {
                                                    for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                                        var stream = runner_1.runner.streams[s];
                                                        if (stream.schedulename == schedule.name) {
                                                            return true;
                                                        }
                                                    }
                                                    return false;
                                                };
                                                if (schedule.enabled) {
                                                    if (schedule.terminateIfRunning == true && isRunning() == true) {
                                                        log("Schedule " + +" (" + schedule.id + ") is already running, kill all instances of package " + schedule.packageid + " and start again");
                                                        kill();
                                                    }
                                                    else if (schedule.allowConcurrentRuns != true && isRunning() == true) {
                                                        log("Schedule " + +" (" + schedule.id + ") is already running, do nothing");
                                                        return [2 /*return*/];
                                                    }
                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") enabled, run now");
                                                    try {
                                                        agent.localrun(schedule.packageid, null, null, schedule.env, schedule);
                                                    }
                                                    catch (error) {
                                                        console.error(error);
                                                    }
                                                }
                                                else {
                                                    if (isRunning() == true) {
                                                        log("Schedule " + +" (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid);
                                                        kill();
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
                                                var _this = this;
                                                if (schedule.task.timeout != null) {
                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") already running");
                                                    return;
                                                }
                                                if (!schedule.enabled) {
                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") is disabled");
                                                    return;
                                                }
                                                var startinms = 100;
                                                if (schedule.task.restartcounter > 0) {
                                                    startinms = 5000 + (1000 * schedule.task.restartcounter);
                                                }
                                                log("Schedule " + schedule.name + " (" + schedule.id + ") started");
                                                schedule.task.stop();
                                                schedule.task.timeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var exitcode, output, payload, error_6, e, minutes, exists, hascronjobs, error_7;
                                                    var _a;
                                                    return __generator(this, function (_b) {
                                                        switch (_b.label) {
                                                            case 0:
                                                                _b.trys.push([0, 5, , 6]);
                                                                exitcode = -1, output = void 0, payload = void 0;
                                                                _b.label = 1;
                                                            case 1:
                                                                _b.trys.push([1, 3, , 4]);
                                                                return [4 /*yield*/, agent.localrun(schedule.packageid, null, null, schedule.env, schedule)];
                                                            case 2:
                                                                _a = _b.sent(), exitcode = _a[0], output = _a[1], payload = _a[2];
                                                                return [3 /*break*/, 4];
                                                            case 3:
                                                                error_6 = _b.sent();
                                                                e = error_6;
                                                                console.error(e);
                                                                return [3 /*break*/, 4];
                                                            case 4:
                                                                if (schedule.task == null)
                                                                    return [2 /*return*/];
                                                                schedule.task.timeout = null;
                                                                if (exitcode != 0) {
                                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") finished with exitcode " + exitcode + '\n' + output);
                                                                }
                                                                else {
                                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") finished (exitcode " + exitcode + ")");
                                                                }
                                                                minutes = (new Date().getTime() - schedule.task.lastrestart.getTime()) / 1000 / 60;
                                                                if (minutes < agent.maxrestartsminutes) {
                                                                    schedule.task.restartcounter++;
                                                                }
                                                                else {
                                                                    schedule.task.restartcounter = 0;
                                                                }
                                                                schedule.task.lastrestart = new Date();
                                                                if (schedule.task.restartcounter < agent.maxrestarts) {
                                                                    exists = agent.schedules.find(function (x) { return x.name == schedule.name && x.packageid == schedule.packageid; });
                                                                    if (exists != null && schedule.task != null) {
                                                                        log("Schedule " + schedule.name + " (" + schedule.id + ") stopped after " + minutes.toFixed(2) + " minutes (" + schedule.task.restartcounter + " of " + agent.maxrestarts + ")");
                                                                        schedule.task.start();
                                                                    }
                                                                }
                                                                else {
                                                                    hascronjobs = agent.schedules.find(function (x) { return x.cron != null && x.cron != "" && x.enabled == true; });
                                                                    if (hascronjobs == null && agent.exitonfailedschedule == true) {
                                                                        log("Schedule " + schedule.name + " (" + schedule.id + ") stopped " + schedule.task.restartcounter + " times, no cron jobs running, exit agent completly!");
                                                                        process.exit(0);
                                                                    }
                                                                    else {
                                                                        log("Schedule " + schedule.name + " (" + schedule.id + ") stopped " + schedule.task.restartcounter + " times, stop schedule");
                                                                    }
                                                                }
                                                                return [3 /*break*/, 6];
                                                            case 5:
                                                                error_7 = _b.sent();
                                                                try {
                                                                    _error(error_7);
                                                                    schedule.task.timeout = null;
                                                                }
                                                                catch (e) {
                                                                    _error(e);
                                                                }
                                                                return [3 /*break*/, 6];
                                                            case 6: return [2 /*return*/];
                                                        }
                                                    });
                                                }); }, startinms);
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
            var streamid_1, streamqueue_1, dostream_1, packagepath_1, original_1, workitem_1, error_8, files, env, i, file, reply, _a, exitcode, output, newpayload, error_9, error_10, error_11, s, stream, processcount, i, processcount, counter, s, _message, error_12, runner_process, runner_stream, commandstreams, processcount, processes, i, p, error_13;
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
                        packagepath_1 = packagemanager_1.packagemanager.getpackagepath(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "packages", payload.packageid));
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
                        error_8 = _b.sent();
                        log(error_8.message ? error_8.message : error_8);
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
                        error_9 = _b.sent();
                        log(error_9.message ? error_9.message : error_9);
                        return [3 /*break*/, 21];
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        error_10 = _b.sent();
                        _error(error_10);
                        dostream_1 = false;
                        return [3 /*break*/, 23];
                    case 23: return [2 /*return*/, { "command": "invoke", "success": true, "completed": false }];
                    case 24:
                        error_11 = _b.sent();
                        _error(error_11);
                        log("!!!error: " + error_11.message ? error_11.message : error_11);
                        workitem_1.errormessage = (error_11.message != null) ? error_11.message : error_11;
                        workitem_1.state = "retry";
                        workitem_1.errortype = "application";
                        return [4 /*yield*/, agent.client.UpdateWorkitem({ workitem: workitem_1 })];
                    case 25:
                        _b.sent();
                        return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_11.message) }];
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
                        if (payload.command == "reinstallpackage") {
                            if (payload.id == null || payload.id == "")
                                payload.id = payload.streamid;
                            if (payload.id == null || payload.id == "")
                                throw new Error("id is required");
                            log("Reinstall package " + payload.id);
                            log("Kill all instances of package " + payload.id + " if running");
                            for (s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                stream = runner_1.runner.streams[s];
                                if (stream.packageid == payload.id) {
                                    runner_1.runner.kill(agent.client, stream.id);
                                }
                            }
                            packagemanager_1.packagemanager.removepackage(payload.id);
                            return [2 /*return*/, { "command": "reinstallpackage", "success": true }];
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
                            if (payload.streamqueue != null && payload.streamqueue != "" && runner_1.runner.commandstreams.indexOf(payload.streamqueue) == -1) {
                                runner_1.runner.commandstreams.push(payload.streamqueue);
                            }
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
                        error_12 = _b.sent();
                        log(error_12.message ? error_12.message : error_12);
                        return [3 /*break*/, 31];
                    case 31: 
                    // runner.notifyStream(agent.client, payload.id, s.buffer, false)
                    return [2 /*return*/, { "command": "setstreamid", "success": true, "count": counter, }];
                    case 32:
                        if (payload.command == "listprocesses") {
                            if (runner_1.runner.commandstreams.indexOf(msg.replyto) == -1 && msg.replyto != null && msg.replyto != "") {
                                console.log("Add streamqueue " + msg.replyto + " to commandstreams");
                                runner_1.runner.commandstreams.push(msg.replyto);
                            }
                            runner_process = runner_1.runner.processs;
                            runner_stream = runner_1.runner.streams;
                            commandstreams = runner_1.runner.commandstreams;
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
                        error_13 = _b.sent();
                        _error(error_13);
                        log(JSON.stringify({ "command": payload.command, "success": false, error: JSON.stringify(error_13.message) }));
                        return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_13.message) }];
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
    agent.maxrestarts = 15;
    agent.maxrestartsminutes = 15;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQStGO0FBQy9GLG1DQUFrQztBQUNsQyxtREFBNEQ7QUFDNUQsZ0NBQWtDO0FBQ2xDLGlDQUFzQztBQUV0Qyx1QkFBd0I7QUFDeEIsMkJBQTZCO0FBQzdCLHVCQUF3QjtBQUN4QixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBRWxDLElBQUksSUFBSSxHQUFRLElBQUksQ0FBQztBQUNyQixJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7SUFDN0IseURBQXlEO0lBQ3pELHVDQUF1QztDQUN4QztBQUVEO0lBQ0UsNkJBQVksUUFBNkI7SUFFekMsQ0FBQztJQUNILDBCQUFDO0FBQUQsQ0FBQyxBQUpELElBSUM7QUFKWSxrREFBbUI7QUFLaEM7SUFBQTtJQXM2QkEsQ0FBQztJQXA1QmUsaUJBQVcsR0FBekIsVUFBMEIsU0FBMEIsRUFBRSxRQUFrQztRQUN0RixLQUFLLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNhLFFBQUUsR0FBaEIsVUFBaUIsU0FBMEIsRUFBRSxRQUFrQztRQUM3RSxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNhLFVBQUksR0FBbEIsVUFBbUIsU0FBMEIsRUFBRSxRQUFrQztRQUMvRSxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNhLFNBQUcsR0FBakIsVUFBa0IsU0FBMEIsRUFBRSxRQUFrQztRQUM5RSxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFT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