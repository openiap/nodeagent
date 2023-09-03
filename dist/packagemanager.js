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
exports.packagemanager = void 0;
var fs = require("fs");
var path = require("path");
var os = require("os");
var AdmZip = require("adm-zip");
var tar = require("tar");
var nodeapi_1 = require("@openiap/nodeapi");
var runner_1 = require("./runner");
var agent_1 = require("./agent");
var info = nodeapi_1.config.info, err = nodeapi_1.config.err;
var packagemanager = /** @class */ (function () {
    function packagemanager() {
    }
    packagemanager.getpackages = function (client, languages) {
        return __awaiter(this, void 0, void 0, function () {
            var _packages, files, i, pkg, _packages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (client == null) {
                            if (!fs.existsSync(packagemanager.packagefolder))
                                fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
                            _packages = [];
                            files = fs.readdirSync(packagemanager.packagefolder);
                            for (i = 0; i < files.length; i++) {
                                if (files[i].endsWith(".json")) {
                                    pkg = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder, files[i])).toString());
                                    if (pkg != null && pkg._type == "package")
                                        _packages.push(pkg);
                                }
                            }
                            packagemanager.packages = _packages;
                            return [2 /*return*/, JSON.parse(JSON.stringify(_packages))];
                        }
                        return [4 /*yield*/, client.Query({ query: { "_type": "package", "language": { "$in": languages } }, collectionname: "agents" })];
                    case 1:
                        _packages = _a.sent();
                        packagemanager.packages = _packages;
                        return [2 /*return*/, JSON.parse(JSON.stringify(_packages))];
                }
            });
        });
    };
    packagemanager.reloadpackage = function (client, id, force) {
        return __awaiter(this, void 0, void 0, function () {
            var pkg, document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.FindOne({ query: { "_type": "package", "_id": id }, collectionname: "agents" })];
                    case 1:
                        pkg = _a.sent();
                        if (pkg == null)
                            return [2 /*return*/, null];
                        if (!fs.existsSync(packagemanager.packagefolder))
                            fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
                        if (force == false && fs.existsSync(path.join(packagemanager.packagefolder, pkg._id + ".json"))) {
                            document = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder, pkg._id + ".json")).toString());
                            if (document.version == pkg.version)
                                return [2 /*return*/, pkg];
                        }
                        packagemanager.deleteDirectoryRecursiveSync(path.join(packagemanager.packagefolder, pkg._id));
                        if (!(pkg.fileid != null && pkg.fileid != "")) return [3 /*break*/, 3];
                        // console.log("get package " + pkg.name);
                        return [4 /*yield*/, packagemanager.getpackage(client, pkg._id)];
                    case 2:
                        // console.log("get package " + pkg.name);
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    packagemanager.reloadpackages = function (client, languages, force) {
        return __awaiter(this, void 0, void 0, function () {
            var packages, i, document, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, packagemanager.getpackages(client, languages)];
                    case 1:
                        packages = _a.sent();
                        if (!fs.existsSync(packagemanager.packagefolder))
                            fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < packages.length)) return [3 /*break*/, 8];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        if (!fs.existsSync(packagemanager.packagefolder))
                            fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
                        if (force == false && fs.existsSync(path.join(packagemanager.packagefolder, packages[i]._id + ".json"))) {
                            document = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder, packages[i]._id + ".json")).toString());
                            if (document.version == packages[i].version)
                                return [3 /*break*/, 7];
                        }
                        packagemanager.deleteDirectoryRecursiveSync(path.join(packagemanager.packagefolder, packages[i]._id));
                        if (!(packages[i].fileid != null && packages[i].fileid != "")) return [3 /*break*/, 5];
                        // console.log("get package " + packages[i].name + " v" + packages[i].version + " " + packages[i]._id);
                        return [4 /*yield*/, packagemanager.getpackage(client, packages[i]._id)];
                    case 4:
                        // console.log("get package " + packages[i].name + " v" + packages[i].version + " " + packages[i]._id);
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, packages];
                }
            });
        });
    };
    packagemanager.getpackage = function (client, id) {
        return __awaiter(this, void 0, void 0, function () {
            var pkg, serverpcks, error_2, localpath, files, filename, reply, error_3, reply, error_4, zip, dest, error_5, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fs.existsSync(packagemanager.packagefolder))
                            fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
                        pkg = null;
                        if (!fs.existsSync(path.join(packagemanager.packagefolder, id + ".json"))) return [3 /*break*/, 6];
                        pkg = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder, id + ".json")).toString());
                        if (!(pkg.fileid != "local" && agent_1.agent.client.connected && agent_1.agent.client.signedin)) return [3 /*break*/, 5];
                        serverpcks = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, client.Query({ collectionname: "agents", query: { _id: id, "_type": "package" } })];
                    case 2:
                        // serverpck = await client.FindOne<ipackage>({ collectionname: "agents", query: { _id: id, "_type": "package" } });
                        serverpcks = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        if (serverpcks != null) {
                            if (serverpcks.length == 0) {
                                throw new Error("package: " + id + " no longer exists!");
                            }
                            if (serverpcks[0].fileid == pkg.fileid) {
                                pkg = serverpcks[0];
                                fs.writeFileSync(path.join(packagemanager.packagefolder, id + ".json"), JSON.stringify(pkg, null, 2));
                                localpath = path.join(packagemanager.packagefolder, id);
                                if (fs.existsSync(localpath)) {
                                    files = fs.readdirSync(localpath);
                                    if (files.length > 0) {
                                        return [2 /*return*/, pkg];
                                    }
                                }
                            }
                            else {
                                pkg = serverpcks[0];
                                fs.writeFileSync(path.join(packagemanager.packagefolder, id + ".json"), JSON.stringify(pkg, null, 2));
                            }
                        }
                        _a.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        if (!(agent_1.agent.client.connected && agent_1.agent.client.signedin)) return [3 /*break*/, 8];
                        return [4 /*yield*/, client.FindOne({ collectionname: "agents", query: { _id: id, "_type": "package" } })];
                    case 7:
                        pkg = _a.sent();
                        if (pkg != null)
                            fs.writeFileSync(path.join(packagemanager.packagefolder, id + ".json"), JSON.stringify(pkg, null, 2));
                        _a.label = 8;
                    case 8:
                        if (pkg == null)
                            throw new Error("Failed to find package: " + id);
                        if (!agent_1.agent.client.connected || !agent_1.agent.client.signedin) {
                            return [2 /*return*/, pkg];
                        }
                        filename = "";
                        if (!(pkg.fileid != "local")) return [3 /*break*/, 18];
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, client.DownloadFile({ id: pkg.fileid, folder: packagemanager.packagefolder })];
                    case 10:
                        reply = _a.sent();
                        filename = path.join(packagemanager.packagefolder, reply.filename);
                        return [3 /*break*/, 12];
                    case 11:
                        error_3 = _a.sent();
                        console.log(error_3);
                        return [3 /*break*/, 12];
                    case 12:
                        if (!(filename == "")) return [3 /*break*/, 17];
                        return [4 /*yield*/, client.FindOne({ collectionname: "agents", query: { _id: id, "_type": "package" } })];
                    case 13:
                        pkg = _a.sent();
                        if (pkg != null)
                            fs.writeFileSync(path.join(packagemanager.packagefolder, id + ".json"), JSON.stringify(pkg, null, 2));
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, client.DownloadFile({ id: pkg.fileid, folder: packagemanager.packagefolder })];
                    case 15:
                        reply = _a.sent();
                        filename = path.join(packagemanager.packagefolder, reply.filename);
                        return [3 /*break*/, 17];
                    case 16:
                        error_4 = _a.sent();
                        return [3 /*break*/, 17];
                    case 17:
                        if (filename == "") {
                            throw new Error("Failed to download file: " + pkg.fileid);
                        }
                        _a.label = 18;
                    case 18:
                        _a.trys.push([18, 24, 25, 26]);
                        if (!(path.extname(filename) == ".zip")) return [3 /*break*/, 19];
                        zip = new AdmZip(filename);
                        zip.extractAllTo(path.join(packagemanager.packagefolder, id), true);
                        return [3 /*break*/, 23];
                    case 19:
                        if (!(path.extname(filename) == ".tar.gz" || path.extname(filename) == ".tgz")) return [3 /*break*/, 23];
                        dest = path.join(packagemanager.packagefolder, id);
                        if (!fs.existsSync(dest)) {
                            fs.mkdirSync(dest, { recursive: true });
                        }
                        _a.label = 20;
                    case 20:
                        _a.trys.push([20, 22, , 23]);
                        return [4 /*yield*/, tar.x({
                                file: filename,
                                C: dest
                            })];
                    case 21:
                        _a.sent();
                        return [3 /*break*/, 23];
                    case 22:
                        error_5 = _a.sent();
                        console.error(error_5);
                        throw error_5;
                    case 23: return [3 /*break*/, 26];
                    case 24:
                        error_6 = _a.sent();
                        console.error(error_6);
                        throw error_6;
                    case 25:
                        if (filename != "" && fs.existsSync(filename))
                            fs.unlinkSync(filename);
                        return [2 /*return*/, pkg];
                    case 26: return [2 /*return*/];
                }
            });
        });
    };
    packagemanager.getpackagepath = function (packagepath, first) {
        if (first === void 0) { first = true; }
        if (fs.existsSync(path.join(packagepath, "package.json")))
            return packagepath;
        if (fs.existsSync(path.join(packagepath, "agent.js")))
            return packagepath;
        if (fs.existsSync(path.join(packagepath, "main.js")))
            return packagepath;
        if (fs.existsSync(path.join(packagepath, "index.js")))
            return packagepath;
        if (fs.existsSync(path.join(packagepath, "agent.py")))
            return packagepath;
        if (fs.existsSync(path.join(packagepath, "main.py")))
            return packagepath;
        if (fs.existsSync(path.join(packagepath, "index.py")))
            return packagepath;
        // search for a .csproj file
        if (!first)
            return "";
        if (!fs.existsSync(packagepath))
            return "";
        var files = fs.readdirSync(packagepath);
        for (var i = 0; i < files.length; i++) {
            var filepath = path.join(packagepath, files[i]);
            if (fs.lstatSync(filepath).isDirectory()) {
                var test = packagemanager.getpackagepath(filepath, false);
                if (test != "")
                    return test;
            }
        }
        return "";
    };
    packagemanager.getscriptpath = function (packagepath) {
        if (fs.existsSync(path.join(packagepath, "package.json"))) {
            var project = require(path.join(packagepath, "package.json"));
            if (project.scripts && project.scripts.start) {
                return "npm run start";
            }
            var _main = path.join(packagepath, project.main);
            if (fs.existsSync(_main)) {
                return _main;
            }
        }
        if (fs.existsSync(path.join(packagepath, "agent.js")))
            return path.join(packagepath, "agent.js");
        if (fs.existsSync(path.join(packagepath, "main.js")))
            return path.join(packagepath, "main.js");
        if (fs.existsSync(path.join(packagepath, "index.js")))
            return path.join(packagepath, "index.js");
        if (fs.existsSync(path.join(packagepath, "agent.py")))
            return path.join(packagepath, "agent.py");
        if (fs.existsSync(path.join(packagepath, "main.py")))
            return path.join(packagepath, "main.py");
        if (fs.existsSync(path.join(packagepath, "index.py")))
            return path.join(packagepath, "index.py");
        if (fs.existsSync(path.join(packagepath, "index.ps1")))
            return path.join(packagepath, "index.ps1");
        if (fs.existsSync(path.join(packagepath, "main.ps1")))
            return path.join(packagepath, "main.ps1");
    };
    packagemanager.addstream = function (streamid, streamqueues, stream, pck) {
        var s = runner_1.runner.streams.find(function (x) { return x.id == streamid; });
        if (s != null)
            throw new Error("Stream " + streamid + " already exists");
        s = new runner_1.runner_stream();
        s.id = streamid;
        s.stream = stream;
        s.streamqueues = streamqueues;
        if (pck != null) {
            s.packagename = pck.name;
            s.packageid = pck._id;
        }
        runner_1.runner.streams.push(s);
        agent_1.agent.emit("streamadded", s);
        return s;
    };
    packagemanager.runpackage = function (client, id, streamid, streamqueues, stream, wait, env, schedule) {
        if (env === void 0) { env = {}; }
        if (schedule === void 0) { schedule = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var pck, s, error_7, processcount, processes, i, p, b, message, i_1, streamqueue, error_8, packagepath, command, python, nodePath, pwshPath, exitcode, dotnet, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (streamid == null || streamid == "")
                            throw new Error("streamid is null or empty");
                        if (packagemanager.packagefolder == null || packagemanager.packagefolder == "")
                            throw new Error("packagemanager.packagefolder is null or empty");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 31, , 32]);
                        pck = null;
                        s = null;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, packagemanager.getpackage(client, id)];
                    case 3:
                        pck = _a.sent();
                        s = packagemanager.addstream(streamid, streamqueues, stream, pck);
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _a.sent();
                        throw error_7;
                    case 5:
                        if (s == null)
                            s = packagemanager.addstream(streamid, streamqueues, stream, pck);
                        if (pck == null)
                            throw new Error("Failed to find package: " + id);
                        s.packagename = pck.name;
                        s.packageid = pck._id;
                        s.schedulename = "";
                        if (schedule != null) {
                            s.schedulename = schedule.name;
                        }
                        processcount = runner_1.runner.streams.length;
                        processes = [];
                        for (i = processcount; i >= 0; i--) {
                            p = runner_1.runner.streams[i];
                            if (p == null)
                                continue;
                            if (p.schedulename == null || p.schedulename == "") {
                                b = true;
                            }
                            processes.push({
                                "id": p.id,
                                "streamqueues": runner_1.runner.commandstreams,
                                "packagename": p.packagename,
                                "packageid": p.packageid,
                                "schedulename": p.schedulename,
                            });
                        }
                        message = { "command": "listprocesses", "success": true, "count": processcount, "processes": processes };
                        i_1 = runner_1.runner.commandstreams.length - 1;
                        _a.label = 6;
                    case 6:
                        if (!(i_1 >= 0)) return [3 /*break*/, 11];
                        streamqueue = runner_1.runner.commandstreams[i_1];
                        if (!(streamqueue != streamid)) return [3 /*break*/, 10];
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: message, correlationId: streamid })];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        error_8 = _a.sent();
                        console.log("runpackage, remove streamqueue " + streamqueue);
                        runner_1.runner.commandstreams.splice(i_1, 1);
                        return [3 /*break*/, 10];
                    case 10:
                        i_1--;
                        return [3 /*break*/, 6];
                    case 11:
                        packagepath = packagemanager.getpackagepath(path.join(packagemanager.packagefolder, id));
                        if (!fs.existsSync(packagepath)) return [3 /*break*/, 29];
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null)
                            throw new Error("Failed locating a command to run, EXIT");
                        if (!command.endsWith(".py")) return [3 /*break*/, 16];
                        python = runner_1.runner.findPythonPath();
                        if (python == "")
                            throw new Error("Failed locating python, is python installed and in the path?");
                        return [4 /*yield*/, runner_1.runner.pipinstall(client, packagepath, streamid, python)];
                    case 12:
                        _a.sent();
                        if (!wait) return [3 /*break*/, 14];
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, python, ["-u", command], true, env)];
                    case 13: return [2 /*return*/, _a.sent()];
                    case 14:
                        runner_1.runner.runit(client, packagepath, streamid, python, ["-u", command], true, env);
                        return [2 /*return*/, 0];
                    case 15: return [3 /*break*/, 28];
                    case 16:
                        if (!(command.endsWith(".js") || command == "npm run start")) return [3 /*break*/, 21];
                        nodePath = runner_1.runner.findNodePath();
                        if (nodePath == "")
                            throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH));
                        return [4 /*yield*/, runner_1.runner.npminstall(client, packagepath, streamid)];
                    case 17:
                        _a.sent();
                        if (!wait) return [3 /*break*/, 19];
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, nodePath, [command], true, env)];
                    case 18: return [2 /*return*/, _a.sent()];
                    case 19:
                        runner_1.runner.runit(client, packagepath, streamid, nodePath, [command], true, env);
                        return [2 /*return*/, 0];
                    case 20: return [3 /*break*/, 28];
                    case 21:
                        if (!command.endsWith(".ps1")) return [3 /*break*/, 25];
                        pwshPath = runner_1.runner.findPwShPath();
                        if (pwshPath == "")
                            throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH));
                        if (!wait) return [3 /*break*/, 23];
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env)];
                    case 22:
                        exitcode = _a.sent();
                        return [2 /*return*/, exitcode];
                    case 23:
                        runner_1.runner.runit(client, packagepath, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env);
                        return [2 /*return*/, 0];
                    case 24: return [3 /*break*/, 28];
                    case 25:
                        dotnet = runner_1.runner.findDotnetPath();
                        if (dotnet == "")
                            throw new Error("Failed locating dotnet, is dotnet installed and in the path?");
                        if (!wait) return [3 /*break*/, 27];
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, dotnet, ["run"], true, env)];
                    case 26: return [2 /*return*/, _a.sent()];
                    case 27:
                        runner_1.runner.runit(client, packagepath, streamid, dotnet, ["run"], true, env);
                        return [2 /*return*/, 0];
                    case 28: return [3 /*break*/, 30];
                    case 29:
                        if (packagepath == null || packagepath == "") {
                            runner_1.runner.notifyStream(client, streamid, "Package not found in " + packagemanager.packagefolder);
                        }
                        else {
                            runner_1.runner.notifyStream(client, streamid, "Package not found in " + packagepath);
                        }
                        runner_1.runner.removestream(client, streamid, false, "");
                        _a.label = 30;
                    case 30: return [3 /*break*/, 32];
                    case 31:
                        error_9 = _a.sent();
                        runner_1.runner.notifyStream(client, streamid, error_9.message);
                        runner_1.runner.removestream(client, streamid, false, "");
                        return [3 /*break*/, 32];
                    case 32: return [2 /*return*/, 0];
                }
            });
        });
    };
    packagemanager.removepackage = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var ppath;
            return __generator(this, function (_a) {
                ppath = path.join(packagemanager.packagefolder, id);
                packagemanager.deleteDirectoryRecursiveSync(ppath);
                return [2 /*return*/];
            });
        });
    };
    packagemanager.deleteDirectoryRecursiveSync = function (dirPath) {
        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach(function (file, index) {
                var curPath = path.join(dirPath, file);
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    packagemanager.deleteDirectoryRecursiveSync(curPath);
                }
                else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(dirPath);
        }
    };
    packagemanager.packagefolder = path.join(os.homedir(), ".openiap", "packages");
    packagemanager.packages = [];
    return packagemanager;
}());
exports.packagemanager = packagemanager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcGFja2FnZW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qix1QkFBd0I7QUFDeEIsZ0NBQWtDO0FBQ2xDLHlCQUEyQjtBQUMzQiw0Q0FBMEM7QUFDMUMsbUNBQWlEO0FBQ2pELGlDQUFnQztBQUN4QixJQUFBLElBQUksR0FBVSxnQkFBTSxLQUFoQixFQUFFLEdBQUcsR0FBSyxnQkFBTSxJQUFYLENBQVk7QUFjN0I7SUFBQTtJQTRVQSxDQUFDO0lBelVxQiwwQkFBVyxHQUEvQixVQUFnQyxNQUFlLEVBQUUsU0FBbUI7Ozs7Ozt3QkFDbEUsSUFBRyxNQUFNLElBQUksSUFBSSxFQUFFOzRCQUNqQixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDO2dDQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDOzRCQUM5RyxTQUFTLEdBQWUsRUFBRSxDQUFDOzRCQUMzQixLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7NEJBQ3pELEtBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQ0FDcEMsSUFBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29DQUN6QixHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FB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QUFjLEdBQTVCLFVBQTZCLFdBQW1CLEVBQUUsS0FBcUI7UUFBckIsc0JBQUEsRUFBQSxZQUFxQjtRQUNyRSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFBRSxPQUFPLFdBQVcsQ0FBQztRQUM5RSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFBRSxPQUFPLFdBQVcsQ0FBQztRQUMxRSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFBRSxPQUFPLFdBQVcsQ0FBQztRQUN6RSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFBRSxPQUFPLFdBQVcsQ0FBQztRQUMxRSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFBRSxPQUFPLFdBQVcsQ0FBQztRQUMxRSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFBRSxPQUFPLFdBQVcsQ0FBQztRQUN6RSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFBRSxPQUFPLFdBQVcsQ0FBQztRQUMxRSw0QkFBNEI7UUFDNUIsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPLEVBQUUsQ0FBQTtRQUNyQixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7WUFBRSxPQUFPLEVBQUUsQ0FBQTtRQUMxQyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3JDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2pELElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDeEMsSUFBSSxJQUFJLEdBQUcsY0FBYyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUE7Z0JBQ3pELElBQUksSUFBSSxJQUFJLEVBQUU7b0JBQUUsT0FBTyxJQUFJLENBQUM7YUFDN0I7U0FDRjtRQUNELE9BQU8sRUFBRSxDQUFBO0lBQ1gsQ0FBQztJQUNhLDRCQUFhLEdBQTNCLFVBQTRCLFdBQW1CO1FBQzdDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFO1lBQ3pELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFBO1lBQzdELElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDNUMsT0FBTyxlQUFlLENBQUE7YUFDdkI7WUFDRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPLEtBQUssQ0FBQTthQUNiO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pHLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDL0YsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqRyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pHLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDL0YsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqRyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ25HLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENB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