"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiSpanExporter = exports.MultiMetricExporter = exports.instrumentation = exports.getNetworkData = void 0;
var sdk_node_1 = require("@opentelemetry/sdk-node");
var exporter_trace_otlp_grpc_1 = require("@opentelemetry/exporter-trace-otlp-grpc");
var api_1 = require("@opentelemetry/api");
var sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
var resources_1 = require("@opentelemetry/resources");
var semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
// import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
// import { HostMetrics } from '@opentelemetry/host-metrics';
var exporter_metrics_otlp_grpc_1 = require("@opentelemetry/exporter-metrics-otlp-grpc");
var pidusage = require("pidusage");
var os = require("os");
var fs = require("fs");
var path = require("path");
var runner_1 = require("./runner");
var api_2 = require("@opentelemetry/api");
if (process.env.otel_log_level == "debug") {
    api_2.diag.setLogger(new api_2.DiagConsoleLogger(), api_2.DiagLogLevel.DEBUG);
}
else if (process.env.otel_log_level != null && process.env.otel_log_level != "") {
    api_2.diag.setLogger(new api_2.DiagConsoleLogger(), api_2.DiagLogLevel.INFO);
}
var SI = require("systeminformation");
function getNetworkData() {
    return new Promise(function (resolve) {
        SI.networkStats()
            .then(resolve)
            .catch(function () {
            resolve([]);
        });
    });
}
exports.getNetworkData = getNetworkData;
var instrumentation = /** @class */ (function () {
    function instrumentation() {
    }
    instrumentation.init = function () {
        var _this = this;
        if (!instrumentation.setdefaultlabels())
            return true;
        if (!instrumentation.firstinit)
            return true;
        // const contextManager = new AsyncHooksContextManager().enable();
        // context.setGlobalContextManager(contextManager)
        instrumentation.traceProvider = new sdk_node_1.node.NodeTracerProvider({
            resource: instrumentation.resource
        });
        sdk_node_1.api.trace.setGlobalTracerProvider(instrumentation.traceProvider);
        instrumentation.meterProvider = new sdk_metrics_1.MeterProvider({
            resource: instrumentation.resource
        });
        sdk_node_1.api.metrics.setGlobalMeterProvider(instrumentation.meterProvider);
        var enable_analytics = true;
        if (process.env.enable_analytics != null && process.env.enable_analytics.toLowerCase() == "false") {
            enable_analytics = false;
        }
        instrumentation.spanexporter = new MultiSpanExporter([]);
        instrumentation.metricexporter = new MultiMetricExporter([]);
        instrumentation.meterProvider.addMetricReader(new sdk_metrics_1.PeriodicExportingMetricReader({
            exporter: instrumentation.metricexporter,
            exportIntervalMillis: 5000,
            exportTimeoutMillis: 5000,
        }));
        instrumentation.traceProvider.addSpanProcessor(new sdk_node_1.tracing.BatchSpanProcessor(instrumentation.spanexporter, { maxQueueSize: instrumentation.maxQueueSize }));
        if (enable_analytics == true) {
            // instrumentation.addMeterURL(instrumentation.baseurl)
            // if (process.env.enable_detailed_analytic == "true") {
            //     instrumentation.addTraceURL(instrumentation.baseurl)
            // }
            instrumentation.metricexporter.addExporter(new exporter_metrics_otlp_grpc_1.OTLPMetricExporter({
                url: instrumentation.baseurl
            }));
            if (process.env.enable_detailed_analytic == "true") {
                instrumentation.spanexporter.addExporter(new exporter_trace_otlp_grpc_1.OTLPTraceExporter({
                    url: instrumentation.baseurl
                }));
            }
        }
        var otel_trace_url = process.env.otel_trace_url || "";
        var otel_metric_url = process.env.otel_metric_url || "";
        if (otel_metric_url != "") {
            // instrumentation.addMeterURL(otel_metric_url);
            instrumentation.metricexporter.addExporter(new exporter_metrics_otlp_grpc_1.OTLPMetricExporter({
                url: otel_metric_url
            }));
        }
        if (otel_trace_url != "") {
            // instrumentation.addTraceURL(otel_trace_url);
            instrumentation.spanexporter.addExporter(new exporter_trace_otlp_grpc_1.OTLPTraceExporter({
                url: otel_trace_url
            }));
        }
        if (enable_analytics == false && otel_metric_url == "" && otel_trace_url == "") {
            return true;
        }
        // const hostMetrics = new HostMetrics({
        //     meterProvider: instrumentation.meterProvider,
        //     name: "nodeagent"
        // });
        // if (process.env.otel_log_level != null && process.env.otel_log_level != "") {
        //     console.log("Starting HostMetrics");
        // }
        // hostMetrics.start();
        instrumentation.creatememorymeters();
        process.on('SIGINT', function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, 6, 7]);
                        if (!(instrumentation.traceProvider != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, instrumentation.traceProvider.shutdown()];
                    case 1:
                        _a.sent();
                        instrumentation.traceProvider = null;
                        _a.label = 2;
                    case 2:
                        if (!(instrumentation.meterProvider != null)) return [3 /*break*/, 4];
                        return [4 /*yield*/, instrumentation.meterProvider.shutdown()];
                    case 3:
                        _a.sent();
                        instrumentation.meterProvider = null;
                        _a.label = 4;
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 7];
                    case 6: return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        instrumentation.firstinit = false;
        return true;
    };
    instrumentation.creatememorymeters = function () {
        var _this = this;
        var meter = instrumentation.meterProvider.getMeter("default");
        var nodejs_heap_size_used_bytes = meter.createObservableUpDownCounter('nodejs.heap.size.used.bytes', {
            description: 'Process heap size used from Node.js in bytes'
        });
        var system_elapsed_time = meter.createObservableUpDownCounter('process.elapsed.time', {
            description: 'ms since the start of the process'
        });
        var process_cpu_time = meter.createObservableUpDownCounter('process.cpu.time', {
            description: 'process cpu time'
        });
        var process_memory_usage = meter.createObservableUpDownCounter('process.memory.usage', {
            description: 'process memory usage'
        });
        var networkDropped = meter.createObservableCounter('system.network.dropped', {
            description: 'Network dropped packets',
        });
        var networkErrors = meter.createObservableCounter('system.network.errors', {
            description: 'Network errors counter',
        });
        var networkIo = meter.createObservableCounter('system.network.io', {
            description: 'Network transmit and received bytes',
        });
        meter.addBatchObservableCallback(function (observableResult) { return __awaiter(_this, void 0, void 0, function () {
            var memUsage, stats, networkUsages, i, j, networkUsage;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        memUsage = process.memoryUsage();
                        observableResult.observe(nodejs_heap_size_used_bytes, memUsage.heapUsed);
                        return [4 /*yield*/, pidusage(process.pid)];
                    case 1:
                        stats = _b.sent();
                        observableResult.observe(system_elapsed_time, stats.elapsed);
                        observableResult.observe(process_cpu_time, stats.cpu);
                        observableResult.observe(process_memory_usage, stats.memory);
                        return [4 /*yield*/, getNetworkData()];
                    case 2:
                        networkUsages = _b.sent();
                        for (i = 0, j = networkUsages.length; i < j; i++) {
                            networkUsage = networkUsages[i];
                            observableResult.observe(networkDropped, networkUsage.rx_dropped, (_a = {},
                                _a["device"] = networkUsage.iface,
                                _a.direction = "receive",
                                _a));
                            observableResult.observe(networkDropped, networkUsage.tx_dropped, {
                                device: networkUsage.iface,
                                direction: "transmit",
                            });
                            observableResult.observe(networkErrors, networkUsage.rx_errors, {
                                device: networkUsage.iface,
                                direction: "receive",
                            });
                            observableResult.observe(networkErrors, networkUsage.tx_errors, {
                                device: networkUsage.iface,
                                direction: "transmit",
                            });
                            observableResult.observe(networkIo, networkUsage.rx_bytes, {
                                device: networkUsage.iface,
                                direction: "receive",
                            });
                            observableResult.observe(networkIo, networkUsage.tx_bytes, {
                                device: networkUsage.iface,
                                direction: "transmit",
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); }, [
            networkDropped,
            networkErrors,
            networkIo,
            system_elapsed_time,
            process_cpu_time,
            process_memory_usage,
            nodejs_heap_size_used_bytes
        ]);
        var agent_package_cpu = meter.createObservableUpDownCounter('agent_package_cpu', {
            description: 'NodeAgent package CPU usage'
        });
        agent_package_cpu === null || agent_package_cpu === void 0 ? void 0 : agent_package_cpu.addCallback(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var _loop_1, s;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_1 = function (s) {
                            var p, stream, stats;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        p = runner_1.runner.processs[s];
                                        stream = runner_1.runner.streams.find(function (s) { return s.id == p.id; });
                                        if (!(p != null && stream != null)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, pidusage(p.pid)];
                                    case 1:
                                        stats = _b.sent();
                                        res.observe(stats.cpu, { packagename: stream.packagename, schedulename: stream.schedulename });
                                        _b.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        s = runner_1.runner.processs.length - 1;
                        _a.label = 1;
                    case 1:
                        if (!(s >= 0)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(s)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        s--;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        var agent_package_memory = meter.createObservableUpDownCounter('agent_package_memory', {
            description: 'NodeAgent package memory usage'
        });
        agent_package_memory === null || agent_package_memory === void 0 ? void 0 : agent_package_memory.addCallback(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var _loop_2, s;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_2 = function (s) {
                            var p, stream, stats;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        p = runner_1.runner.processs[s];
                                        stream = runner_1.runner.streams.find(function (s) { return s.id == p.id; });
                                        if (!(p != null && stream != null)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, pidusage(p.pid)];
                                    case 1:
                                        stats = _b.sent();
                                        res.observe(stats.memory, { packagename: stream.packagename, schedulename: stream.schedulename });
                                        _b.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        s = runner_1.runner.processs.length - 1;
                        _a.label = 1;
                    case 1:
                        if (!(s >= 0)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_2(s)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        s--;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        var agent_package_elapsed_time = meter.createObservableUpDownCounter('agent_package_elapsed_time', {
            description: 'ms since the start of the process'
        });
        agent_package_elapsed_time === null || agent_package_elapsed_time === void 0 ? void 0 : agent_package_elapsed_time.addCallback(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var _loop_3, s;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_3 = function (s) {
                            var p, stream, stats;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        p = runner_1.runner.processs[s];
                                        stream = runner_1.runner.streams.find(function (s) { return s.id == p.id; });
                                        if (!(p != null && stream != null)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, pidusage(p.pid)];
                                    case 1:
                                        stats = _b.sent();
                                        res.observe(stats.elapsed, { packagename: stream.packagename, schedulename: stream.schedulename });
                                        _b.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        s = runner_1.runner.processs.length - 1;
                        _a.label = 1;
                    case 1:
                        if (!(s >= 0)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_3(s)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        s--;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        var agent_package_ctime = meter.createObservableUpDownCounter('agent_package_ctime', {
            description: 'ms user + system time'
        });
        agent_package_ctime === null || agent_package_ctime === void 0 ? void 0 : agent_package_ctime.addCallback(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var _loop_4, s;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_4 = function (s) {
                            var p, stream, stats;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        p = runner_1.runner.processs[s];
                                        stream = runner_1.runner.streams.find(function (s) { return s.id == p.id; });
                                        if (!(p != null && stream != null)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, pidusage(p.pid)];
                                    case 1:
                                        stats = _b.sent();
                                        res.observe(stats.ctime, { packagename: stream.packagename, schedulename: stream.schedulename });
                                        _b.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        s = runner_1.runner.processs.length - 1;
                        _a.label = 1;
                    case 1:
                        if (!(s >= 0)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_4(s)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        s--;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    instrumentation.setdefaultlabels = function () {
        var _a;
        var hostname = (os.hostname()) || "unknown";
        instrumentation.defaultlabels["hostname"] = hostname;
        var packagefile = path.join(__dirname, "package.json");
        if (!fs.existsSync(packagefile))
            packagefile = path.join(__dirname, "..", "package.json");
        if (!fs.existsSync(packagefile))
            packagefile = path.join(__dirname, "..", "..", "package.json");
        if (!fs.existsSync(packagefile))
            packagefile = path.join(__dirname, "..", "..", "..", "package.json");
        if (fs.existsSync(packagefile)) {
            var packagejson = JSON.parse(fs.readFileSync(packagefile, "utf8"));
            instrumentation.version = packagejson.version;
        }
        var apiurl = process.env.oidc_config || process.env.apiurl || process.env.grpcapiurl || process.env.wsapiurl || "";
        // if (apiurl == "") return false;
        if (apiurl == "")
            apiurl = "http://localhost.openiap.io:80";
        var url = new URL(apiurl);
        var apihostname = (url.hostname.indexOf("grpc") == 0) ? url.hostname.substring(5) : url.hostname;
        var crypto = require('crypto');
        var openflow_uniqueid = process.env.openflow_uniqueid || crypto.createHash('md5').update(apihostname).digest("hex");
        instrumentation.defaultlabels["ofid"] = openflow_uniqueid;
        if (process.env.otel_log_level != null && process.env.otel_log_level != "") {
            console.log("ofid=" + openflow_uniqueid);
        }
        instrumentation.resource = new resources_1.Resource(__assign(__assign({}, instrumentation.defaultlabels), (_a = {}, _a[semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME] = 'nodeagent', _a[semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION] = instrumentation.version, _a)));
        return true;
    };
    instrumentation.setparent = function (traceId, spanId, traceFlags) {
        if (traceId === void 0) { traceId = undefined; }
        if (spanId === void 0) { spanId = undefined; }
        if (traceFlags === void 0) { traceFlags = api_1.TraceFlags.SAMPLED; }
        var root = api_1.ROOT_CONTEXT;
        if (traceId != null && traceId != "") {
            var spanContext = {
                traceId: traceId,
                spanId: spanId,
                traceFlags: api_1.TraceFlags.SAMPLED,
            };
            return api_1.trace.setSpanContext(api_1.ROOT_CONTEXT, spanContext);
        }
        else {
            return api_1.context.active();
        }
    };
    instrumentation.otel_trace_max_node_time_seconds = 300;
    instrumentation.baseurl = "https://otel.stats.openiap.io:443";
    instrumentation.defaultlabels = {};
    instrumentation.version = "0.0.1";
    instrumentation.maxQueueSize = 1000; // 100000;
    instrumentation.resource = new resources_1.Resource((_a = {},
        _a[semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME] = 'nodeagent',
        _a[semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION] = instrumentation.version,
        _a));
    instrumentation.traceProvider = null;
    instrumentation.meterProvider = null;
    // public static addMeterURL(url: string) {
    //     const statMetricReader = new PeriodicExportingMetricReader({
    //         exporter: new OTLPMetricExporter({
    //             url: url
    //         }),
    //         exportIntervalMillis: 3000,
    //     });
    //     instrumentation.meterProvider.addMetricReader(statMetricReader);
    // }
    // public static addTraceURL(url: string) {
    //     const stateTraceExporter = new OTLPTraceExporter({ url });
    //     instrumentation.traceProvider.addSpanProcessor(new tracing.BatchSpanProcessor(stateTraceExporter, { maxQueueSize: instrumentation.maxQueueSize }))
    // }
    instrumentation.firstinit = true;
    return instrumentation;
}());
exports.instrumentation = instrumentation;
var MultiMetricExporter = /** @class */ (function () {
    function MultiMetricExporter(exporters) {
        this.isshutdown = false;
        this.exporters = exporters;
    }
    MultiMetricExporter.prototype.addExporter = function (exporter) {
        this.exporters.push(exporter);
    };
    MultiMetricExporter.prototype.export = function (metrics, callback) {
        if (!this.exporters)
            return;
        if (this.exporters.length == 0)
            return;
        for (var i = 0; this.exporters.length > i; i++) {
            try {
                this.exporters[i].export(metrics, callback);
            }
            catch (error) {
                console.error(error);
            }
        }
    };
    MultiMetricExporter.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isshutdown = true;
                        return [4 /*yield*/, Promise.all(this.exporters.map(function (e) { return e.shutdown(); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MultiMetricExporter.prototype.forceFlush = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.exporters.forEach(function (exporter) {
                });
                return [2 /*return*/];
            });
        });
    };
    MultiMetricExporter.prototype.selectAggregationTemporality = function (instrumentType) {
        if (!this.exporters)
            return;
        if (this.exporters.length == 0)
            return;
        for (var i = 0; this.exporters.length > i; i++) {
            try {
                return this.exporters[i].selectAggregationTemporality(instrumentType);
            }
            catch (error) {
                console.error(error);
            }
        }
    };
    return MultiMetricExporter;
}());
exports.MultiMetricExporter = MultiMetricExporter;
var MultiSpanExporter = /** @class */ (function () {
    function MultiSpanExporter(exporters) {
        this.exporters = exporters;
    }
    MultiSpanExporter.prototype.addExporter = function (exporter) {
        this.exporters.push(exporter);
    };
    MultiSpanExporter.prototype.export = function (spans, callback) {
        if (!this.exporters)
            return;
        if (this.exporters.length == 0)
            return;
        for (var i = 0; this.exporters.length > i; i++) {
            try {
                this.exporters[i].export(spans, callback);
            }
            catch (error) {
                console.error(error);
            }
        }
    };
    MultiSpanExporter.prototype.forceFlush = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.exporters.forEach(function (exporter) {
                });
                return [2 /*return*/];
            });
        });
    };
    MultiSpanExporter.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this.exporters.map(function (e) { return e.shutdown(); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MultiSpanExporter;
}());
exports.MultiSpanExporter = MultiSpanExporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2luc3RydW1lbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBNkQ7QUFDN0Qsb0ZBQTRFO0FBQzVFLDBDQUFvRztBQUNwRywwREFBMEY7QUFDMUYsc0RBQW9EO0FBQ3BELDRFQUFpRjtBQUNqRixnRkFBZ0Y7QUFDaEYsNkRBQTZEO0FBQzdELHdGQUErRTtBQUMvRSxtQ0FBcUM7QUFFckMsdUJBQXlCO0FBQ3pCLHVCQUF5QjtBQUN6QiwyQkFBNkI7QUFHN0IsbUNBQWtDO0FBQ2xDLDBDQUEyRTtBQUMzRSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLE9BQU8sRUFBRTtJQUN2QyxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdUJBQWlCLEVBQUUsRUFBRSxrQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQy9EO0tBQU0sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksRUFBRSxFQUFFO0lBQy9FLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx1QkFBaUIsRUFBRSxFQUFFLGtCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDOUQ7QUFFRCxzQ0FBd0M7QUFDeEMsU0FBZ0IsY0FBYztJQUMxQixPQUFPLElBQUksT0FBTyxDQUFnQixVQUFBLE9BQU87UUFDckMsRUFBRSxDQUFDLFlBQVksRUFBRTthQUNaLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDYixLQUFLLENBQUM7WUFDSCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFSRCx3Q0FRQztBQVdEO0lBQUE7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