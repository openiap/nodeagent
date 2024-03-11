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
var util_1 = require("./util");
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
                            switch (_a.label) {
                                case 0:
                                    s = runner_1.runner.streams.length - 1;
                                    _a.label = 1;
                                case 1:
                                    if (!(s >= 0)) return [3 /*break*/, 4];
                                    stream = runner_1.runner.streams[s];
                                    console.log("*** Kill stream: " + stream.id);
                                    return [4 /*yield*/, runner_1.runner.kill(agent_1.agent.client, stream.id)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    s--;
                                    return [3 /*break*/, 1];
                                case 4:
                                    console.log("*** Exit");
                                    ;
                                    process.exit(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    process.on('SIGINT', onexit);
                    process.on('SIGTERM', onexit);
                    process.on('SIGQUIT', onexit);
                    return [4 /*yield*/, agent_1.agent.init()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, util_1.sleep)(10)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcnVuYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBQ2xDLCtCQUErQjtBQUMvQixTQUFlLElBQUk7Ozs7Ozs7O29CQUVmLGFBQUssQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDO29CQUM3RSxNQUFNLEdBQUc7Ozs7O29DQUNKLENBQUMsR0FBRyxlQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDOzs7eUNBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxDQUFBO29DQUN0QyxNQUFNLEdBQUcsZUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQ0FDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7b0NBQzdDLHFCQUFNLGVBQU0sQ0FBQyxJQUFJLENBQUMsYUFBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUE7O29DQUExQyxTQUEwQyxDQUFDOzs7b0NBSEcsQ0FBQyxFQUFFLENBQUE7OztvQ0FLbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQ0FBQSxDQUFDO29DQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O3lCQUNqQixDQUFDO29CQUNGLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO29CQUM1QixPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtvQkFDN0IsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUE7b0JBQzdCLHFCQUFNLGFBQUssQ0FBQyxJQUFJLEVBQUUsRUFBQTs7b0JBQWxCLFNBQWtCLENBQUE7Ozt5QkFDWCxJQUFJO29CQUNULHFCQUFNLElBQUEsWUFBSyxFQUFDLEVBQUUsQ0FBQyxFQUFBOztvQkFBZixTQUFlLENBQUM7Ozs7O29CQUdsQixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQUssQ0FBQyxDQUFDOzs7Ozs7Q0FFeEI7QUFFRCxJQUFJLEVBQUUsQ0FBQyJ9