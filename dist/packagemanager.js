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
var Logger_1 = require("./Logger");
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
                Logger_1.Logger.instrumentation.info("homedir overriden to /home/openiap from: " + packagemanager._homedir, {});
                packagemanager._homedir = "/home/openiap";
            }
            else {
                Logger_1.Logger.instrumentation.info("homedir overriden to /tmp from: " + packagemanager._homedir, {});
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
        Logger_1.Logger.instrumentation.info("packagefolder as: " + packagemanager._packagefolder, {});
        return packagemanager._packagefolder;
    };
    packagemanager.getpackages = function (client, languages) {
        return __awaiter(this, void 0, void 0, function () {
            var _packages_1, files, i, pkg, _packages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (client == null) {
                            if (!fs.existsSync(packagemanager.packagefolder()))
                                fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
                            _packages_1 = [];
                            files = fs.readdirSync(packagemanager.packagefolder());
                            for (i = 0; i < files.length; i++) {
                                if (files[i] == null) {
                                }
                                else if (files[i].endsWith(".json")) {
                                    pkg = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder(), files[i])).toString());
                                    if (pkg != null && pkg._type == "package")
                                        _packages_1.push(pkg);
                                }
                            }
                            packagemanager.packages = _packages_1;
                            return [2 /*return*/, JSON.parse(JSON.stringify(_packages_1))];
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
                        Logger_1.Logger.instrumentation.error(error_1, {});
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
                        if (id == null || id == "") {
                            throw new Error("package id is null or empty");
                        }
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
                        Logger_1.Logger.instrumentation.error(error_3, { packageid: id });
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
                        Logger_1.Logger.instrumentation.error(error_5, { packageid: id });
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
                        Logger_1.Logger.instrumentation.error(error_6, { packageid: id });
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
                            Logger_1.Logger.instrumentation.info("port " + port + " is in use, using " + newport + " instead for " + pck.ports[i].portname, { streamid: streamid });
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
                            Logger_1.Logger.instrumentation.info("port " + port + " is in use, using " + newport + " instead for envoriment variable PORT", { streamid: streamid });
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
    packagemanager.preparepackage = function (client, packageid, streamid) {
        return __awaiter(this, void 0, void 0, function () {
            var pck, error_7, packagepath, java, command, php, composefile, vendorfolder, command, cargo, pwshPath, command, shellPath, command, stats, dotnet, command, args, command, condaname, python, conda, lockfile, nodePath, lockfile, pwshPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (packagemanager.packagefolder() == null || packagemanager.packagefolder() == "")
                            throw new Error("packagemanager.packagefolder is null or empty");
                        pck = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, packagemanager.getpackage(client, packageid, true)];
                    case 2:
                        pck = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        throw error_7;
                    case 4:
                        if (pck == null) {
                            throw new Error("Failed to find package: " + packageid);
                        }
                        packagepath = packagemanager.getpackagepath(path.join(packagemanager.packagefolder(), packageid));
                        if (!fs.existsSync(packagepath)) {
                            throw new Error("Failed to find package: " + packageid);
                        }
                        if (!(pck.language == "java")) return [3 /*break*/, 5];
                        java = runner_1.runner.findJavaPath();
                        if (java == "")
                            throw new Error("Failed locating java, is java installed and in the path?");
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        return [3 /*break*/, 25];
                    case 5:
                        if (!(pck.language == "php")) return [3 /*break*/, 8];
                        php = runner_1.runner.findPhpPath();
                        if (php == "")
                            throw new Error("Failed locating php, is php installed and in the path?");
                        composefile = path.join(packagepath, "composer.json");
                        vendorfolder = path.join(packagepath, "vendor");
                        if (!fs.existsSync(composefile)) return [3 /*break*/, 7];
                        if (!!fs.existsSync(vendorfolder)) return [3 /*break*/, 7];
                        return [4 /*yield*/, runner_1.runner.composerinstall(client, packagepath, streamid)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        return [3 /*break*/, 25];
                    case 8:
                        if (!(pck.language == "rust")) return [3 /*break*/, 9];
                        cargo = runner_1.runner.findCargoPath();
                        if (cargo == "")
                            throw new Error("Failed locating cargo, is rust installed and in the path?");
                        return [3 /*break*/, 25];
                    case 9:
                        if (!(pck.language == "powershell")) return [3 /*break*/, 10];
                        pwshPath = runner_1.runner.findPwShPath();
                        if (pwshPath == "")
                            throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH));
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        return [3 /*break*/, 25];
                    case 10:
                        if (!(pck.language == "shell")) return [3 /*break*/, 11];
                        shellPath = runner_1.runner.findShellPath();
                        if (shellPath == "")
                            throw new Error("Failed locating shell, is bash or sh installed and in the path? " + JSON.stringify(process.env.PATH));
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        if (!fs.existsSync(command)) {
                            throw new Error("Failed to find script: " + command);
                        }
                        stats = fs.statSync(command);
                        if ((stats.mode & 73) == 0) {
                            fs.chmodSync(command, 493);
                        }
                        return [3 /*break*/, 25];
                    case 11:
                        if (!(pck.language == "dotnet")) return [3 /*break*/, 12];
                        dotnet = runner_1.runner.findDotnetPath();
                        if (dotnet == "")
                            throw new Error("Failed locating dotnet, is dotnet installed and in the path?");
                        return [3 /*break*/, 25];
                    case 12:
                        if (!(pck.language == "exec")) return [3 /*break*/, 13];
                        command = runner_1.runner.getExecutablePath(packagepath, pck.main);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        args = [];
                        if (pck.main != null && pck.main != "" && pck.main.indexOf(" ") > 0) {
                            args = pck.main.split(" ").slice(1);
                        }
                        return [3 /*break*/, 25];
                    case 13:
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        condaname = null;
                        python = runner_1.runner.findPythonPath();
                        conda = runner_1.runner.findCondaPath();
                        if (!command.endsWith(".py")) return [3 /*break*/, 21];
                        if (python == "" && conda == "")
                            throw new Error("Failed locating python or conda or micromamba, if installed is it added to the path environment variable?");
                        lockfile = path.join(packagepath, "conda.lock");
                        if (!!fs.existsSync(lockfile)) return [3 /*break*/, 18];
                        if (!(conda != null && conda != "")) return [3 /*break*/, 15];
                        return [4 /*yield*/, runner_1.runner.condainstall(client, packagepath, streamid, conda)];
                    case 14:
                        condaname = _a.sent();
                        _a.label = 15;
                    case 15:
                        if (!(condaname == null && (python != null && python != ""))) return [3 /*break*/, 17];
                        return [4 /*yield*/, runner_1.runner.pipinstall(client, packagepath, streamid, python)];
                    case 16:
                        _a.sent();
                        _a.label = 17;
                    case 17:
                        fs.writeFileSync(lockfile, "installed");
                        return [3 /*break*/, 20];
                    case 18: return [4 /*yield*/, runner_1.runner.condainstall(client, packagepath, streamid, conda)];
                    case 19:
                        condaname = _a.sent();
                        _a.label = 20;
                    case 20: return [3 /*break*/, 25];
                    case 21:
                        if (!(command.endsWith(".js") || command == "npm run start")) return [3 /*break*/, 24];
                        nodePath = runner_1.runner.findNodePath();
                        if (nodePath == "")
                            throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH));
                        lockfile = path.join(packagepath, "npm.lock");
                        if (!!fs.existsSync(lockfile)) return [3 /*break*/, 23];
                        return [4 /*yield*/, runner_1.runner.npminstall(client, packagepath, streamid)];
                    case 22:
                        _a.sent();
                        fs.writeFileSync(lockfile, "installed");
                        _a.label = 23;
                    case 23: return [3 /*break*/, 25];
                    case 24:
                        if (command.endsWith(".ps1")) {
                            pwshPath = runner_1.runner.findPwShPath();
                            if (pwshPath == "")
                                throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH));
                        }
                        else {
                        }
                        _a.label = 25;
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    packagemanager.runpackage = function (client, packageid, streamid, streamqueues, stream, wait, env, schedule) {
        if (env === void 0) { env = {}; }
        if (schedule === void 0) { schedule = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var pck, s, error_8, processcount, processes, i, p, message, i_1, streamqueue, error_9, packagepath, runfolder, java, command, php, composefile, vendorfolder, command, cargo, pwshPath, command, shellPath, command, stats, dotnet, command, args, command, condaname, python, conda, lockfile, nodePath, lockfile, pwshPath, nodePath, npmpath, npmpath, pwshPath, exitcode, error_10;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        if (streamid == null || streamid == "")
                            throw new Error("streamid is null or empty");
                        if (packagemanager.packagefolder() == null || packagemanager.packagefolder() == "")
                            throw new Error("packagemanager.packagefolder is null or empty");
                        _m.label = 1;
                    case 1:
                        _m.trys.push([1, 73, , 74]);
                        pck = null;
                        s = null;
                        _m.label = 2;
                    case 2:
                        _m.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, packagemanager.getpackage(client, packageid, true)];
                    case 3:
                        pck = _m.sent();
                        return [4 /*yield*/, packagemanager.addstream(client, streamid, streamqueues, stream, pck, env)];
                    case 4:
                        s = _m.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_8 = _m.sent();
                        throw error_8;
                    case 6:
                        if (!(s == null)) return [3 /*break*/, 8];
                        return [4 /*yield*/, packagemanager.addstream(client, streamid, streamqueues, stream, pck, env)];
                    case 7:
                        s = _m.sent();
                        _m.label = 8;
                    case 8:
                        if (pck == null) {
                            throw new Error("Failed to find package: " + packageid);
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
                        _m.label = 9;
                    case 9:
                        if (!(i_1 >= 0)) return [3 /*break*/, 14];
                        streamqueue = runner_1.runner.commandstreams[i_1];
                        if (!(streamqueue != streamid)) return [3 /*break*/, 13];
                        _m.label = 10;
                    case 10:
                        _m.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, client.QueueMessage({ queuename: streamqueue, data: message, correlationId: streamid })];
                    case 11:
                        _m.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        error_9 = _m.sent();
                        Logger_1.Logger.instrumentation.info("runpackage, remove streamqueue " + streamqueue, { packageid: packageid, streamid: streamid });
                        runner_1.runner.commandstreams.splice(i_1, 1);
                        return [3 /*break*/, 13];
                    case 13:
                        i_1--;
                        return [3 /*break*/, 9];
                    case 14:
                        packagepath = packagemanager.getpackagepath(path.join(packagemanager.packagefolder(), packageid));
                        runfolder = path.join(packagemanager.homedir(), ".openiap", "runtime", streamid);
                        if (!fs.existsSync(packagepath)) {
                            throw new Error("Failed to find package: " + packageid);
                        }
                        if (!(pck.language == "java")) return [3 /*break*/, 18];
                        java = runner_1.runner.findJavaPath();
                        if (java == "")
                            throw new Error("Failed locating java, is java installed and in the path?");
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        if (!fs.existsSync(runfolder))
                            fs.mkdirSync(runfolder, { recursive: true });
                        fs.cpSync(packagepath, runfolder, { recursive: true });
                        if (!wait) return [3 /*break*/, 16];
                        _a = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, java, ["-jar", command], true, env)];
                    case 15: return [2 /*return*/, (_a.exitcode = _m.sent(), _a.stream = s, _a)];
                    case 16:
                        runner_1.runner.runit(client, runfolder, streamid, java, ["-jar", command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 17: return [3 /*break*/, 72];
                    case 18:
                        if (!(pck.language == "php")) return [3 /*break*/, 24];
                        php = runner_1.runner.findPhpPath();
                        if (php == "")
                            throw new Error("Failed locating php, is php installed and in the path?");
                        composefile = path.join(packagepath, "composer.json");
                        vendorfolder = path.join(packagepath, "vendor");
                        if (!fs.existsSync(composefile)) return [3 /*break*/, 20];
                        if (!!fs.existsSync(vendorfolder)) return [3 /*break*/, 20];
                        return [4 /*yield*/, runner_1.runner.composerinstall(client, packagepath, streamid)];
                    case 19:
                        _m.sent();
                        _m.label = 20;
                    case 20:
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        if (!fs.existsSync(runfolder))
                            fs.mkdirSync(runfolder, { recursive: true });
                        fs.cpSync(packagepath, runfolder, { recursive: true });
                        if (!wait) return [3 /*break*/, 22];
                        _b = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, php, [command], true, env)];
                    case 21: return [2 /*return*/, (_b.exitcode = _m.sent(), _b.stream = s, _b)];
                    case 22:
                        runner_1.runner.runit(client, runfolder, streamid, php, [command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 23: return [3 /*break*/, 72];
                    case 24:
                        if (!(pck.language == "rust")) return [3 /*break*/, 28];
                        cargo = runner_1.runner.findCargoPath();
                        if (cargo == "")
                            throw new Error("Failed locating cargo, is rust installed and in the path?");
                        if (!fs.existsSync(runfolder))
                            fs.mkdirSync(runfolder, { recursive: true });
                        fs.cpSync(packagepath, runfolder, { recursive: true });
                        if (!wait) return [3 /*break*/, 26];
                        _c = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, cargo, ["run"], true, env)];
                    case 25: return [2 /*return*/, (_c.exitcode = _m.sent(), _c.stream = s, _c)];
                    case 26:
                        runner_1.runner.runit(client, runfolder, streamid, cargo, ["run"], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 27: return [3 /*break*/, 72];
                    case 28:
                        if (!(pck.language == "powershell")) return [3 /*break*/, 32];
                        pwshPath = runner_1.runner.findPwShPath();
                        if (pwshPath == "")
                            throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH));
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        if (!fs.existsSync(runfolder))
                            fs.mkdirSync(runfolder, { recursive: true });
                        fs.cpSync(packagepath, runfolder, { recursive: true });
                        if (!wait) return [3 /*break*/, 30];
                        _d = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env)];
                    case 29: return [2 /*return*/, (_d.exitcode = _m.sent(), _d.stream = s, _d)];
                    case 30:
                        runner_1.runner.runit(client, runfolder, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 31: return [3 /*break*/, 72];
                    case 32:
                        if (!(pck.language == "shell")) return [3 /*break*/, 36];
                        shellPath = runner_1.runner.findShellPath();
                        if (shellPath == "")
                            throw new Error("Failed locating shell, is bash or sh installed and in the path? " + JSON.stringify(process.env.PATH));
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        if (!fs.existsSync(command)) {
                            throw new Error("Failed to find script: " + command);
                        }
                        stats = fs.statSync(command);
                        if ((stats.mode & 73) == 0) {
                            fs.chmodSync(command, 493);
                        }
                        if (!fs.existsSync(runfolder))
                            fs.mkdirSync(runfolder, { recursive: true });
                        fs.cpSync(packagepath, runfolder, { recursive: true });
                        if (!wait) return [3 /*break*/, 34];
                        _e = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, shellPath, ["-c", command], true, env)];
                    case 33: return [2 /*return*/, (_e.exitcode = _m.sent(), _e.stream = s, _e)];
                    case 34:
                        runner_1.runner.runit(client, runfolder, streamid, shellPath, ["-c", command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 35: return [3 /*break*/, 72];
                    case 36:
                        if (!(pck.language == "dotnet")) return [3 /*break*/, 40];
                        dotnet = runner_1.runner.findDotnetPath();
                        if (dotnet == "")
                            throw new Error("Failed locating dotnet, is dotnet installed and in the path?");
                        if (!fs.existsSync(runfolder))
                            fs.mkdirSync(runfolder, { recursive: true });
                        fs.cpSync(packagepath, runfolder, { recursive: true });
                        if (!wait) return [3 /*break*/, 38];
                        _f = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, dotnet, ["run"], true, env)];
                    case 37: return [2 /*return*/, (_f.exitcode = _m.sent(), _f.stream = s, _f)];
                    case 38:
                        runner_1.runner.runit(client, runfolder, streamid, dotnet, ["run"], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 39: return [3 /*break*/, 72];
                    case 40:
                        if (!(pck.language == "exec")) return [3 /*break*/, 44];
                        if (!fs.existsSync(runfolder))
                            fs.mkdirSync(runfolder, { recursive: true });
                        fs.cpSync(packagepath, runfolder, { recursive: true });
                        command = runner_1.runner.getExecutablePath(packagepath, pck.main);
                        args = [];
                        if (pck.main != null && pck.main != "" && pck.main.indexOf(" ") > 0) {
                            args = pck.main.split(" ").slice(1);
                        }
                        if (!wait) return [3 /*break*/, 42];
                        _g = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, command, args, true, env)];
                    case 41: return [2 /*return*/, (_g.exitcode = _m.sent(), _g.stream = s, _g)];
                    case 42:
                        runner_1.runner.runit(client, runfolder, streamid, command, args, true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 43: return [3 /*break*/, 72];
                    case 44:
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run, EXIT");
                        }
                        condaname = null;
                        python = runner_1.runner.findPythonPath();
                        conda = runner_1.runner.findCondaPath();
                        if (!command.endsWith(".py")) return [3 /*break*/, 52];
                        if (python == "" && conda == "")
                            throw new Error("Failed locating python or conda or micromamba, if installed is it added to the path environment variable?");
                        lockfile = path.join(packagepath, "conda.lock");
                        if (!!fs.existsSync(lockfile)) return [3 /*break*/, 49];
                        if (!(conda != null && conda != "")) return [3 /*break*/, 46];
                        return [4 /*yield*/, runner_1.runner.condainstall(client, packagepath, streamid, conda)];
                    case 45:
                        condaname = _m.sent();
                        _m.label = 46;
                    case 46:
                        if (!(condaname == null && (python != null && python != ""))) return [3 /*break*/, 48];
                        return [4 /*yield*/, runner_1.runner.pipinstall(client, packagepath, streamid, python)];
                    case 47:
                        _m.sent();
                        _m.label = 48;
                    case 48:
                        fs.writeFileSync(lockfile, "installed");
                        return [3 /*break*/, 51];
                    case 49: return [4 /*yield*/, runner_1.runner.condainstall(client, packagepath, streamid, conda)];
                    case 50:
                        condaname = _m.sent();
                        _m.label = 51;
                    case 51: return [3 /*break*/, 56];
                    case 52:
                        if (!(command.endsWith(".js") || command == "npm run start")) return [3 /*break*/, 55];
                        nodePath = runner_1.runner.findNodePath();
                        if (nodePath == "")
                            throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH));
                        lockfile = path.join(packagepath, "npm.lock");
                        if (!!fs.existsSync(lockfile)) return [3 /*break*/, 54];
                        return [4 /*yield*/, runner_1.runner.npminstall(client, packagepath, streamid)];
                    case 53:
                        _m.sent();
                        fs.writeFileSync(lockfile, "installed");
                        _m.label = 54;
                    case 54: return [3 /*break*/, 56];
                    case 55:
                        if (command.endsWith(".ps1")) {
                            pwshPath = runner_1.runner.findPwShPath();
                            if (pwshPath == "")
                                throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH));
                        }
                        else {
                        }
                        _m.label = 56;
                    case 56:
                        if (!fs.existsSync(runfolder))
                            fs.mkdirSync(runfolder, { recursive: true });
                        fs.cpSync(packagepath, runfolder, { recursive: true });
                        command = packagemanager.getscriptpath(runfolder);
                        if (command == "" || command == null) {
                            throw new Error("Failed locating a command to run in run folder, EXIT");
                        }
                        if (!fs.existsSync(packagepath)) {
                            throw new Error("Failed to find package: " + packageid);
                        }
                        if (!command.endsWith(".py")) return [3 /*break*/, 61];
                        if (!wait) return [3 /*break*/, 60];
                        if (!(condaname != null)) return [3 /*break*/, 58];
                        Logger_1.Logger.instrumentation.info(conda, { packageid: packageid, streamid: streamid });
                        Logger_1.Logger.instrumentation.info(["run", "-n", condaname, "python", "-u", command].join(" "), { packageid: packageid, streamid: streamid });
                        _h = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, conda, ["run", "-n", condaname, "python", "-u", command], true, env)];
                    case 57: return [2 /*return*/, (_h.exitcode = _m.sent(), _h.stream = s, _h)];
                    case 58:
                        Logger_1.Logger.instrumentation.info(python, { packageid: packageid, streamid: streamid });
                        Logger_1.Logger.instrumentation.info(["-u", command].join(" "), { packageid: packageid, streamid: streamid });
                        _j = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, python, ["-u", command], true, env)];
                    case 59: return [2 /*return*/, (_j.exitcode = _m.sent(), _j.stream = s, _j)];
                    case 60:
                        if (condaname != null) {
                            Logger_1.Logger.instrumentation.info(conda, { packageid: packageid, streamid: streamid });
                            Logger_1.Logger.instrumentation.info(["run", "-n", condaname, "python", "-u", command].join(" "), { packageid: packageid, streamid: streamid });
                            runner_1.runner.runit(client, runfolder, streamid, conda, ["run", "-n", condaname, "python", "-u", command], true, env);
                            return [2 /*return*/, { exitcode: 0, stream: s }];
                        }
                        Logger_1.Logger.instrumentation.info(python, { packageid: packageid, streamid: streamid });
                        Logger_1.Logger.instrumentation.info(["-u", command].join(" "), { packageid: packageid, streamid: streamid });
                        runner_1.runner.runit(client, runfolder, streamid, python, ["-u", command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 61:
                        if (!(command.endsWith(".js") || command == "npm run start")) return [3 /*break*/, 67];
                        nodePath = runner_1.runner.findNodePath();
                        if (nodePath == "")
                            throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH));
                        if (!wait) return [3 /*break*/, 65];
                        if (!(command == "npm run start")) return [3 /*break*/, 63];
                        npmpath = runner_1.runner.findNPMPath();
                        _k = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, npmpath, ["run", "start"], true, env)];
                    case 62: return [2 /*return*/, (_k.exitcode = _m.sent(), _k.stream = s, _k)];
                    case 63:
                        _l = {};
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, nodePath, [command], true, env)];
                    case 64: return [2 /*return*/, (_l.exitcode = _m.sent(), _l.stream = s, _l)];
                    case 65:
                        if (command == "npm run start") {
                            npmpath = runner_1.runner.findNPMPath();
                            runner_1.runner.runit(client, runfolder, streamid, npmpath, ["run", "start"], true, env);
                            return [2 /*return*/, { exitcode: 0, stream: s }];
                        }
                        runner_1.runner.runit(client, runfolder, streamid, nodePath, [command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 66: return [3 /*break*/, 72];
                    case 67:
                        if (!command.endsWith(".ps1")) return [3 /*break*/, 71];
                        pwshPath = runner_1.runner.findPwShPath();
                        if (pwshPath == "")
                            throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH));
                        if (!wait) return [3 /*break*/, 69];
                        return [4 /*yield*/, runner_1.runner.runit(client, runfolder, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env)];
                    case 68:
                        exitcode = _m.sent();
                        return [2 /*return*/, { exitcode: exitcode, stream: s }];
                    case 69:
                        runner_1.runner.runit(client, runfolder, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env);
                        return [2 /*return*/, { exitcode: 0, stream: s }];
                    case 70: return [3 /*break*/, 72];
                    case 71:
                        Logger_1.Logger.instrumentation.error("failed to find a command to run", { packageid: packageid, streamid: streamid });
                        runner_1.runner.notifyStream(client, streamid, "failed to find a command to run");
                        return [2 /*return*/, { exitcode: 1, stream: s }];
                    case 72: return [3 /*break*/, 74];
                    case 73:
                        error_10 = _m.sent();
                        Logger_1.Logger.instrumentation.error(error_10.message, { packageid: packageid, streamid: streamid });
                        runner_1.runner.notifyStream(client, streamid, error_10.message);
                        runner_1.runner.removestream(client, streamid, false, "");
                        return [3 /*break*/, 74];
                    case 74: return [2 /*return*/, { exitcode: 0, stream: null }];
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
                        Logger_1.Logger.instrumentation.error(error.message + " while unlinkSync " + curPath, {});
                    }
                }
            });
            try {
                fs.rmdirSync(dirPath);
            }
            catch (error) {
                Logger_1.Logger.instrumentation.error(error.message + " while rmdirSync " + dirPath, {});
            }
        }
    };
    packagemanager._homedir = null;
    packagemanager._packagefolder = null;
    packagemanager.packages = [];
    return packagemanager;
}());
exports.packagemanager = packagemanager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcGFja2FnZW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qix1QkFBd0I7QUFDeEIsZ0NBQWtDO0FBQ2xDLHlCQUEyQjtBQUMzQiw0Q0FBMEM7QUFDMUMsbUNBQWlEO0FBQ2pELGlDQUFnQztBQUNoQywyQ0FBNEM7QUFDNUMsbUNBQWtDO0FBQzFCLElBQUEsSUFBSSxHQUFVLGdCQUFNLEtBQWhCLEVBQUUsR0FBRyxHQUFLLGdCQUFNLElBQVgsQ0FBWTtBQXFCN0I7SUFBQTtJQXFyQkEsQ0FBQztJQWxyQmUsc0JBQU8sR0FBckI7UUFDRSxJQUFJLGNBQWMsQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO1lBQ25DLE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQztTQUNoQztRQUNELGNBQWMsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZDLElBQUksY0FBYyxDQUFDLFFBQVEsSUFBSSxHQUFHLElBQUksY0FBYyxDQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUU7WUFDbkUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksRUFBRTtnQkFDMUMsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsMkNBQTJDLEdBQUcsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQTtnQkFDdEcsY0FBYyxDQUFDLFFBQVEsR0FBRyxlQUFlLENBQUE7YUFDMUM7aUJBQU07Z0JBQ0wsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLEdBQUcsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQTtnQkFDN0YsY0FBYyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUE7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