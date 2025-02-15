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
// import { HostPortMapper } from "./PortMapper";
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
    // public static portlisteners: HostPortMapper[] = [];
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
    // private static PortMapperCleanTimer: NodeJS.Timer;  
    agent.init = function (_client) {
        if (_client === void 0) { _client = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var oidc_config, protocol, domain, apiurl, assistantConfig, url, myproject, pypath, condapath, pypath, pwshpath, cargopath, javapath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        process.env.PIP_BREAK_SYSTEM_PACKAGES = "1";
                        try {
                            Logger_1.Logger.init();
                        }
                        catch (error) {
                        }
                        // if(agent.PortMapperCleanTimer == null) {
                        //   agent.PortMapperClean();
                        // }
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
                        log("Agent starting!!!", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                                Logger_1.Logger.instrumentation.info("auto generated oidc_config: " + oidc_config, {});
                                process.env.oidc_config = oidc_config;
                            }
                        }
                        myproject = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
                        this.client.version = myproject.version;
                        log("version: " + this.client.version, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        // When injected from docker, use the injected agentid
                        agent.assistantConfig = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
                        agent.dockeragent = false;
                        if (process.env.agentid != "" && process.env.agentid != null) {
                            agent.agentid = process.env.agentid;
                            agent.dockeragent = true;
                        }
                        agent.localqueue = "";
                        agent.languages = ["nodejs", "exec"];
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
                        try {
                            cargopath = runner_1.runner.findCargoPath();
                            if (cargopath != null && cargopath != "") {
                                agent.languages.push("rust");
                            }
                        }
                        catch (error) {
                        }
                        try {
                            javapath = runner_1.runner.findJavaPath();
                            if (javapath != null && javapath != "") {
                                agent.languages.push("java");
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
    // public static PortMapperClean() {
    //   try {
    //     for(let i = 0; i < agent.portlisteners.length; i++) {
    //       const portlistener = agent.portlisteners[i];
    //       if(portlistener == null) continue;
    //       if(portlistener.lastUsed.getTime() + 600000 < new Date().getTime()) { // 10 minutes
    //         log("Port " + portlistener.portname + " not used for 10 minutes, remove it");
    //         agent.portlisteners.splice(i, 1);
    //         i--;
    //         portlistener.dispose();
    //       } else {
    //         portlistener.RemoveOldConnections();
    //       }
    //     }
    //   } catch (error) {
    //     _error(error);      
    //   }
    //   agent.PortMapperCleanTimer = setTimeout(() => agent.PortMapperClean(), 100);
    // }
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
                log("failed locating config to load from " + path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "config.json"), { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
            var u, watchid_1, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 5]);
                        u = new URL(client.url);
                        process.env.apiurl = client.url;
                        (_a = Logger_1.Logger.instrumentation) === null || _a === void 0 ? void 0 : _a.init(client);
                        return [4 /*yield*/, agent.RegisterAgent()];
                    case 1:
                        _b.sent();
                        if (client.client == null || client.client.user == null) {
                            log('connected, but not signed in, close connection again', { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                            return [2 /*return*/, client.Close()];
                        }
                        //Logger.instrumentation?.init(client);
                        log("registering watch on agents", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        return [4 /*yield*/, client.Watch({ paths: [], collectionname: "agents" }, function (operation, document) { return __awaiter(_this, void 0, void 0, function () {
                                var s, stream, error_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 14, , 15]);
                                            if (!(document._type == "package")) return [3 /*break*/, 8];
                                            if (!(operation == "insert")) return [3 /*break*/, 1];
                                            log("package " + document.name + " inserted, reload packages", { watchid: watchid_1, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                                            return [3 /*break*/, 7];
                                        case 1:
                                            if (!(operation == "replace" || operation == "delete")) return [3 /*break*/, 7];
                                            log("package " + document.name + " (" + document._id + " ) updated.", { watchid: watchid_1, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                                            if (!agent.killonpackageupdate) return [3 /*break*/, 5];
                                            log("Kill all instances of package " + document.name + " (" + document._id + ") if running", { watchid: watchid_1, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                                                log("agent changed, but last reload was less than 1 second ago, do nothing", { watchid: watchid_1, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                                                return [2 /*return*/];
                                            }
                                            agent.lastreload = new Date();
                                            log("agent changed, reload config", { watchid: watchid_1, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                                            return [4 /*yield*/, agent.RegisterAgent()];
                                        case 9:
                                            _a.sent();
                                            return [3 /*break*/, 11];
                                        case 10:
                                            log("Another agent was changed, do nothing", { watchid: watchid_1, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                                            _a.label = 11;
                                        case 11: return [3 /*break*/, 13];
                                        case 12:
                                            log("unknown type " + document._type + " changed, do nothing", { watchid: watchid_1, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                                            _a.label = 13;
                                        case 13: return [3 /*break*/, 15];
                                        case 14:
                                            error_2 = _a.sent();
                                            _error(error_2, { watchid: watchid_1, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                                            return [3 /*break*/, 15];
                                        case 15: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        watchid_1 = _b.sent();
                        log("watch registered with id " + watchid_1, { watchid: watchid_1, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _b.sent();
                        _error(error_1, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                log("Disconnected", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                        Logger_1.Logger.instrumentation.info("connected: " + agent.client.connected + " signedin: " + agent.client.signedin, { packageid: packageid, streamid: streamid });
                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, packageid, true)];
                    case 1:
                        pck = _c.sent();
                        if (pck == null) {
                            throw new Error("Package " + packageid + " not found");
                        }
                        packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "packages", packageid));
                        Logger_1.Logger.instrumentation.info("connected: " + agent.client.connected + " signedin: " + agent.client.signedin, { packageid: packageid, streamid: streamid });
                        if (packagepath == "") {
                            log("Package " + packageid + " not found", { packageid: packageid, streamid: streamid, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                        log("run package " + pck.name + " (" + packageid + ")", { packageid: packageid, streamid: streamid, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                                log("Error loading payload from " + wipath + " " + (error.message ? error.message : error), { packageid: packageid, streamid: streamid, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                            }
                        }
                        return [2 /*return*/, [exitcode, (_a = stream === null || stream === void 0 ? void 0 : stream.buffer) === null || _a === void 0 ? void 0 : _a.toString(), wipayload]];
                    case 4:
                        error_3 = _c.sent();
                        _error(error_3, { packageid: packageid, streamid: streamid, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        wipayload = payload;
                        if (fs.existsSync(wipath)) {
                            try {
                                wipayload = JSON.parse(fs.readFileSync(wipath).toString());
                                if (fs.existsSync(wipath)) {
                                    fs.unlinkSync(wipath);
                                }
                            }
                            catch (error) {
                                log("Error loading payload from " + wipath + " " + (error.message ? error.message : error), { packageid: packageid, streamid: streamid, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                        Logger_1.Logger.instrumentation.info("connected: " + agent.client.connected + " signedin: " + agent.client.signedin, { packageid: packageid, streamid: streamid });
                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(agent.client, packageid, true)];
                    case 1:
                        pck = _b.sent();
                        if (pck == null) {
                            throw new Error("Package " + packageid + " not found");
                        }
                        packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(packagemanager_1.packagemanager.homedir(), ".openiap", "packages", packageid));
                        Logger_1.Logger.instrumentation.info("connected: " + agent.client.connected + " signedin: " + agent.client.signedin, { packageid: packageid, streamid: streamid });
                        if (packagepath == "") {
                            log("Package " + packageid + " not found", { packageid: packageid, streamid: streamid, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                        log("run package " + pck.name + " (" + packageid + ")", { packageid: packageid, streamid: streamid, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                                log("Error loading payload from " + wipath + " " + (error.message ? error.message : error), { packageid: packageid, streamid: streamid });
                            }
                        }
                        return [2 /*return*/, [exitcode, stream === null || stream === void 0 ? void 0 : stream.buffer.toString(), wipayload]];
                    case 4:
                        error_4 = _b.sent();
                        _error(error_4, { packageid: packageid, streamid: streamid, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                        log("reloadpackages", {});
                        if (!(agent.globalpackageid != "" && agent.globalpackageid != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, packagemanager_1.packagemanager.reloadpackage(agent.client, agent.globalpackageid, force)];
                    case 1: return [2 /*return*/, [_a.sent()]];
                    case 2: return [4 /*yield*/, packagemanager_1.packagemanager.reloadpackages(agent.client, agent.languages, force)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_5 = _a.sent();
                        _error(error_5, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                        log("Registering agent with " + u.hostname + " as " + agent.client.client.user.username, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                        log("registering agent queue as " + res.slug + "agent", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        _a = agent;
                        return [4 /*yield*/, agent.client.RegisterQueue({ queuename: res.slug + "agent" }, agent.onQueueMessage)];
                    case 2:
                        _a.localqueue = _b.sent();
                        log("queue registered as " + agent.localqueue, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                            log("packageid is set, run package " + agent.globalpackageid, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: agent.globalpackageid });
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
                                        log("Schedule " + _schedule.name + " (" + _schedule.id + ") updated, kill all instances of package " + _schedule.packageid + " if running", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: _schedule.packageid });
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
                                        log("Schedule " + _schedule.name + " (" + _schedule.id + ") removed, kill all instances of package " + _schedule.packageid + " if running", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: _schedule.packageid });
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
                                            log("Schedule " + schedule.name + " has no packageid, skip", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                            return [2 /*return*/, "continue"];
                                        }
                                        if (!(schedule.cron != null && schedule.cron != "")) return [3 /*break*/, 7];
                                        if (!!schedule.enabled) return [3 /*break*/, 5];
                                        if (schedule.task != null) {
                                            schedule.task.stop();
                                            schedule.task = null;
                                        }
                                        log("Schedule " + schedule.name + " (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid + " if running", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
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
                                        log("Schedule " + schedule.name + " (" + schedule.id + ") running every " + schedule.cron, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                        if (schedule.task == null) {
                                            schedule.task = cron.schedule(schedule.cron, function () { return __awaiter(_this, void 0, void 0, function () {
                                                var kill, isRunning;
                                                return __generator(this, function (_a) {
                                                    kill = function () {
                                                        var _loop_4 = function (s) {
                                                            var stream = runner_1.runner.streams[s];
                                                            if (stream.schedulename == schedule.name) {
                                                                runner_1.runner.kill(agent.client, stream.id).catch(function (error) {
                                                                    _error(error, { streamid: stream === null || stream === void 0 ? void 0 : stream.id, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                                                                });
                                                            }
                                                        };
                                                        for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                                            _loop_4(s);
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
                                                            log("Schedule " + +" (" + schedule.id + ") is already running, kill all instances of package " + schedule.packageid + " and start again", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                                            kill();
                                                        }
                                                        else if (schedule.allowConcurrentRuns != true && isRunning() == true) {
                                                            log("Schedule " + +" (" + schedule.id + ") is already running, do nothing", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                                            return [2 /*return*/];
                                                        }
                                                        log("Schedule " + schedule.name + " (" + schedule.id + ") enabled, run now", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                                        try {
                                                            agent.localrun(schedule.packageid, null, null, schedule.env, schedule);
                                                        }
                                                        catch (error) {
                                                            Logger_1.Logger.instrumentation.error(error, { packageid: schedule === null || schedule === void 0 ? void 0 : schedule.packageid });
                                                        }
                                                    }
                                                    else {
                                                        if (isRunning() == true) {
                                                            log("Schedule " + +" (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
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
                                            log("Schedule " + schedule.name + " enabled, run now", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                            schedule.task = {
                                                timeout: null,
                                                lastrestart: new Date(),
                                                restartcounter: 0,
                                                stop: function () {
                                                    if (schedule.task.timeout != null) {
                                                        clearTimeout(schedule.task.timeout);
                                                        var _loop_5 = function (s) {
                                                            var stream = runner_1.runner.streams[s];
                                                            if (stream.schedulename == schedule.name) {
                                                                runner_1.runner.kill(agent.client, stream.id).catch(function (error) {
                                                                    _error(error, { streamid: stream === null || stream === void 0 ? void 0 : stream.id, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                                                                });
                                                            }
                                                        };
                                                        for (var s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                                            _loop_5(s);
                                                        }
                                                    }
                                                },
                                                start: function () {
                                                    var _this = this;
                                                    if (schedule.task.timeout != null) {
                                                        log("Schedule " + schedule.name + " (" + schedule.id + ") already running", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                                        return;
                                                    }
                                                    if (!schedule.enabled) {
                                                        log("Schedule " + schedule.name + " (" + schedule.id + ") is disabled", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                                        return;
                                                    }
                                                    var startinms = 100;
                                                    if (schedule.task.restartcounter > 0) {
                                                        startinms = 5000 + (1000 * schedule.task.restartcounter);
                                                    }
                                                    log("Schedule " + schedule.name + " (" + schedule.id + ") started", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
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
                                                                    Logger_1.Logger.instrumentation.error(e, { packageid: schedule === null || schedule === void 0 ? void 0 : schedule.packageid });
                                                                    return [3 /*break*/, 4];
                                                                case 4:
                                                                    if (schedule.task == null)
                                                                        return [2 /*return*/];
                                                                    schedule.task.timeout = null;
                                                                    if (exitcode != 0) {
                                                                        log("Schedule " + schedule.name + " (" + schedule.id + ") finished with exitcode " + exitcode + '\n' + output, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                                                    }
                                                                    else {
                                                                        log("Schedule " + schedule.name + " (" + schedule.id + ") finished (exitcode " + exitcode + ")", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
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
                                                                            log("Schedule " + schedule.name + " (" + schedule.id + ") stopped after " + minutes.toFixed(2) + " minutes (" + schedule.task.restartcounter + " of " + agent.maxrestarts + ")", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                                                            schedule.task.start();
                                                                        }
                                                                    }
                                                                    else {
                                                                        hascronjobs = agent.schedules.find(function (x) { return x.cron != null && x.cron != "" && x.enabled == true; });
                                                                        if (hascronjobs == null && agent.exitonfailedschedule == true) {
                                                                            log("Schedule " + schedule.name + " (" + schedule.id + ") stopped " + schedule.task.restartcounter + " times, no cron jobs running, exit agent completly!", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                                                            process.exit(0);
                                                                        }
                                                                        else {
                                                                            log("Schedule " + schedule.name + " (" + schedule.id + ") stopped " + schedule.task.restartcounter + " times, stop schedule", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
                                                                        }
                                                                    }
                                                                    return [3 /*break*/, 6];
                                                                case 5:
                                                                    error_10 = _b.sent();
                                                                    try {
                                                                        _error(error_10, { packageid: schedule === null || schedule === void 0 ? void 0 : schedule.packageid, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                                                                        schedule.task.timeout = null;
                                                                    }
                                                                    catch (e) {
                                                                        _error(e, { packageid: schedule === null || schedule === void 0 ? void 0 : schedule.packageid, agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
                                            log("Schedule " + schedule.name + " (" + schedule.id + ") allready running", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule === null || schedule === void 0 ? void 0 : schedule.packageid });
                                        }
                                        return [3 /*break*/, 12];
                                    case 8:
                                        log("Schedule " + schedule.name + " disabled, kill all instances of package " + schedule.packageid + " if running", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, packageid: schedule.packageid });
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
                        log("Registed agent as " + res.name + " (" + agent.agentid + ") and queue " + agent.localqueue + " ( from " + res.slug + " )", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        return [3 /*break*/, 16];
                    case 15:
                        log("Registrering agent seems to have failed without an error !?!", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        if (res == null) {
                            log("res is null", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        }
                        else {
                            log(JSON.stringify(res, null, 2), { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        }
                        _b.label = 16;
                    case 16:
                        if (!(res.jwt != null && res.jwt != "")) return [3 /*break*/, 18];
                        return [4 /*yield*/, agent.client.Signin({ jwt: res.jwt })];
                    case 17:
                        _b.sent();
                        log('Re-authenticated to ' + u.hostname + ' as ' + agent.client.client.user.username, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        _b.label = 18;
                    case 18:
                        agent.reloadAndParseConfig();
                        return [3 /*break*/, 20];
                    case 19:
                        error_6 = _b.sent();
                        _error(error_6, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
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
            var streamid_1, streamqueue_1, dostream_1, packagepath_1, original_1, workitem_1, error_11, files, env, i, file, reply, _a, exitcode, output, newpayload, error_12, error_13, error_14, s, stream, processcount, i, processcount, counter, s, _message, error_15, runner_process, runner_stream, commandstreams, processcount, processes, i, p, error_16;
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
                            log("payload missing wiq " + JSON.stringify(payload, null, 2), { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
                            return [2 /*return*/, { "command": payload.command, "success": false, error: "payload missing wiq" }];
                        }
                        if (payload.packageid == null) {
                            log("payload missing packageid " + JSON.stringify(payload, null, 2), { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
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
                        log("No more workitems for " + payload.wiq, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
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
                        log(error_11.message ? error_11.message : error_11, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
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
                        log("Downloaded file: " + reply.filename, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
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
                                log("adding file: " + file, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
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
                        log(error_12.message ? error_12.message : error_12, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
                        return [3 /*break*/, 21];
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        error_13 = _b.sent();
                        _error(error_13, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        dostream_1 = false;
                        return [3 /*break*/, 23];
                    case 23: return [2 /*return*/, { "command": "invoke", "success": true, "completed": false }];
                    case 24:
                        error_14 = _b.sent();
                        _error(error_14, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        log("!!!error: " + error_14.message ? error_14.message : error_14, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
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
                            _error("not authenticated", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                            return [2 /*return*/, { "command": payload.command, "success": false, error: "not authenticated" }];
                        }
                        log("onQueueMessage " + msg.correlationId, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
                        log("command: " + payload.command + " streamqueue: " + streamqueue_1 + " dostream: " + dostream_1, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
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
                                    log(error.message ? error.message : error, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
                                }
                            }).catch(function (error) {
                                var output = error.output;
                                try {
                                    if (dostream_1 == true && streamqueue_1 != "")
                                        agent.client.QueueMessage({ queuename: streamqueue_1, data: { "command": "runpackage", "success": false, "completed": true, "output": output, "error": error.message ? error.message : error, "payload": payload.payload }, correlationId: streamid_1 });
                                }
                                catch (error) {
                                    log(error.message ? error.message : error, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
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
                        log("Reinstall package " + payload.id, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
                        log("Kill all instances of package " + payload.id + " if running", { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
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
                                Logger_1.Logger.instrumentation.info("remove " + payload.streamqueue + " from commandstreams", {});
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
                            Logger_1.Logger.instrumentation.info("Add streamqueue " + payload.streamqueue + " to commandstreams", {});
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
                        log(error_15.message ? error_15.message : error_15, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid, streamid: streamid_1 });
                        return [3 /*break*/, 43];
                    case 43: return [2 /*return*/, { "command": "setstreamid", "success": true, "count": counter, }];
                    case 44:
                        if (payload.command == "listprocesses") {
                            if (runner_1.runner.commandstreams.indexOf(msg.replyto) == -1 && msg.replyto != null && msg.replyto != "") {
                                Logger_1.Logger.instrumentation.info("Add streamqueue " + msg.replyto + " to commandstreams", {});
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
                        return [3 /*break*/, 47];
                    case 45:
                        error_16 = _b.sent();
                        _error(error_16, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        log(JSON.stringify({ "command": payload.command, "success": false, error: JSON.stringify(error_16.message) }), { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_16.message) }];
                    case 46:
                        // const sumports = agent.portlisteners.map(x => x.connections.size).reduce((a, b) => a + b, 0);
                        // log("commandstreams:" + runner.commandstreams.length + " portlisteners:" + agent.portlisteners.length + " ports: " + sumports);
                        log("commandstreams:" + runner_1.runner.commandstreams.length, { agentid: agent === null || agent === void 0 ? void 0 : agent.agentid });
                        return [7 /*endfinally*/];
                    case 47: return [2 /*return*/];
                }
            });
        });
    };
    agent.assistantConfig = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
    agent.agentid = "";
    agent.localqueue = "";
    agent.languages = ["nodejs", "exec"];
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
function log(message, attributes) {
    Logger_1.Logger.instrumentation.info(message, attributes);
    if (elog != null) {
        try {
            elog.info(message);
        }
        catch (error) {
        }
    }
}
function _error(message, attributes) {
    Logger_1.Logger.instrumentation.error(message, attributes);
    if (elog != null) {
        try {
            elog.error(message.toString());
        }
        catch (error) {
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQStGO0FBQy9GLG1DQUFrQztBQUNsQyxtREFBNEQ7QUFDNUQsZ0NBQWtDO0FBQ2xDLGlDQUFzQztBQUV0Qyx1QkFBd0I7QUFDeEIsMkJBQTZCO0FBQzdCLHVCQUF3QjtBQUN4QixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBQ2xDLGlEQUFpRDtBQUNqRCwrQkFBK0I7QUFFL0IsSUFBSSxJQUFJLEdBQVEsSUFBSSxDQUFDO0FBQ3JCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sRUFBRTtJQUM3Qix5REFBeUQ7SUFDekQsdUNBQXVDO0NBQ3hDO0FBRUQ7SUFDRSw2QkFBWSxRQUE2QjtJQUV6QyxDQUFDO0lBQ0gsMEJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUpZLGtEQUFtQjtBQUtoQztJQUFBO0lBeWpDQSxDQUFDO0lBdmlDQyxzREFBc0Q7SUFDeEMsaUJBQVcsR0FBekIsVUFBMEIsU0FBMEIsRUFBRSxRQUFrQztRQUN0RixLQUFLLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNhLFFBQUUsR0FBaEIsVUFBaUIsU0FBMEIsRUFBRSxRQUFrQztRQUM3RSxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNhLFVBQUksR0FBbEIsVUFBbUIsU0FBMEIsRUFBRSxRQUFrQztRQUMvRSxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNhLFNBQUcsR0FBakIsVUFBa0IsU0FBMEIsRUFBRSxRQUFrQztR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