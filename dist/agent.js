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
var PortMapper_1 = require("./PortMapper");
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
                        if (agent.PortMapperCleanTimer == null) {
                            agent.PortMapperClean();
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
    agent.PortMapperClean = function () {
        try {
            for (var i = 0; i < agent.portlisteners.length; i++) {
                var portlistener = agent.portlisteners[i];
                if (portlistener == null)
                    continue;
                if (portlistener.lastUsed.getTime() + 600000 < new Date().getTime()) { // 10 minutes
                    log("Port " + portlistener.portname + " not used for 10 minutes, remove it");
                    agent.portlisteners.splice(i, 1);
                    i--;
                    portlistener.dispose();
                }
                else {
                    portlistener.RemoveOldConnections();
                }
            }
        }
        catch (error) {
            _error(error);
        }
        agent.PortMapperCleanTimer = setTimeout(function () { return agent.PortMapperClean(); }, 100);
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
            var b, pck, packagepath, _env, payloadfile, wipath, wijson, stream, buffer_1, ids, exitcode, wipayload, error_3;
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
                        ids = [];
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
            var streamid_1, streamqueue_1, dostream_1, packagepath_1, original_1, workitem_1, error_8, files, env, i, file, reply, _a, exitcode, output, newpayload, error_9, error_10, error_11, s, stream, processcount, i, processcount, counter, s, _message, error_12, runner_process, runner_stream, commandstreams, processcount, processes, i, p, _streamid_1, portname, _streams, filteredstreams, i, s, y, p, portlistener, _streamid_2, portname_1, portlistener, _streams, filteredstreams, i, s, y, p, portlistener, error_13, sumports;
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
                                    "ports": p.ports,
                                });
                            }
                            return [2 /*return*/, { "command": "listprocesses", "success": true, "count": processcount, "processes": processes }];
                        }
                        if (payload.command == "portclose") {
                            if (payload.id == null || payload.id == "")
                                return [2 /*return*/, { "command": "portclose", "success": false, "error": "id is required" }];
                            _streamid_1 = payload.streamid;
                            if (_streamid_1 == null || _streamid_1 == "")
                                _streamid_1 = null;
                            portname = payload.portname;
                            if (portname == null || portname == "")
                                portname = null;
                            if (portname == null)
                                return [2 /*return*/, { "command": "portclose", "success": false, "error": "portname is required" }];
                            _streams = [];
                            filteredstreams = runner_1.runner.streams;
                            if (_streamid_1 != null)
                                filteredstreams = filteredstreams.filter(function (x) { return x.id == _streamid_1; });
                            for (i = 0; i < filteredstreams.length; i++) {
                                s = runner_1.runner.streams[i];
                                for (y = 0; y < s.ports.length; y++) {
                                    p = s.ports[y];
                                    if (p.portname == portname) {
                                        _streams.push({ "streamid": s.id, "port": p.port, "portname": p.portname });
                                        break;
                                    }
                                }
                            }
                            if (_streams.length != 1) {
                                return [2 /*return*/, { "command": "portclose", "success": false, "error": "Unknown forwarding port (" + payload.portname + ":" + (payload.port || "") + "/" + _streams.length + ")" }];
                            }
                            else {
                                portlistener = agent.portlisteners.find(function (x) { return x.streamid == _streams[0].id && x.portname == _streams[0].portname; });
                                if (portlistener != null) {
                                    portlistener.removeConnection(payload.id);
                                }
                            }
                            return [2 /*return*/];
                            // return { "command": "portclose", "success": true};
                        }
                        if (payload.command == "portdata") {
                            if (payload.id == null || payload.id == "")
                                return [2 /*return*/, { "command": "portdata", "success": false, "error": "id is required" }];
                            if (payload.seq === null || payload.seq === undefined || payload.seq === "")
                                return [2 /*return*/, { "command": "portdata", "success": false, "error": "seq is required" }];
                            payload.seq = parseInt(payload.seq);
                            if (Number.isNaN(payload.seq))
                                return [2 /*return*/, { "command": "portdata", "success": false, "error": "seq is not a number" }];
                            if (msg.replyto == null || msg.replyto == "")
                                return [2 /*return*/, { "command": "portdata", "success": false, "error": "replyto is required" }];
                            _streamid_2 = payload.streamid;
                            if (_streamid_2 == null || _streamid_2 == "")
                                _streamid_2 = null;
                            portname_1 = payload.portname;
                            if (portname_1 == null || portname_1 == "")
                                portname_1 = null;
                            if (portname_1 == null)
                                return [2 /*return*/, { "command": "portdata", "success": false, "error": "portname is required" }];
                            if (_streamid_2 == null && portname_1 != null && payload.port !== null && payload.port !== undefined) {
                                portlistener = agent.portlisteners.find(function (x) { return x.port == payload.port && x.portname == portname_1; });
                                if (portlistener == null) {
                                    portlistener = new PortMapper_1.HostPortMapper(agent.client, parseInt(payload.port), portname_1, "127.0.0.1", undefined);
                                    agent.portlisteners.push(portlistener);
                                }
                                portlistener.newConnection(payload.id, msg.replyto); // Ensure connection
                                portlistener.IncommingData(payload.id, payload.seq, Buffer.from(payload.buf)); // Forward data
                                return [2 /*return*/]; // { "command": "portdata", "success": true};
                            }
                            _streams = [];
                            filteredstreams = runner_1.runner.streams;
                            if (_streamid_2 != null)
                                filteredstreams = filteredstreams.filter(function (x) { return x.id == _streamid_2; });
                            for (i = 0; i < filteredstreams.length; i++) {
                                s = runner_1.runner.streams[i];
                                for (y = 0; y < s.ports.length; y++) {
                                    p = s.ports[y];
                                    if (p.portname == portname_1) {
                                        _streams.push({ "streamid": s.id, "port": p.port, "portname": p.portname });
                                        break;
                                    }
                                }
                            }
                            if (_streams.length != 1) {
                                return [2 /*return*/, { "command": "portdata", "success": false, "error": "Unknown forwarding port (" + payload.portname + ":" + (payload.port || "") + "/" + _streams.length + ")" }];
                            }
                            else {
                                portlistener = agent.portlisteners.find(function (x) { return x.streamid == _streams[0].id && x.portname == _streams[0].portname; });
                                if (portlistener == null) {
                                    portlistener = new PortMapper_1.HostPortMapper(agent.client, _streams[0].port, _streams[0].portname, "127.0.0.1", _streams[0].id);
                                    agent.portlisteners.push(portlistener);
                                }
                                portlistener.newConnection(payload.id, msg.replyto); // Ensure connection
                                portlistener.IncommingData(payload.id, payload.seq, Buffer.from(payload.buf)); // Forward data
                            }
                            return [2 /*return*/, null];
                        }
                        return [3 /*break*/, 35];
                    case 33:
                        error_13 = _b.sent();
                        _error(error_13);
                        log(JSON.stringify({ "command": payload.command, "success": false, error: JSON.stringify(error_13.message) }));
                        return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_13.message) }];
                    case 34:
                        sumports = agent.portlisteners.map(function (x) { return x.connections.size; }).reduce(function (a, b) { return a + b; }, 0);
                        log("commandstreams:" + runner_1.runner.commandstreams.length + " portlisteners:" + agent.portlisteners.length + " ports: " + sumports);
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
    agent.portlisteners = [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQStGO0FBQy9GLG1DQUFrQztBQUNsQyxtREFBNEQ7QUFDNUQsZ0NBQWtDO0FBQ2xDLGlDQUFzQztBQUV0Qyx1QkFBd0I7QUFDeEIsMkJBQTZCO0FBQzdCLHVCQUF3QjtBQUN4QixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBQ2xDLDJDQUE0RDtBQUU1RCxJQUFJLElBQUksR0FBUSxJQUFJLENBQUM7QUFDckIsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxFQUFFO0lBQzdCLHlEQUF5RDtJQUN6RCx1Q0FBdUM7Q0FDeEM7QUFFRDtJQUNFLDZCQUFZLFFBQTZCO0lBRXpDLENBQUM7SUFDSCwwQkFBQztBQUFELENBQUMsQUFKRCxJQUlDO0FBSlksa0RBQW1CO0FBS2hDO0lBQUE7SUE2Z0NBLENBQUM7SUExL0JlLGlCQUFXLEdBQXpCLFVBQTBCLFNBQTBCLEVBQUUsUUFBa0M7UUFDdEYsS0FBSyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFDYSxRQUFFLEdBQWhCLFVBQWlCLFNBQTBCLEVBQUUsUUFBa0M7UUFDN0UsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFDYSxVQUFJLEdBQWxCLFVBQW1CLFNBQTBCLEVBQUUsUUFBa0M7UUFDL0UsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDYSxTQUFHLEdBQWpCLFVBQWtCLFNBQTBCLEVBQUUsUUFBa0M7UUFDOUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxH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