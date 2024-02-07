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
exports.sleep = exports.awaittry = void 0;
function awaittry(command, timeout) {
    return __awaiter(this, void 0, void 0, function () {
        var results, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.race([
                            command.then(function (result) { return ({ success: true, result: result }); }).catch(function (error) { return ({ success: false, error: error }); }),
                            new Promise(function (resolve) { return setTimeout(function () { return resolve({ success: false, error: new Error("Await timed out after ".concat(timeout, " seconds")) }); }, timeout * 1000); })
                        ])];
                case 1:
                    results = _a.sent();
                    if (!results.success)
                        throw results.error;
                    return [2 /*return*/, results.result];
                case 2:
                    error_1 = _a.sent();
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.awaittry = awaittry;
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
exports.sleep = sleep;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQXNCLFFBQVEsQ0FBQyxPQUFZLEVBQUUsT0FBZTs7Ozs7OztvQkFFakMscUJBQU0sT0FBTyxDQUFDLElBQUksQ0FBQzs0QkFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQVcsSUFBSyxPQUFBLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sUUFBQSxFQUFFLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFDLEtBQVUsSUFBSyxPQUFBLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQzs0QkFDN0csSUFBSSxPQUFPLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxVQUFVLENBQUMsY0FBTSxPQUFBLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksS0FBSyxDQUFDLGdDQUF5QixPQUFPLGFBQVUsQ0FBQyxFQUFFLENBQUMsRUFBekYsQ0FBeUYsRUFBRSxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQTNILENBQTJILENBQUM7eUJBQ3RKLENBQUMsRUFBQTs7b0JBSEUsT0FBTyxHQUFRLFNBR2pCO29CQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTzt3QkFBRSxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUM7b0JBQzFDLHNCQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUM7OztvQkFFdEIsTUFBTSxPQUFLLENBQUM7Ozs7O0NBRW5CO0FBWEQsNEJBV0M7QUFDRCxTQUFzQixLQUFLLENBQUMsRUFBVTs7O1lBQ2xDLHNCQUFPLElBQUksT0FBTyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQyxFQUFDOzs7Q0FDMUQ7QUFGRCxzQkFFQyJ9