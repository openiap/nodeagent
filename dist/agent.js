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
            var oidc_config, protocol, domain, apiurl, assistantConfig, url, myproject, pypath, condapath, pypath, pwshpath;
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
                        nodeapi_1.config.doDumpStack = true;
                        if (!agent.reloadAndParseConfig()) {
                            return [2 /*return*/];
                        }
                        try {
                            pypath = runner_1.runner.findPythonPath();
                            if (pypath != null && pypath != "") {
                                agent.languages.push("python");
                            }
                            else {
                                condapath = runner_1.runner.findCondaPath();
                                if (condapath != null && condapath != "") {
                                    agent.languages.push("python");
                                }
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    agent.onConnected = function (client) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var u, watchid, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 5]);
                        u = new URL(client.url);
                        process.env.apiurl = client.url;
                        return [4 /*yield*/, agent.RegisterAgent()];
                    case 1:
                        _b.sent();
                        if (client.client == null || client.client.user == null) {
                            log('connected, but not signed in, close connection again');
                            return [2 /*return*/, client.Close()];
                        }
                        (_a = Logger_1.Logger.instrumentation) === null || _a === void 0 ? void 0 : _a.init(client);
                        log("registering watch on agents");
                        return [4 /*yield*/, client.Watch({ paths: [], collectionname: "agents" }, function (operation, document) { return __awaiter(_this, void 0, void 0, function () {
                                var s, stream, error_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 14, , 15]);
                                            if (!(document._type == "package")) return [3 /*break*/, 8];
                                            if (!(operation == "insert")) return [3 /*break*/, 1];
                                            log("package " + document.name + " inserted, reload packages");
                                            return [3 /*break*/, 7];
                                        case 1:
                                            if (!(operation == "replace" || operation == "delete")) return [3 /*break*/, 7];
                                            log("package " + document.name + " (" + document._id + " ) updated.");
                                            if (!agent.killonpackageupdate) return [3 /*break*/, 5];
                                            log("Kill all instances of package " + document.name + " (" + document._id + ") if running");
                                            s = runner_1.runner.streams.length - 1;
                                            _a.label = 2;
                                        case 2:
                                            if (!(s >= 0)) return [3 /*break*/, 5];
                                            stream = runner_1.runner.streams[s];
                                            if (!(stream.packageid == document._id)) return [3 /*break*/, 4];
                                            return [4 /*yield*/, runner_1.runner.kill(agent.client, stream.id)];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4:
                                            s--;
                                            return [3 /*break*/, 2];
                                        case 5:
                                            packagemanager_1.packagemanager.removepackage(document._id);
                                            if (!(operation == "replace")) return [3 /*break*/, 7];
                                            if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder()))
                                                fs.mkdirSync(packagemanager_1.packagemanager.packagefolder(), { recursive: true });
                                            return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, document._id, false)];
                                        case 6:
                                            _a.sent();
                                            _a.label = 7;
                                        case 7: return [3 /*break*/, 13];
                                        case 8:
                                            if (!(document._type == "agent")) return [3 /*break*/, 12];
                                            if (!(document._id == agent.agentid)) return [3 /*break*/, 10];
                                            if (agent.lastreload.getTime() + 1000 > new Date().getTime()) {
                                                log("agent changed, but last reload was less than 1 second ago, do nothing");
                                                return [2 /*return*/];
                                            }
                                            agent.lastreload = new Date();
                                            log("agent changed, reload config");
                                            return [4 /*yield*/, agent.RegisterAgent()];
                                        case 9:
                                            _a.sent();
                                            return [3 /*break*/, 11];
                                        case 10:
                                            log("Another agent was changed, do nothing");
                                            _a.label = 11;
                                        case 11: return [3 /*break*/, 13];
                                        case 12:
                                            log("unknown type " + document._type + " changed, do nothing");
                                            _a.label = 13;
                                        case 13: return [3 /*break*/, 15];
                                        case 14:
                                            error_2 = _a.sent();
                                            _error(error_2);
                                            return [3 /*break*/, 15];
                                        case 15: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        watchid = _b.sent();
                        log("watch registered with id " + watchid);
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _b.sent();
                        _error(error_1);
                        return [4 /*yield*/, (0, util_1.sleep)(2000)];
                    case 4:
                        _b.sent();
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
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var pck, packagepath, runfolder, _env, payloadfile, wipath, wijson, _stream, _b, exitcode, stream, wipayload, error_3, wipayload;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("connected: " + agent.client.connected + " signedin: " + agent.client.signedin);
                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, packageid, true)];
                    case 1:
                        pck = _c.sent();
                        if (pck == null) {
                            throw new Error("Package " + packageid + " not found");
                        }
                        packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "packages", packageid));
                        console.log("connected: " + agent.client.connected + " signedin: " + agent.client.signedin);
                        if (packagepath == "") {
                            log("Package " + packageid + " not found");
                            return [2 /*return*/, [2, "Package " + packageid + " not found", payload]];
                        }
                        if (streamid == null || streamid == "") {
                            streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                        }
                        runfolder = path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "runtime", streamid);
                        if (fs.existsSync(runfolder)) {
                            throw new Error("Stream " + streamid + " already running (folder exists)");
                        }
                        _env = { "payloadfile": "" };
                        payloadfile = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ".json";
                        wipath = path.join(runfolder, payloadfile);
                        if (env != null)
                            _env = Object.assign(_env, env);
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, 5, 6]);
                        if (fs.existsSync(wipath)) {
                            fs.unlinkSync(wipath);
                        }
                        if (payload != null) {
                            _env = Object.assign(_env, payload);
                        }
                        _env["payloadfile"] = payloadfile;
                        if (payload != null) {
                            wijson = JSON.stringify(payload, null, 2);
                            if (!fs.existsSync(runfolder))
                                fs.mkdirSync(runfolder, { recursive: true });
                            fs.writeFileSync(wipath, wijson);
                        }
                        _stream = new stream_1.Stream.Readable({
                            read: function (size) { }
                        });
                        log("run package " + pck.name + " (" + packageid + ")");
                        return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(agent.client, packageid, streamid, [], _stream, true, _env, schedule)];
                    case 3:
                        _b = _c.sent(), exitcode = _b.exitcode, stream = _b.stream;
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
                        return [2 /*return*/, [exitcode, (_a = stream === null || stream === void 0 ? void 0 : stream.buffer) === null || _a === void 0 ? void 0 : _a.toString(), wipayload]];
                    case 4:
                        error_3 = _c.sent();
                        _error(error_3);
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
                        return [2 /*return*/, [-1, error_3.message, wipayload]];
                    case 5:
                        try {
                            packagemanager_1.packagemanager.deleteDirectoryRecursiveSync(runfolder);
                        }
                        catch (error) {
                        }
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    agent.localrun_old = function (packageid, streamid, payload, env, schedule) {
        return __awaiter(this, void 0, void 0, function () {
            var pck, packagepath, _env, payloadfile, wipath, wijson, _stream, ids, _a, exitcode, stream, wipayload, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("connected: " + agent.client.connected + " signedin: " + agent.client.signedin);
                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, packageid, true)];
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
                        return [2 /*return*/, [exitcode, stream === null || stream === void 0 ? void 0 : stream.buffer.toString(), wipayload]];
                    case 4:
                        error_4 = _b.sent();
                        _error(error_4);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    agent.reloadpackages = function (force) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
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
                        error_5 = _a.sent();
                        _error(error_5);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    agent.RegisterAgent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var u, chromium, chrome, daemon, data, res, keys_1, i_1, _a, config_1, exists, name_1, _loop_1, keys, p, _loop_2, p, _loop_3, p, error_6;
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
                        if (res.jwt != null && res.jwt != "") {
                            process.env.jwt = res.jwt;
                        }
                        if (agent.client.url != null && agent.client.url != "") {
                            config_1.apiurl = agent.client.url;
                        }
                        if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder()))
                            fs.mkdirSync(packagemanager_1.packagemanager.packagefolder(), { recursive: true });
                        fs.writeFileSync(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json"), JSON.stringify(config_1));
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
                            var _schedule, schedule, updated, i, key, s, stream, error_7;
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
                                        error_7 = _c.sent();
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
                            var _schedule, schedule, s, stream, error_8;
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
                                        error_8 = _d.sent();
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
                                                        var exitcode, output, payload, error_9, e, minutes, exists, hascronjobs, error_10;
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
                                                                    error_9 = _b.sent();
                                                                    e = error_9;
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
                                                                    error_10 = _b.sent();
                                                                    try {
                                                                        _error(error_10);
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
                        error_6 = _b.sent();
                        _error(error_6);
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
            var streamid_1, streamqueue_1, dostream_1, packagepath_1, original_1, workitem_1, error_11, files, env, i, file, reply, _a, exitcode, output, newpayload, error_12, error_13, error_14, s, stream, processcount, i, processcount, counter, s, _message, error_15, runner_process, runner_stream, commandstreams, processcount, processes, i, p, _streamid_1, portname, _streams, filteredstreams, i, s, y, p, portlistener, _streamid_2, portname_1, portlistener, _streams, filteredstreams, i, s, y, p, portlistener, error_16, sumports;
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
                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, payload.packageid, true)];
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
                        error_11 = _b.sent();
                        log(error_11.message ? error_11.message : error_11);
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
                        error_12 = _b.sent();
                        log(error_12.message ? error_12.message : error_12);
                        return [3 /*break*/, 21];
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        error_13 = _b.sent();
                        _error(error_13);
                        dostream_1 = false;
                        return [3 /*break*/, 23];
                    case 23: return [2 /*return*/, { "command": "invoke", "success": true, "completed": false }];
                    case 24:
                        error_14 = _b.sent();
                        _error(error_14);
                        log("!!!error: " + error_14.message ? error_14.message : error_14);
                        workitem_1.errormessage = (error_14.message != null) ? error_14.message : error_14;
                        workitem_1.state = "retry";
                        workitem_1.errortype = "application";
                        return [4 /*yield*/, agent.client.UpdateWorkitem({ workitem: workitem_1 })];
                    case 25:
                        _b.sent();
                        return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_14.message) }];
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
                        error_15 = _b.sent();
                        log(error_15.message ? error_15.message : error_15);
                        return [3 /*break*/, 43];
                    case 43: return [2 /*return*/, { "command": "setstreamid", "success": true, "count": counter, }];
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
                                return [2 /*return*/];
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
                        error_16 = _b.sent();
                        _error(error_16);
                        log(JSON.stringify({ "command": payload.command, "success": false, error: JSON.stringify(error_16.message) }));
                        return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_16.message) }];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQStGO0FBQy9GLG1DQUFrQztBQUNsQyxtREFBNEQ7QUFDNUQsZ0NBQWtDO0FBQ2xDLGlDQUFzQztBQUV0Qyx1QkFBd0I7QUFDeEIsMkJBQTZCO0FBQzdCLHVCQUF3QjtBQUN4QixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBQ2xDLDJDQUE4QztBQUM5QywrQkFBK0I7QUFFL0IsSUFBSSxJQUFJLEdBQVEsSUFBSSxDQUFDO0FBQ3JCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sRUFBRTtJQUM3Qix5REFBeUQ7SUFDekQsdUNBQXVDO0NBQ3hDO0FBRUQ7SUFDRSw2QkFBWSxRQUE2QjtJQUV6QyxDQUFDO0lBQ0gsMEJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUpZLGtEQUFtQjtBQUtoQztJQUFBO0lBMGlDQSxDQUFDO0lBdmhDZSxpQkFBVyxHQUF6QixVQUEwQixTQUEwQixFQUFFLFFBQWtDO1FBQ3RGLEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ2EsUUFBRSxHQUFoQixVQUFpQixTQUEwQixFQUFFLFFBQWtDO1FBQzdFLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ2EsVUFBSSxHQUFsQixVQUFtQixTQUEwQixFQUFFLFFBQWtDO1FBQy9FLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ2EsU0FBRyxHQUFqQixVQUFrQixTQUEwQixFQUFFLFFBQWtDO1FBQzlFLEtBQUssQ0FB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