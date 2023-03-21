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
exports.agenttools = void 0;
var http = require("http");
var https = require("https");
var agenttools = /** @class */ (function () {
    function agenttools() {
    }
    agenttools.AddRequestToken = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenkey, u, host, base, addtokenurl, signinurl, result, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenkey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                        u = new URL(url);
                        host = u.host;
                        if (host.startsWith("grpc."))
                            host = host.substring(5);
                        base = u.protocol + "//" + host;
                        if (u.protocol == "wss:") {
                            base = "https://" + host;
                        }
                        else if (u.protocol == "ws:") {
                            base = "http://" + host;
                        }
                        addtokenurl = base + "/AddTokenRequest";
                        signinurl = base + "/login?key=" + tokenkey;
                        return [4 /*yield*/, agenttools.post(null, null, addtokenurl, JSON.stringify({ key: tokenkey }))];
                    case 1:
                        result = _a.sent();
                        res = JSON.parse(result);
                        return [2 /*return*/, [tokenkey, signinurl]];
                }
            });
        });
    };
    agenttools.WaitForToken = function (url, tokenkey) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var u = new URL(url);
                        var host = u.host;
                        if (host.startsWith("grpc."))
                            host = host.substring(5);
                        var base = u.protocol + "//" + host;
                        if (u.protocol == "wss:") {
                            base = "https://" + host;
                        }
                        else if (u.protocol == "ws:") {
                            base = "http://" + host;
                        }
                        var gettokenurl = base + "/GetTokenRequest?key=" + tokenkey;
                        var id = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            var result, res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, agenttools.get(gettokenurl)];
                                    case 1:
                                        result = _a.sent();
                                        res = JSON.parse(result);
                                        if (res.jwt != "" && res.jwt != null) {
                                            clearInterval(id);
                                            resolve(res.jwt);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 2500);
                    })];
            });
        });
    };
    agenttools.get = function (url) {
        return new Promise(function (resolve, reject) {
            var provider = http;
            if (url.startsWith("https")) {
                // @ts-ignore
                provider = https;
            }
            provider.get(url, function (resp) {
                var data = "";
                resp.on("data", function (chunk) {
                    data += chunk;
                });
                resp.on("end", function () {
                    resolve(data);
                });
            }).on("error", function (err) {
                reject(err);
            });
        });
    };
    agenttools.post = function (jwt, agent, url, body) {
        return new Promise(function (resolve, reject) {
            try {
                var provider = http;
                var u = new URL(url);
                var options = {
                    rejectUnauthorized: false,
                    agent: agent,
                    hostname: u.hostname,
                    port: u.port,
                    path: u.pathname,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(body)
                    }
                };
                if (agent == null) {
                    delete options.agent;
                }
                if (jwt != null && jwt != "") {
                    // @ts-ignore
                    options.headers["Authorization"] = "Bearer " + jwt;
                }
                if (url.startsWith("https")) {
                    delete options.agent;
                    // @ts-ignore
                    provider = https;
                }
                var req = provider.request(url, options, function (res) {
                    var o = options;
                    var b = body;
                    res.setEncoding("utf8");
                    if (res.statusCode != 200) {
                        return reject(new Error("HTTP Error: " + res.statusCode + " " + res.statusMessage));
                    }
                    var _body = "";
                    res.on("data", function (chunk) {
                        _body += chunk;
                    });
                    res.on("end", function () {
                        var r = res;
                        resolve(_body);
                    });
                });
                req.write(body);
                req.end();
            }
            catch (error) {
                reject(error);
            }
        });
    };
    return agenttools;
}());
exports.agenttools = agenttools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnR0b29scy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hZ2VudHRvb2xzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJCQUE0QjtBQUM1Qiw2QkFBOEI7QUFDOUI7SUFBQTtJQWtIQSxDQUFDO0lBakhjLDBCQUFlLEdBQTVCLFVBQTZCLEdBQVU7Ozs7Ozt3QkFDakMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQ3JHLENBQUMsR0FBUSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDdEIsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQ2xCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7NEJBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ25ELElBQUksR0FBRyxDQUFDLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7d0JBQ3BDLElBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxNQUFNLEVBQUU7NEJBQ3ZCLElBQUksR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDO3lCQUMxQjs2QkFBTSxJQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksS0FBSyxFQUFFOzRCQUM3QixJQUFJLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQzt5QkFDekI7d0JBQ0csV0FBVyxHQUFHLElBQUksR0FBRyxrQkFBa0IsQ0FBQzt3QkFDeEMsU0FBUyxHQUFHLElBQUksR0FBRyxhQUFhLEdBQUcsUUFB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