import { openiap } from "@openiap/nodeapi";
import { Context, TraceFlags } from "@opentelemetry/api";
export class Logger {
    public static instrumentation: iinstrumentation;
    public static init() {
        let _instrumentation_require: any = null;
        try {
            if (process.env.enable_analytics != null && process.env.enable_analytics.toLowerCase() == "false") {
            } else {
                _instrumentation_require = require("./instrumentation");
            }
        } catch (error) {
        }
        if (_instrumentation_require != null && Logger.instrumentation == null) {
            Logger.instrumentation = _instrumentation_require.instrumentation;
        } else {
        }

    }
}
export interface iinstrumentation {
    init(client:openiap): void;
    addMeterURL(url: string): void;
    addTraceURL(url: string): void;
    setparent(traceId: string, spanId: string, traceFlags: TraceFlags): Context;
}
