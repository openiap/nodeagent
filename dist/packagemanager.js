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
var PortMapper_1 = require("./PortMapper");
var info = nodeapi_1.config.info, err = nodeapi_1.config.err;
var packagemanager = /** @class */ (function () {
    function packagemanager() {
    }
    packagemanager.homedir = function () {
        if (packagemanager._homedir != null) {
            return packagemanager._homedir;
        }
        packagemanager._homedir = os.homedir();
        if (packagemanager._homedir == "/" || packagemanager._homedir == "") {
            if (fs.existsSync("/home/openiap") == true) {
                console.log("homedir overriden to /home/openiap from:", packagemanager._homedir);
                packagemanager._homedir = "/home/openiap";
            }
            else {
                console.log("homedir overriden to /tmp from:", packagemanager._homedir);
                packagemanager._homedir = "/tmp";
            }
        }
        return packagemanager._homedir;
    };
    packagemanager.packagefolder = function () {
        if (packagemanager._packagefolder != null) {
            return packagemanager._packagefolder;
        }
        packagemanager._packagefolder = path.join(packagemanager.homedir(), ".openiap", "packages");
        console.log("packagefolder as:", packagemanager._packagefolder);
        return packagemanager._packagefolder;
    };
    packagemanager.getpackages = function (client, languages) {
        return __awaiter(this, void 0, void 0, function () {
            var _packages, files, i, pkg, _packages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (client == null) {
                            if (!fs.existsSync(packagemanager.packagefolder()))
                                fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
                            _packages = [];
                            files = fs.readdirSync(packagemanager.packagefolder());
                            for (i = 0; i < files.length; i++) {
                                if (files[i].endsWith(".json")) {
                                    pkg = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder(), files[i])).toString());
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
                        if (!fs.existsSync(packagemanager.packagefolder()))
                            fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
                        if (force == false && fs.existsSync(path.join(packagemanager.packagefolder(), pkg._id + ".json"))) {
                            document = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder(), pkg._id + ".json")).toString());
                            if (document.version == pkg.version)
                                return [2 /*return*/, pkg];
                        }
                        packagemanager.deleteDirectoryRecursiveSync(path.join(packagemanager.packagefolder(), pkg._id));
                        if (!(pkg.fileid != null && pkg.fileid != "")) return [3 /*break*/, 3];
                        return [4 /*yield*/, packagemanager.getpackage(client, pkg._id)];
                    case 2:
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
                        if (!fs.existsSync(packagemanager.packagefolder()))
                            fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < packages.length)) return [3 /*break*/, 8];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        if (!fs.existsSync(packagemanager.packagefolder()))
                            fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
                        if (force == false && fs.existsSync(path.join(packagemanager.packagefolder(), packages[i]._id + ".json"))) {
                            document = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder(), packages[i]._id + ".json")).toString());
                            if (document.version == packages[i].version)
                                return [3 /*break*/, 7];
                        }
                        packagemanager.deleteDirectoryRecursiveSync(path.join(packagemanager.packagefolder(), packages[i]._id));
                        if (!(packages[i].fileid != null && packages[i].fileid != "")) return [3 /*break*/, 5];
                        return [4 /*yield*/, packagemanager.getpackage(client, packages[i]._id)];
                    case 4:
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
                        if (!fs.existsSync(packagemanager.packagefolder()))
                            fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
                        pkg = null;
                        if (!fs.existsSync(path.join(packagemanager.packagefolder(), id + ".json"))) return [3 /*break*/, 6];
                        pkg = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder(), id + ".json")).toString());
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
                                fs.writeFileSync(path.join(packagemanager.packagefolder(), id + ".json"), JSON.stringify(pkg, null, 2));
                                localpath = path.join(packagemanager.packagefolder(), id);
                                if (fs.existsSync(localpath)) {
                                    files = fs.readdirSync(localpath);
                                    if (files.length > 0) {
                                        return [2 /*return*/, pkg];
                                    }
                                }
                            }
                            else {
                                pkg = serverpcks[0];
                                fs.writeFileSync(path.join(packagemanager.packagefolder(), id + ".json"), JSON.stringify(pkg, null, 2));
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
                            fs.writeFileSync(path.join(packagemanager.packagefolder(), id + ".json"), JSON.stringify(pkg, null, 2));
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
                        return [4 /*yield*/, client.DownloadFile({ id: pkg.fileid, folder: packagemanager.packagefolder() })];
                    case 10:
                        reply = _a.sent();
                        filename = path.join(packagemanager.packagefolder(), reply.filename);
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
                            fs.writeFileSync(path.join(packagemanager.packagefolder(), id + ".json"), JSON.stringify(pkg, null, 2));
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, client.DownloadFile({ id: pkg.fileid, folder: packagemanager.packagefolder() })];
                    case 15:
                        reply = _a.sent();
                        filename = path.join(packagemanager.packagefolder(), reply.filename);
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
                        zip.extractAllTo(path.join(packagemanager.packagefolder(), id), true);
                        return [3 /*break*/, 23];
                    case 19:
                        if (!(path.extname(filename) == ".tar.gz" || path.extname(filename) == ".tgz")) return [3 /*break*/, 23];
                        dest = path.join(packagemanager.packagefolder(), id);
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
    packagemanager.addstream = function (streamid, streamqueues, stream, pck, env) {
        return __awaiter(this, void 0, void 0, function () {
            var s, i, port, newp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        s = runner_1.runner.streams.find(function (x) { return x.id == streamid; });
                        if (s != null)
                            throw new Error("Stream " + streamid + " already exists");
                        s = new runner_1.runner_stream();
                        s.id = streamid;
                        s.ports = [];
                        s.stream = stream;
                        s.streamqueues = streamqueues;
                        if (pck != null) {
                            s.packagename = pck.name;
                            s.packageid = pck._id;
                        }
                        runner_1.runner.streams.push(s);
                        if (!(pck.ports != null)) return [3 /*break*/, 4];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < pck.ports.length)) return [3 /*break*/, 4];
                        port = pck.ports[i].port;
                        if (port == null || port == "")
                            port = 0;
                        return [4 /*yield*/, (0, PortMapper_1.FindFreePort)(port)];
                    case 2:
                        port = _a.sent();
                        // @ts-ignore
                        if (pck.ports[i].name != null && pck.ports[i].portname == null)
                            pck.ports[i].portname = pck.ports[i].name;
                        newp = { port: port, portname: pck.ports[i].portname, protocol: pck.ports[i].protocol, web: pck.ports[i].web };
                        if (newp.portname == null || newp.portname == "") {
                            newp.portname = "PORT" + port;
                        }
                        s.ports.push(newp);
                        if (env != null) {
                            env[pck.ports[i].portname] = port;
                            if (pck.ports.length == 1) {
                                env["PORT"] = port;
                            }
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        agent_1.agent.emit("streamadded", s);
                        return [2 /*return*/, s];
                }
            });
        });
    };
    packagemanager.runpackage = function (client, id, streamid, streamqueues, stream, wait, env, schedule) {
        if (env === void 0) { env = {}; }
        if (schedule === void 0) { schedule = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var pck, s, error_7, processcount, processes, i, p, message, i_1, streamqueue, error_8, packagepath, command, python, conda, condaname, nodePath, npmpath, npmpath, pwshPath, exitcode, dotnet, error_9;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (streamid == null || streamid == "")
                            throw new Error("streamid is null or empty");
                        if (packagemanager.packagefolder() == null || packagemanager.packagefolder() == "")
                            throw new Error("packagemanager.packagefolder is null or empty");
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 40, , 41]);
                        pck = null;
                        s = null;
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, packagemanager.getpackage(client, id)];
                    case 3:
                        pck = _f.sent();
                        return [4 /*yield*/, packagemanager.addstream(streamid, streamqueues, stream, pck, env)];
                    case 4:
                        s = _f.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_7 = _f.sent();
                        throw error_7;
                    case 6:
                        if (!(s == null)) return [3 /*break*/, 8];
                        return [4 /*yield*/, packagemanager.addstream(streamid, streamqueues, stream, pck, env)];
                    case 7:
                        s = _f.sent();
                        _f.label = 8;
                    case 8:
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
                        _f.label = 9;
                    case 9:
                        if (!(i_1 >= 0)) return [3 /*break*/, 14];
                        streamqueue = runner_1.runner.commandstreams[i_1];
                        if (!(streamqueue != streamid)) return [3 /*break*/, 13];
                        _f.label = 10;
                    case 10:
                        _f.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: message, correlationId: streamid })];
                    case 11:
                        _f.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        error_8 = _f.sent();
                        console.log("runpackage, remove streamqueue " + streamqueue);
                        runner_1.runner.commandstreams.splice(i_1, 1);
                        return [3 /*break*/, 13];
                    case 13:
                        i_1--;
                        return [3 /*break*/, 9];
                    case 14:
                        packagepath = packagemanager.getpackagepath(path.join(packagemanager.packagefolder(), id));
                        if (!fs.existsSync(packagepath)) return [3 /*break*/, 38];
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null)
                            throw new Error("Failed locating a command to run, EXIT");
                        if (!command.endsWith(".py")) return [3 /*break*/, 23];
                        python = runner_1.runner.findPythonPath();
                        if (python == "")
                            throw new Error("Failed locating python, is python installed and in the path?");
                        conda = runner_1.runner.findCondaPath();
                        condaname = null;
                        if (!(conda != null && conda != "")) return [3 /*break*/, 16];
                        return [4 /*yield*/, runner_1.runner.condainstall(client, packagepath, streamid, conda)];
                    case 15:
                        condaname = _f.sent();
                        _f.label = 16;
                    case 16:
                        if (!(condaname == null)) return [3 /*break*/, 18];
                        return [4 /*yield*/, runner_1.runner.pipinstall(client, packagepath, streamid, python)];
                    case 17:
                        _f.sent();
                        _f.label = 18;
                    case 18:
                        if (!wait) return [3 /*break*/, 22];
                        if (!(condaname != null)) return [3 /*break*/, 20];
                        console.log(conda);
                        console.log(["run", "-n", condaname, "python", "-u", command]);
                        _a = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, conda, ["run", "-n", condaname, "python", "-u", command], true, env)];
                    case 19: return [2 /*return*/, (_a.exitcode = _f.sent(), _a.stream = s, _a)];
                    case 20:
                        console.log(python);
                        console.log(["-u", command]);
                        _b = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, python, ["-u", command], true, env)];
                    case 21: return [2 /*return*/, (_b.exitcode = _f.sent(), _b.stream = s, _b)];
                    case 22:
                        if (condaname != null) {
                            console.log(conda);
                            console.log(["run", "-n", condaname, "python", "-u", command]);
                            runner_1.runner.runit(client, packagepath, streamid, conda, ["run", "-n", condaname, "python", "-u", command], true, env);
                            return [2 /*return*/, { exitcode: 0, stream: s }];
                        }
                        console.log(python);
                        console.log(["-u", command]);
                        runner_1.runner.runit(client, packagepath, streamid, python, ["-u", command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 23:
                        if (!(command.endsWith(".js") || command == "npm run start")) return [3 /*break*/, 30];
                        nodePath = runner_1.runner.findNodePath();
                        if (nodePath == "")
                            throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH));
                        return [4 /*yield*/, runner_1.runner.npminstall(client, packagepath, streamid)];
                    case 24:
                        _f.sent();
                        if (!wait) return [3 /*break*/, 28];
                        if (!(command == "npm run start")) return [3 /*break*/, 26];
                        npmpath = runner_1.runner.findNPMPath();
                        _c = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, npmpath, ["run", "start"], true, env)];
                    case 25: return [2 /*return*/, (_c.exitcode = _f.sent(), _c.stream = s, _c)];
                    case 26:
                        _d = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, nodePath, [command], true, env)];
                    case 27: return [2 /*return*/, (_d.exitcode = _f.sent(), _d.stream = s, _d)];
                    case 28:
                        if (command == "npm run start") {
                            npmpath = runner_1.runner.findNPMPath();
                            runner_1.runner.runit(client, packagepath, streamid, npmpath, ["run", "start"], true, env);
                            return [2 /*return*/, { exitcode: 0, stream: s }];
                        }
                        runner_1.runner.runit(client, packagepath, streamid, nodePath, [command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 29: return [3 /*break*/, 37];
                    case 30:
                        if (!command.endsWith(".ps1")) return [3 /*break*/, 34];
                        pwshPath = runner_1.runner.findPwShPath();
                        if (pwshPath == "")
                            throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH));
                        if (!wait) return [3 /*break*/, 32];
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env)];
                    case 31:
                        exitcode = _f.sent();
                        return [2 /*return*/, { exitcode: exitcode, stream: s }];
                    case 32:
                        runner_1.runner.runit(client, packagepath, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 33: return [3 /*break*/, 37];
                    case 34:
                        dotnet = runner_1.runner.findDotnetPath();
                        if (dotnet == "")
                            throw new Error("Failed locating dotnet, is dotnet installed and in the path?");
                        if (!wait) return [3 /*break*/, 36];
                        _e = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, dotnet, ["run"], true, env)];
                    case 35: return [2 /*return*/, (_e.exitcode = _f.sent(), _e.stream = s, _e)];
                    case 36:
                        runner_1.runner.runit(client, packagepath, streamid, dotnet, ["run"], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 37: return [3 /*break*/, 39];
                    case 38:
                        if (packagepath == null || packagepath == "") {
                            runner_1.runner.notifyStream(client, streamid, "Package not found in " + packagemanager.packagefolder());
                        }
                        else {
                            runner_1.runner.notifyStream(client, streamid, "Package not found in " + packagepath);
                        }
                        runner_1.runner.removestream(client, streamid, false, "");
                        _f.label = 39;
                    case 39: return [3 /*break*/, 41];
                    case 40:
                        error_9 = _f.sent();
                        runner_1.runner.notifyStream(client, streamid, error_9.message);
                        runner_1.runner.removestream(client, streamid, false, "");
                        return [3 /*break*/, 41];
                    case 41: return [2 /*return*/, { exitcode: 0, stream: null }];
                }
            });
        });
    };
    packagemanager.removepackage = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var ppath;
            return __generator(this, function (_a) {
                ppath = path.join(packagemanager.packagefolder(), id);
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
                    try {
                        fs.unlinkSync(curPath);
                    }
                    catch (error) {
                        console.log(error.message + " while unlinkSync " + curPath);
                    }
                }
            });
            try {
                fs.rmdirSync(dirPath);
            }
            catch (error) {
                console.log(error.message + " while rmdirSync " + dirPath);
            }
        }
    };
    packagemanager._homedir = null;
    packagemanager._packagefolder = null;
    packagemanager.packages = [];
    return packagemanager;
}());
exports.packagemanager = packagemanager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcGFja2FnZW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qix1QkFBd0I7QUFDeEIsZ0NBQWtDO0FBQ2xDLHlCQUEyQjtBQUMzQiw0Q0FBMEM7QUFDMUMsbUNBQWlEO0FBQ2pELGlDQUFnQztBQUNoQywyQ0FBNEM7QUFDcEMsSUFBQSxJQUFJLEdBQVUsZ0JBQU0sS0FBaEIsRUFBRSxHQUFHLEdBQUssZ0JBQU0sSUFBWCxDQUFZO0FBcUI3QjtJQUFBO0lBMFpBLENBQUM7SUF2WmUsc0JBQU8sR0FBckI7UUFDRSxJQUFHLGNBQWMsQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO1lBQ2xDLE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQztTQUNoQztRQUNELGNBQWMsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZDLElBQUcsY0FBYyxDQUFDLFFBQVEsSUFBSSxHQUFHLElBQUksY0FBYyxDQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUU7WUFDbEUsSUFBRyxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksRUFBRTtnQkFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUE7Z0JBQ2hGLGNBQWMsQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFBO2FBQzFDO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLEVBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO2dCQUN2RSxjQUFjLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQTthQUNqQztTQUNGO1FBQ0QsT0FBTyxjQUFjLENBQUMsUUFBUSxDQUFDO0lBQ2pDLENBQUM7SUFD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QUFDO3dCQUN0RSxzQkFBTyxHQUFHLEVBQUM7Ozs7O0tBRWQ7SUFDYSw2QkFBYyxHQUE1QixVQUE2QixXQUFtQixFQUFFLEtBQXFCO1FBQXJCLHNCQUFBLEVBQUEsWUFBcUI7UUFDckUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDOUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDekUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDekUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsNEJBQTRCO1FBQzVCLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDMUMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNqRCxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3hDLElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBO2dCQUN6RCxJQUFJLElBQUksSUFBSSxFQUFFO29CQUFFLE9BQU8sSUFBSSxDQUFDO2FBQzdCO1NBQ0Y7UUFDRCxPQUFPLEVBQUUsQ0FBQTtJQUNYLENBQUM7SUFDYSw0QkFBYSxHQUEzQixVQUE0QixXQUFtQjtRQUM3QyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRTtZQUN6RCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQTtZQUM3RCxJQUFJLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQzVDLE9BQU8sZUFBZSxDQUFBO2FBQ3ZCO1lBQ0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pELElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDeEIsT0FBTyxLQUFLLENBQUE7YUFDYjtTQUNGO1FBQ0QsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqRyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9GLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakcsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqRyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9GLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakcsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNuRyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ25HLENBQUM7SUFDb0Isd0JBQVMsR0FBOUIsVUFBK0IsUUFBZ0IsRUFBRSxZQUFzQixFQUFFLE1BQWdCLEVBQUUsR0FBYSxFQUFFLEdBQVE7Ozs7Ozt3QkFDNUcsQ0FBQyxHQUFHLGVBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxRQUFRLEVBQWhCLENBQWdCLENBQUMsQ0FBQTt3QkFDbEQsSUFBSSxDQUFDLElBQUksSUFBSTs0QkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsR0FBRyxRQUFRLEdBQUcsaUJBQWlCLENBQUMsQ0FBQTt3QkFDeEUsQ0FBQyxHQUFHLElBQUksc0JBQWEsRUFBRSxDQUFDO3dCQUN4QixDQUFDLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQzt3QkFDaEIsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7d0JBQ2IsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7d0JBQ2xCLENBQUMsQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO3dCQUM5QixJQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUU7NEJBQ2QsQ0FBQyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDOzRCQUN6QixDQUFDLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7eUJBQ3ZCO3dCQUNELGVBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzZCQUVwQixDQUFBLEdBQUcsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFBLEVBQWpCLHdCQUFpQjt3QkFDVixDQUFDLEdBQUcsQ0FBQzs7OzZCQUFFLENBQUEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFBO3dCQUM3QixJQUFJLEdBQVcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQ3JDLElBQUcsSUFBSSxJQUFJLElBQUksSUFBSyxJQUFZLElBQUksRUFBRTs0QkFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO3dCQUMxQyxxQkFBTSxJQUFBLHlCQUFZLEVBQUMsSUFBSSxDQUFDLEVBQUE7O3dCQUEvQixJQUFJLEdBQUcsU0FBd0IsQ0FBQzt3QkFDaEMsYUFBYTt3QkFDYixJQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxJQUFJOzRCQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO3dCQUNyRyxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7d0JBQ25ILElBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUU7NEJBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDO3lCQUFFO3dCQUNuRixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDbkIsSUFBRyxHQUFHLElBQUksSUFBSSxFQUFFOzRCQUNkLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFB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