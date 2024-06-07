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
    instrumentation.init = function (client) {
        var _this = this;
        if (!instrumentation.setdefaultlabels(client))
            return true;
        if (!instrumentation.firstinit) {
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
            return true;
        }
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
        else {
            console.warn("analytics disabled, please consider enabling this, to help us improve the product!");
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
        // if (enable_analytics == false && otel_metric_url == "" && otel_trace_url == "") {
        //     return true;
        // }
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
        // nodejs_heap_size_used_bytes
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
    instrumentation.setdefaultlabels = function (client) {
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
        if (client.flowconfig != null && client.flowconfig.domain != null && client.flowconfig.domain != "") {
            apihostname = client.flowconfig.domain;
            if (client.flowconfig.openflow_uniqueid != null && client.flowconfig.openflow_uniqueid != "") {
                process.env.openflow_uniqueid = client.flowconfig.openflow_uniqueid;
            }
            var enable_analytics = process.env.enable_analytics || "";
            var otel_trace_url = process.env.otel_trace_url || "";
            var otel_metric_url = process.env.otel_metric_url || "";
            if (enable_analytics == "" && client.flowconfig.enable_analytics != null && client.flowconfig.enable_analytics != "") {
                process.env.enable_analytics = client.flowconfig.enable_analytics;
            }
            if (client.flowconfig.otel_metric_url != otel_metric_url && client.flowconfig.otel_metric_url != null && client.flowconfig.otel_metric_url != "") {
                process.env.otel_metric_url = client.flowconfig.otel_metric_url;
            }
            if (client.flowconfig.otel_trace_url != otel_trace_url && client.flowconfig.otel_trace_url != null && client.flowconfig.otel_trace_url != "") {
                process.env.otel_trace_url = client.flowconfig.otel_trace_url;
            }
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2luc3RydW1lbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBNkQ7QUFDN0Qsb0ZBQTRFO0FBQzVFLDBDQUFvRztBQUNwRywwREFBMEY7QUFDMUYsc0RBQW9EO0FBQ3BELDRFQUFpRjtBQUNqRixnRkFBZ0Y7QUFDaEYsNkRBQTZEO0FBQzdELHdGQUErRTtBQUMvRSxtQ0FBcUM7QUFFckMsdUJBQXlCO0FBQ3pCLHVCQUF5QjtBQUN6QiwyQkFBNkI7QUFHN0IsbUNBQWtDO0FBQ2xDLDBDQUEyRTtBQUMzRSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLE9BQU8sRUFBRTtJQUN2QyxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdUJBQWlCLEVBQUUsRUFBRSxrQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQy9EO0tBQU0sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksRUFBRSxFQUFFO0lBQy9FLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx1QkFBaUIsRUFBRSxFQUFFLGtCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDOUQ7QUFFRCxzQ0FBd0M7QUFDeEMsU0FBZ0IsY0FBYztJQUMxQixPQUFPLElBQUksT0FBTyxDQUFnQixVQUFBLE9BQU87UUFDckMsRUFBRSxDQUFDLFlBQVksRUFBRTthQUNaLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDYixLQUFLLENBQUM7WUFDSCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFSRCx3Q0FRQztBQVdEO0lBQUE7SUFvVUEsQ0FBQztJQXhTaUIsb0JBQUksR0FBbEIsVUFBbUIsTUFBYztRQUFqQyxpQkF1R0M7UUF0R0csSUFBRyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUMxRCxJQUFHLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRTtZQUMzQixJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7WUFDdEQsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLElBQUksRUFBRSxDQUFDO1lBQ3hELElBQUksZUFBZSxJQUFJLEVBQUUsRUFBRTtnQkFDdkIsZ0RBQWdEO2dCQUNoRCxlQUFlLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLCtDQUFrQixDQUFDO29CQUM5RCxHQUFHLEVBQUUsZUFBZTtpQkFDdkIsQ0FBQyxDQUFDLENBQUE7YUFDTjtZQUNELElBQUksY0FBYyxJQUFJLEVBQUUsRUFBRTtnQkFDdEIsK0NBQStDO2dCQUMvQyxlQUFlLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLDRDQUFpQixDQUFDO29CQUMzRCxHQUFHLEVBQUUsY0FBYztpQkFDdEIsQ0FBQyxDQUFDLENBQUE7YUFDTjtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxrRUFBa0U7UUFDbEUsa0RBQWtEO1FBRWxELGVBQWUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxlQUFJLENBQUMsa0JBQWtCLENBQUM7WUFDeEQsUUFBUSxFQUFFLGVBQWUsQ0FBQyxRQUFRO1NBQ3JDLENBQUMsQ0FBQTtRQUNGLGNBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQ2hFLGVBQWUsQ0FBQyxhQUFhLEdBQUcsSUFBSSwyQkFBYSxDQUFDO1lBQzlDLFFBQVEsRUFBRSxlQUFlLENBQUMsUUFBUTtTQUNyQyxDQUFDLENBQUM7UUFDSCxjQUFHLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNsRSxJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQztRQUM1QixJQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksT0FBTyxFQUFFO1lBQzlGLGdCQUFnQixHQUFHLEtBQUssQ0FBQztTQUM1QjtRQUNELGVBQWUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RCxlQUFlLENBQUMsY0FBYyxHQUFHLElBQUksbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0QsZUFBZSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSwyQ0FBNkIsQ0FBQztZQUM1RSxRQUFRLEVBQUUsZUFBZSxDQUFDLGNBQWM7WUFDeEMsb0JBQW9CLEVBQUUsSUFBSTtZQUMxQixtQkFBbUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBRSxDQUFBO1FBQ0osZUFBZSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLGtCQUFPLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzVKLElBQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO1lBQzFCLHVEQUF1RDtZQUN2RCx3REFBd0Q7WUFDeEQsMkRBQTJEO1lBQzNELElBQUk7WUFDSixlQUFlLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLCtDQUFrQixDQUFDO2dCQUM5RCxHQUFHLEVBQUUsZUFBZSxDQUFDLE9BQU87YUFDL0IsQ0FBQyxDQUFDLENBQUE7WUFDSCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLElBQUksTUFBTSxFQUFFO2dCQUNoRCxlQUFlLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLDRDQUFpQixDQUFDO29CQUMzRCxHQUFHLEVBQUUsZUFBZSxDQUFDLE9BQU87aUJBQy9CLENBQUMsQ0FBQyxDQUFBO2FBQ047U0FDSjthQUFNO1lBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxvRkFBb0YsQ0FBQyxDQUFDO1NBQ3RHO1FBQ0QsSUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDO1FBQ3RELElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQztRQUN4RCxJQUFJLGVBQWUsSUFBSSxFQUFFLEVBQUU7WUFDdkIsZ0RBQWdEO1lBQ2hELGVBQWUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksK0NBQWtCLENBQUM7Z0JBQzlELEdBQUcsRUFBRSxlQUFlO2FBQ3ZCLENBQUMsQ0FBQyxDQUFBO1NBQ047UUFDRCxJQUFJLGNBQWMsSUFBSSxFQUFFLEVBQUU7WUFDdEIsK0NBQStDO1lBQy9DLGVBQWUsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksNENBQWlCLENBQUM7Z0JBQzNELEdBQUcsRUFBRSxjQUFjO2FBQ3RCLENBQUMsQ0FBQyxDQUFBO1NBQ047UUFDRCxvRkFBb0Y7UUFDcEYsbUJBQW1CO1FBQ25CLElBQUk7UUFFSix3Q0FBd0M7UUFDeEMsb0RBQW9EO1FBQ3BELHdCQUF3QjtRQUN4QixNQUFNO1FBQ04sZ0ZBQWdGO1FBQ2hGLDJDQUEyQztRQUMzQyxJQUFJO1FBQ0osdUJBQXVCO1FBQ3ZCLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1FBQ3BDLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFOzs7Ozs7NkJBRVQsQ0FBQSxlQUFlLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQSxFQUFyQyx3QkFBcUM7d0JBQ3JDLHFCQUFNLGVBQWUsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUE7O3dCQUE5QyxTQUE4QyxDQUFDO3dCQUMvQyxlQUFlLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQzs7OzZCQUVyQyxDQUFBLGVBQWUsQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFBLEVBQXJDLHdCQUFxQzt3QkFDckMscUJBQU0sZUFBZSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBQTs7d0JBQTlDLFNBQThDLENBQUM7d0JBQy9DLGVBQWUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDOzs7Ozt3QkFHekMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFLLENBQUMsQ0FBQzs7Ozs7O2FBRzVCLENBQUMsQ0FBQztRQUNILGVBQWUsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDYyxrQ0FBa0IsR0FBakM7UUFBQSxpQkFnSUM7UUEvSEcsSUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFaEUsOEJBQThCO1FBQzlCLElBQU0sMkJBQTJCLEdBQUcsS0FBSyxDQUFDLDZCQUE2QixDQUFDLDZCQUE2QixFQUFFO1lBQ25HLFdBQVcsRUFBRSw4Q0FBOEM7U0FDOUQsQ0FBQyxDQUFDO1FBQ0gsSUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsNkJBQTZCLENBQUMsc0JBQXNCLEVBQUU7WUFDcEYsV0FBVyxFQUFFLG1DQUFtQztTQUNuRCxDQUFDLENBQUM7UUFDSCxJQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxrQkFBa0IsRUFBRTtZQUM3RSxXQUFXLEVBQUUsa0JBQWtCO1NBQ2xDLENBQUMsQ0FBQztRQUNILElBQU0sb0JBQW9CLEdBQUcsS0FBSyxDQUFDLDZCQUE2QixDQUFDLHNCQUFzQixFQUFFO1lBQ3JGLFdBQVcsRUFBRSxzQkFBc0I7U0FDdEMsQ0FBQyxDQUFDO1FBQ0gsSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixDQUFDLHdCQUF3QixFQUFDO1lBQzFFLFdBQVcsRUFBRSx5QkFBeUI7U0FDekMsQ0FBQyxDQUFDO1FBQ0gsSUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixDQUFDLHVCQUF1QixFQUFDO1lBQ3hFLFdBQVcsRUFBRSx3QkFBd0I7U0FDeEMsQ0FBQyxDQUFDO1FBQ0gsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixDQUFDLG1CQUFtQixFQUFDO1lBQ2hFLFdBQVcsRUFBRSxxQ0FBcUM7U0FDckQsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLDBCQUEwQixDQUFDLFVBQU8sZ0JBQWdCOzs7Ozs7d0JBQzlDLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQ3ZDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBRTNELHFCQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUE7O3dCQUFuQyxLQUFLLEdBQUcsU0FBMkI7d0JBQ3pDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzdELGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3RELGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBRXhCLHFCQUFNLGNBQWMsRUFBRSxFQUFBOzt3QkFBckQsYUFBYSxHQUFrQixTQUFzQjt3QkFDM0QsS0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQzVDLFlBQVksR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3RDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLFVBQVU7Z0NBQzlELEdBQUMsUUFBUSxJQUFHLFlBQVksQ0FBQyxLQUFLO2dDQUM5QixZQUFTLEdBQUUsU0FBUztvQ0FDcEIsQ0FBQzs0QkFDSCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUU7Z0NBQ2hFLE1BQU0sRUFBRSxZQUFZLENBQUMsS0FBSztnQ0FDMUIsU0FBUyxFQUFFLFVBQVU7NkJBQ3RCLENBQUMsQ0FBQzs0QkFFSCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxTQUFTLEVBQUU7Z0NBQzlELE1BQU0sRUFBRSxZQUFZLENBQUMsS0FBSztnQ0FDMUIsU0FBUyxFQUFFLFNBQVM7NkJBQ3JCLENBQUMsQ0FBQzs0QkFDSCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxTQUFTLEVBQUU7Z0NBQzlELE1BQU0sRUFBRSxZQUFZLENBQUMsS0FBSztnQ0FDMUIsU0FBUyxFQUFFLFVBQVU7NkJBQ3RCLENBQUMsQ0FBQzs0QkFFSCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxRQUFRLEVBQUU7Z0NBQ3pELE1BQU0sRUFBRSxZQUFZLENBQUMsS0FBSztnQ0FDMUIsU0FBUyxFQUFFLFNBQVM7NkJBQ3JCLENBQUMsQ0FBQzs0QkFDSCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxRQUFRLEVBQUU7Z0NBQ3pELE1BQU0sRUFBRSxZQUFZLENBQUMsS0FBSztnQ0FDMUIsU0FBUyxFQUFFLFVBQVU7NkJBQ3RCLENBQUMsQ0FBQzt5QkFDSjs7OzthQUNOLEVBQUU7WUFDQyxjQUFjO1lBQ2QsYUFBYTtZQUNiLFNBQVM7WUFDVCxtQkFBbUI7WUFDbkIsZ0JBQWdCO1lBQ2hCLG9CQUFvQjtZQUNwQiwyQkFBMkI7U0FDOUIsQ0FBQyxDQUFDO1FBR0gsSUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsNkJBQTZCLENBQUMsbUJBQW1CLEVBQUU7WUFDL0UsV0FBVyxFQUFFLDZCQUE2QjtTQUM3QyxDQUFDLENBQUM7UUFDSCxpQkFBaUIsYUFBakIsaUJBQWlCLHVCQUFqQixpQkFBaUIsQ0FBRSxXQUFXLENBQUMsVUFBTyxHQUFHOzs7Ozs0Q0FDNUIsQ0FBQzs7Ozs7d0NBQ0EsQ0FBQyxHQUFHLGVBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQ3ZCLE1BQU0sR0FBRyxlQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQzs2Q0FDckQsQ0FBQSxDQUFDLElBQUksSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUEsRUFBM0Isd0JBQTJCO3dDQUNaLHFCQUFNLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUE7O3dDQUE3QixLQUFLLEdBQUcsU0FBcUI7d0NBQ25DLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQzs7Ozs7O3dCQUw3RixDQUFDLEdBQUcsZUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQzs7OzZCQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtzREFBdEMsQ0FBQzs7Ozs7d0JBQXVDLENBQUMsRUFBRSxDQUFBOzs7OzthQVF2RCxDQUFDLENBQUM7UUFDSCxJQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxzQkFBc0IsRUFBRTtZQUNyRixXQUFXLEVBQUUsZ0NBQWdDO1NBQ2hELENBQUMsQ0FBQztRQUNILG9CQUFvQixhQUFwQixvQkFBb0IsdUJBQXBCLG9CQUFvQixDQUFFLFdBQVcsQ0FBQyxVQUFPLEdBQUc7Ozs7OzRDQUMvQixDQUFDOzs7Ozt3Q0FDQSxDQUFDLEdBQUcsZUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDdkIsTUFBTSxHQUFHLGVBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFaLENBQVksQ0FBQyxDQUFDOzZDQUNyRCxDQUFBLENBQUMsSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQSxFQUEzQix3QkFBMkI7d0NBQ1oscUJBQU0sUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQTs7d0NBQTdCLEtBQUssR0FBRyxTQUFxQjt3Q0FDbkMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7d0JBTGpHLENBQUMsR0FBRyxlQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDOzs7NkJBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxDQUFBO3NEQUF0QyxDQUFDOzs7Ozt3QkFBdUMsQ0FBQyxFQUFFLENBQUE7Ozs7O2FBUXZELENBQUMsQ0FBQztRQUNILElBQU0sMEJBQTBCLEdBQUcsS0FBSyxDQUFDLDZCQUE2QixDQUFDLDRCQUE0QixFQUFFO1lBQ2pHLFdBQVcsRUFBRSxtQ0FBbUM7U0FDbkQsQ0FBQyxDQUFDO1FBQ0gsMEJBQTBCLGFBQTFCLDBCQUEwQix1QkFBMUIsMEJBQTBCLENBQUUsV0FBVyxDQUFDLFVBQU8sR0FBRzs7Ozs7NENBQ3JDLENBQUM7Ozs7O3dDQUNBLENBQUMsR0FBRyxlQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dDQUN2QixNQUFNLEdBQUcsZUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUM7NkNBQ3JELENBQUEsQ0FBQyxJQUFJLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxDQUFBLEVBQTNCLHdCQUEyQjt3Q0FDWixxQkFBTSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFBOzt3Q0FBN0IsS0FBSyxHQUFHLFNBQXFCO3dDQUNuQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7Ozs7Ozt3QkFMakcsQ0FBQyxHQUFHLGVBQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUM7Ozs2QkFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLENBQUE7c0RBQXRDLENBQUM7Ozs7O3dCQUF1QyxDQUFDLEVBQUUsQ0FBQTs7Ozs7YUFRdkQsQ0FBQyxDQUFDO1FBQ0gsSUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsNkJBQTZCLENBQUMscUJBQXFCLEVBQUU7WUFDbkYsV0FBVyxFQUFFLHVCQUF1QjtTQUN2QyxDQUFDLENBQUM7UUFDSCxtQkFBbUIsYUFBbkIsbUJBQW1CLHVCQUFuQixtQkFBbUIsQ0FBRSxXQUFXLENBQUMsVUFBTyxHQUFHOzs7Ozs0Q0FDOUIsQ0FBQzs7Ozs7d0NBQ0EsQ0FBQyxHQUFHLGVBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQ3ZCLE1BQU0sR0FBRyxlQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQzs2Q0FDckQsQ0FBQSxDQUFDLElBQUksSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUEsRUFBM0Isd0JBQTJCO3dDQUNaLHFCQUFNLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUE7O3dDQUE3QixLQUFLLEdBQUcsU0FBcUI7d0NBQ25DLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQzs7Ozs7O3dCQUwvRixDQUFDLEdBQUcsZUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQzs7OzZCQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtzREFBdEMsQ0FBQzs7Ozs7d0JBQXVDLENBQUMsRUFBRSxDQUFBOzs7OzthQVF2RCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ2EsZ0NBQWdCLEdBQTlCLFVBQStCLE1BQWM7O1FBQ3pDLElBQU0sUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksU0FBUyxDQUFDO1FBQzlDLGVBQWUsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDO1FBQ3JELElBQUksV0FBVyxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztZQUFFLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUE7UUFDekYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQUUsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUE7UUFDL0YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQUUsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFBO1FBRXJHLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM1QixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbkUsZUFBZSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1NBQ2pEO1FBQ0QsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO1FBQ25ILGtDQUFrQztRQUNsQyxJQUFJLE1BQU0sSUFBSSxFQUFFO1lBQUUsTUFBTSxHQUFHLGdDQUFnQyxDQUFDO1FBQzVELElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLElBQUksV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBRWpHLElBQUcsTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLEVBQUUsRUFBRTtZQUNoRyxXQUFXLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7WUFDdkMsSUFBRyxNQUFNLENBQUMsVUFBVSxDQUFDLGlCQUFpQixJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLGlCQUFpQixJQUFJLEVBQUUsRUFBRTtnQkFDekYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDO2FBQ3ZFO1lBQ0QsSUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztZQUMxRCxJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7WUFDdEQsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLElBQUksRUFBRSxDQUFDO1lBQ3hELElBQUcsZ0JBQWdCLElBQUksRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLElBQUksRUFBRSxFQUFFO2dCQUNqSCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7YUFDckU7WUFDRCxJQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxJQUFJLGVBQWUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLGVBQWUsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLElBQUksRUFBRSxFQUFFO2dCQUM3SSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQzthQUNuRTtZQUNELElBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLElBQUksY0FBYyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLGNBQWMsSUFBSSxFQUFFLEVBQUU7Z0JBQ3pJLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDO2FBQ2pFO1NBQ0o7UUFDRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsSUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0SCxlQUFlLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGlCQUFpQixDQUFDO1FBRTFELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLEVBQUUsRUFBRTtZQUN4RSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO1NBQzVDO1FBQ0QsZUFBZSxDQUFDLFFBQVEsR0FBRyxJQUFJLG9CQUFRLHVCQUNoQyxlQUFlLENBQUMsYUFBYSxnQkFDL0IsaURBQTBCLENBQUMsWUFBWSxJQUFHLFdBQVcsS0FDckQsaURBQTBCLENBQUMsZUFBZSxJQUFHLGVBQWUsQ0FBQyxPQUFPLE9BQ3ZFLENBQUE7UUFDRixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ2EseUJBQVMsR0FBdkIsVUFBd0IsT0FBMkIsRUFBRSxNQUEwQixFQUFFLFVBQStCO1FBQXhGLHdCQUFBLEVBQUEsbUJBQTJCO1FBQUUsdUJBQUEsRUFBQSxrQkFBMEI7UUFBRSwyQkFBQSxFQUFBLGFBQWEsZ0JBQVUsQ0FBQyxPQUFPO1FBQzVHLElBQUksSUFBSSxHQUFHLGtCQUFZLENBQUM7UUFDeEIsSUFBSSxPQUFPLElBQUksSUFBSSxJQUFJLE9BQU8sSUFBSSxFQUFFLEVBQUU7WUFDbEMsSUFBTSxXQUFXLEdBQWdCO2dCQUM3QixPQUFPLFNBQUE7Z0JBQ1AsTUFBTSxRQUFBO2dCQUNOLFVBQVUsRUFBRSxnQkFBVSxDQUFDLE9BQU87YUFDakMsQ0FBQztZQUNGLE9BQU8sV0FBSyxDQUFDLGNBQWMsQ0FBQyxrQkFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQzFEO2FBQU07WUFDSCxPQUFPLGFBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMzQjtJQUNMLENBQUM7SUFsVU0sZ0RBQWdDLEdBQUcsR0FBRyxDQUFDO0lBQ3ZDLHVCQUFPLEdBQUcsbUNBQW1DLENBQUM7SUFDOUMsNkJBQWEsR0FBUSxFQUFFLENBQUM7SUFDeEIsdUJBQU8sR0FBRyxPQUFPLENBQUE7SUFDakIsNEJBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVO0lBQy9CLHdCQUFRLEdBQUcsSUFBSSxvQkFBUTtRQUMxQixHQUFDLGlEQUEwQixDQUFDLFlBQVksSUFBRyxXQUFXO1FBQ3RELEdBQUMsaURBQTBCLENBQUMsZUFBZSxJQUFHLGVBQWUsQ0FBQyxPQUFPO1lBQ3ZFLENBQUE7SUFDWSw2QkFBYSxHQUE0QixJQUFJLENBQUM7SUFDOUMsNkJBQWEsR0FBa0IsSUFBSSxDQUFDO0lBQ2xELDJDQUEyQztJQUMzQyxtRUFBbUU7SUFDbkUsNkNBQTZDO0lBQzdDLHVCQUF1QjtJQUN2QixjQUFjO0lBQ2Qsc0NBQXNDO0lBQ3RDLFVBQVU7SUFDVix1RUFBdUU7SUFDdkUsSUFBSTtJQUNKLDJDQUEyQztJQUMzQyxpRUFBaUU7SUFDakUseUpBQXlKO0lBQ3pKLElBQUk7SUFDVyx5QkFBUyxHQUFXLElBQUksQ0FBQztJQTJTNUMsc0JBQUM7Q0FBQSxBQXBVRCxJQW9VQztBQXBVWSwwQ0FBZTtBQXVVNUI7SUFHSSw2QkFBWSxTQUErQjtRQURuQyxlQUFVLEdBQVksS0FBSyxDQUFDO1FBRWhDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFDRCx5Q0FBVyxHQUFYLFVBQVksUUFBNEI7UUFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNELG9DQUFNLEdBQU4sVUFBTyxPQUF3QixFQUFFLFFBQXdDO1FBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFDNUIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQUUsT0FBTztRQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUMsSUFBSTtnQkFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDL0M7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3hCO1NBQ0o7SUFDTCxDQUFDO0lBQ0ssc0NBQVEsR0FBZDs7Ozs7d0JBQ0ksSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7d0JBQ3ZCLHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUMsRUFBQTs7d0JBQTFELFNBQTBELENBQUM7Ozs7O0tBQzlEO0lBQ0ssd0NBQVUsR0FBaEI7OztnQkFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7Z0JBQ2hDLENBQUMsQ0FBQyxDQUFDOzs7O0tBRU47SUFDRCwwREFBNEIsR0FBNUIsVUFBNkIsY0FBOEI7UUFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUM1QixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUM7WUFBRSxPQUFPO1FBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QyxJQUFJO2dCQUNBLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUN6RTtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDeEI7U0FDSjtJQUNMLENBQUM7SUFDTCwwQkFBQztBQUFELENBQUMsQUF4Q0QsSUF3Q0M7QUF4Q1ksa0RBQW1CO0FBNkNoQztJQUVJLDJCQUFZLFNBQXlCO1FBQ2pDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFDRCx1Q0FBVyxHQUFYLFVBQVksUUFBc0I7UUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNELGtDQUFNLEdBQU4sVUFDSSxLQUFxQixFQUNyQixRQUF3QztRQUV4QyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBQzVCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQztZQUFFLE9BQU87UUFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVDLElBQUk7Z0JBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzdDO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN4QjtTQUNKO0lBQ0wsQ0FBQztJQUNLLHNDQUFVLEdBQWhCOzs7Z0JBQ0ksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRO2dCQUNoQyxDQUFDLENBQUMsQ0FBQzs7OztLQUNOO0lBQ0ssb0NBQVEsR0FBZDs7Ozs0QkFDSSxxQkFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFaLENBQVksQ0FBQyxDQUFDLEVBQUE7O3dCQUExRCxTQUEwRCxDQUFDOzs7OztLQUM5RDtJQUNMLHdCQUFDO0FBQUQsQ0FBQyxBQTdCRCxJQTZCQztBQTdCWSw4Q0FBaUIifQ==