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
var util_1 = require("./util");
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
                                            _a.trys.push([0, 15, , 16]);
                                            if (!(document._type == "package")) return [3 /*break*/, 9];
                                            if (!(operation == "insert")) return [3 /*break*/, 2];
                                            log("package " + document.name + " inserted, reload packages");
                                            return [4 /*yield*/, agent.reloadpackages(false)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 8];
                                        case 2:
                                            if (!(operation == "replace" || operation == "delete")) return [3 /*break*/, 8];
                                            log("package " + document.name + " (" + document._id + " ) updated.");
                                            if (!agent.killonpackageupdate) return [3 /*break*/, 6];
                                            log("Kill all instances of package " + document.name + " (" + document._id + ") if running");
                                            s = runner_1.runner.streams.length - 1;
                                            _a.label = 3;
                                        case 3:
                                            if (!(s >= 0)) return [3 /*break*/, 6];
                                            stream = runner_1.runner.streams[s];
                                            if (!(stream.packageid == document._id)) return [3 /*break*/, 5];
                                            return [4 /*yield*/, runner_1.runner.kill(agent.client, stream.id)];
                                        case 4:
                                            _a.sent();
                                            _a.label = 5;
                                        case 5:
                                            s--;
                                            return [3 /*break*/, 3];
                                        case 6:
                                            packagemanager_1.packagemanager.removepackage(document._id);
                                            if (!(operation == "replace")) return [3 /*break*/, 8];
                                            if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder()))
                                                fs.mkdirSync(packagemanager_1.packagemanager.packagefolder(), { recursive: true });
                                            return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, document._id)];
                                        case 7:
                                            _a.sent();
                                            _a.label = 8;
                                        case 8: return [3 /*break*/, 14];
                                        case 9:
                                            if (!(document._type == "agent")) return [3 /*break*/, 13];
                                            if (!(document._id == agent.agentid)) return [3 /*break*/, 11];
                                            if (agent.lastreload.getTime() + 1000 > new Date().getTime()) {
                                                log("agent changed, but last reload was less than 1 second ago, do nothing");
                                                return [2 /*return*/];
                                            }
                                            agent.lastreload = new Date();
                                            log("agent changed, reload config");
                                            return [4 /*yield*/, agent.RegisterAgent()];
                                        case 10:
                                            _a.sent();
                                            return [3 /*break*/, 12];
                                        case 11:
                                            log("Another agent was changed, do nothing");
                                            _a.label = 12;
                                        case 12: return [3 /*break*/, 14];
                                        case 13:
                                            log("unknown type " + document._type + " changed, do nothing");
                                            _a.label = 14;
                                        case 14: return [3 /*break*/, 16];
                                        case 15:
                                            error_2 = _a.sent();
                                            _error(error_2);
                                            return [3 /*break*/, 16];
                                        case 16: return [2 /*return*/];
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
                        return [4 /*yield*/, (0, util_1.sleep)(2000)];
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
            var pck, packagepath, _env, payloadfile, wipath, wijson, _stream, ids, _a, exitcode, stream, wipayload, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("connected: " + agent.client.connected + " signedin: " + agent.client.signedin);
                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, packageid)];
                    case 1:
                        pck = _b.sent();
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
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
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
                        _stream = new stream_1.Stream.Readable({
                            read: function (size) { }
                        });
                        // let buffer: Buffer = Buffer.from("");
                        //_stream.on('data', async (data) => {
                        // if (data == null) return;
                        // if (Buffer.isBuffer(data)) {
                        //   buffer = Buffer.concat([buffer, data]);
                        // } else {
                        //   buffer = Buffer.concat([buffer, Buffer.from(data)]);
                        // }
                        // if(buffer.length > 1000000) {
                        //     // keep first 500k and remove rest
                        //     buffer = buffer.subarray(0, 500000);
                        // }
                        //});
                        // stream.on('end', async () => { log("process ended"); });
                        log("run package " + pck.name + " (" + packageid + ")");
                        ids = [];
                        return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(agent.client, packageid, streamid, [], _stream, true, _env, schedule)];
                    case 3:
                        _a = _b.sent(), exitcode = _a.exitcode, stream = _a.stream;
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
                        return [2 /*return*/, [exitcode, stream.buffer.toString(), wipayload]];
                    case 4:
                        error_3 = _b.sent();
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
                        _b.trys.push([0, 19, , 20]);
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
                        if (!(res != null && res.slug != "" && res._id != null && res._id != "")) return [3 /*break*/, 15];
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
                            var _schedule, schedule, updated, i, key, s, stream, error_6;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _schedule = res.schedules[p];
                                        schedule = agent.schedules.find(function (x) { return x.name == _schedule.name && x.packageid == _schedule.packageid; });
                                        if (_schedule.env == null)
                                            _schedule.env = {};
                                        if (_schedule.cron == null || _schedule.cron == "")
                                            _schedule.cron = "";
                                        if (!(schedule == null)) return [3 /*break*/, 1];
                                        agent.schedules.push(_schedule);
                                        return [3 /*break*/, 8];
                                    case 1:
                                        if (schedule.env == null)
                                            schedule.env = {};
                                        if (schedule.cron == null || schedule.cron == "")
                                            schedule.cron = "";
                                        updated = false;
                                        // if (JSON.stringify(_schedule.env) != JSON.stringify(schedule.env) || _schedule.cron != schedule.cron || _schedule.enabled != schedule.enabled) {
                                        //   updated = true;
                                        // }
                                        keys = Object.keys(_schedule);
                                        for (i = 0; i < keys.length; i++) {
                                            key = keys[i];
                                            if (key == "task")
                                                continue;
                                            if (JSON.stringify(schedule[key]) != JSON.stringify(_schedule[key])) {
                                                updated = true;
                                                schedule[key] = _schedule[key];
                                            }
                                        }
                                        if (!updated) return [3 /*break*/, 8];
                                        if (schedule.task != null) {
                                            schedule.task.restartcounter = 0;
                                            schedule.task.lastrestart = new Date();
                                        }
                                        _c.label = 2;
                                    case 2:
                                        _c.trys.push([2, 7, , 8]);
                                        log("Schedule " + _schedule.name + " (" + _schedule.id + ") updated, kill all instances of package " + _schedule.packageid + " if running");
                                        s = runner_1.runner.streams.length - 1;
                                        _c.label = 3;
                                    case 3:
                                        if (!(s >= 0)) return [3 /*break*/, 6];
                                        stream = runner_1.runner.streams[s];
                                        if (!(stream.schedulename == _schedule.name)) return [3 /*break*/, 5];
                                        return [4 /*yield*/, runner_1.runner.kill(agent.client, stream.id)];
                                    case 4:
                                        _c.sent();
                                        _c.label = 5;
                                    case 5:
                                        s--;
                                        return [3 /*break*/, 3];
                                    case 6:
                                        if (schedule.enabled && schedule.task != null) {
                                            schedule.task.start();
                                        }
                                        return [3 /*break*/, 8];
                                    case 7:
                                        error_6 = _c.sent();
                                        return [3 /*break*/, 8];
                                    case 8: return [2 /*return*/];
                                }
                            });
                        };
                        p = 0;
                        _b.label = 3;
                    case 3:
                        if (!(p < res.schedules.length)) return [3 /*break*/, 6];
                        return [5 /*yield**/, _loop_1(p)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        p++;
                        return [3 /*break*/, 3];
                    case 6:
                        _loop_2 = function (p) {
                            var _schedule, schedule, s, stream, error_7;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _schedule = agent.schedules[p];
                                        schedule = res.schedules.find(function (x) { return x.name == _schedule.name && x.packageid == _schedule.packageid; });
                                        if (!(schedule == null)) return [3 /*break*/, 7];
                                        agent.schedules.splice(p, 1);
                                        _d.label = 1;
                                    case 1:
                                        _d.trys.push([1, 6, , 7]);
                                        if (_schedule.task != null) {
                                            _schedule.task.stop();
                                            _schedule.task = null;
                                        }
                                        log("Schedule " + _schedule.name + " (" + _schedule.id + ") removed, kill all instances of package " + _schedule.packageid + " if running");
                                        s = runner_1.runner.streams.length - 1;
                                        _d.label = 2;
                                    case 2:
                                        if (!(s >= 0)) return [3 /*break*/, 5];
                                        stream = runner_1.runner.streams[s];
                                        if (!(stream.schedulename == _schedule.name)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, runner_1.runner.kill(agent.client, stream.id)];
                                    case 3:
                                        _d.sent();
                                        _d.label = 4;
                                    case 4:
                                        s--;
                                        return [3 /*break*/, 2];
                                    case 5: return [3 /*break*/, 7];
                                    case 6:
                                        error_7 = _d.sent();
                                        return [3 /*break*/, 7];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        };
                        p = agent.schedules.length - 1;
                        _b.label = 7;
                    case 7:
                        if (!(p >= 0)) return [3 /*break*/, 10];
                        return [5 /*yield**/, _loop_2(p)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        p--;
                        return [3 /*break*/, 7];
                    case 10:
                        _loop_3 = function (p) {
                            var schedule, s, stream, s, stream;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        schedule = agent.schedules[p];
                                        if (schedule.packageid == null || schedule.packageid == "") {
                                            log("Schedule " + schedule.name + " has no packageid, skip");
                                            return [2 /*return*/, "continue"];
                                        }
                                        if (!(schedule.cron != null && schedule.cron != "")) return [3 /*break*/, 7];
                                        if (!!schedule.enabled) return [3 /*break*/, 5];
                                        if (schedule.task != null) {
                                            schedule.task.stop();
                                            schedule.task = null;
                                        }
                                        log("Schedule " + schedule.name + " (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid + " if running");
                                        s = runner_1.runner.streams.length - 1;
                                        _e.label = 1;
                                    case 1:
                                        if (!(s >= 0)) return [3 /*break*/, 4];
                                        stream = runner_1.runner.streams[s];
                                        if (!(stream.schedulename == schedule.name)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, runner_1.runner.kill(agent.client, stream.id)];
                                    case 2:
                                        _e.sent();
                                        _e.label = 3;
                                    case 3:
                                        s--;
                                        return [3 /*break*/, 1];
                                    case 4: return [3 /*break*/, 6];
                                    case 5:
                                        log("Schedule " + schedule.name + " (" + schedule.id + ") running every " + schedule.cron);
                                        if (schedule.task == null) {
                                            schedule.task = cron.schedule(schedule.cron, function () { return __awaiter(_this, void 0, void 0, function () {
                                                var kill, isRunning;
                                                return __generator(this, function (_a) {
                                                    kill = function () {
                                                        for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                                            var stream = runner_1.runner.streams[s];
                                                            if (stream.schedulename == schedule.name) {
                                                                runner_1.runner.kill(agent.client, stream.id).catch(function (error) {
                                                                    _error(error);
                                                                });
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
                                        _e.label = 6;
                                    case 6: return [3 /*break*/, 12];
                                    case 7:
                                        if (!schedule.enabled) return [3 /*break*/, 8];
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
                                                                runner_1.runner.kill(agent.client, stream.id).catch(function (error) {
                                                                    _error(error);
                                                                });
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
                                                        var exitcode, output, payload, error_8, e, minutes, exists, hascronjobs, error_9;
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
                                                                    error_8 = _b.sent();
                                                                    e = error_8;
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
                                                                    error_9 = _b.sent();
                                                                    try {
                                                                        _error(error_9);
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
                                        return [3 /*break*/, 12];
                                    case 8:
                                        log("Schedule " + schedule.name + " disabled, kill all instances of package " + schedule.packageid + " if running");
                                        s = runner_1.runner.streams.length - 1;
                                        _e.label = 9;
                                    case 9:
                                        if (!(s >= 0)) return [3 /*break*/, 12];
                                        stream = runner_1.runner.streams[s];
                                        if (!(stream.schedulename == schedule.name)) return [3 /*break*/, 11];
                                        return [4 /*yield*/, runner_1.runner.kill(agent.client, stream.id)];
                                    case 10:
                                        _e.sent();
                                        _e.label = 11;
                                    case 11:
                                        s--;
                                        return [3 /*break*/, 9];
                                    case 12: return [2 /*return*/];
                                }
                            });
                        };
                        p = 0;
                        _b.label = 11;
                    case 11:
                        if (!(p < agent.schedules.length)) return [3 /*break*/, 14];
                        return [5 /*yield**/, _loop_3(p)];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13:
                        p++;
                        return [3 /*break*/, 11];
                    case 14:
                        log("Registed agent as " + res.name + " (" + agent.agentid + ") and queue " + agent.localqueue + " ( from " + res.slug + " )");
                        return [3 /*break*/, 16];
                    case 15:
                        log("Registrering agent seems to have failed without an error !?!");
                        if (res == null) {
                            log("res is null");
                        }
                        else {
                            log(JSON.stringify(res, null, 2));
                        }
                        _b.label = 16;
                    case 16:
                        if (!(res.jwt != null && res.jwt != "")) return [3 /*break*/, 18];
                        return [4 /*yield*/, agent.client.Signin({ jwt: res.jwt })];
                    case 17:
                        _b.sent();
                        log('Re-authenticated to ' + u.hostname + ' as ' + agent.client.client.user.username);
                        _b.label = 18;
                    case 18:
                        agent.reloadAndParseConfig();
                        return [3 /*break*/, 20];
                    case 19:
                        error_5 = _b.sent();
                        _error(error_5);
                        process.env["apiurl"] = "";
                        process.env["jwt"] = "";
                        try {
                            agent.client.Close();
                        }
                        catch (error) {
                        }
                        return [3 /*break*/, 20];
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    agent.onQueueMessage = function (msg, payload, user, jwt) {
        return __awaiter(this, void 0, void 0, function () {
            var streamid_1, streamqueue_1, dostream_1, packagepath_1, original_1, workitem_1, error_10, files, env, i, file, reply, _a, exitcode, output, newpayload, error_11, error_12, error_13, s, stream, processcount, i, processcount, counter, s, _message, error_14, runner_process, runner_stream, commandstreams, processcount, processes, i, p, _streamid_1, portname, _streams, filteredstreams, i, s, y, p, portlistener, _streamid_2, portname_1, portlistener, _streams, filteredstreams, i, s, y, p, portlistener, error_15, sumports;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 45, 46, 47]);
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
                        error_10 = _b.sent();
                        log(error_10.message ? error_10.message : error_10);
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
                        error_11 = _b.sent();
                        log(error_11.message ? error_11.message : error_11);
                        return [3 /*break*/, 21];
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        error_12 = _b.sent();
                        _error(error_12);
                        dostream_1 = false;
                        return [3 /*break*/, 23];
                    case 23: return [2 /*return*/, { "command": "invoke", "success": true, "completed": false }];
                    case 24:
                        error_13 = _b.sent();
                        _error(error_13);
                        log("!!!error: " + error_13.message ? error_13.message : error_13);
                        workitem_1.errormessage = (error_13.message != null) ? error_13.message : error_13;
                        workitem_1.state = "retry";
                        workitem_1.errortype = "application";
                        return [4 /*yield*/, agent.client.UpdateWorkitem({ workitem: workitem_1 })];
                    case 25:
                        _b.sent();
                        return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_13.message) }];
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
                        if (!(payload.command == "kill")) return [3 /*break*/, 29];
                        if (payload.id == null || payload.id == "")
                            payload.id = payload.streamid;
                        if (payload.id == null || payload.id == "")
                            throw new Error("id is required");
                        return [4 /*yield*/, runner_1.runner.kill(agent.client, payload.id)];
                    case 28:
                        _b.sent();
                        return [2 /*return*/, { "command": "kill", "success": true }];
                    case 29:
                        if (!(payload.command == "reinstallpackage")) return [3 /*break*/, 34];
                        if (payload.id == null || payload.id == "")
                            payload.id = payload.streamid;
                        if (payload.id == null || payload.id == "")
                            throw new Error("id is required");
                        log("Reinstall package " + payload.id);
                        log("Kill all instances of package " + payload.id + " if running");
                        s = runner_1.runner.streams.length - 1;
                        _b.label = 30;
                    case 30:
                        if (!(s >= 0)) return [3 /*break*/, 33];
                        stream = runner_1.runner.streams[s];
                        if (!(stream.packageid == payload.id)) return [3 /*break*/, 32];
                        return [4 /*yield*/, runner_1.runner.kill(agent.client, stream.id)];
                    case 31:
                        _b.sent();
                        _b.label = 32;
                    case 32:
                        s--;
                        return [3 /*break*/, 30];
                    case 33:
                        packagemanager_1.packagemanager.removepackage(payload.id);
                        return [2 /*return*/, { "command": "reinstallpackage", "success": true }];
                    case 34:
                        if (!(payload.command == "killall")) return [3 /*break*/, 39];
                        processcount = runner_1.runner.processs.length;
                        i = processcount;
                        _b.label = 35;
                    case 35:
                        if (!(i >= 0)) return [3 /*break*/, 38];
                        return [4 /*yield*/, runner_1.runner.kill(agent.client, runner_1.runner.processs[i].id)];
                    case 36:
                        _b.sent();
                        _b.label = 37;
                    case 37:
                        i--;
                        return [3 /*break*/, 35];
                    case 38: return [2 /*return*/, { "command": "killall", "success": true, "count": processcount }];
                    case 39:
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
                        if (!(payload.command == "setstreamid")) return [3 /*break*/, 44];
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
                        if (!((s === null || s === void 0 ? void 0 : s.buffer) != null && (s === null || s === void 0 ? void 0 : s.buffer.length) > 0)) return [3 /*break*/, 43];
                        _message = Buffer.from(s.buffer);
                        _b.label = 40;
                    case 40:
                        _b.trys.push([40, 42, , 43]);
                        return [4 /*yield*/, agent.client.QueueMessage({ queuename: payload.streamqueue, data: { "command": "stream", "data": _message }, correlationId: streamid_1 })];
                    case 41:
                        _b.sent();
                        return [3 /*break*/, 43];
                    case 42:
                        error_14 = _b.sent();
                        log(error_14.message ? error_14.message : error_14);
                        return [3 /*break*/, 43];
                    case 43: 
                    // runner.notifyStream(agent.client, payload.id, s.buffer, false)
                    return [2 /*return*/, { "command": "setstreamid", "success": true, "count": counter, }];
                    case 44:
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
                        return [3 /*break*/, 47];
                    case 45:
                        error_15 = _b.sent();
                        _error(error_15);
                        log(JSON.stringify({ "command": payload.command, "success": false, error: JSON.stringify(error_15.message) }));
                        return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_15.message) }];
                    case 46:
                        sumports = agent.portlisteners.map(function (x) { return x.connections.size; }).reduce(function (a, b) { return a + b; }, 0);
                        log("commandstreams:" + runner_1.runner.commandstreams.length + " portlisteners:" + agent.portlisteners.length + " ports: " + sumports);
                        return [7 /*endfinally*/];
                    case 47: return [2 /*return*/];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQStGO0FBQy9GLG1DQUFrQztBQUNsQyxtREFBNEQ7QUFDNUQsZ0NBQWtDO0FBQ2xDLGlDQUFzQztBQUV0Qyx1QkFBd0I7QUFDeEIsMkJBQTZCO0FBQzdCLHVCQUF3QjtBQUN4QixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBQ2xDLDJDQUE0RDtBQUM1RCwrQkFBK0I7QUFFL0IsSUFBSSxJQUFJLEdBQVEsSUFBSSxDQUFDO0FBQ3JCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sRUFBRTtJQUM3Qix5REFBeUQ7SUFDekQsdUNBQXVDO0NBQ3hDO0FBRUQ7SUFDRSw2QkFBWSxRQUE2QjtJQUV6QyxDQUFDO0lBQ0gsMEJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUpZLGtEQUFtQjtBQUtoQztJQUFBO0lBZ2hDQSxDQUFDO0lBNy9CZSxpQkFBVyxHQUF6QixVQUEwQixTQUEwQixFQUFFLFFBQWtDO1FBQ3RGLEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ2EsUUFBRSxHQUFoQixVQUFpQixTQUEwQixFQUFFLFFBQWtDO1FBQzdFLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ2EsVUFBSSxHQUFsQixVQUFtQixTQUEwQixFQUFFLFFBQWtDO1FBQy9FLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ2EsU0FBRyxHQUFqQixVQUFrQixTQUEwQixFQUFFLFFBQWtDO1FBQzlFLEtBQUssQ0FB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