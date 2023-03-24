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
process.on('SIGINT', function () { process.exit(0); });
process.on('SIGTERM', function () { process.exit(0); });
process.on('SIGQUIT', function () { process.exit(0); });
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
var localqueue = "";
var languages = ["nodejs"];
function reloadAndParseConfig() {
    nodeapi_1.config.doDumpStack = true;
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
            return true;
        }
        console.log("failed locating config to load from " + path.join(os.homedir(), ".openiap", "config.json"));
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
        console.log("connected");
    }).catch(function (err) {
        console.error(err);
    });
}
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
                        console.log('connected, but not signed in, close connection again');
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
                                        console.log("package " + document.name + " inserted, reload packages");
                                        return [4 /*yield*/, reloadpackages()];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 5];
                                    case 2:
                                        if (!(operation == "replace")) return [3 /*break*/, 4];
                                        console.log("package " + document.name + " updated, delete and reload");
                                        packagemanager_1.packagemanager.removepackage(document._id);
                                        return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(client, document.fileid, document._id)];
                                    case 3:
                                        _a.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        if (operation == "delete") {
                                            console.log("package " + document.name + " deleted, cleanup after package");
                                            packagemanager_1.packagemanager.removepackage(document._id);
                                        }
                                        _a.label = 5;
                                    case 5: return [3 /*break*/, 11];
                                    case 6:
                                        if (!(document._type == "agent")) return [3 /*break*/, 10];
                                        if (!(document._id == agentid)) return [3 /*break*/, 8];
                                        console.log("agent changed, reload config");
                                        return [4 /*yield*/, RegisterAgent()];
                                    case 7:
                                        _a.sent();
                                        return [3 /*break*/, 9];
                                    case 8:
                                        console.log("Another agent was changed, do nothing");
                                        _a.label = 9;
                                    case 9: return [3 /*break*/, 11];
                                    case 10:
                                        console.log("unknown type " + document._type + " changed, do nothing");
                                        _a.label = 11;
                                    case 11: return [3 /*break*/, 13];
                                    case 12:
                                        error_1 = _a.sent();
                                        console.error(error_1);
                                        return [3 /*break*/, 13];
                                    case 13: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    watchid = _a.sent();
                    console.log("watch registered with id", watchid);
                    if (!(process.env.packageid != "" && process.env.packageid != null)) return [3 /*break*/, 5];
                    console.log("packageid is set, run package " + process.env.packageid);
                    return [4 /*yield*/, localrun()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function onDisconnected(client) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("Disconnected");
            return [2 /*return*/];
        });
    });
}
;
function localrun() {
    return __awaiter(this, void 0, void 0, function () {
        var streamid, stream, buffer;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
                            console.log(s);
                            return [2 /*return*/];
                        });
                    }); });
                    stream.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.log("process ended");
                            return [2 /*return*/];
                        });
                    }); });
                    runner_1.runner.addstream(streamid, stream);
                    return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(process.env.packageid, streamid, false)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function reloadpackages() {
    return __awaiter(this, void 0, void 0, function () {
        var _packages, i, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.Query({ query: { "_type": "package", "language": { "$in": languages } }, collectionname: "agents" })];
                case 1:
                    _packages = _a.sent();
                    if (!(_packages != null)) return [3 /*break*/, 8];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < _packages.length)) return [3 /*break*/, 8];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    if (fs.existsSync(path.join(packagemanager_1.packagemanager.packagefolder, _packages[i]._id)))
                        return [3 /*break*/, 7];
                    if (!(_packages[i].fileid != null && _packages[i].fileid != "")) return [3 /*break*/, 5];
                    return [4 /*yield*/, packagemanager_1.packagemanager.getpackage(client, _packages[i].fileid, _packages[i]._id)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error(error_2);
                    return [3 /*break*/, 7];
                case 7:
                    i++;
                    return [3 /*break*/, 2];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function RegisterAgent() {
    return __awaiter(this, void 0, void 0, function () {
        var u, data, res, config, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    u = new URL(client.url);
                    console.log("Registering agent with " + u.hostname + " as " + client.client.user.username);
                    data = JSON.stringify({ hostname: os.hostname(), os: os.platform(), arch: os.arch(), username: os.userInfo().username, version: myproject.version, "languages": languages, "chrome": true, "chromium": true, "maxpackages": 50 });
                    return [4 /*yield*/, client.CustomCommand({
                            id: agentid, command: "registeragent",
                            data: data
                        })];
                case 1:
                    res = _a.sent();
                    if (res != null)
                        res = JSON.parse(res);
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
                        console.log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)");
                    }
                    else {
                        if (res.jwt != null && res.jwt != "") {
                            config.jwt = res.jwt;
                            process.env.jwt = res.jwt;
                        }
                        fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config));
                    }
                    console.log("Registed agent as " + agentid + " and queue " + localqueue + " ( from " + res.slug + " )");
                    return [3 /*break*/, 4];
                case 3:
                    console.log("Registrering agent seems to have failed without an error !?!");
                    if (res == null) {
                        console.log("res is null");
                    }
                    else {
                        console.log(JSON.stringify(res, null, 2));
                    }
                    _a.label = 4;
                case 4:
                    if (!(res.jwt != null && res.jwt != "")) return [3 /*break*/, 6];
                    return [4 /*yield*/, client.Signin({ jwt: res.jwt })];
                case 5:
                    _a.sent();
                    console.log('Re-authenticated to ' + u.hostname + ' as ' + client.client.user.username);
                    _a.label = 6;
                case 6:
                    reloadAndParseConfig();
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _a.sent();
                    console.error(error_3);
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
        var streamid, commandqueue, streamqueue, dostream, packagepath, stream, buffer, error_4, error_5;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    if (payload != null && payload.payload != null)
                        payload = payload.payload;
                    // console.log("onQueueMessage");
                    // console.log(payload);
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
                    console.log("commandqueue: " + commandqueue + " streamqueue: " + streamqueue + " dostream: " + dostream);
                    if (commandqueue == null)
                        commandqueue = "";
                    if (streamqueue == null)
                        streamqueue = "";
                    if (!(payload.command == "runpackage")) return [3 /*break*/, 7];
                    if (payload.id == null || payload.id == "")
                        throw new Error("id is required");
                    packagepath = packagemanager_1.packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
                    if (packagepath == "") {
                        console.log("package not found");
                        return [2 /*return*/, { "command": "error", error: "package not found" }];
                    }
                    stream = new stream_1.Stream.Readable({
                        read: function (size) { }
                    });
                    buffer = "";
                    stream.on('data', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        var error_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!dostream) return [3 /*break*/, 5];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": data } })];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_6 = _a.sent();
                                    console.error(error_6);
                                    dostream = false;
                                    return [3 /*break*/, 4];
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    if (data != null)
                                        buffer += data.toString();
                                    _a.label = 6;
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    stream.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                        var data, error_7, error_8;
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
                                    return [4 /*yield*/, client.QueueMessage({ queuename: commandqueue, data: data })];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [3 /*break*/, 5];
                                case 4:
                                    error_7 = _a.sent();
                                    console.error(error_7);
                                    return [3 /*break*/, 5];
                                case 5:
                                    _a.trys.push([5, 8, , 9]);
                                    if (!(dostream == true && streamqueue != "")) return [3 /*break*/, 7];
                                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: data })];
                                case 6:
                                    _a.sent();
                                    _a.label = 7;
                                case 7: return [3 /*break*/, 9];
                                case 8:
                                    error_8 = _a.sent();
                                    console.error(error_8);
                                    return [3 /*break*/, 9];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    runner_1.runner.addstream(streamid, stream);
                    return [4 /*yield*/, packagemanager_1.packagemanager.runpackage(payload.id, streamid, true)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    if (!(dostream == true && streamqueue != "")) return [3 /*break*/, 4];
                    return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: { "command": "success" } })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_4 = _a.sent();
                    console.error(error_4);
                    dostream = false;
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, { "command": "success" }];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_5 = _a.sent();
                    return [2 /*return*/, { "command": "error", error: JSON.stringify(error_5.message) }];
                case 9: return [2 /*return*/];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FBK0Q7QUFDL0QsbUNBQWtDO0FBQ2xDLG1EQUFrRDtBQUNsRCx1QkFBd0I7QUFDeEIsMkJBQTZCO0FBQzdCLHVCQUF3QjtBQUN4QixpQ0FBZ0M7QUFFaEMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsY0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDOUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsY0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0MsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsY0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFFL0MsSUFBTSxNQUFNLEdBQVksSUFBSSxpQkFBTyxFQUFFLENBQUE7QUFDckMsTUFBTSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztBQUNsQyxNQUFNLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQTtBQUMxQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDaEcsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQ25DLElBQUksZUFBZSxHQUFRLEVBQUUsUUFBUSxFQUFFLDRCQUE0QixFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFB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