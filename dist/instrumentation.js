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
            instrumentation.addMeterURL(instrumentation.baseurl + "/v1/metrics");
            if (process.env.enable_detailed_analytic == "true") {
                instrumentation.addTraceURL(instrumentation.baseurl + "/v1/trace");
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
        // instrumentation.creatememorymeters()
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
        var meter = api_1.default.metrics.getMeter('default');
        var nodejs_heap_size_used_bytes = meter.createObservableUpDownCounter('nodejs_heap_size_used_bytes', {
            description: 'Process heap size used from Node.js in bytes'
        });
        var nodejs_heap_size_total_bytes = meter.createObservableUpDownCounter('nodejs_heap_size_total_bytes', {
            description: 'Process heap size from Node.js in bytes'
        });
        nodejs_heap_size_used_bytes === null || nodejs_heap_size_used_bytes === void 0 ? void 0 : nodejs_heap_size_used_bytes.addCallback(function (res) {
            var memUsage = process.memoryUsage();
            res.observe(memUsage.heapUsed, __assign({}, instrumentation.defaultlabels));
        });
        nodejs_heap_size_total_bytes === null || nodejs_heap_size_total_bytes === void 0 ? void 0 : nodejs_heap_size_total_bytes.addCallback(function (res) {
            var memUsage = process.memoryUsage();
            res.observe(memUsage.heapTotal, __assign({}, instrumentation.defaultlabels));
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
        var apiurl = process.env.apiurl || process.env.grpcapiurl || process.env.wsapiurl || "";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2luc3RydW1lbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBc0U7QUFDdEUsb0ZBQTRFO0FBQzVFLHdGQUErRTtBQUMvRSwwQ0FBNEk7QUFFNUksMERBQTBGO0FBQzFGLHNEQUFvRDtBQUNwRCw0RUFBaUY7QUFFakYsMEVBQTZFO0FBRTdFLDREQUEwRDtBQUMxRCxrRUFBa0U7QUFFbEUsdUJBQXlCO0FBQ3pCLHVCQUF5QjtBQUN6QiwyQkFBNkI7QUFHN0IsMENBQTJFO0FBQzNFLElBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksT0FBTyxFQUFFO0lBQ3RDLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx1QkFBaUIsRUFBRSxFQUFFLGtCQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDL0Q7S0FBTSxJQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxFQUFFLEVBQUU7SUFDOUUsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHVCQUFpQixFQUFFLEVBQUUsa0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM5RDtBQUVEO0lBQUE7SUE4S0EsQ0FBQztJQWxLaUIsMkJBQVcsR0FBekIsVUFBMEIsR0FBVztRQUNqQyxJQUFNLGdCQUFnQixHQUFHLElBQUksMkNBQTZCLENBQUM7WUFDdkQsUUFBUSxFQUFFLElBQUksK0NBQWtCLENBQUM7Z0JBQzdCLEdBQUcsRUFBRSxHQUFHO2FBQ1gsQ0FBQztZQUNGLG9CQUFvQixFQUFFLElBQUk7U0FDN0IsQ0FBQyxDQUFDO1FBQ0gsSUFBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxJQUFJLElBQUksT0FB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