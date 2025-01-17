import { openiap } from "@openiap/nodeapi";
import { Context, TraceFlags } from "@opentelemetry/api";
export declare class Logger {
    static instrumentation: iinstrumentation;
    static init(): void;
}
export interface iinstrumentation {
    init(client: openiap): void;
    addMeterURL(url: string): void;
    addTraceURL(url: string): void;
    error(error: any, attributes: any): void;
    info(message: string, attributes: any): void;
    setparent(traceId: string, spanId: string, traceFlags: TraceFlags): Context;
}
