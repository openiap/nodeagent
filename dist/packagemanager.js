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
            var reply, filename, zip, dest, error_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fs.existsSync(packagemanager.packagefolder))
                            fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
                        return [4 /*yield*/, client.DownloadFile({ id: fileid, folder: packagemanager.packagefolder })];
                    case 1:
                        reply = _a.sent();
                        filename = path.join(packagemanager.packagefolder, reply.filename);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, 9, 10]);
                        if (!(path.extname(filename) == ".zip")) return [3 /*break*/, 3];
                        zip = new AdmZip(filename);
                        zip.extractAllTo(path.join(packagemanager.packagefolder, id), true);
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(path.extname(filename) == ".tar.gz" || path.extname(filename) == ".tgz")) return [3 /*break*/, 7];
                        dest = path.join(packagemanager.packagefolder, id);
                        if (!fs.existsSync(dest)) {
                            fs.mkdirSync(dest, { recursive: true });
                        }
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, tar.x({
                                file: filename,
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
                        fs.unlinkSync(filename);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcGFja2FnZW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qix1QkFBd0I7QUFDeEIsZ0NBQWtDO0FBQ2xDLHlCQUEyQjtBQUMzQiw0Q0FBMEM7QUFDMUMsbUNBQWtDO0FBQzFCLElBQUEsSUFBSSxHQUFVLGdCQUFNLEtBQWhCLEVBQUUsR0FBRyxHQUFLLGdCQUFNLElBQVgsQ0FBWTtBQUM3QjtJQUFBO0lBd0lBLENBQUM7SUF0SXFCLHlCQUFVLEdBQTlCLFVBQStCLE1BQWUsRUFBRSxNQUFjLEVBQUUsRUFBVTs7Ozs7O3dCQUN4RSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDOzRCQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUNwRyxxQkFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUE7O3dCQUF2RixLQUFLLEdBQUcsU0FBK0U7d0JBQ3ZGLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7OzZCQUVuRSxDQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksTUFBTSxDQUFBLEVBQWhDLHdCQUFnQzt3QkFDOUIsR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUMvQixHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7OzZCQUMzRCxDQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksTUFBTSxDQUFBLEVBQXZFLHdCQUF1RTt3QkFDNUUsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDdkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQ3hCLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7eUJBQ3pDOzs7O3dCQUVDLHFCQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQ1YsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsQ0FBQyxFQUFFLElBQUk7NkJBQ1IsQ0FBQyxFQUFBOzt3QkFIRixTQUdFLENBQUE7Ozs7d0JBRUYsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFLLENBQUMsQ0FBQTt3QkFDcEIsTUFBTSxPQUFLLENBQUM7Ozs7d0JBS2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBSyxDQUFDLENBQUM7d0JBQ3JCLE1BQU0sT0FBSyxDQUFBOzt3QkFFWCxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7S0FFM0I7SUFDYSw2QkFBYyxHQUE1QixVQUE2QixXQUFtQixFQUFFLEtBQXFCO1FBQXJCLHNCQUFBLEVBQUEsWUFBcUI7UUFDckUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDOUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDekUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDekUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUM7UUFDMUUsNEJBQTRCO1FBQzVCLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDMUMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNqRCxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JB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