import { api, node } from '@opentelemetry/sdk-node';
import { Context } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
export declare class instrumentation {
    static otel_trace_max_node_time_seconds: number;
    static baseurl: string;
    static defaultlabels: any;
    static version: string;
    static maxQueueSize: number;
    static resource: Resource;
    static traceProvider: node.NodeTracerProvider;
    static meterProvider: MeterProvider;
    static addMeterURL(url: string): void;
    static addTraceURL(url: string): void;
    private static firstinit;
    static init(): boolean;
    private static creatememorymeters;
    static setdefaultlabels(): boolean;
    static setparent(traceId?: string, spanId?: string, traceFlags?: api.TraceFlags): Context;
}
