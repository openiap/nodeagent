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
console.log("version: " + client.version);
var assistentConfig = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
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
    assistentConfig = {};
    assistentConfig.apiurl = process.env["apiurl"];
    if (assistentConfig.apiurl == null || assistentConfig.apiurl == "") {
        assistentConfig.apiurl = process.env["grpcapiurl"];
    }
    if (assistentConfig.apiurl == null || assistentConfig.apiurl == "") {
        assistentConfig.apiurl = process.env["wsapiurl"];
    }
    assistentConfig.jwt = process.env["jwt"];
    if (dockeragent) {
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
        if (assistentConfig.apiurl == null || assistentConfig.apiurl == "") {
            log("failed locating config to load from " + path.join(os.homedir(), ".openiap", "config.json"));
            process.exit(1);
        }
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
                    // if (process.env["apiurl"] != null && process.env["apiurl"] != "") {
                    //   log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)")
                    // } else {
                    if (res.jwt != null && res.jwt != "") {
                        config.jwt = res.jwt;
                        process.env.jwt = res.jwt;
                    }
                    fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config));
                    // }
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