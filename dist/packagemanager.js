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
                                if (files[i] == null) {
                                }
                                else if (files[i].endsWith(".json")) {
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
                        return [4 /*yield*/, packagemanager.getpackage(client, pkg._id, force)];
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
                        return [4 /*yield*/, packagemanager.getpackage(client, packages[i]._id, false)];
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
    packagemanager.getpackage = function (client, id, download) {
        return __awaiter(this, void 0, void 0, function () {
            var pkg, serverpcks, error_2, localpath, packagepath, filename, reply, error_3, reply, error_4, zip, dest, error_5, error_6;
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
                        // If offline, this will fail, but we still have the files, so return the local package
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
                                    packagepath = packagemanager.getpackagepath(path.join(packagemanager.homedir(), ".openiap", "packages", id));
                                    if (packagepath != null && packagepath != "")
                                        return [2 /*return*/, pkg];
                                    // let files = fs.readdirSync(localpath);
                                    // if(files.length > 0 ) {
                                    //   return pkg;
                                    // }
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
                        if (download == false) {
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
                        _a.trys.push([18, 27, 28, 29]);
                        if (!(path.extname(filename) == ".zip")) return [3 /*break*/, 20];
                        packagemanager.deleteDirectoryRecursiveSync(path.join(packagemanager.packagefolder(), id));
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 19:
                        _a.sent();
                        zip = new AdmZip(filename);
                        zip.extractAllTo(path.join(packagemanager.packagefolder(), id), true);
                        return [3 /*break*/, 26];
                    case 20:
                        if (!(path.extname(filename) == ".tar.gz" || path.extname(filename) == ".tgz")) return [3 /*break*/, 26];
                        dest = path.join(packagemanager.packagefolder(), id);
                        packagemanager.deleteDirectoryRecursiveSync(dest);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 21:
                        _a.sent();
                        if (!fs.existsSync(dest)) {
                            fs.mkdirSync(dest, { recursive: true });
                        }
                        _a.label = 22;
                    case 22:
                        _a.trys.push([22, 24, , 26]);
                        return [4 /*yield*/, tar.x({
                                file: filename,
                                C: dest
                            })];
                    case 23:
                        _a.sent();
                        return [3 /*break*/, 26];
                    case 24:
                        error_5 = _a.sent();
                        console.error(error_5);
                        return [4 /*yield*/, tar.x({
                                file: filename,
                                C: dest
                            })];
                    case 25:
                        _a.sent();
                        return [3 /*break*/, 26];
                    case 26: return [3 /*break*/, 29];
                    case 27:
                        error_6 = _a.sent();
                        console.error(error_6);
                        throw error_6;
                    case 28:
                        if (filename != "" && fs.existsSync(filename))
                            fs.unlinkSync(filename);
                        return [2 /*return*/, pkg];
                    case 29: return [2 /*return*/];
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
    packagemanager.addstream = function (client, streamid, streamqueues, stream, pck, env) {
        return __awaiter(this, void 0, void 0, function () {
            var s, i, port, newport, newp, port, newport;
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
                        if (process.env.SKIP_FREE_PORT_CHECK != null || env.SKIP_FREE_PORT_CHECK != null) {
                            agent_1.agent.emit("streamadded", s);
                            return [2 /*return*/, s];
                        }
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
                        newport = _a.sent();
                        if (newport != port) {
                            console.log("port " + port + " is in use, using " + newport + " instead for " + pck.ports[i].portname);
                            runner_1.runner.notifyStream(client, streamid, "port " + port + " is in use, using " + newport + " instead for " + pck.ports[i].portname);
                            port = newport;
                        }
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
                        if (!(env != null)) return [3 /*break*/, 6];
                        if (!(env.PORT != null && env.PORT != "")) return [3 /*break*/, 6];
                        port = parseInt(env.PORT);
                        if (!(port > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, PortMapper_1.FindFreePort)(port)];
                    case 5:
                        newport = _a.sent();
                        if (port != newport) {
                            console.log("port " + port + " is in use, using " + newport + " instead for envoriment variable PORT");
                            runner_1.runner.notifyStream(client, streamid, "port " + port + " is in use, using " + newport + " instead for envoriment variable PORT");
                            env.PORT = newport;
                        }
                        _a.label = 6;
                    case 6:
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
            var pck, s, error_7, processcount, processes, i, p, message, i_1, streamqueue, error_8, packagepath, runfolder, command, python, conda, condaname, lockfile, nodePath, lockfile, pwshPath, dotnet, nodePath, npmpath, npmpath, pwshPath, exitcode, dotnet, error_9;
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
                        _f.trys.push([1, 43, , 44]);
                        pck = null;
                        s = null;
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, packagemanager.getpackage(client, id, true)];
                    case 3:
                        pck = _f.sent();
                        return [4 /*yield*/, packagemanager.addstream(client, streamid, streamqueues, stream, pck, env)];
                    case 4:
                        s = _f.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_7 = _f.sent();
                        throw error_7;
                    case 6:
                        if (!(s == null)) return [3 /*break*/, 8];
                        return [4 /*yield*/, packagemanager.addstream(client, streamid, streamqueues, stream, pck, env)];
                    case 7:
                        s = _f.sent();
                        _f.label = 8;
                    case 8:
                        if (pck == null) {
                            throw new Error("Failed to find package: " + id);
                        }
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
                        runfolder = path.join(packagemanager.homedir(), ".openiap", "runtime", streamid);
                        if (!fs.existsSync(packagepath)) {
                            throw new Error("Failed to find package: " + id);
                        }
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        if (!command.endsWith(".py")) return [3 /*break*/, 20];
                        python = runner_1.runner.findPythonPath();
                        if (python == "")
                            throw new Error("Failed locating python, is python installed and in the path?");
                        conda = runner_1.runner.findCondaPath();
                        condaname = null;
                        lockfile = path.join(packagepath, "conda.lock");
                        if (!!fs.existsSync(lockfile)) return [3 /*break*/, 19];
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
                        fs.writeFileSync(lockfile, "installed");
                        _f.label = 19;
                    case 19: return [3 /*break*/, 24];
                    case 20:
                        if (!(command.endsWith(".js") || command == "npm run start")) return [3 /*break*/, 23];
                        nodePath = runner_1.runner.findNodePath();
                        if (nodePath == "")
                            throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH));
                        lockfile = path.join(packagepath, "npm.lock");
                        if (!!fs.existsSync(lockfile)) return [3 /*break*/, 22];
                        return [4 /*yield*/, runner_1.runner.npminstall(client, packagepath, streamid)];
                    case 21:
                        _f.sent();
                        fs.writeFileSync(lockfile, "installed");
                        _f.label = 22;
                    case 22: return [3 /*break*/, 24];
                    case 23:
                        if (command.endsWith(".ps1")) {
                            pwshPath = runner_1.runner.findPwShPath();
                            if (pwshPath == "")
                                throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH));
                        }
                        else {
                            dotnet = runner_1.runner.findDotnetPath();
                            if (dotnet == "")
                                throw new Error("Failed locating dotnet, is dotnet installed and in the path?");
                        }
                        _f.label = 24;
                    case 24:
                        if (!fs.existsSync(runfolder))
                            fs.mkdirSync(runfolder, { recursive: true });
                        fs.cpSync(packagepath, runfolder, { recursive: true });
                        command = packagemanager.getscriptpath(runfolder);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run in run folder, EXIT");
                        }
                        if (!fs.existsSync(packagepath)) {
                            throw new Error("Failed to find package: " + id);
                        }
                        if (!command.endsWith(".py")) return [3 /*break*/, 29];
                        if (!wait) return [3 /*break*/, 28];
                        if (!(condaname != null)) return [3 /*break*/, 26];
                        console.log(conda);
                        console.log(["run", "-n", condaname, "python", "-u", command]);
                        _a = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, conda, ["run", "-n", condaname, "python", "-u", command], true, env)];
                    case 25: return [2 /*return*/, (_a.exitcode = _f.sent(), _a.stream = s, _a)];
                    case 26:
                        console.log(python);
                        console.log(["-u", command]);
                        _b = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, python, ["-u", command], true, env)];
                    case 27: return [2 /*return*/, (_b.exitcode = _f.sent(), _b.stream = s, _b)];
                    case 28:
                        if (condaname != null) {
                            console.log(conda);
                            console.log(["run", "-n", condaname, "python", "-u", command]);
                            runner_1.runner.runit(client, runfolder, streamid, conda, ["run", "-n", condaname, "python", "-u", command], true, env);
                            return [2 /*return*/, { exitcode: 0, stream: s }];
                        }
                        console.log(python);
                        console.log(["-u", command]);
                        runner_1.runner.runit(client, runfolder, streamid, python, ["-u", command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 29:
                        if (!(command.endsWith(".js") || command == "npm run start")) return [3 /*break*/, 35];
                        nodePath = runner_1.runner.findNodePath();
                        if (nodePath == "")
                            throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH));
                        if (!wait) return [3 /*break*/, 33];
                        if (!(command == "npm run start")) return [3 /*break*/, 31];
                        npmpath = runner_1.runner.findNPMPath();
                        _c = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, npmpath, ["run", "start"], true, env)];
                    case 30: return [2 /*return*/, (_c.exitcode = _f.sent(), _c.stream = s, _c)];
                    case 31:
                        _d = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, nodePath, [command], true, env)];
                    case 32: return [2 /*return*/, (_d.exitcode = _f.sent(), _d.stream = s, _d)];
                    case 33:
                        if (command == "npm run start") {
                            npmpath = runner_1.runner.findNPMPath();
                            runner_1.runner.runit(client, runfolder, streamid, npmpath, ["run", "start"], true, env);
                            return [2 /*return*/, { exitcode: 0, stream: s }];
                        }
                        runner_1.runner.runit(client, runfolder, streamid, nodePath, [command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 34: return [3 /*break*/, 42];
                    case 35:
                        if (!command.endsWith(".ps1")) return [3 /*break*/, 39];
                        pwshPath = runner_1.runner.findPwShPath();
                        if (pwshPath == "")
                            throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH));
                        if (!wait) return [3 /*break*/, 37];
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env)];
                    case 36:
                        exitcode = _f.sent();
                        return [2 /*return*/, { exitcode: exitcode, stream: s }];
                    case 37:
                        runner_1.runner.runit(client, runfolder, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 38: return [3 /*break*/, 42];
                    case 39:
                        dotnet = runner_1.runner.findDotnetPath();
                        if (dotnet == "")
                            throw new Error("Failed locating dotnet, is dotnet installed and in the path?");
                        if (!wait) return [3 /*break*/, 41];
                        _e = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, dotnet, ["run"], true, env)];
                    case 40: return [2 /*return*/, (_e.exitcode = _f.sent(), _e.stream = s, _e)];
                    case 41:
                        runner_1.runner.runit(client, runfolder, streamid, dotnet, ["run"], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 42: return [3 /*break*/, 44];
                    case 43:
                        error_9 = _f.sent();
                        console.error(error_9.message);
                        runner_1.runner.notifyStream(client, streamid, error_9.message);
                        runner_1.runner.removestream(client, streamid, false, "");
                        return [3 /*break*/, 44];
                    case 44: return [2 /*return*/, { exitcode: 0, stream: null }];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcGFja2FnZW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qix1QkFBd0I7QUFDeEIsZ0NBQWtDO0FBQ2xDLHlCQUEyQjtBQUMzQiw0Q0FBMEM7QUFDMUMsbUNBQWlEO0FBQ2pELGlDQUFnQztBQUNoQywyQ0FBNEM7QUFDcEMsSUFBQSxJQUFJLEdBQVUsZ0JBQU0sS0FBaEIsRUFBRSxHQUFHLEdBQUssZ0JBQU0sSUFBWCxDQUFZO0FBcUI3QjtJQUFBO0lBdWRBLENBQUM7SUFwZGUsc0JBQU8sR0FBckI7UUFDRSxJQUFHLGNBQWMsQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO1lBQ2xDLE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQztTQUNoQztRQUNELGNBQWMsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZDLElBQUcsY0FBYyxDQUFDLFFBQVEsSUFBSSxHQUFHLElBQUksY0FBYyxDQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUU7WUFDbEUsSUFBRyxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksRUFBRTtnQkFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUE7Z0JBQ2hGLGNBQWMsQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFBO2FBQzFDO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLEVBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO2dCQUN2RSxjQUFjLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQTthQUNqQztTQUNGO1FBQ0QsT0FBTyxjQUFjLENBQUMsUUFBUSxDQUFDO0lBQ2pDLENBQUM7SUFDYSw0QkFBYSxHQUEzQjtRQUNFLElBQUcsY0FBYyxDQUFDLGNBQWMsSUFBSSxJQUFJLEVBQUU7WUFDeEMsT0FBTyxjQUFjLENBQUMsY0FBYyxDQUFDO1NBQ3RDO1FBQ0QsY0FBYyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUE7UUFDM0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDL0QsT0FBTyxjQUFjLENBQUMsY0FBYyxDQUFDO0lBQ3ZDLENBQUM7SUFHbUIsMEJBQVcsR0FBL0IsVUFBZ0MsTUFBZSxFQUFFLFNBQW1COzs7Ozs7d0JBQ2xFLElBQUcsTUFBTSxJQUFJLElBQUksRUFBRTs0QkFDakIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDO2dDQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7NEJBQ2xILFNBQVMsR0FBZSxFQUFFLENBQUM7NEJBQzNCLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDOzRCQUMzRCxLQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0NBQ3BDLElBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTtpQ0FDcEI7cUNBQU0sSUFBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29DQUNoQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQ0FDdEcsSUFBRyxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksU0FBUzt3Q0FBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lDQUMvRDs2QkFDRjs0QkFDRCxjQUFjLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQTs0QkFDbkMsc0JBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUM7eUJBQzlDO3dCQUNlLHFCQUFNLE1BQU0sQ0FBQyxLQUFLLENBQVcsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFBOzt3QkFBdkksU0FBUyxHQUFHLFNBQTJIO3dCQUMzSSxjQUFjLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQTt3QkFDbkMsc0JBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUM7Ozs7S0FDaEQ7SUFDcUIsNEJBQWEsR0FBakMsVUFBa0MsTUFBZSxFQUFFLEVBQVUsRUFBRSxLQUFjOzs7Ozs0QkFDakUscUJBQU0sTUFBTSxDQUFDLE9BQU8sQ0FBVyxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFBOzt3QkFBNUcsR0FBRyxHQUFHLFNBQXNHO3dCQUNoSCxJQUFHLEdBQUcsSUFBSSxJQUFJOzRCQUFFLHNCQUFPLElBQUksRUFBQzt3QkFDNUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDOzRCQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQ3RILElBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRTs0QkFDNUYsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzs0QkFDcEgsSUFBRyxRQUFRLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxPQUFPO2dDQUFFLHNCQUFPLEdBQUcsRUFBQzt5QkFDaEQ7d0JBQ0QsY0FBYyxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOzZCQUM1RixDQUFBLEdBQUcsQ0FBQyxNQUFNLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFBLEVBQXRDLHdCQUFzQzt3QkFDeEMscUJBQU0sY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBQTs7d0JBQXZELFNBQXVELENBQUM7Ozs7OztLQUUzRDtJQUNtQiw2QkFBYyxHQUFsQyxVQUFtQyxNQUFlLEVBQUUsU0FBbUIsRUFBRSxLQUFjOzs7Ozs0QkFDdEUscUJBQU0sY0FBYyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLEVBQUE7O3dCQUE5RCxRQUFRLEdBQUcsU0FBbUQ7d0JBQ2xFLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQzs0QkFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUM3RyxDQUFDLEdBQUcsQ0FBQzs7OzZCQUFFLENBQUEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUE7Ozs7d0JBRS9CLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQzs0QkFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUN0SCxJQUFHLEtBQUssSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUU7NEJBQ3BHLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7NEJBQzVILElBQUcsUUFBUSxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztnQ0FBRSx3QkFBUzt5QkFDdEQ7d0JBQ0QsY0FBYyxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOzZCQUNwRyxDQUFBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFBLEVBQXRELHdCQUFzRDt3QkFDeEQscUJBQU0sY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBQTs7d0JBQS9ELFNBQStELENBQUM7Ozs7O3dCQUdsRSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQUssQ0FBQyxDQUFDOzs7d0JBWlksQ0FBQyxFQUFFLENBQUE7OzRCQWV4QyxzQkFBTyxRQUFRLEVBQUM7Ozs7S0FDakI7SUFDbUIseUJBQVUsR0FBOUIsVUFBK0IsTUFBZSxFQUFFLEVBQVUsRUFBRSxRQUFpQjs7Ozs7O3dCQUMzRSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLENBQUM7NEJBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDbEgsR0FBRyxHQUFhLElBQUksQ0FBQzs2QkFDdEIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBdEUsd0JBQXNFO3dCQUN2RSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7NkJBQ2xHLENBQUEsR0FBRyxDQUFDLE1BQU0sSUFBSSxPQUFPLElBQUksYUFBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksYUFBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUEsRUFBeEUsd0JBQXdFO3dCQUNyRSxVQUFVLEdBQWUsSUFBSSxDQUFDOzs7O3dCQUluQixxQkFBTSxNQUFNLENBQUMsS0FBSyxDQUFXLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUE7O3dCQUYvRyx1RkFBdUY7d0JBQ3ZGLG9IQUFvSDt3QkFDcEgsVUFBVSxHQUFHLFNBQWtHLENBQUM7Ozs7Ozt3QkFHbEgsSUFBRyxVQUFVLElBQUksSUFBSSxFQUFFOzRCQUNyQixJQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO2dDQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsR0FBRyxFQUFFLEdBQUcsb0JBQW9CLENBQUMsQ0FBQzs2QkFDMUQ7NEJBQ0QsSUFBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUU7Z0NBQ3JDLEdBQUcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3BCLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO2dDQUNqRyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7Z0NBQy9ELElBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQ0FDckIsV0FBVyxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO29DQUNuSCxJQUFHLFdBQVcsSUFBSSxJQUFJLElBQUksV0FBVyxJQUFJLEVBQUU7d0NBQUUsc0JBQU8sR0FBRyxFQUFDO29DQUN4RCx5Q0FBeUM7b0NBQ3pDLDBCQUEwQjtvQ0FDMUIsZ0JBQWdCO29DQUNoQixJQUFJO2lDQUNMOzZCQUNGO2lDQUFNO2dDQUNMLEdBQUcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3BCLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBOzZCQUN4Rzt5QkFDRjs7Ozs2QkFHQSxDQUFBLGFBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxJQUFJLGFBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFBLEVBQS9DLHdCQUErQzt3QkFDMUMscUJBQU0sTUFBTSxDQUFDLE9BQU8sQ0FBVyxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFBOzt3QkFBMUcsR0FBRyxHQUFHLFNBQW9HLENBQUM7d0JBQzNHLElBQUcsR0FBRyxJQUFJLElBQUk7NEJBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7Ozt3QkFHM0gsSUFBRyxHQUFHLElBQUksSUFBSTs0QkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixHQUFHLEVBQUUsQ0FBQyxDQUFDO3dCQUNqRSxJQUFHLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTs0QkFDcEQsc0JBQU8sR0FBRyxFQUFDO3lCQUNaO3dCQUNELElBQUcsUUFBUSxJQUFJLEtBQUssRUFBRTs0QkFDcEIsc0JBQU8sR0FBRyxFQUFDO3lCQUNaO3dCQUNHLFFBQVEsR0FBRyxFQUFFLENBQUM7NkJBQ2YsQ0FBQSxHQUFHLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQSxFQUFyQix5QkFBcUI7Ozs7d0JBRU4scUJBQU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxFQUFBOzt3QkFBN0YsS0FBSyxHQUFHLFNBQXFGO3dCQUNuRyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7O3dCQUVyRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQUssQ0FBQyxDQUFDOzs7NkJBRWxCLENBQUEsUUFBUSxJQUFJLEVBQUUsQ0FBQSxFQUFkLHlCQUFjO3dCQUNULHFCQUFNLE1BQU0sQ0FBQyxPQUFPLENBQVcsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBQTs7d0JBQTFHLEdBQUcsR0FBRyxTQUFvRyxDQUFDO3dCQUMzRyxJQUFHLEdBQUcsSUFBSSxJQUFJOzRCQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBOzs7O3dCQUV2RyxxQkFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLEVBQUE7O3dCQUE3RixLQUFLLEdBQUcsU0FBcUY7d0JBQ25HLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7Ozt3QkFJekUsSUFBRyxRQUFRLElBQUksRUFBRSxFQUFFOzRCQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzt5QkFDM0Q7Ozs7NkJBR0csQ0FBQSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLE1BQU0sQ0FBQSxFQUFoQyx5QkFBZ0M7d0JBQ2xDLGNBQWMsQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUMzRixxQkFBTSxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sSUFBSyxPQUFBLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQXpCLENBQXlCLENBQUMsRUFBQTs7d0JBQXpELFNBQXlELENBQUM7d0JBQ3RELEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDL0IsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7OzZCQUM3RCxDQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksTUFBTSxDQUFBLEVBQXZFLHlCQUF1RTt3QkFDNUUsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUN6RCxjQUFjLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2xELHFCQUFNLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxJQUFLLE9BQUEsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBekIsQ0FBeUIsQ0FBQyxFQUFBOzt3QkFBekQsU0FBeUQsQ0FBQzt3QkFDMUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQ3hCLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7eUJBQ3pDOzs7O3dCQUVDLHFCQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQ1YsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsQ0FBQyxFQUFFLElBQUk7NkJBQ1IsQ0FBQyxFQUFBOzt3QkFIRixTQUdFLENBQUE7Ozs7d0JBRUYsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFLLENBQUMsQ0FBQTt3QkFDcEIscUJBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQ0FDVixJQUFJLEVBQUUsUUFBUTtnQ0FDZCxDQUFDLEVBQUUsSUFBSTs2QkFDUixDQUFDLEVBQUE7O3dCQUhGLFNBR0UsQ0FBQTs7Ozs7d0JBSU4sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFLLENBQUMsQ0FBQzt3QkFDckIsTUFBTSxPQUFLLENBQUE7O3dCQUVYLElBQUcsUUFBUSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQzs0QkFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN0RSxzQkFBTyxHQUFHLEVBQUM7Ozs7O0tBRWQ7SUFDYSw2QkFBYyxHQUE1QixVQUE2QixXQUFtQixFQUFFLEtBQXFCO1FBQXJCLHNCQUFBLEVBQUEsWUFBcUI7UUFDckUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDOUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDekUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDekUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsNEJBQTRCO1FBQzVCLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDMUMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMs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