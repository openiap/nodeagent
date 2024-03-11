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
                        return [2 /*return*/, [exitcode, (_a = stream.buffer) === null || _a === void 0 ? void 0 : _a.toString(), wipayload]];
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
                        return [2 /*return*/, [exitcode, stream.buffer.toString(), wipayload]];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQStGO0FBQy9GLG1DQUFrQztBQUNsQyxtREFBNEQ7QUFDNUQsZ0NBQWtDO0FBQ2xDLGlDQUFzQztBQUV0Qyx1QkFBd0I7QUFDeEIsMkJBQTZCO0FBQzdCLHVCQUF3QjtBQUN4QixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBQ2xDLDJDQUE4QztBQUM5QywrQkFBK0I7QUFFL0IsSUFBSSxJQUFJLEdBQVEsSUFBSSxDQUFDO0FBQ3JCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sRUFBRTtJQUM3Qix5REFBeUQ7SUFDekQsdUNBQXVDO0NBQ3hDO0FBRUQ7SUFDRSw2QkFBWSxRQUE2QjtJQUV6QyxDQUFDO0lBQ0gsMEJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUpZLGtEQUFtQjtBQUtoQztJQUFBO0lBbWlDQSxDQUFDO0lBaGhDZSxpQkFBVyxHQUF6QixVQUEwQixTQUEwQixFQUFFLFFBQWtDO1FBQ3RGLEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ2EsUUFBRSxHQUFoQixVQUFpQixTQUEwQixFQUFFLFFBQWtDO1FBQzdFLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ2EsVUFBSSxHQUFsQixVQUFtQixTQUEwQixFQUFFLFFBQWtDO1FBQy9FLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ2EsU0FBRyxHQUFqQixVQUFrQixTQUEwQixFQUFFLFFBQWtDO1FBQzlFLEtBQUssQ0FB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