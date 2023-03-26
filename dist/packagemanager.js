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
    packagemanager.getpackage = function (client, fileid, id) {
        return __awaiter(this, void 0, void 0, function () {
            var reply, zip, dest, error_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.DownloadFile({ id: fileid })];
                    case 1:
                        reply = _a.sent();
                        if (!fs.existsSync(packagemanager.packagefolder))
                            fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, 9, 10]);
                        if (!(path.extname(reply.filename) == ".zip")) return [3 /*break*/, 3];
                        zip = new AdmZip(reply.filename);
                        zip.extractAllTo(path.join(packagemanager.packagefolder, id), true);
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(path.extname(reply.filename) == ".tar.gz" || path.extname(reply.filename) == ".tgz")) return [3 /*break*/, 7];
                        dest = path.join(packagemanager.packagefolder, id);
                        if (!fs.existsSync(dest)) {
                            fs.mkdirSync(dest, { recursive: true });
                        }
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, tar.x({
                                file: reply.filename,
                                C: dest
                            })];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error(error_1);
                        throw error_1;
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        error_2 = _a.sent();
                        console.error(error_2);
                        throw error_2;
                    case 9:
                        fs.unlinkSync(reply.filename);
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
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
    };
    packagemanager.runpackage = function (id, streamid, wait) {
        return __awaiter(this, void 0, void 0, function () {
            var packagepath, command, python, nodePath, dotnet, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (streamid == null || streamid == "")
                            throw new Error("streamid is null or empty");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 17, , 18]);
                        packagepath = packagemanager.getpackagepath(path.join(packagemanager.packagefolder, id));
                        if (!fs.existsSync(packagepath)) return [3 /*break*/, 15];
                        command = packagemanager.getscriptpath(packagepath);
                        if (command == "" || command == null)
                            throw new Error("Failed locating a command to run, EXIT");
                        if (!command.endsWith(".py")) return [3 /*break*/, 6];
                        python = runner_1.runner.findPythonPath();
                        return [4 /*yield*/, runner_1.runner.pipinstall(packagepath, streamid, python)];
                    case 2:
                        _a.sent();
                        if (!wait) return [3 /*break*/, 4];
                        return [4 /*yield*/, runner_1.runner.runit(packagepath, streamid, python, [command], true)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        runner_1.runner.runit(packagepath, streamid, python, [command], true);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 14];
                    case 6:
                        if (!(command.endsWith(".js") || command == "npm run start")) return [3 /*break*/, 11];
                        nodePath = runner_1.runner.findNodePath();
                        return [4 /*yield*/, runner_1.runner.npminstall(packagepath, streamid)];
                    case 7:
                        _a.sent();
                        if (!wait) return [3 /*break*/, 9];
                        return [4 /*yield*/, runner_1.runner.runit(packagepath, streamid, nodePath, [command], true)];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        runner_1.runner.runit(packagepath, streamid, nodePath, [command], true);
                        _a.label = 10;
                    case 10: return [3 /*break*/, 14];
                    case 11:
                        dotnet = runner_1.runner.findDotnetPath();
                        if (!wait) return [3 /*break*/, 13];
                        return [4 /*yield*/, runner_1.runner.runit(packagepath, streamid, dotnet, ["run"], true)];
                    case 12:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        runner_1.runner.runit(packagepath, streamid, dotnet, ["run"], true);
                        _a.label = 14;
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        if (packagepath == null || packagepath == "") {
                            runner_1.runner.notifyStream(streamid, "Package not found in " + packagemanager.packagefolder);
                        }
                        else {
                            runner_1.runner.notifyStream(streamid, "Package not found in " + packagepath);
                        }
                        runner_1.runner.removestream(streamid);
                        _a.label = 16;
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        error_3 = _a.sent();
                        runner_1.runner.notifyStream(streamid, error_3.message);
                        runner_1.runner.removestream(streamid);
                        return [3 /*break*/, 18];
                    case 18: return [2 /*return*/];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcGFja2FnZW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qix1QkFBd0I7QUFDeEIsZ0NBQWtDO0FBQ2xDLHlCQUEyQjtBQUMzQiw0Q0FBMEM7QUFDMUMsbUNBQWtDO0FBQzFCLElBQUEsSUFBSSxHQUFVLGdCQUFNLEtBQWhCLEVBQUUsR0FBRyxHQUFLLGdCQUFNLElBQVgsQ0FBWTtBQUM3QjtJQUFBO0lBdUlBLENBQUM7SUFySXFCLHlCQUFVLEdBQTlCLFVBQStCLE1BQWUsRUFBRSxNQUFjLEVBQUUsRUFBVTs7Ozs7NEJBQzFELHFCQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBQTs7d0JBQWpELEtBQUssR0FBRyxTQUF5Qzt3QkFDdkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQzs0QkFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzs7Ozs2QkFFNUcsQ0FBQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxNQUFNLENBQUEsRUFBdEMsd0JBQXNDO3dCQUNwQyxHQUFHLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUNyQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7OzZCQUMzRCxDQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFB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