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
                            return [2 /*return*/, _packages];
                        }
                        return [4 /*yield*/, client.Query({ query: { "_type": "package", "language": { "$in": languages } }, collectionname: "agents" })];
                    case 1:
                        _packages = _a.sent();
                        return [2 /*return*/, _packages];
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
                        fs.writeFileSync(path.join(packagemanager.packagefolder, pkg._id + ".json"), JSON.stringify(pkg, null, 2));
                        if (!(pkg.fileid != null && pkg.fileid != "")) return [3 /*break*/, 3];
                        console.log("get package " + pkg.name);
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
                        fs.writeFileSync(path.join(packagemanager.packagefolder, packages[i]._id + ".json"), JSON.stringify(packages[i], null, 2));
                        if (!(packages[i].fileid != null && packages[i].fileid != "")) return [3 /*break*/, 5];
                        console.log("get package " + packages[i].name + " v" + packages[i].version + " " + packages[i]._id);
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
            var pkg, reply, filename, zip, dest, error_2, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fs.existsSync(packagemanager.packagefolder))
                            fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
                        pkg = null;
                        if (!fs.existsSync(path.join(packagemanager.packagefolder, id + ".json"))) return [3 /*break*/, 1];
                        pkg = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder, id + ".json")).toString());
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, client.FindOne({ collectionname: "agents", query: { _id: id, "_type": "package" } })];
                    case 2:
                        pkg = _a.sent();
                        if (pkg != null)
                            fs.writeFileSync(path.join(packagemanager.packagefolder, id + ".json"), JSON.stringify(pkg, null, 2));
                        _a.label = 3;
                    case 3:
                        if (pkg == null)
                            throw new Error("Failed to find package: " + id);
                        return [4 /*yield*/, client.DownloadFile({ id: pkg.fileid, folder: packagemanager.packagefolder })];
                    case 4:
                        reply = _a.sent();
                        filename = path.join(packagemanager.packagefolder, reply.filename);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 11, 12, 13]);
                        if (!(path.extname(filename) == ".zip")) return [3 /*break*/, 6];
                        zip = new AdmZip(filename);
                        zip.extractAllTo(path.join(packagemanager.packagefolder, id), true);
                        return [3 /*break*/, 10];
                    case 6:
                        if (!(path.extname(filename) == ".tar.gz" || path.extname(filename) == ".tgz")) return [3 /*break*/, 10];
                        dest = path.join(packagemanager.packagefolder, id);
                        if (!fs.existsSync(dest)) {
                            fs.mkdirSync(dest, { recursive: true });
                        }
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, tar.x({
                                file: filename,
                                C: dest
                            })];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        error_2 = _a.sent();
                        console.error(error_2);
                        throw error_2;
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        error_3 = _a.sent();
                        console.error(error_3);
                        throw error_3;
                    case 12:
                        fs.unlinkSync(filename);
                        return [2 /*return*/, pkg];
                    case 13: return [2 /*return*/];
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
    packagemanager.addstream = function (streamid, streamqueue, stream) {
        var s = runner_1.runner.streams.find(function (x) { return x.id == streamid; });
        if (s != null)
            throw new Error("Stream " + streamid + " already exists");
        s = new runner_1.runner_stream();
        s.id = streamid;
        s.stream = stream;
        s.streamqueue = streamqueue;
        runner_1.runner.streams.push(s);
        return s;
    };
    packagemanager.runpackage = function (client, id, streamid, streamqueue, stream, wait) {
        return __awaiter(this, void 0, void 0, function () {
            var s, pck, packagepath, command, python, nodePath, pwshPath, exitcode, dotnet, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (streamid == null || streamid == "")
                            throw new Error("streamid is null or empty");
                        if (packagemanager.packagefolder == null || packagemanager.packagefolder == "")
                            throw new Error("packagemanager.packagefolder is null or empty");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 22, , 23]);
                        s = packagemanager.addstream(streamid, streamqueue, stream);
                        return [4 /*yield*/, packagemanager.getpackage(client, id)];
                    case 2:
                        pck = _a.sent();
                        if (pck == null)
                            throw new Error("Failed to find package: " + id);
                        s.packagename = pck.name;
                        s.packageid = pck._id;
                        packagepath = packagemanager.getpackagepath(path.join(packagemanager.packagefolder, id));
                        if (!fs.existsSync(packagepath)) return [3 /*break*/, 20];
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null)
                            throw new Error("Failed locating a command to run, EXIT");
                        if (!command.endsWith(".py")) return [3 /*break*/, 7];
                        python = runner_1.runner.findPythonPath();
                        if (python == "")
                            throw new Error("Failed locating python, is python installed and in the path?");
                        return [4 /*yield*/, runner_1.runner.pipinstall(client, packagepath, streamid, python)];
                    case 3:
                        _a.sent();
                        if (!wait) return [3 /*break*/, 5];
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, python, ["-u", command], true)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        runner_1.runner.runit(client, packagepath, streamid, python, ["-u", command], true);
                        return [2 /*return*/, 0];
                    case 6: return [3 /*break*/, 19];
                    case 7:
                        if (!(command.endsWith(".js") || command == "npm run start")) return [3 /*break*/, 12];
                        nodePath = runner_1.runner.findNodePath();
                        if (nodePath == "")
                            throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH));
                        return [4 /*yield*/, runner_1.runner.npminstall(client, packagepath, streamid)];
                    case 8:
                        _a.sent();
                        if (!wait) return [3 /*break*/, 10];
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, nodePath, [command], true)];
                    case 9: return [2 /*return*/, _a.sent()];
                    case 10:
                        runner_1.runner.runit(client, packagepath, streamid, nodePath, [command], true);
                        return [2 /*return*/, 0];
                    case 11: return [3 /*break*/, 19];
                    case 12:
                        if (!command.endsWith(".ps1")) return [3 /*break*/, 16];
                        pwshPath = runner_1.runner.findPwShPath();
                        if (pwshPath == "")
                            throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH));
                        if (!wait) return [3 /*break*/, 14];
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true)];
                    case 13:
                        exitcode = _a.sent();
                        return [2 /*return*/, exitcode];
                    case 14:
                        runner_1.runner.runit(client, packagepath, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true);
                        return [2 /*return*/, 0];
                    case 15: return [3 /*break*/, 19];
                    case 16:
                        dotnet = runner_1.runner.findDotnetPath();
                        if (dotnet == "")
                            throw new Error("Failed locating dotnet, is dotnet installed and in the path?");
                        if (!wait) return [3 /*break*/, 18];
                        return [4 /*yield*/, runner_1.runner.runit(client, packagepath, streamid, dotnet, ["run"], true)];
                    case 17: return [2 /*return*/, _a.sent()];
                    case 18:
                        runner_1.runner.runit(client, packagepath, streamid, dotnet, ["run"], true);
                        return [2 /*return*/, 0];
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        if (packagepath == null || packagepath == "") {
                            runner_1.runner.notifyStream(client, streamid, "Package not found in " + packagemanager.packagefolder);
                        }
                        else {
                            runner_1.runner.notifyStream(client, streamid, "Package not found in " + packagepath);
                        }
                        runner_1.runner.removestream(client, streamid, false, "");
                        _a.label = 21;
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        error_4 = _a.sent();
                        runner_1.runner.notifyStream(client, streamid, error_4.message);
                        runner_1.runner.removestream(client, streamid, false, "");
                        return [3 /*break*/, 23];
                    case 23: return [2 /*return*/, 0];
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
    return packagemanager;
}());
exports.packagemanager = packagemanager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcGFja2FnZW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qix1QkFBd0I7QUFDeEIsZ0NBQWtDO0FBQ2xDLHlCQUEyQjtBQUMzQiw0Q0FBMEM7QUFDMUMsbUNBQWlEO0FBQ3pDLElBQUEsSUFBSSxHQUFVLGdCQUFNLEtBQWhCLEVBQUUsR0FBRyxHQUFLLGdCQUFNLElBQVgsQ0FBWTtBQWE3QjtJQUFBO0lBME9BLENBQUM7SUF4T3FCLDBCQUFXLEdBQS9CLFVBQWdDLE1BQWUsRUFBRSxTQUFtQjs7Ozs7O3dCQUNsRSxJQUFHLE1BQU0sSUFBSSxJQUFJLEVBQUU7NEJBQ2pCLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUM7Z0NBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7NEJBQzlHLFNBQVMsR0FBZSxFQUFFLENBQUM7NEJBQzNCLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFDekQsS0FBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dDQUNwQyxJQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7b0NBQ3pCLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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TyxXQUFXLENBQUM7UUFDOUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDekUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDekUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsNEJBQTRCO1FBQzVCLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDMUMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFL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