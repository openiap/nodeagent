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
var os = require("os");
var fs = require("fs");
var path = require("path");
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
        instrumentation.setdefaultlabels();
        var contextManager = new context_async_hooks_1.AsyncHooksContextManager().enable();
        api_1.context.setGlobalContextManager(contextManager);
        instrumentation.traceProvider = new sdk_node_1.node.NodeTracerProvider({
            resource: instrumentation.resource
        });
        sdk_node_1.api.trace.setGlobalTracerProvider(instrumentation.traceProvider);
        instrumentation.meterProvider = new sdk_metrics_1.MeterProvider({
            resource: instrumentation.resource
        });
        sdk_node_1.api.metrics.setGlobalMeterProvider(instrumentation.meterProvider);
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
                    case 6:
                        process.exit(0);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    };
    instrumentation.creatememorymeters = function () {
        var meter = instrumentation.meterProvider.getMeter("default");
        var nodejs_heap_size_used_bytes = meter.createObservableUpDownCounter('nodejs_heap_size_used_bytes', {
            description: 'Process heap size used from Node.js in bytes'
        });
        nodejs_heap_size_used_bytes === null || nodejs_heap_size_used_bytes === void 0 ? void 0 : nodejs_heap_size_used_bytes.addCallback(function (res) {
            var stats = v8.getHeapStatistics();
            res.observe(stats.used_heap_size);
            var memUsage = process.memoryUsage();
            res.observe(memUsage.heapUsed);
        });
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
            return;
        var url = new URL(apiurl);
        var apihostname = (url.hostname.indexOf("grpc") == 0) ? url.hostname.substring(5) : url.hostname;
        var crypto = require('crypto');
        var openflow_uniqueid = process.env.openflow_uniqueid || crypto.createHash('md5').update(apihostname).digest("hex");
        instrumentation.defaultlabels["ofid"] = openflow_uniqueid;
        if (process.env.otel_log_level != null && process.env.otel_log_level != "") {
            console.log("ofid=" + openflow_uniqueid);
        }
        instrumentation.resource = new resources_1.Resource(__assign(__assign({}, instrumentation.defaultlabels), (_a = {}, _a[semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME] = 'nodeagent', _a[semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION] = instrumentation.version, _a)));
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
    return instrumentation;
}());
exports.instrumentation = instrumentation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2luc3RydW1lbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsb0RBQXNFO0FBQ3RFLG9GQUE0RTtBQUM1RSx3RkFBK0U7QUFDL0UsMENBQTRJO0FBRTVJLDBEQUEwRjtBQUMxRixzREFBb0Q7QUFDcEQsNEVBQWlGO0FBRWpGLDBFQUE2RTtBQUU3RSw0REFBMEQ7QUFDMUQsa0VBQWtFO0FBRWxFLHVCQUF5QjtBQUN6Qix1QkFBeUI7QUFDekIsMkJBQTZCO0FBRzdCLDBDQUEyRTtBQUMzRSxJQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLE9BQU8sRUFBRTtJQUN0QyxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdUJBQWlCLEVBQUUsRUFBRSxrQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQy9EO0tBQU0sSUFBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksRUFBRSxFQUFFO0lBQzlFLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx1QkFBaUIsRUFBRSxFQUFFLGtCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDOUQ7QUFFRDtJQUFBO0lBdUtBLENBQUM7SUEzSmlCLDJCQUFXLEdBQXpCLFVBQTBCLEdBQVc7UUFDakMsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLDJDQUE2QixDQUFDO1lBQ3ZELFFBQVEsRUFBRSxJQUFJLCtDQUFrQixDQUFDO2dCQUM3QixHQUFHLEVBQUUsR0FBRzthQUNYLENBQUM7WUFDRixvQkFBb0IsRUFBRSxJQUFJO1NBQzdCLENBQUMsQ0FBQztRQUNILElB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