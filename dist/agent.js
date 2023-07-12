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
                    _a.trys.push([0, 5, , 7]);
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
                    if (!(process.env.packageid != "" && process.env.packageid != null)) return [3 /*break*/, 4];
                    log("packageid is set, run package " + process.env.packageid);
                    return [4 /*yield*/, localrun()];
                case 3:
                    _a.sent();
                    process.exit(0);
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 6:
                    _a.sent();
                    process.exit(0);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
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
        var streamid, stream, buffer, error_3;
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
                    log("run package " + process.env.packageid);
                    return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(client, process.env.packageid, streamid, "", stream, true)];
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
                    if (!(process.env.packageid != "" && process.env.packageid != null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, packagemanager_1.packagemanager.reloadpackage(client, process.env.packageid, force)];
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
                    return [4 /*yield*/, client.RegisterQueue({ queuename: res.slug + "agent" }, onQueueMessage)];
                case 2:
                    localqueue = _a.sent();
                    agentid = res._id;
                    config = { agentid: agentid, jwt: res.jwt, apiurl: client.url };
                    if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
                        config = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
                    }
                    config.agentid = agentid;
                    // if (process.env["apiurl"] != null && process.env["apiurl"] != "") {
                    //   log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)")
                    // } else {
                    if (res.jwt != null && res.jwt != "") {
                        process.env.jwt = res.jwt;
                    }
                    if (client.url != null && client.url != "") {
                        config.apiurl = client.url;
                    }
                    if (!fs.existsSync(packagemanager_1.packagemanager.packagefolder))
                        fs.mkdirSync(packagemanager_1.packagemanager.packagefolder, { recursive: true });
                    fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config));
                    // }
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
function onQueueMessage(msg, payload, user, jwt) {
    return __awaiter(this, void 0, void 0, function () {
        var streamid, streamqueue, dostream, packagepath, workitem, stream2, buffer, wipayload, wijson, wipath, original, files, i_1, file, exitcode, error_6, error_7, error_8, packagepath, stream, buffer, wipath, wijson, error_9, error_10, error_11, processcount, i, processcount, counter, i, p, s, processcount, processes, i, p, error_12;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 45, , 46]);
                    streamid = msg.correlationId;
                    if (payload != null && payload.payload != null && payload.command == null)
                        payload = payload.payload;
                    if (payload.streamid != null && payload.streamid != "")
                        streamid = payload.streamid;
                    streamqueue = msg.replyto;
                    if (payload.queuename != null && payload.queuename != "") {
                        streamqueue = payload.queuename;
                    }
                    dostream = true;
                    if (payload.stream == "false" || payload.stream == false) {
                        dostream = false;
                    }
                    if (!(payload.command == null || payload.command == "" || payload.command == "invoke")) return [3 /*break*/, 20];
                    if (num_workitemqueue_jobs >= max_workitemqueue_jobs) {
                        return [2 /*return*/, { "command": payload.command, "success": false, error: "Busy running " + num_workitemqueue_jobs + " jobs ( max " + max_workitemqueue_jobs + " )" }];
                    }
                    num_workitemqueue_jobs++;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 17, 19, 20]);
                    if (streamid == null || streamid == "") {
                        dostream = false;
                        streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
                    packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.packageid));
                    if (!(packagepath == "")) return [3 /*break*/, 5];
                    log("Package " + payload.packageid + " not found");
                    if (!dostream) return [3 /*break*/, 4];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("Package " + payload.packageid + " not found") }, correlationId: streamid })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, { "command": "runpackage", "success": false, "completed": true, error: "Package " + payload.packageid + " not found" }];
                case 5: return [4 /*yield*/, client.PopWorkitem({ wiq: payload.wiq, includefiles: false, compressed: false })];
                case 6:
                    workitem = _a.sent();
                    if (!(workitem == null)) return [3 /*break*/, 9];
                    log("No more workitems for " + payload.wiq);
                    if (!dostream) return [3 /*break*/, 8];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("No more workitems for " + payload.wiq) }, correlationId: streamid })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [2 /*return*/, { "command": "runpackage", "success": false, "completed": true, error: "No more workitems for " + payload.wiq }];
                case 9:
                    stream2 = new stream_1.Stream.Readable({
                        read: function (size) { }
                    });
                    buffer = "";
                    stream2.on('data', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (!dostream) {
                                if (data != null)
                                    buffer += data.toString();
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    stream2.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                        var data;
                        return __generator(this, function (_a) {
                            data = { "command": "runpackage", "success": true, "completed": true, "data": buffer };
                            if (buffer == "")
                                delete data.data;
                            return [2 /*return*/];
                        });
                    }); });
                    wipayload = {};
                    wijson = "";
                    wipath = path.join(packagepath, "workitem.json");
                    if (fs.existsSync(wipath)) {
                        fs.unlinkSync(wipath);
                    }
                    original = [];
                    files = fs.readdirSync(packagepath);
                    files.forEach(function (file) {
                        var filename = path.join(packagepath, file);
                        if (fs.lstatSync(filename).isFile())
                            original.push(file);
                    });
                    if (workitem.payload != null && workitem.payload != "") {
                        try {
                            wijson = JSON.stringify(workitem.payload);
                            wipayload = JSON.parse(wijson);
                            console.log("dump payload to: ", wipath);
                            fs.writeFileSync(wipath, wijson);
                        }
                        catch (error) {
                            console.log("parsing payload: " + (error.message != null) ? error.message : error);
                            console.log(workitem.payload);
                        }
                    }
                    for (i_1 = 0; i_1 < workitem.files.length; i_1++) {
                        file = workitem.files[i_1];
                        if (file.filename == "output.txt")
                            continue;
                        // const reply = await client.DownloadFile({ id: file._id, folder: packagepath });
                        console.log("Downloaded file: ", file.filename);
                        fs.writeFileSync(path.join(packagepath, file.filename), file.file);
                    }
                    return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(client, payload.packageid, streamid, streamqueue, stream2, true)];
                case 10:
                    exitcode = _a.sent();
                    if (exitcode != 0) {
                        throw new Error("exitcode: " + exitcode);
                    }
                    _a.label = 11;
                case 11:
                    _a.trys.push([11, 15, , 16]);
                    workitem.state = "successful";
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
                    workitem.payload = JSON.stringify(wipayload);
                    fs.writeFileSync(path.join(packagepath, "output.txt"), buffer);
                    files = fs.readdirSync(packagepath);
                    files = files.filter(function (x) { return original.indexOf(x) == -1; });
                    files.forEach(function (file) {
                        var filename = path.join(packagepath, file);
                        if (fs.lstatSync(filename).isFile()) {
                            console.log("adding file: ", file);
                            workitem.files.push({ filename: file, file: fs.readFileSync(filename), _id: null, compressed: false });
                            fs.unlinkSync(filename);
                        }
                    });
                    return [4 /*yield*/, client.UpdateWorkitem({ workitem: workitem })];
                case 12:
                    _a.sent();
                    if (!(dostream == true && streamqueue != "")) return [3 /*break*/, 14];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": true, "completed": true }, correlationId: streamid })];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_6 = _a.sent();
                    _error(error_6);
                    dostream = false;
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/, { "command": "runpackage", "success": true, "completed": false }];
                case 17:
                    error_7 = _a.sent();
                    console.log(error_7);
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
                    console.log("!!!error: ", error_7.message ? error_7.message : error_7);
                    fs.writeFileSync(path.join(packagepath, "output.txt"), buffer);
                    files = fs.readdirSync(packagepath);
                    files = files.filter(function (x) { return original.indexOf(x) == -1; });
                    files.forEach(function (file) {
                        var filename = path.join(packagepath, file);
                        if (fs.lstatSync(filename).isFile()) {
                            console.log("adding file: ", file);
                            workitem.files.push({ filename: file, file: fs.readFileSync(filename), _id: null, compressed: false });
                            fs.unlinkSync(filename);
                        }
                    });
                    workitem.payload = JSON.stringify(wipayload);
                    workitem.errormessage = (error_7.message != null) ? error_7.message : error_7;
                    workitem.state = "retry";
                    workitem.errortype = "application";
                    return [4 /*yield*/, client.UpdateWorkitem({ workitem: workitem })];
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
                    log("command: " + payload.command + " streamqueue: " + streamqueue + " dostream: " + dostream);
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
                    if (!dostream) return [3 /*break*/, 25];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": false, "completed": true, "error": error_8.message ? error_8.message : error_8, "payload": wipayload }, correlationId: streamid })];
                case 24:
                    _a.sent();
                    _a.label = 25;
                case 25: throw error_8;
                case 26:
                    packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
                    if (!(packagepath == "")) return [3 /*break*/, 29];
                    log("Package " + payload.id + " not found");
                    if (!dostream) return [3 /*break*/, 28];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("Package " + payload.id + " not found") }, correlationId: streamid })];
                case 27:
                    _a.sent();
                    _a.label = 28;
                case 28: return [2 /*return*/, { "command": "runpackage", "success": false, "completed": true, error: "Package " + payload.id + " not found" }];
                case 29:
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
                        var data;
                        return __generator(this, function (_a) {
                            data = { "command": "runpackage", "success": true, "completed": true, "data": buffer };
                            if (buffer == "")
                                delete data.data;
                            return [2 /*return*/];
                        });
                    }); });
                    wipath = path.join(packagepath, "workitem.json");
                    wijson = JSON.stringify(payload.payload, null, 2);
                    if (fs.existsSync(wipath)) {
                        fs.unlinkSync(wipath);
                    }
                    if (payload.payload != null) {
                        console.log("dump payload to: ", wipath);
                        fs.writeFileSync(wipath, wijson);
                    }
                    wipayload = {};
                    _a.label = 30;
                case 30:
                    _a.trys.push([30, 37, , 43]);
                    return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(client, payload.id, streamid, streamqueue, stream, true)];
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
                    if (!(dostream == true && streamqueue != "")) return [3 /*break*/, 34];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": true, "completed": true, "payload": wipayload }, correlationId: streamid })];
                case 33:
                    _a.sent();
                    _a.label = 34;
                case 34: return [3 /*break*/, 36];
                case 35:
                    error_9 = _a.sent();
                    _error(error_9);
                    dostream = false;
                    return [3 /*break*/, 36];
                case 36: return [3 /*break*/, 43];
                case 37:
                    error_10 = _a.sent();
                    _a.label = 38;
                case 38:
                    _a.trys.push([38, 41, , 42]);
                    if (!(dostream == true && streamqueue != "")) return [3 /*break*/, 40];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": false, "completed": true, "error": error_10.message ? error_10.message : error_10, "payload": wipayload }, correlationId: streamid })];
                case 39:
                    _a.sent();
                    _a.label = 40;
                case 40: return [3 /*break*/, 42];
                case 41:
                    error_11 = _a.sent();
                    _error(error_11);
                    dostream = false;
                    return [3 /*break*/, 42];
                case 42: return [3 /*break*/, 43];
                case 43: return [2 /*return*/, { "command": "runpackage", "success": true, "completed": false, "payload": wipayload }];
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
                    if (payload.command == "setstreamid") {
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
                        for (i = processcount; i >= 0; i--) {
                            p = runner_1.runner.streams[i];
                            if (p == null)
                                continue;
                            if (p.id == payload.id) {
                                counter++;
                                p.streamqueue = payload.streamqueue;
                            }
                        }
                        s = runner_1.runner.ensurestream(streamid, payload.streamqueue);
                        runner_1.runner.notifyStream(client, payload.id, s.buffer, false);
                        return [2 /*return*/, { "command": "setstreamid", "success": true, "count": counter, }];
                    }
                    if (payload.command == "listprocesses") {
                        processcount = runner_1.runner.streams.length;
                        processes = [];
                        for (i = processcount; i >= 0; i--) {
                            p = runner_1.runner.streams[i];
                            if (p == null)
                                continue;
                            processes.push({
                                "id": p.id,
                                "streamqueue": p.streamqueue,
                            });
                        }
                        return [2 /*return*/, { "command": "listprocesses", "success": true, "count": processcount, "processes": processes }];
                    }
                    return [3 /*break*/, 46];
                case 45:
                    error_12 = _a.sent();
                    console.error(error_12);
                    console.log({ "command": payload.command, "success": false, error: JSON.stringify(error_12.message) });
                    return [2 /*return*/, { "command": payload.command, "success": false, error: JSON.stringify(error_12.message) }];
                case 46: return [2 /*return*/];
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