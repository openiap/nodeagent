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
            console.error(id, "HostPortMapper", error.message);
            try {
                _this.removeConnection(id);
            }
            catch (error) {
            }
        });
        connection.socket.on('close', function () {
            console.log(id, "HostPortMapper", "closed");
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
                    console.log(id, connection.sendseq, "send", subarr.length, "cunk", "port connections", _this.connections.size);
                    _this.client.QueueMessage({ queuename: connection.replyqueue, data: { "command": "portdata", id: id, seq: connection.sendseq.toString(), "buf": subarr } }).catch(function (error) {
                        console.error(id, "HostPortMapper", error.message);
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
                console.log(id, connection.sendseq, "send", a.length, "port connections", _this.connections.size);
                _this.client.QueueMessage({ queuename: connection.replyqueue, data: { "command": "portdata", id: id, seq: connection.sendseq.toString(), "buf": a } }).catch(function (error) {
                    console.error(id, "HostPortMapper", error.message);
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
                console.log(id, "HostPortMapper", "idle timeout");
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
                    while (connection.cache.length > 0) {
                        var item = connection.cache.find(function (x) { return x.seq == connection.seq; });
                        if (item != null) {
                            connection.socket.write(item.data);
                            connection.cache.splice(connection.cache.indexOf(item), 1);
                            connection.seq++;
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error("SendCache.send", error.message);
        }
        try {
            this.RemoveOldConnections();
        }
        catch (error) {
            console.error("SendCache.cleanup", error.message);
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
        console.log("ClientPortMapper", "listening on localport", this.server.address().port, "http://127.0.0.1:" + this.server.address().port);
        console.log("forwarded to", hostqueue, "portname:", portname, "remoteport:", remoteport || "auto");
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
                                        console.error(id, "remote error", payload.error);
                                        try {
                                            this.removeConnection(id);
                                        }
                                        catch (error) {
                                        }
                                        return [2 /*return*/];
                                    }
                                    if (payload.command === "portclose") {
                                        console.log(id, "remote", "portclose");
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
                                        console.log(id, payload.seq, "recv", payload.buf.length, "port connections", this.connections.size);
                                        connection.cache.push({ seq: parseInt(payload.seq), data: Buffer.from(payload.buf) });
                                        return [2 /*return*/];
                                    }
                                    if (payload.seq === null || payload.seq === undefined || payload.buf == null) {
                                        console.log(id, "remote", payload.command, "invalid ?");
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
                            console.error(id, "ClientPortMapper", error.message);
                            try {
                                _this.removeConnection(id);
                            }
                            catch (error) {
                            }
                        });
                        connection.socket.on('close', function () {
                            console.log(id, "ClientPortMapper", "closed");
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
                                    console.log(id, connection.sendseq, "send", subarr.length, "cunk", "port connections", _this.connections.size);
                                    _this.client.QueueMessage({ queuename: hostqueue, replyto: connection.replyqueue,
                                        data: { command: "portdata", id: id, portname: _this.portname, port: _this.remoteport, seq: connection.sendseq, "buf": subarr } }).catch(function (error) {
                                        console.error(id, "sendError", error);
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
                                console.log(id, connection.sendseq, "send", a.length, "port connections", _this.connections.size);
                                _this.client.QueueMessage({ queuename: hostqueue, replyto: connection.replyqueue,
                                    data: { command: "portdata", id: id, portname: _this.portname, port: _this.remoteport, seq: connection.sendseq, "buf": a } }).catch(function (error) {
                                    console.error(id, "sendError", error);
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
                    while (connection.cache.length > 0) {
                        var item = connection.cache.find(function (x) { return x.seq == connection.seq; });
                        if (item != null) {
                            connection.socket.write(item.data);
                            connection.cache.splice(connection.cache.indexOf(item), 1);
                            connection.seq++;
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error("SendCache.send", error.message);
        }
        try {
            this.RemoveOldConnections();
        }
        catch (error) {
            console.error("SendCache.cleanup", error.message);
        }
        this.sendTimer = setTimeout(function () { return _this.SendCache(); }, 0);
    };
    return ClientPortMapper;
}());
exports.ClientPortMapper = ClientPortMapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9ydE1hcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Qb3J0TWFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHlCQUEyQjtBQUMzQjtJQUFBO0lBR0EsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFIWSw4QkFBUztBQUl0QjtJQUFBO0lBU0EsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQVRELElBU0M7QUFUWSx3Q0FBYztBQVUzQjtJQUFBO0lBU0EsQ0FBQztJQUFELHVCQUFDO0FBQUQsQ0FBQyxBQVRELElBU0M7QUFUWSw0Q0FBZ0I7QUFVN0IsU0FBc0IsWUFBWSxDQUFDLFNBQWlCOzs7WUFDbEQsc0JBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtvQkFDakMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUM3QixJQUFJO3dCQUNGLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FBRzs0QkFDbEIsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQ0FDdEMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQ0FDekIsaUZBQWlGO2dDQUNqRixHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtvQ0FDWixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7b0NBQ3RCLGFBQWE7b0NBQ2IsSUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztvQ0FDcEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFiLENBQWEsQ0FBQyxDQUFDO2dDQUNqQyxDQUFDLENBQUMsQ0FBQzs2QkFDSjtpQ0FBTTtnQ0FDTCxx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