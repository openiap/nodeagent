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
var agent_1 = require("./agent");
var runner_1 = require("./runner");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var onexit, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    agent_1.agent.globalpackageid = process.env.forcedpackageid || process.env.packageid || "";
                    onexit = function () { return __awaiter(_this, void 0, void 0, function () {
                        var s, stream;
                        return __generator(this, function (_a) {
                            for (s = runner_1.runner.streams.length - 1; s >= 0; s--) {
                                stream = runner_1.runner.streams[s];
                                console.log("*** Kill stream: " + stream.id);
                                runner_1.runner.kill(agent_1.agent.client, stream.id);
                            }
                            console.log("*** Exit");
                            ;
                            process.exit(0);
                            return [2 /*return*/];
                        });
                    }); };
                    process.on('SIGINT', onexit);
                    process.on('SIGTERM', onexit);
                    process.on('SIGQUIT', onexit);
                    return [4 /*yield*/, agent_1.agent.init()
                        // agent.reloadpackages(true);
                        // agent.on("runit", ( streamid, command, parameters, cwd, env) => {
                        // });
                        // agent.on("streamadded", ( stream:any ) => {
                        //   console.log("***** streamadded")
                        // });
                        // agent.on("stream", ( stream:any, message: Buffer) => {
                        //   if(message != null) console.log("***** stream: " + message.toString());
                        //   if(message == null) console.log("***** stream: (null)");
                        // });
                        // agent.on("streamremoved", (stream: any) => {
                        //   console.log("***** streamremoved")
                        // });
                    ];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 4];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 2];
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcnVuYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBQ2xDLFNBQWUsSUFBSTs7Ozs7Ozs7b0JBRWYsYUFBSyxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7b0JBQzdFLE1BQU0sR0FBRzs7OzRCQUNiLEtBQVMsQ0FBQyxHQUFHLGVBQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dDQUM3QyxNQUFNLEdBQUcsZUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0NBQzdDLGVBQU0sQ0FBQyxJQUFJLENBQUMsYUFBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7NkJBQ3RDOzRCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQUEsQ0FBQzs0QkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O3lCQUNqQixDQUFDO29CQUNGLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO29CQUM1QixPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtvQkFDN0IsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUE7b0JBQzdCLHFCQUFNLGFBQUssQ0FBQyxJQUFJLEVBQUU7d0JBQ2xCLDhCQUE4Qjt3QkFDOUIsb0VBQW9FO3dCQUNwRSxNQUFNO3dCQUNOLDhDQUE4Qzt3QkFDOUMscUNBQXFDO3dCQUNyQyxNQUFNO3dCQUNOLHlEQUF5RDt3QkFDekQsNEVBQTRFO3dCQUM1RSw2REFBNkQ7d0JBQzdELE1BQU07d0JBQ04sK0NBQStDO3dCQUMvQyx1Q0FBdUM7d0JBQ3ZDLE1BQU07c0JBYlk7O29CQUFsQixTQUFrQixDQUFBOzs7eUJBY1gsSUFBSTtvQkFDVCxxQkFBTSxJQUFJLE9BQU8sQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQXpCLENBQXlCLENBQUMsRUFBQTs7b0JBQXZELFNBQXVELENBQUM7Ozs7O29CQUcxRCxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQUssQ0FBQyxDQUFDOzs7Ozs7Q0FFeEI7QUFFRCxJQUFJLEVBQUUsQ0FBQyJ9