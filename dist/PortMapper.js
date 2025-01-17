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
exports.ClientPortMapper = exports.HostPortMapper = exports.FindFreePort = exports.ClientConnection = exports.HostConnection = exports.CacheItem = void 0;
var net = require("net");
var Logger_1 = require("./Logger");
var CacheItem = /** @class */ (function () {
    function CacheItem() {
    }
    return CacheItem;
}());
exports.CacheItem = CacheItem;
var HostConnection = /** @class */ (function () {
    function HostConnection() {
    }
    return HostConnection;
}());
exports.HostConnection = HostConnection;
var ClientConnection = /** @class */ (function () {
    function ClientConnection() {
    }
    return ClientConnection;
}());
exports.ClientConnection = ClientConnection;
function FindFreePort(preferred) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var srv = net.createServer();
                    try {
                        srv.on('error', function (err) {
                            if (err.message.includes('EADDRINUSE')) {
                                srv = net.createServer();
                                // If preferred port is in use, listen on a random free port by specifying port 0
                                srv.listen(0, function () {
                                    var a = srv.address();
                                    // @ts-ignore
                                    var port = a.port;
                                    srv.close(function () { return resolve(port); });
                                });
                            }
                            else {
                                // If other error, reject the promise
                                reject(err);
                            }
                        });
                        srv.listen(preferred, function () {
                            // @ts-ignore
                            var port = srv.address().port;
                            // Preferred port is available, use it
                            srv.close(function () { return resolve(port); });
                        });
                    }
                    catch (error) {
                        // If preferred port is in use, listen on a random free port by specifying port 0
                        srv.listen(0, function () {
                            // @ts-ignore
                            var port = srv.address().port;
                            srv.close(function () { return resolve(port); });
                        });
                    }
                })];
        });
    });
}
exports.FindFreePort = FindFreePort;
var HostPortMapper = /** @class */ (function () {
    function HostPortMapper(client, port, portname, host, streamid) {
        this.client = client;
        this.port = port;
        this.portname = portname;
        this.host = host;
        this.streamid = streamid;
        this.connections = new Map();
        this.running = true;
        this.created = new Date();
        this.lastUsed = new Date();
        this.id = "";
        this.id = Math.random().toString(36).substring(7);
    }
    HostPortMapper.prototype.dispose = function () {
        var _this = this;
        this.running = false;
        if (this.sendTimer) {
            clearTimeout(this.sendTimer);
        }
        this.connections.forEach(function (connection, id) {
            _this.removeConnection(id);
        });
    };
    HostPortMapper.prototype.newConnection = function (id, replyqueue) {
        var _this = this;
        var connection = this.connections.get(id);
        if (connection) {
            return connection;
        }
        connection = new HostConnection();
        connection.cache = [];
        connection.id = id;
        connection.seq = 0;
        connection.sendseq = 0;
        connection.replyqueue = replyqueue;
        connection.created = new Date();
        connection.lastUsed = new Date();
        connection.socket = net.connect({ host: this.host, port: this.port });
        connection.socket.on('error', function (error) {
            Logger_1.Logger.instrumentation.error(id + " HostPortMapper " + error.message, { id: id });
            try {
                _this.removeConnection(id);
            }
            catch (error) {
            }
        });
        connection.socket.on('close', function () {
            Logger_1.Logger.instrumentation.info(id + " HostPortMapper closed", { id: id });
            try {
                _this.removeConnection(id);
            }
            catch (error) {
            }
        });
        connection.socket.on('data', function (data) {
            var a = Array.from(data);
            if (a.length > 60000) {
                while (a.length > 0) {
                    var subarr = a.slice(0, 60000);
                    a = a.slice(60000);
                    Logger_1.Logger.instrumentation.info(id + " " + connection.sendseq + " " + "send" + " " + subarr.length + " " + "cunk" + " " + "port connections" + " " + _this.connections.size, { id: id });
                    _this.client.QueueMessage({ queuename: connection.replyqueue, data: { "command": "portdata", id: id, seq: connection.sendseq.toString(), "buf": subarr } }).catch(function (error) {
                        Logger_1.Logger.instrumentation.error(id + " HostPortMapper " + error.message, { id: id });
                        try {
                            _this.removeConnection(id);
                        }
                        catch (error) {
                        }
                    });
                    connection.sendseq++;
                }
            }
            else {
                Logger_1.Logger.instrumentation.info(id + " " + connection.sendseq + " " + "send" + " " + a.length + " " + "port connections" + " " + _this.connections.size, { id: id });
                _this.client.QueueMessage({ queuename: connection.replyqueue, data: { "command": "portdata", id: id, seq: connection.sendseq.toString(), "buf": a } }).catch(function (error) {
                    Logger_1.Logger.instrumentation.error(id + " HostPortMapper " + error.message, { id: id });
                    try {
                        _this.removeConnection(id);
                    }
                    catch (error) {
                    }
                });
                connection.sendseq++;
            }
        });
        if (this.sendTimer == null) {
            this.SendCache();
        }
        this.connections.set(id, connection);
    };
    HostPortMapper.prototype.removeConnection = function (id) {
        var connection = this.connections.get(id);
        if (connection) {
            if (connection.socket != null) {
                connection.socket.removeAllListeners();
                connection.socket.destroy();
                connection.socket = null;
                this.client.QueueMessage({ queuename: connection.replyqueue, data: { "command": "portclose", id: id, seq: connection.sendseq.toString() } }).catch(function (error) {
                });
            }
            this.connections.delete(id);
        }
    };
    HostPortMapper.prototype.RemoveOldConnections = function () {
        var _this = this;
        var now = new Date();
        this.connections.forEach(function (connection, id) {
            if (now.getTime() - connection.lastUsed.getTime() > 1000 * 60 * 10) { // 10 minutes
                Logger_1.Logger.instrumentation.info(id + " HostPortMapper idle timeout", { id: id });
                _this.removeConnection(id);
            }
        });
    };
    HostPortMapper.prototype.IncommingData = function (id, seq, data) {
        var connection = this.connections.get(id);
        if (connection) {
            this.lastUsed = new Date();
            connection.cache.push({ seq: seq, data: data });
            connection.lastUsed = new Date();
        }
    };
    HostPortMapper.prototype.SendCache = function () {
        var _this = this;
        try {
            if (this.running == false) {
                return;
            }
            this.connections.forEach(function (connection, id) {
                if (connection.socket != null) {
                    var start = new Date();
                    while (connection.cache.length > 0) {
                        var item = connection.cache.find(function (x) { return x.seq == connection.seq; });
                        if (item != null) {
                            connection.socket.write(item.data);
                            connection.cache.splice(connection.cache.indexOf(item), 1);
                            connection.seq++;
                        }
                        if (new Date().getTime() - start.getTime() > 2000) { // 2000ms
                            break;
                        }
                    }
                }
            });
        }
        catch (error) {
            Logger_1.Logger.instrumentation.error("SendCache.send " + error.message, {});
        }
        try {
            this.RemoveOldConnections();
        }
        catch (error) {
            Logger_1.Logger.instrumentation.error("SendCache.cleanup " + error.message, {});
        }
        this.sendTimer = setTimeout(function () { return _this.SendCache(); }, 0);
    };
    return HostPortMapper;
}());
exports.HostPortMapper = HostPortMapper;
var ClientPortMapper = /** @class */ (function () {
    function ClientPortMapper(client, localport, portname, remoteport, hostqueue) {
        var _this = this;
        this.client = client;
        this.localport = localport;
        this.portname = portname;
        this.remoteport = remoteport;
        this.hostqueue = hostqueue;
        this.connections = new Map();
        this.running = true;
        if (this.remoteport === null || this.remoteport === undefined || this.remoteport < 1) {
            this.remoteport = undefined;
        }
        this.server = net.createServer().listen(localport);
        // @ts-ignore
        Logger_1.Logger.instrumentation.info("ClientPortMapper" + " " + "listening on localport" + " " + this.server.address().port + " " + "http://127.0.0.1:" + this.server.address().port, {});
        Logger_1.Logger.instrumentation.info("forwarded to" + " " + hostqueue + " " + "portname:" + " " + portname + " " + "remoteport:" + " " + remoteport || "auto", {});
        this.server.on('connection', function (socket) { return __awaiter(_this, void 0, void 0, function () {
            var id, connection, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = Math.random().toString(36).substring(7);
                        connection = this.connections.get(id);
                        if (connection) {
                            return [2 /*return*/, connection];
                        }
                        connection = new ClientConnection();
                        connection.cache = [];
                        connection.id = id;
                        connection.seq = 0;
                        connection.sendseq = 0;
                        _a = connection;
                        return [4 /*yield*/, client.RegisterQueue({ queuename: "" }, function (msg, payload, user, jwt) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (payload.error != null) {
                                        Logger_1.Logger.instrumentation.error(id + " remote error " + payload.error, { id: id });
                                        try {
                                            this.removeConnection(id);
                                        }
                                        catch (error) {
                                        }
                                        return [2 /*return*/];
                                    }
                                    if (payload.command === "portclose") {
                                        Logger_1.Logger.instrumentation.info(id + " remote portclose", { id: id });
                                        try {
                                            this.removeConnection(id);
                                        }
                                        catch (error) {
                                        }
                                        return [2 /*return*/];
                                    }
                                    if (payload.command === "portdata") {
                                        if (payload.buf == null) {
                                            return [2 /*return*/]; // confirmed
                                        }
                                        Logger_1.Logger.instrumentation.info(id + " " + payload.seq + " " + "recv" + " " + payload.buf.length + " " + "port connections" + " " + this.connections.size, { id: id });
                                        connection.cache.push({ seq: parseInt(payload.seq), data: Buffer.from(payload.buf) });
                                        return [2 /*return*/];
                                    }
                                    if (payload.seq === null || payload.seq === undefined || payload.buf == null) {
                                        Logger_1.Logger.instrumentation.info(id + " " + "remote" + " " + payload.command + " " + "invalid ?", { id: id });
                                        return [2 /*return*/];
                                    }
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.replyqueue = _b.sent();
                        connection.created = new Date();
                        connection.lastUsed = new Date();
                        connection.socket = socket;
                        connection.socket.on('error', function (error) {
                            Logger_1.Logger.instrumentation.error(id + " " + "ClientPortMapper" + " " + error.message, { id: id });
                            try {
                                _this.removeConnection(id);
                            }
                            catch (error) {
                            }
                        });
                        connection.socket.on('close', function () {
                            Logger_1.Logger.instrumentation.info(id + " " + "ClientPortMapper closed", { id: id });
                            try {
                                _this.removeConnection(id);
                            }
                            catch (error) {
                            }
                        });
                        connection.socket.on('data', function (data) {
                            var a = Array.from(data);
                            if (a.length > 60000) {
                                while (a.length > 0) {
                                    var subarr = a.slice(0, 60000);
                                    a = a.slice(60000);
                                    Logger_1.Logger.instrumentation.info(id + " " + connection.sendseq + " " + "send" + " " + subarr.length + " " + "cunk" + " " + "port connections" + " " + _this.connections.size, { id: id });
                                    _this.client.QueueMessage({ queuename: hostqueue, replyto: connection.replyqueue,
                                        data: { command: "portdata", id: id, portname: _this.portname, port: _this.remoteport, seq: connection.sendseq, "buf": subarr } }).catch(function (error) {
                                        Logger_1.Logger.instrumentation.error(id + "sendError " + error, { id: id });
                                        try {
                                            _this.removeConnection(id);
                                        }
                                        catch (error) {
                                        }
                                    });
                                    connection.sendseq++;
                                }
                            }
                            else {
                                Logger_1.Logger.instrumentation.info(id + " " + connection.sendseq + " " + "send" + " " + a.length + " " + "port connections" + " " + _this.connections.size, { id: id });
                                _this.client.QueueMessage({ queuename: hostqueue, replyto: connection.replyqueue,
                                    data: { command: "portdata", id: id, portname: _this.portname, port: _this.remoteport, seq: connection.sendseq, "buf": a } }).catch(function (error) {
                                    Logger_1.Logger.instrumentation.info(id + " sendError " + error, { id: id });
                                    try {
                                        _this.removeConnection(id);
                                    }
                                    catch (error) {
                                    }
                                });
                                connection.sendseq++;
                            }
                        });
                        if (this.sendTimer == null) {
                            this.SendCache();
                        }
                        this.connections.set(id, connection);
                        return [2 /*return*/];
                }
            });
        }); });
    }
    ClientPortMapper.prototype.dispose = function () {
        var _this = this;
        this.running = false;
        if (this.sendTimer) {
            clearTimeout(this.sendTimer);
        }
        this.connections.forEach(function (connection, id) {
            _this.removeConnection(id);
        });
    };
    ClientPortMapper.prototype.removeConnection = function (id) {
        var connection = this.connections.get(id);
        if (connection) {
            if (connection.socket != null) {
                connection.socket.removeAllListeners();
                connection.socket.destroy();
                connection.socket = null;
                this.client.QueueMessage({ queuename: this.hostqueue, data: { command: "portclose", id: id, portname: this.portname, port: this.remoteport } }).catch(function (error) {
                });
            }
            this.connections.delete(id);
        }
    };
    ClientPortMapper.prototype.RemoveOldConnections = function () {
        var _this = this;
        var now = new Date();
        this.connections.forEach(function (connection, id) {
            if (now.getTime() - connection.lastUsed.getTime() > 1000 * 60) {
                _this.removeConnection(id);
            }
        });
    };
    ClientPortMapper.prototype.IncommingData = function (id, seq, data) {
        var connection = this.connections.get(id);
        if (connection) {
            connection.cache.push({ seq: seq, data: data });
            connection.lastUsed = new Date();
        }
    };
    ClientPortMapper.prototype.SendCache = function () {
        var _this = this;
        if (this.running == false) {
            return;
        }
        try {
            this.connections.forEach(function (connection, id) {
                if (connection.socket != null) {
                    var start = new Date();
                    while (connection.cache.length > 0) {
                        var item = connection.cache.find(function (x) { return x.seq == connection.seq; });
                        if (item != null) {
                            connection.socket.write(item.data);
                            connection.cache.splice(connection.cache.indexOf(item), 1);
                            connection.seq++;
                        }
                        if (new Date().getTime() - start.getTime() > 2000) { // 2000ms
                            break;
                        }
                    }
                }
            });
        }
        catch (error) {
            Logger_1.Logger.instrumentation.error("SendCache.send " + error.message, {});
        }
        try {
            this.RemoveOldConnections();
        }
        catch (error) {
            Logger_1.Logger.instrumentation.error("SendCache.cleanup " + error.message, {});
        }
        this.sendTimer = setTimeout(function () { return _this.SendCache(); }, 0);
    };
    return ClientPortMapper;
}());
exports.ClientPortMapper = ClientPortMapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9ydE1hcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Qb3J0TWFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHlCQUEyQjtBQUMzQixtQ0FBa0M7QUFDbEM7SUFBQTtJQUdBLENBQUM7SUFBRCxnQkFBQztBQUFELENBQUMsQUFIRCxJQUdDO0FBSFksOEJBQVM7QUFJdEI7SUFBQTtJQVNBLENBQUM7SUFBRCxxQkFBQztBQUFELENBQUMsQUFURCxJQVNDO0FBVFksd0NBQWM7QUFVM0I7SUFBQTtJQVNBLENBQUM7SUFBRCx1QkFBQztBQUFELENBQUMsQUFURCxJQVNDO0FBVFksNENBQWdCO0FBVTdCLFNBQXNCLFlBQVksQ0FBQyxTQUFpQjs7O1lBQ2xELHNCQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07b0JBQ2pDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDN0IsSUFBSTt3QkFDRixHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFDLEdBQUc7NEJBQ2xCLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0NBQ3RDLEdBQUcsR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQ3pCLGlGQUFpRjtnQ0FDakYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7b0NBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO29DQUN0QixhQUFhO29DQUNiLElBQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7b0NBQ3BCLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBTSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBYixDQUFhLENBQUMsQ0FBQztnQ0FDakMsQ0FBQyxDQUFDLENBQUM7NkJBQ0o7aUNBQU07Z0NBQ0wscUNBQXFDO2dDQUNyQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7NkJBQ2I7d0JBQ0gsQ0FBQyxDQUFDLENBQUM7d0JBRUgsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7NEJBQ3BCLGFBQWE7NEJBQ2IsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQzs0QkFDaEMsc0NBQXNDOzRCQUN0QyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQWIsQ0FBYSxDQUFDLENBQUM7d0JBQ2pDLENBQUMsQ0FBQyxDQUFDO3FCQUNKO29CQUFDLE9BQU8sS0FBSyxFQUFFO3dCQUNaLGlGQUFpRjt3QkFDakYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7NEJBQ1osYUFBYTs0QkFDYixJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDOzRCQUNoQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQWIsQ0FBYSxDQUFDLENBQUM7d0JBQ2pDLENBQUMsQ0FBQyxDQUFDO3FCQUNOO2dCQUNILENBQUMsQ0FBQyxFQUFDOzs7Q0FDSjtBQW5DRCxvQ0FtQ0M7QUFFRDtJQU9FLHdCQUFtQixNQUFlLEVBQVMsSUFBWSxFQUFTLFFBQWdCLEVBQVMsSUFBWSxFQUFTLFFBQWdCO1FBQTNHLFdBQU0sR0FBTixNQUFNLENBQVM7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBTjlILGdCQUFXLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7UUFFaEQsWUFBTyxHQUFZLElBQUksQ0FBQztRQUN4QixZQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNyQixhQUFRLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN0QixPQUFFLEdBQVcsRUFBRSxDQUFDO1FBRWQsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBQ0QsZ0NBQU8sR0FBUDtRQUFBLGlCQVFDO1FBUEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBZ0IsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxVQUFVLEVBQUUsRUFBRTtZQUN0QyxLQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0Qsc0NBQWEsR0FBYixVQUFjLEVBQVUsRUFBRSxVQUFrQjtRQUE1QyxpQkE0REM7UUEzREMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUMsSUFBSSxVQUFVLEVBQUU7WUFDZCxPQUFPLFVBQVUsQ0FBQztTQUNuQjtRQUNELFVBQVUsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ2xDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ25CLFVBQVUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLFVBQVUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLFVBQVUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQ25DLFVBQVUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNoQyxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDakMsVUFBVSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ3RFLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFDLEtBQUs7WUFDbEMsZUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBQyxFQUFFLElBQUEsRUFBQyxDQUFDLENBQUM7WUFDNUUsSUFBSTtnQkFDRixLQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDM0I7WUFBQyxPQUFPLEtBQUssRUFBRTthQUNmO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7WUFDNUIsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLHdCQUF3QixFQUFFLEVBQUMsRUFBRSxJQUFBLEVBQUMsQ0FBQyxDQUFDO1lBQ2pFLElBQUk7Z0JBQ0YsS0FBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzNCO1lBQUMsT0FBTyxLQUFLLEVBQUU7YUFDZjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBSTtZQUNoQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLElBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLEVBQUU7Z0JBQ25CLE9BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ2xCLElBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNqQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDbkIsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsa0JBQWtCLEdBQUcsR0FBRyxHQUFHLEtBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUMsRUFBRSxJQUFBLEVBQUMsQ0FBQyxDQUFDO29CQUM5SyxLQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsRUFBRSxJQUFBLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBQyxFQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLO3dCQUM3SixlQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFDLEVBQUUsSUFBQSxFQUFDLENBQUMsQ0FBQzt3QkFDNUUsSUFBSTs0QkFDRixLQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7eUJBQzNCO3dCQUFDLE9BQU8sS0FBSyxFQUFFO3lCQUNmO29CQUNILENBQUMsQ0FBQyxDQUFDO29CQUNILFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDdEI7YUFDRjtpQkFBTTtnQkFDTCxlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsa0JBQWtCLEdBQUcsR0FBRyxHQUFHLEtBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUMsRUFBRSxJQUFBLEVBQUMsQ0FBQyxDQUFDO2dCQUMxSixLQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsRUFBRSxJQUFBLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLO29CQUN4SixlQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFDLEVBQUUsSUFBQSxFQUFDLENBQUMsQ0FBQztvQkFDNUUsSUFBSTt3QkFDRixLQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQzNCO29CQUFDLE9BQU8sS0FBSyxFQUFFO3FCQUNmO2dCQUNILENBQUMsQ0FBQyxDQUFDO2dCQUNILFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUN0QjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksRUFBRTtZQUMxQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDbEI7UUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELHlDQUFnQixHQUFoQixVQUFpQixFQUFVO1FBQ3pCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFDLElBQUksVUFBVSxFQUFFO1lBQ2QsSUFBRyxVQUFVLENBQUMsTUFBTSxJQUFJLElBQUksRUFBRTtnQkFDNUIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUN2QyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM1QixVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLEVBQUUsSUFBQSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFDLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFDLEtBQUs7Z0JBQ2pKLENBQUMsQ0FBQyxDQUFDO2FBRUo7WUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM3QjtJQUNILENBQUM7SUFDRCw2Q0FBb0IsR0FBcEI7UUFBQSxpQkFRQztRQVBDLElBQU0sR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxVQUFVLEVBQUUsRUFBRTtZQUN0QyxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsYUFBYTtnQkFDakYsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLDhCQUE4QixFQUFFLEVBQUMsRUFBRSxJQUFBLEVBQUMsQ0FBQyxDQUFDO2dCQUN2RSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDM0I7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxzQ0FBYSxHQUFiLFVBQWMsRUFBVSxFQUFFLEdBQVcsRUFBRSxJQUFZO1FBQ2pELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksVUFBVSxFQUFFO1lBQ2QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQzNCLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztTQUNsQztJQUNILENBQUM7SUFDRCxrQ0FBUyxHQUFUO1FBQUEsaUJBOEJDO1FBN0JDLElBQUk7WUFDRixJQUFHLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxFQUFFO2dCQUN4QixPQUFPO2FBQ1I7WUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFVBQVUsRUFBRSxFQUFFO2dCQUN0QyxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxFQUFFO29CQUM3QixJQUFNLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUN6QixPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTt3QkFDbEMsSUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxHQUFHLEVBQXZCLENBQXVCLENBQUMsQ0FBQzt3QkFDakUsSUFBRyxJQUFJLElBQUksSUFBSSxFQUFFOzRCQUNmLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDbkMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQzNELFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQzt5QkFDbEI7d0JBQ0QsSUFBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxTQUFTOzRCQUMzRCxNQUFNO3lCQUNQO3FCQUNGO2lCQUNGO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsZUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNyRTtRQUNELElBQUk7WUFDRixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtTQUM1QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsZUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN4RTtRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsU0FBUyxFQUFFLEVBQWhCLENBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNILHFCQUFDO0FBQUQsQ0FBQyxBQS9JRCxJQStJQztBQS9JWSx3Q0FBYztBQWtKM0I7SUFLRSwwQkFBbUIsTUFBZSxFQUFTLFNBQWlCLEVBQVMsUUFBZ0IsRUFBUyxVQUFrQixFQUFTLFNBQWlCO1FBQTFJLGlCQXFHQztRQXJHa0IsV0FBTSxHQUFOLE1BQU0sQ0FBUztRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFKMUksZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQztRQUVsRCxZQUFPLEdBQVksSUFBSSxDQUFDO1FBR3RCLElBQUcsSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUU7WUFDbkYsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7U0FDN0I7UUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkQsYUFBYTtRQUNiLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEdBQUcsR0FBRyx3QkFBd0IsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLG1CQUFtQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pMLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLEdBQUcsU0FBUyxHQUFHLEdBQUcsR0FBRyxXQUFXLEdBQUcsR0FBRyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsYUFBYSxHQUFHLEdBQUcsR0FBRyxVQUFVLElBQUksTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzFKLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxVQUFPLE1BQU07Ozs7Ozt3QkFDbEMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMvQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQzFDLElBQUksVUFBVSxFQUFFOzRCQUNkLHNCQUFPLFVBQVUsRUFBQzt5QkFDbkI7d0JBQ0QsVUFBVSxHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQzt3QkFDcEMsVUFBVSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7d0JBQ3RCLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO3dCQUNuQixVQUFVLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQzt3QkFDbkIsVUFBVSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7d0JBQ3ZCLEtBQUEsVUFBVSxDQUFBO3dCQUFjLHFCQUFNLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBQyxTQUFTLEVBQUUsRUFBRSxFQUFDLEVBQUUsVUFBTyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHOztvQ0FDaEcsSUFBRyxPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTt3Q0FDeEIsZUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBQyxFQUFFLElBQUEsRUFBQyxDQUFDLENBQUM7d0NBQzFFLElBQUk7NENBQ0YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO3lDQUMzQjt3Q0FBQyxPQUFPLEtBQUssRUFBRTt5Q0FDZjt3Q0FDRCxzQkFBTztxQ0FDUjtvQ0FDRCxJQUFHLE9BQU8sQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFO3dDQUNsQyxlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsbUJBQW1CLEVBQUUsRUFBQyxFQUFFLElBQUEsRUFBQyxDQUFDLENBQUM7d0NBQzVELElBQUk7NENBQ0YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO3lDQUMzQjt3Q0FBQyxPQUFPLEtBQUssRUFBRTt5Q0FDZjt3Q0FDRCxzQkFBTztxQ0FDUjtvQ0FDRCxJQUFHLE9BQU8sQ0FBQyxPQUFPLEtBQUssVUFBVSxFQUFFO3dDQUNqQyxJQUFHLE9BQU8sQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFOzRDQUN0QixzQkFBTyxDQUFDLFlBQVk7eUNBQ3JCO3dDQUNELGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsa0JBQWtCLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUMsRUFBRSxJQUFBLEVBQUMsQ0FBQyxDQUFDO3dDQUM3SixVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7d0NBQ3RGLHNCQUFPO3FDQUNSO29DQUNELElBQUcsT0FBTyxDQUFDLEdBQUcsS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUU7d0NBQzNFLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxXQUFXLEVBQUUsRUFBQyxFQUFFLElBQUEsRUFBQyxDQUFDLENBQUM7d0NBQ25HLHNCQUFPO3FDQUNSOzs7aUNBQ0YsQ0FBQyxFQUFBOzt3QkE3QkYsR0FBVyxVQUFVLEdBQUcsU0E2QnRCLENBQUM7d0JBQ0gsVUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO3dCQUNoQyxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7d0JBQ2pDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO3dCQUMzQixVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxLQUFLOzRCQUNsQyxlQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLGtCQUFrQixHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUMsRUFBRSxJQUFBLEVBQUMsQ0FBQyxDQUFDOzRCQUN4RixJQUFJO2dDQUNGLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQzs2QkFDM0I7NEJBQUMsT0FBTyxLQUFLLEVBQUU7NkJBQ2Y7d0JBQ0gsQ0FBQyxDQUFDLENBQUM7d0JBQ0gsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFOzRCQUM1QixlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLHlCQUF5QixFQUFFLEVBQUMsRUFBRSxJQUFBLEVBQUMsQ0FBQyxDQUFDOzRCQUN4RSxJQUFJO2dDQUNGLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQzs2QkFDM0I7NEJBQUMsT0FBTyxLQUFLLEVBQUU7NkJBQ2Y7d0JBQ0gsQ0FBQyxDQUFDLENBQUM7d0JBQ0gsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBSTs0QkFDaEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDekIsSUFBRyxDQUFDLENBQUMsTUFBTSxHQUFHLEtBQUssRUFBRTtnQ0FDbkIsT0FBTSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQ0FDbEIsSUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7b0NBQ2pDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO29DQUNuQixlQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEdBQUcsR0FBRyxrQkFBa0IsR0FBRyxHQUFHLEdBQUcsS0FBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBQyxFQUFFLElBQUEsRUFBQyxDQUFDLENBQUM7b0NBQzlLLEtBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLFVBQVU7d0NBQzVFLElBQUksRUFBRSxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsRUFBRSxJQUFBLEVBQUUsUUFBUSxFQUFFLEtBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBQyxFQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLO3dDQUNwSSxlQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsWUFBWSxHQUFHLEtBQUssRUFBRSxFQUFDLEVBQUUsSUFBQSxFQUFDLENBQUMsQ0FBQzt3Q0FDaEUsSUFBSTs0Q0FDRixLQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7eUNBQzNCO3dDQUFDLE9BQU8sS0FBSyxFQUFFO3lDQUNmO29DQUNELENBQUMsQ0FBQyxDQUFDO29DQUNMLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQ0FDdEI7NkJBQ0Y7aUNBQU07Z0NBQ0wsZUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLGtCQUFrQixHQUFHLEdBQUcsR0FBRyxLQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFDLEVBQUUsSUFBQSxFQUFDLENBQUMsQ0FBQztnQ0FDMUosS0FBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsVUFBVTtvQ0FDNUUsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxFQUFFLElBQUEsRUFBRSxRQUFRLEVBQUUsS0FBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFDLEtBQUs7b0NBQy9ILGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFLEVBQUMsRUFBRSxJQUFBLEVBQUMsQ0FBQyxDQUFDO29DQUM5RCxJQUFJO3dDQUNGLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQ0FDM0I7b0NBQUMsT0FBTyxLQUFLLEVBQUU7cUNBQ2Y7Z0NBQ0gsQ0FBQyxDQUFDLENBQUM7Z0NBQ0wsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDOzZCQUN0Qjt3QkFDSCxDQUFDLENBQUMsQ0FBQzt3QkFDSCxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxFQUFFOzRCQUMxQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7eUJBQ2xCO3dCQUNELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQzs7OzthQUN0QyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0Qsa0NBQU8sR0FBUDtRQUFBLGlCQVFDO1FBUEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBZ0IsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQyxVQUFVLEVBQUUsRUFBRTtZQUN0QyxLQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsMkNBQWdCLEdBQWhCLFVBQWlCLEVBQVU7UUFDekIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUMsSUFBSSxVQUFVLEVBQUU7WUFDZCxJQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxFQUFFO2dCQUM1QixVQUFVLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3ZDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzVCLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsRUFBRSxJQUFBLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUMsRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUMsS0FBSztnQkFDcEosQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUNELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzdCO0lBQ0gsQ0FBQztJQUNELCtDQUFvQixHQUFwQjtRQUFBLGlCQU9DO1FBTkMsSUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3RDLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsRUFBRTtnQkFDN0QsS0FBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzNCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0Qsd0NBQWEsR0FBYixVQUFjLEVBQVUsRUFBRSxHQUFXLEVBQUUsSUFBWTtRQUNqRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QyxJQUFJLFVBQVUsRUFBRTtZQUNkLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztTQUNsQztJQUNILENBQUM7SUFDRCxvQ0FBUyxHQUFUO1FBQUEsaUJBOEJDO1FBN0JDLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUU7WUFDeEIsT0FBTztTQUNSO1FBQ0QsSUFBSTtZQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3RDLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUU7b0JBQzdCLElBQU0sS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ3pCLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUNsQyxJQUFNLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxHQUFHLElBQUksVUFBVSxDQUFDLEdBQUcsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO3dCQUNqRSxJQUFHLElBQUksSUFBSSxJQUFJLEVBQUU7NEJBQ2YsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNuQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDM0QsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO3lCQUNsQjt3QkFDRCxJQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLFNBQVM7NEJBQzNELE1BQU07eUJBQ1A7cUJBQ0Y7aUJBQ0Y7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxlQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3JFO1FBQ0QsSUFBSTtZQUNGLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO1NBQzVCO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxlQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxTQUFTLEVBQUUsRUFBaEIsQ0FBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQ0gsdUJBQUM7QUFBRCxDQUFDLEFBL0tELElBK0tDO0FBL0tZLDRDQUFnQiJ9