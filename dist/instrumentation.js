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
exports.MultiSpanExporter = exports.MultiMetricExporter = exports.instrumentation = void 0;
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
        var nodejs_heap_size_used_bytes = meter.createObservableUpDownCounter('nodejs_heap_size_used_bytes', {
            description: 'Process heap size used from Node.js in bytes'
        });
        nodejs_heap_size_used_bytes === null || nodejs_heap_size_used_bytes === void 0 ? void 0 : nodejs_heap_size_used_bytes.addCallback(function (res) {
            var memUsage = process.memoryUsage();
            res.observe(memUsage.heapUsed);
        });
        var system_elapsed_time = meter.createObservableUpDownCounter('system_elapsed_time', {
            description: 'ms since the start of the process'
        });
        system_elapsed_time === null || system_elapsed_time === void 0 ? void 0 : system_elapsed_time.addCallback(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pidusage(process.pid)];
                    case 1:
                        stats = _a.sent();
                        res.observe(stats.elapsed);
                        return [2 /*return*/];
                }
            });
        }); });
        var process_cpu_time = meter.createObservableUpDownCounter('process_cpu_time', {
            description: 'process cpu time'
        });
        process_cpu_time === null || process_cpu_time === void 0 ? void 0 : process_cpu_time.addCallback(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pidusage(process.pid)];
                    case 1:
                        stats = _a.sent();
                        res.observe(stats.cpu);
                        return [2 /*return*/];
                }
            });
        }); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2luc3RydW1lbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBNkQ7QUFDN0Qsb0ZBQTRFO0FBQzVFLDBDQUFvRztBQUNwRywwREFBMEY7QUFDMUYsc0RBQW9EO0FBQ3BELDRFQUFpRjtBQUNqRixnRkFBZ0Y7QUFDaEYsNkRBQTZEO0FBQzdELHdGQUErRTtBQUMvRSxtQ0FBcUM7QUFFckMsdUJBQXlCO0FBQ3pCLHVCQUF5QjtBQUN6QiwyQkFBNkI7QUFHN0IsbUNBQWtDO0FBQ2xDLDBDQUEyRTtBQUMzRSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLE9BQU8sRUFBRTtJQUN2QyxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdUJBQWlCLEVBQUUsRUFBRSxrQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQy9EO0tBQU0sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksRUFBRSxFQUFFO0lBQy9FLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx1QkFBaUIsRUFBRSxFQUFFLGtCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDOUQ7QUFFRDtJQUFBO0lBZ1BBLENBQUM7SUFwTmlCLG9CQUFJLEdBQWxCO1FBQUEsaUJBcUZDO1FBcEZHLElBQUcsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNwRCxJQUFHLENBQUMsZUFBZSxDQUFDLFNBQVM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUUzQyxrRUFBa0U7UUFDbEUsa0RBQWtEO1FBRWxELGVBQWUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxlQUFJLENBQUMsa0JBQWtCLENBQUM7WUFDeEQsUUFBUSxFQUFFLGVBQWUsQ0FBQyxRQUFRO1NBQ3JDLENBQUMsQ0FBQTtRQUNGLGNBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQ2hFLGVBQWUsQ0FBQyxhQUFhLEdBQUcsSUFBSSwyQkFBYSxDQUFDO1lBQzlDLFFBQVEsRUFBRSxlQUFlLENBQUMsUUFBUTtTQUNyQyxDQUFDLENBQUM7UUFDSCxjQUFHLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNsRSxJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQztRQUM1QixJQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksT0FBTyxFQUFFO1lBQzlGLGdCQUFnQixHQUFHLEtBQUssQ0FBQztTQUM1QjtRQUNELGVBQWUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RCxlQUFlLENBQUMsY0FBYyxHQUFHLElBQUksbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0QsZUFBZSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSwyQ0FBNkIsQ0FBQztZQUM1RSxRQUFRLEVBQUUsZUFBZSxDQUFDLGNBQWM7WUFDeEMsb0JBQW9CLEVBQUUsSUFBSTtZQUMxQixtQkFBbUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBRSxDQUFBO1FBQ0osZUFBZSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLGtCQUFPLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzVKLElBQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO1lBQzFCLHVEQUF1RDtZQUN2RCx3REFBd0Q7WUFDeEQsMkRBQTJEO1lBQzNELElBQUk7WUFDSixlQUFlLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLCtDQUFrQixDQUFDO2dCQUM5RCxHQUFHLEVBQUUsZUFBZSxDQUFDLE9BQU87YUFDL0IsQ0FBQyxDQUFDLENBQUE7WUFDSCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLElBQUksTUFBTSxFQUFFO2dCQUNoRCxlQUFlLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLDRDQUFpQixDQUFDO29CQUMzRCxHQUFHLEVBQUUsZUFBZSxDQUFDLE9BQU87aUJBQy9CLENBQUMsQ0FBQyxDQUFBO2FBQ047U0FDSjtRQUNELElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQztRQUN0RCxJQUFJLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUM7UUFDeEQsSUFBSSxlQUFlLElBQUksRUFBRSxFQUFFO1lBQ3ZCLGdEQUFnRDtZQUNoRCxlQUFlLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLCtDQUFrQixDQUFDO2dCQUM5RCxHQUFHLEVBQUUsZUFBZTthQUN2QixDQUFDLENBQUMsQ0FBQTtTQUNOO1FBQ0QsSUFBSSxjQUFjLElBQUksRUFBRSxFQUFFO1lBQ3RCLCtDQUErQztZQUMvQyxlQUFlLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLDRDQUFpQixDQUFDO2dCQUMzRCxHQUFHLEVBQUUsY0FBYzthQUN0QixDQUFDLENBQUMsQ0FBQTtTQUNOO1FBQ0QsSUFBSSxnQkFBZ0IsSUFBSSxLQUFLLElBQUksZUFBZSxJQUFJLEVBQUUsSUFBSSxjQUFjLElBQUksRUFBRSxFQUFFO1lBQzVFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCx3Q0FBd0M7UUFDeEMsb0RBQW9EO1FBQ3BELHdCQUF3QjtRQUN4QixNQUFNO1FBQ04sZ0ZBQWdGO1FBQ2hGLDJDQUEyQztRQUMzQyxJQUFJO1FBQ0osdUJBQXVCO1FBQ3ZCLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1FBQ3BDLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFOzs7Ozs7NkJBRVQsQ0FBQSxlQUFlLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQSxFQUFyQyx3QkFBcUM7d0JBQ3JDLHFCQUFNLGVBQWUsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUE7O3dCQUE5QyxTQUE4QyxDQUFDO3dCQUMvQyxlQUFlLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQzs7OzZCQUVyQyxDQUFBLGVBQWUsQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFBLEVBQXJDLHdCQUFxQzt3QkFDckMscUJBQU0sZUFBZSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBQTs7d0JBQTlDLFNBQThDLENBQUM7d0JBQy9DLGVBQWUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDOzs7Ozt3QkFHekMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFLLENBQUMsQ0FBQzs7Ozs7O2FBRzVCLENBQUMsQ0FBQztRQUNILGVBQWUsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDYyxrQ0FBa0IsR0FBakM7UUFBQSxpQkErRUM7UUE5RUcsSUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEUsSUFBTSwyQkFBMkIsR0FBRyxLQUFLLENBQUMsNkJBQTZCLENBQUMsNkJBQTZCLEVBQUU7WUFDbkcsV0FBVyxFQUFFLDhDQUE4QztTQUM5RCxDQUFDLENBQUM7UUFDSCwyQkFBMkIsYUFBM0IsMkJBQTJCLHVCQUEzQiwyQkFBMkIsQ0FBRSxXQUFXLENBQUMsVUFBQyxHQUFHO1lBQ3pDLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztRQUNILElBQU0sbUJBQW1CLEdBQUcsS0FBSyxDQUFDLDZCQUE2QixDQUFDLHFCQUFxQixFQUFFO1lBQ25GLFdBQVcsRUFBRSxtQ0FBbUM7U0FDbkQsQ0FBQyxDQUFDO1FBQ0gsbUJBQW1CLGFBQW5CLG1CQUFtQix1QkFBbkIsbUJBQW1CLENBQUUsV0FBVyxDQUFDLFVBQU8sR0FBRzs7Ozs0QkFDekIscUJBQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBQTs7d0JBQW5DLEtBQUssR0FBRyxTQUEyQjt3QkFDekMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Ozs7YUFDOUIsQ0FBQyxDQUFDO1FBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsNkJBQTZCLENBQUMsa0JBQWtCLEVBQUU7WUFDN0UsV0FBVyxFQUFFLGtCQUFrQjtTQUNsQyxDQUFDLENBQUM7UUFDSCxnQkFBZ0IsYUFBaEIsZ0JBQWdCLHVCQUFoQixnQkFBZ0IsQ0FBRSxXQUFXLENBQUMsVUFBTyxHQUFHOzs7OzRCQUN0QixxQkFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFBOzt3QkFBbkMsS0FBSyxHQUFHLFNBQTJCO3dCQUN6QyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzs7OzthQUMxQixDQUFDLENBQUM7UUFHSCxJQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxtQkFBbUIsRUFBRTtZQUMvRSxXQUFXLEVBQUUsNkJBQTZCO1NBQzdDLENBQUMsQ0FBQztRQUNILGlCQUFpQixhQUFqQixpQkFBaUIsdUJBQWpCLGlCQUFpQixDQUFFLFdBQVcsQ0FBQyxVQUFPLEdBQUc7Ozs7OzRDQUM1QixDQUFDOzs7Ozt3Q0FDQSxDQUFDLEdBQUcsZUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDdkIsTUFBTSxHQUFHLGVBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFaLENBQVksQ0FBQyxDQUFDOzZDQUNyRCxDQUFBLENBQUMsSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQSxFQUEzQix3QkFBMkI7d0NBQ1oscUJBQU0sUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQTs7d0NBQTdCLEtBQUssR0FBRyxTQUFxQjt3Q0FDbkMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7d0JBTDdGLENBQUMsR0FBRyxlQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDOzs7NkJBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxDQUFBO3NEQUF0QyxDQUFDOzs7Ozt3QkFBdUMsQ0FBQyxFQUFFLENBQUE7Ozs7O2FBUXZELENBQUMsQ0FBQztRQUNILElBQU0sb0JBQW9CLEdBQUcsS0FBSyxDQUFDLDZCQUE2QixDQUFDLHNCQUFzQixFQUFFO1lBQ3JGLFdBQVcsRUFBRSxnQ0FBZ0M7U0FDaEQsQ0FBQyxDQUFDO1FBQ0gsb0JBQW9CLGFBQXBCLG9CQUFvQix1QkFBcEIsb0JBQW9CLENBQUUsV0FBVyxDQUFDLFVBQU8sR0FBRzs7Ozs7NENBQy9CLENBQUM7Ozs7O3dDQUNBLENBQUMsR0FBRyxlQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dDQUN2QixNQUFNLEdBQUcsZUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUM7NkNBQ3JELENBQUEsQ0FBQyxJQUFJLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxDQUFBLEVBQTNCLHdCQUEyQjt3Q0FDWixxQkFBTSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFBOzt3Q0FBN0IsS0FBSyxHQUFHLFNBQXFCO3dDQUNuQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7Ozs7Ozt3QkFMakcsQ0FBQyxHQUFHLGVBQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUM7Ozs2QkFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLENBQUE7c0RBQXRDLENBQUM7Ozs7O3dCQUF1QyxDQUFDLEVBQUUsQ0FBQTs7Ozs7YUFRdkQsQ0FBQyxDQUFDO1FBQ0gsSUFBTSwwQkFBMEIsR0FBRyxLQUFLLENBQUMsNkJBQTZCLENBQUMsNEJBQTRCLEVBQUU7WUFDakcsV0FBVyxFQUFFLG1DQUFtQztTQUNuRCxDQUFDLENBQUM7UUFDSCwwQkFBMEIsYUFBMUIsMEJBQTBCLHVCQUExQiwwQkFBMEIsQ0FBRSxXQUFXLENBQUMsVUFBTyxHQUFHOzs7Ozs0Q0FDckMsQ0FBQzs7Ozs7d0NBQ0EsQ0FBQyxHQUFHLGVBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQ3ZCLE1BQU0sR0FBRyxlQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQzs2Q0FDckQsQ0FBQSxDQUFDLElBQUksSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUEsRUFBM0Isd0JBQTJCO3dDQUNaLHFCQUFNLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUE7O3dDQUE3QixLQUFLLEdBQUcsU0FBcUI7d0NBQ25DLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQzs7Ozs7O3dCQUxqRyxDQUFDLEdBQUcsZUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQzs7OzZCQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtzREFBdEMsQ0FBQzs7Ozs7d0JBQXVDLENBQUMsRUFBRSxDQUFBOzs7OzthQVF2RCxDQUFDLENBQUM7UUFDSCxJQUFNLG1CQUFtQixHQUFHLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxxQkFBcUIsRUFBRTtZQUNuRixXQUFXLEVBQUUsdUJBQXVCO1NBQ3ZDLENBQUMsQ0FBQztRQUNILG1CQUFtQixhQUFuQixtQkFBbUIsdUJBQW5CLG1CQUFtQixDQUFFLFdBQVcsQ0FBQyxVQUFPLEdBQUc7Ozs7OzRDQUM5QixDQUFDOzs7Ozt3Q0FDQSxDQUFDLEdBQUcsZUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDdkIsTUFBTSxHQUFHLGVBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFaLENBQVksQ0FBQyxDQUFDOzZDQUNyRCxDQUFBLENBQUMsSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQSxFQUEzQix3QkFBMkI7d0NBQ1oscUJBQU0sUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQTs7d0NBQTdCLEtBQUssR0FBRyxTQUFxQjt3Q0FDbkMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7d0JBTC9GLENBQUMsR0FBRyxlQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDOzs7NkJBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxDQUFBO3NEQUF0QyxDQUFDOzs7Ozt3QkFBdUMsQ0FBQyxFQUFFLENBQUE7Ozs7O2FBUXZELENBQUMsQ0FBQztJQUdQLENBQUM7SUFDYSxnQ0FBZ0IsR0FBOUI7O1FBRUksSUFBTSxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxTQUFTLENBQUM7UUFDOUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDckQsSUFBSSxXQUFXLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQUUsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQTtRQUN6RixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7WUFBRSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQTtRQUMvRixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7WUFBRSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUE7UUFFckcsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQzVCLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNuRSxlQUFlLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7U0FDakQ7UUFDRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7UUFFbkgsa0NBQWtDO1FBQ2xDLElBQUksTUFBTSxJQUFJLEVBQUU7WUFBRSxNQUFNLEdBQUcsZ0NBQWdDLENBQUM7UUFDNUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDakcsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEgsZUFBZSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztRQUUxRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxFQUFFLEVBQUU7WUFDeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMsQ0FBQztTQUM1QztRQUNELGVBQWUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxvQkFBUSx1QkFDaEMsZUFBZSxDQUFDLGFBQWEsZ0JBQy9CLGlEQUEwQixDQUFDLFlBQVksSUFBRyxXQUFXLEtBQ3JELGlEQUEwQixDQUFDLGVBQWUsSUFBRyxlQUFlLENBQUMsT0FBTyxPQUN2RSxDQUFBO1FBQ0YsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNhLHlCQUFTLEdBQXZCLFVBQXdCLE9BQTJCLEVBQUUsTUFBMEIsRUFBRSxVQUErQjtRQUF4Rix3QkFBQSxFQUFBLG1CQUEyQjtRQUFFLHVCQUFBLEVBQUEsa0JBQTBCO1FBQUUsMkJBQUEsRUFBQSxhQUFhLGdCQUFVLENBQUMsT0FBTztRQUM1RyxJQUFJLElBQUksR0FBRyxrQkFBWSxDQUFDO1FBQ3hCLElBQUksT0FBTyxJQUFJLElBQUksSUFBSSxPQUFPLElBQUksRUFBRSxFQUFFO1lBQ2xDLElBQU0sV0FBVyxHQUFnQjtnQkFDN0IsT0FBTyxTQUFBO2dCQUNQLE1BQU0sUUFBQTtnQkFDTixVQUFVLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO2FBQ2pDLENBQUM7WUFDRixPQUFPLFdBQUssQ0FBQyxjQUFjLENBQUMsa0JBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztTQUMxRDthQUFNO1lBQ0gsT0FBTyxhQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDM0I7SUFDTCxDQUFDO0lBOU9NLGdEQUFnQyxHQUFHLEdBQUcsQ0FBQztJQUN2Qyx1QkFBTyxHQUFHLG1DQUFtQyxDQUFDO0lBQzlDLDZCQUFhLEdBQVEsRUFBRSxDQUFDO0lBQ3hCLHVCQUFPLEdBQUcsT0FBTyxDQUFBO0lBQ2pCLDRCQUFZLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVTtJQUMvQix3QkFBUSxHQUFHLElBQUksb0JBQVE7UUFDMUIsR0FBQyxpREFBMEIsQ0FBQyxZQUFZLElBQUcsV0FBVztRQUN0RCxHQUFDLGlEQUEwQixDQUFDLGVBQWUsSUFBRyxlQUFlLENBQUMsT0FBTztZQUN2RSxDQUFBO0lBQ1ksNkJBQWEsR0FBNEIsSUFBSSxDQUFDO0lBQzlDLDZCQUFhLEdBQWtCLElBQUksQ0FBQztJQUNsRCwyQ0FBMkM7SUFDM0MsbUVBQW1FO0lBQ25FLDZDQUE2QztJQUM3Qyx1QkFBdUI7SUFDdkIsY0FBYztJQUNkLHNDQUFzQztJQUN0QyxVQUFVO0lBQ1YsdUVBQXVFO0lBQ3ZFLElBQUk7SUFDSiwyQ0FBMkM7SUFDM0MsaUVBQWlFO0lBQ2pFLHlKQUF5SjtJQUN6SixJQUFJO0lBQ1cseUJBQVMsR0FBVyxJQUFJLENBQUM7SUF1TjVDLHNCQUFDO0NBQUEsQUFoUEQsSUFnUEM7QUFoUFksMENBQWU7QUFtUDVCO0lBR0ksNkJBQVksU0FBK0I7UUFEbkMsZUFBVSxHQUFZLEtBQUssQ0FBQztRQUVoQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBQ0QseUNBQVcsR0FBWCxVQUFZLFFBQTRCO1FBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDRCxvQ0FBTSxHQUFOLFVBQU8sT0FBd0IsRUFBRSxRQUF3QztRQUNyRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBQzVCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQztZQUFFLE9BQU87UUFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVDLElBQUk7Z0JBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQy9DO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN4QjtTQUNKO0lBQ0wsQ0FBQztJQUNLLHNDQUFRLEdBQWQ7Ozs7O3dCQUNJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO3dCQUN2QixxQkFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFaLENBQVksQ0FBQyxDQUFDLEVBQUE7O3dCQUExRCxTQUEwRCxDQUFDOzs7OztLQUM5RDtJQUNLLHdDQUFVLEdBQWhCOzs7Z0JBQ0ksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRO2dCQUNoQyxDQUFDLENBQUMsQ0FBQzs7OztLQUVOO0lBQ0QsMERBQTRCLEdBQTVCLFVBQTZCLGNBQThCO1FBQ3ZELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFDNUIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQUUsT0FBTztRQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUMsSUFBSTtnQkFDQSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDekU7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3hCO1NBQ0o7SUFDTCxDQUFDO0lBQ0wsMEJBQUM7QUFBRCxDQUFDLEFBeENELElBd0NDO0FBeENZLGtEQUFtQjtBQTRDaEM7SUFFSSwyQkFBWSxTQUF5QjtRQUNqQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBQ0QsdUNBQVcsR0FBWCxVQUFZLFFBQXNCO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDRCxrQ0FBTSxHQUFOLFVBQ0ksS0FBcUIsRUFDckIsUUFBd0M7UUFFeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUM1QixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUM7WUFBRSxPQUFPO1FBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QyxJQUFJO2dCQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQzthQUM3QztZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDeEI7U0FDSjtJQUNMLENBQUM7SUFDSyxzQ0FBVSxHQUFoQjs7O2dCQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUTtnQkFDaEMsQ0FBQyxDQUFDLENBQUM7Ozs7S0FDTjtJQUNLLG9DQUFRLEdBQWQ7Ozs7NEJBQ0kscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQyxFQUFBOzt3QkFBMUQsU0FBMEQsQ0FBQzs7Ozs7S0FDOUQ7SUFDTCx3QkFBQztBQUFELENBQUMsQUE3QkQsSUE2QkM7QUE3QlksOENBQWlCIn0=