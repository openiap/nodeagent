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
var assistentConfig = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
var agentid = "";
// When injected from docker, use the injected agentid
if (process.env.agentid != "" && process.env.agentid != null)
    agentid = process.env.agentid;
var dockeragent = false;
var localqueue = "";
var languages = ["nodejs"];
function reloadAndParseConfig() {
    nodeapi_1.config.doDumpStack = true;
    assistentConfig = {};
    assistentConfig.apiurl = process.env["apiurl"];
    if (assistentConfig.apiurl == null || assistentConfig.apiurl == "") {
        assistentConfig.apiurl = process.env["grpcapiurl"];
    }
    if (assistentConfig.apiurl == null || assistentConfig.apiurl == "") {
        assistentConfig.apiurl = process.env["wsapiurl"];
    }
    assistentConfig.jwt = process.env["jwt"];
    if (assistentConfig.apiurl != null && assistentConfig.apiurl != "") {
        dockeragent = true;
        return true;
    }
    if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
        assistentConfig = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
        process.env["NODE_ENV"] = "production";
        if (assistentConfig.apiurl) {
            process.env["apiurl"] = assistentConfig.apiurl;
            client.url = assistentConfig.apiurl;
        }
        if (assistentConfig.jwt) {
            process.env["jwt"] = assistentConfig.jwt;
            client.jwt = assistentConfig.jwt;
        }
        if (assistentConfig.agentid != null && assistentConfig.agentid != "") {
            agentid = assistentConfig.agentid;
        }
        return true;
    }
    else {
        log("failed locating config to load from " + path.join(os.homedir(), ".openiap", "config.json"));
        process.exit(1);
    }
    return false;
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
        var u, watchid;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    u = new URL(client.url);
                    process.env.apiurl = client.url;
                    return [4 /*yield*/, RegisterAgent()];
                case 1:
                    _a.sent();
                    if (client.client == null || client.client.user == null) {
                        log('connected, but not signed in, close connection again');
                        return [2 /*return*/, client.Close()];
                    }
                    return [4 /*yield*/, reloadpackages()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, client.Watch({ paths: [], collectionname: "agents" }, function (operation, document) { return __awaiter(_this, void 0, void 0, function () {
                            var error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 12, , 13]);
                                        if (!(document._type == "package")) return [3 /*break*/, 6];
                                        if (!(operation == "insert")) return [3 /*break*/, 2];
                                        log("package " + document.name + " inserted, reload packages");
                                        return [4 /*yield*/, reloadpackages()];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 5];
                                    case 2:
                                        if (!(operation == "replace")) return [3 /*break*/, 4];
                                        log("package " + document.name + " updated, delete and reload");
                                        packagemanager_1.packagemanager.removepackage(document._id);
                                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(client, document.fileid, document._id)];
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
                                        error_1 = _a.sent();
                                        _error(error_1);
                                        return [3 /*break*/, 13];
                                    case 13: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    watchid = _a.sent();
                    log("watch registered with id " + watchid);
                    if (!(process.env.packageid != "" && process.env.packageid != null)) return [3 /*break*/, 5];
                    log("packageid is set, run package " + process.env.packageid);
                    return [4 /*yield*/, localrun()];
                case 4:
                    _a.sent();
                    process.exit(0);
                    _a.label = 5;
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
function localrun() {
    return __awaiter(this, void 0, void 0, function () {
        var streamid, stream, buffer, error_2;
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
                            log(s);
                            return [2 /*return*/];
                        });
                    }); });
                    stream.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            log("process ended");
                            return [2 /*return*/];
                        });
                    }); });
                    runner_1.runner.addstream(streamid, stream);
                    log("run package " + process.env.packageid);
                    return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(client, process.env.packageid, streamid, "", true)];
                case 1:
                    _a.sent();
                    log("run complete");
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    _error(error_2);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function reloadpackages() {
    return __awaiter(this, void 0, void 0, function () {
        var _packages, _packages, i, error_3, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    log("reloadpackages");
                    if (!(process.env.packageid != "" && process.env.packageid != null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, client.Query({ query: { "_type": "package", "_id": process.env.packageid }, collectionname: "agents" })];
                case 1:
                    _packages = _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, client.Query({ query: { "_type": "package", "language": { "$in": languages } }, collectionname: "agents" })];
                case 3:
                    _packages = _a.sent();
                    _a.label = 4;
                case 4:
                    log("Got " + _packages.length + " packages to handle");
                    if (!(_packages != null)) return [3 /*break*/, 11];
                    i = 0;
                    _a.label = 5;
                case 5:
                    if (!(i < _packages.length)) return [3 /*break*/, 11];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 9, , 10]);
                    if (fs.existsSync(path.join(packagemanager_1.packagemanager.packagefolder, _packages[i]._id)))
                        return [3 /*break*/, 10];
                    if (!(_packages[i].fileid != null && _packages[i].fileid != "")) return [3 /*break*/, 8];
                    log("get package " + _packages[i].name);
                    return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(client, _packages[i].fileid, _packages[i]._id)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_3 = _a.sent();
                    _error(error_3);
                    return [3 /*break*/, 10];
                case 10:
                    i++;
                    return [3 /*break*/, 5];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_4 = _a.sent();
                    _error(error_4);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function RegisterAgent() {
    return __awaiter(this, void 0, void 0, function () {
        var u, chromium, chrome, daemon, data, res, keys, i, config, error_5;
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
                    return [4 /*yield*/, client.RegisterQueue({ queuename: res.slug }, onQueueMessage)];
                case 2:
                    localqueue = _a.sent();
                    agentid = res._id;
                    config = { agentid: agentid, jwt: res.jwt };
                    if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
                        config = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
                    }
                    config.agentid = agentid;
                    if (process.env["apiurl"] != null && process.env["apiurl"] != "") {
                        log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)");
                    }
                    else {
                        if (res.jwt != null && res.jwt != "") {
                            config.jwt = res.jwt;
                            process.env.jwt = res.jwt;
                        }
                        fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config));
                    }
                    log("Registed agent as " + agentid + " and queue " + localqueue + " ( from " + res.slug + " )");
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
function onQueueMessage(msg, payload, user, jwt) {
    return __awaiter(this, void 0, void 0, function () {
        var streamid_1, commandqueue, streamqueue, dostream, packagepath, _packages, error_6, stream, buffer, error_7, processcount, i, processcount, processes, i, p, error_8;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 20, , 21]);
                    log("onQueueMessage " + msg.correlationId);
                    streamid_1 = msg.correlationId;
                    if (payload != null && payload.payload != null)
                        payload = payload.payload;
                    if (payload.streamid != null && payload.streamid != "")
                        streamid_1 = payload.streamid;
                    // log("onQueueMessage");
                    // log(payload);
                    if (user == null || jwt == null || jwt == "") {
                        return [2 /*return*/, { "command": "error", error: "not authenticated" }];
                    }
                    commandqueue = msg.replyto;
                    streamqueue = msg.replyto;
                    if (payload.queuename != null && payload.queuename != "") {
                        streamqueue = payload.queuename;
                    }
                    dostream = true;
                    if (payload.stream == "false" || payload.stream == false) {
                        dostream = false;
                    }
                    log("commandqueue: " + commandqueue + " streamqueue: " + streamqueue + " dostream: " + dostream);
                    if (commandqueue == null)
                        commandqueue = "";
                    if (streamqueue == null)
                        streamqueue = "";
                    if (!(payload.command == "runpackage")) return [3 /*break*/, 19];
                    if (payload.id == null || payload.id == "")
                        throw new Error("id is required");
                    packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
                    if (!(packagepath == "")) return [3 /*break*/, 7];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, client.Query({ query: { "_type": "package", "_id": payload.id }, collectionname: "agents" })];
                case 2:
                    _packages = _a.sent();
                    if (!(_packages.length > 0)) return [3 /*break*/, 4];
                    log("get package " + _packages[0].name);
                    return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(client, _packages[0].fileid, payload.id)];
                case 3:
                    _a.sent();
                    packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
                    return [3 /*break*/, 5];
                case 4:
                    log("Cannot find package with id " + payload.id);
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_6 = _a.sent();
                    return [3 /*break*/, 7];
                case 7:
                    if (!(packagepath == "")) return [3 /*break*/, 12];
                    log("Package " + payload.id + " not found");
                    if (!dostream) return [3 /*break*/, 9];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("Package " + payload.id + " not found") }, correlationId: streamid_1 })];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    if (!(commandqueue != "")) return [3 /*break*/, 11];
                    return [4 /*yield*/, client.QueueMessage({ queuename: commandqueue, data: { "command": "completed" }, correlationId: streamid_1 })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [2 /*return*/, { "command": "error", error: "Package " + payload.id + " not found" }];
                case 12:
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
                        var data, error_9, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    data = { "command": "completed", "data": buffer };
                                    if (buffer == "")
                                        delete data.data;
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, , 5]);
                                    if (!(commandqueue != "")) return [3 /*break*/, 3];
                                    return [4 /*yield*/, client.QueueMessage({ queuename: commandqueue, data: data, correlationId: streamid_1 })];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [3 /*break*/, 5];
                                case 4:
                                    error_9 = _a.sent();
                                    _error(error_9);
                                    return [3 /*break*/, 5];
                                case 5:
                                    _a.trys.push([5, 8, , 9]);
                                    if (!(dostream == true && streamqueue != "")) return [3 /*break*/, 7];
                                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: data, correlationId: streamid_1 })];
                                case 6:
                                    _a.sent();
                                    _a.label = 7;
                                case 7: return [3 /*break*/, 9];
                                case 8:
                                    error_10 = _a.sent();
                                    _error(error_10);
                                    return [3 /*break*/, 9];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    runner_1.runner.addstream(streamid_1, stream);
                    return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(client, payload.id, streamid_1, streamqueue, true)];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14:
                    _a.trys.push([14, 17, , 18]);
                    if (!(dostream == true && streamqueue != "")) return [3 /*break*/, 16];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "success" }, correlationId: streamid_1 })];
                case 15:
                    _a.sent();
                    _a.label = 16;
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_7 = _a.sent();
                    _error(error_7);
                    dostream = false;
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/, { "command": "success" }];
                case 19:
                    if (payload.command == "kill") {
                        if (payload.id == null || payload.id == "")
                            payload.id = payload.streamid;
                        if (payload.id == null || payload.id == "")
                            throw new Error("id is required");
                        runner_1.runner.kill(client, payload.id);
                        return [2 /*return*/, { "command": "success" }];
                    }
                    if (payload.command == "killall") {
                        processcount = runner_1.runner.processs.length;
                        for (i = processcount; i >= 0; i--) {
                            runner_1.runner.kill(client, runner_1.runner.processs[i].id);
                        }
                        return [2 /*return*/, { "command": "success", "count": processcount }];
                    }
                    if (payload.command == "setstreamid") {
                        if (payload.id == null || payload.id == "")
                            payload.id = payload.streamid;
                        if (payload.id == null || payload.id == "")
                            throw new Error("id is required");
                    }
                    if (payload.command == "listprocesses") {
                        processcount = runner_1.runner.processs.length;
                        processes = [];
                        for (i = processcount; i >= 0; i--) {
                            p = runner_1.runner.processs[i];
                            processes.push({
                                "id": p.id,
                                "forcekilled": p.forcekilled,
                                "pid": p.pid,
                            });
                        }
                        return [2 /*return*/, { "command": "success", "count": processcount, "processes": processes }];
                    }
                    return [3 /*break*/, 21];
                case 20:
                    error_8 = _a.sent();
                    return [2 /*return*/, { "command": "error", error: JSON.stringify(error_8.message) }];
                case 21: return [2 /*return*/];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FBK0Q7QUFDL0QsbUNBQWtDO0FBQ2xDLG1EQUFrRDtBQUNsRCx1QkFBd0I7QUFDeEIsMkJBQTZCO0FBQzdCLHVCQUF3QjtBQUN4QixpQ0FBZ0M7QUFFaEMsSUFBSSxJQUFJLEdBQVEsSUFBSSxDQUFDO0FBQ3JCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sRUFBRTtJQUM3Qix5REFBeUQ7SUFDekQsdUNBQXVDO0NBQ3hDO0FBRUQsU0FBUyxHQUFHLENBQUMsT0FBZTtJQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JCLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtRQUNoQixJQUFJO1lBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNwQjtRQUFDLE9BQU8sS0FBSyxFQUFFO1NBRWY7S0FDRjtBQUNILENBQUM7QUFDRCxTQUFTLE1BQU0sQ0FBQyxPQUF1QjtJQUNyQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZCLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtRQUNoQixJQUFJO1lBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztTQUNoQztRQUFDLE9BQU8sS0FBSyxFQUFFO1NBRWY7S0FDRjtBQUNILENBQUM7QUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxjQUFRLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMvQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxjQUFRLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FB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