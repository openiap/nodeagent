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
exports.instrumentation = void 0;
var v8 = require('v8');
var sdk_node_1 = require("@opentelemetry/sdk-node");
var exporter_trace_otlp_grpc_1 = require("@opentelemetry/exporter-trace-otlp-grpc");
var exporter_metrics_otlp_grpc_1 = require("@opentelemetry/exporter-metrics-otlp-grpc");
var api_1 = require("@opentelemetry/api");
var sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
var resources_1 = require("@opentelemetry/resources");
var semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
var context_async_hooks_1 = require("@opentelemetry/context-async-hooks");
var host_metrics_1 = require("@opentelemetry/host-metrics");
// const { HostMetrics } = require('@opentelemetry/host-metrics');
var pidusage = require("pidusage");
var os = require("os");
var fs = require("fs");
var path = require("path");
var api_2 = require("@opentelemetry/api");
var runner_1 = require("./runner");
if (process.env.otel_log_level == "debug") {
    api_2.diag.setLogger(new api_2.DiagConsoleLogger(), api_2.DiagLogLevel.DEBUG);
}
else if (process.env.otel_log_level != null && process.env.otel_log_level != "") {
    api_2.diag.setLogger(new api_2.DiagConsoleLogger(), api_2.DiagLogLevel.INFO);
}
var instrumentation = /** @class */ (function () {
    function instrumentation() {
    }
    instrumentation.addMeterURL = function (url) {
        var statMetricReader = new sdk_metrics_1.PeriodicExportingMetricReader({
            exporter: new exporter_metrics_otlp_grpc_1.OTLPMetricExporter({
                url: url
            }),
            exportIntervalMillis: 3000,
        });
        if (process.env.otel_log_level != null && process.env.otel_log_level != "") {
            console.log("Adding metric reader for " + url);
        }
        instrumentation.meterProvider.addMetricReader(statMetricReader);
    };
    instrumentation.addTraceURL = function (url) {
        var stateTraceExporter = new exporter_trace_otlp_grpc_1.OTLPTraceExporter({ url: url });
        instrumentation.traceProvider.addSpanProcessor(new sdk_node_1.tracing.BatchSpanProcessor(stateTraceExporter, { maxQueueSize: instrumentation.maxQueueSize }));
        if (process.env.otel_log_level != null && process.env.otel_log_level != "") {
            console.log("Adding trace exporter for " + url);
        }
    };
    instrumentation.init = function () {
        var _this = this;
        if (!instrumentation.setdefaultlabels())
            return;
        if (!instrumentation.firstinit)
            return;
        var contextManager = new context_async_hooks_1.AsyncHooksContextManager().enable();
        api_1.context.setGlobalContextManager(contextManager);
        if (instrumentation.traceProvider == null) {
            instrumentation.traceProvider = new sdk_node_1.node.NodeTracerProvider({
                resource: instrumentation.resource
            });
            sdk_node_1.api.trace.setGlobalTracerProvider(instrumentation.traceProvider);
        }
        if (instrumentation.meterProvider == null) {
            instrumentation.meterProvider = new sdk_metrics_1.MeterProvider({
                resource: instrumentation.resource
            });
            sdk_node_1.api.metrics.setGlobalMeterProvider(instrumentation.meterProvider);
        }
        if (process.env.enable_analytics != "false") {
            instrumentation.addMeterURL(instrumentation.baseurl);
            if (process.env.enable_detailed_analytic == "true") {
                instrumentation.addTraceURL(instrumentation.baseurl);
            }
        }
        if (process.env.otel_metric_url != null && process.env.otel_metric_url != "") {
            instrumentation.addMeterURL(process.env.otel_metric_url);
        }
        if (process.env.otel_trace_url != null && process.env.otel_trace_url != "") {
            instrumentation.addTraceURL(process.env.otel_trace_url);
        }
        var hostMetrics = new host_metrics_1.HostMetrics({
            meterProvider: instrumentation.meterProvider,
            name: "nodeagent"
        });
        if (process.env.otel_log_level != null && process.env.otel_log_level != "") {
            console.log("Starting HostMetrics");
        }
        hostMetrics.start();
        instrumentation.creatememorymeters();
        // registerInstrumentations({
        //     instrumentations: [
        //         getNodeAutoInstrumentations({
        //             // load custom configuration for http instrumentation
        //             // '@opentelemetry/instrumentation-http': {
        //             //     applyCustomAttributesOnSpan: (span) => {
        //             //         span.setAttribute('foo2', 'bar2');
        //             //     },
        //             // },
        //         }),
        //     ],
        // });
        // const sdk = new NodeSDK({
        //     serviceName: 'nodeagent',
        //     resource: instrumentation.resource,
        //     metricReader: statMetricReader,
        //     // spanProcessor: new tracing.BatchSpanProcessor(
        //     //     traceExporter,
        //     //     {maxQueueSize: 100000}
        //     //     ),
        //     // instrumentations: [getNodeAutoInstrumentations()],
        // });
        // sdk.start();
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
                    case 4:
                        console.log('Tracing finished.');
                        return [3 /*break*/, 7];
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
    };
    instrumentation.creatememorymeters = function () {
        var _this = this;
        var meter = instrumentation.meterProvider.getMeter("default");
        var nodejs_heap_size_used_bytes = meter.createObservableUpDownCounter('nodejs_heap_size_used_bytes', {
            description: 'Process heap size used from Node.js in bytes'
        });
        nodejs_heap_size_used_bytes === null || nodejs_heap_size_used_bytes === void 0 ? void 0 : nodejs_heap_size_used_bytes.addCallback(function (res) {
            // var stats = v8.getHeapStatistics();
            // res.observe(stats.used_heap_size);
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
                        res.observe(stats.elapsed, { pid: process.pid });
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
                                        res.observe(stats.cpu, { pid: p.pid, packagename: stream.packagename, schedulename: stream.schedulename });
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
                                        res.observe(stats.memory, { pid: p.pid, packagename: stream.packagename, schedulename: stream.schedulename });
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
                                        res.observe(stats.elapsed, { pid: p.pid, packagename: stream.packagename, schedulename: stream.schedulename });
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
                                        res.observe(stats.ctime, { pid: p.pid, packagename: stream.packagename, schedulename: stream.schedulename });
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
        if (apiurl == "")
            return false;
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
    instrumentation.firstinit = true;
    return instrumentation;
}());
exports.instrumentation = instrumentation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2luc3RydW1lbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsb0RBQXNFO0FBQ3RFLG9GQUE0RTtBQUM1RSx3RkFBK0U7QUFDL0UsMENBQTRJO0FBRTVJLDBEQUEwRjtBQUMxRixzREFBb0Q7QUFDcEQsNEVBQWlGO0FBRWpGLDBFQUE2RTtBQUU3RSw0REFBMEQ7QUFDMUQsa0VBQWtFO0FBQ2xFLG1DQUFxQztBQUVyQyx1QkFBeUI7QUFDekIsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUc3QiwwQ0FBMkU7QUFDM0UsbUNBQWtDO0FBRWxDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksT0FBTyxFQUFFO0lBQ3ZDLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx1QkFBaUIsRUFBRSxFQUFFLGtCQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDL0Q7S0FBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxFQUFFLEVBQUU7SUFDL0UsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHVCQUFpQixFQUFFLEVBQUUsa0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM5RDtBQUVEO0lBQUE7SUErT0EsQ0FBQztJQW5PaUIsMkJBQVcsR0FBekIsVUFBMEIsR0FBVztRQUNqQyxJQUFNLGdCQUFnQixHQUFHLElBQUksMkNBQTZCLENBQUM7WUFDdkQsUUFBUSxFQUFFLElBQUksK0NBQWtCLENBQUM7Z0JBQzdCLEdBQUcsRUFBRSxHQUFHO2FBQ1gsQ0FBQztZQUNGLG9CQUFvQixFQUFFLElB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