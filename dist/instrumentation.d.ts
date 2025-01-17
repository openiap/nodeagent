import { api, node } from '@opentelemetry/sdk-node';
import { Context } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import * as logsAPI from '@opentelemetry/api-logs';
export declare function getNetworkData(): Promise<NetworkData[]>;
export interface NetworkData {
    iface: string;
    rx_bytes: number;
    rx_dropped: number;
    rx_errors: number;
    tx_bytes: number;
    tx_dropped: number;
    tx_errors: number;
}
export declare class instrumentation {
    static otel_trace_max_node_time_seconds: number;
    static baseurl: string;
    static defaultlabels: any;
    static version: string;
    static maxQueueSize: number;
    static resource: Resource;
    static traceProvider: node.NodeTracerProvider;
    static meterProvider: MeterProvider;
    static logger: logsAPI.Logger;
    private static firstinit;
    static spanexporter: MultiSpanExporter;
    static metricexporter: MultiMetricExporter;
    static logexporter: MultiMetricExporter;
    static init(client: openiap): boolean;
    private static creatememorymeters;
    static setdefaultlabels(client: openiap): boolean;
    static setparent(traceId?: string, spanId?: string, traceFlags?: api.TraceFlags): Context;
    static error(error: any, attributes?: any): void;
    static info(message: string, attributes?: any): void;
}
import { InstrumentType, ResourceMetrics, PushMetricExporter, AggregationTemporality } from '@opentelemetry/sdk-metrics';
export declare class MultiMetricExporter implements PushMetricExporter {
    private exporters;
    private isshutdown;
    constructor(exporters: PushMetricExporter[]);
    addExporter(exporter: PushMetricExporter): void;
    export(metrics: ResourceMetrics, callback: (result: ExportResult) => void): void;
    shutdown(): Promise<void>;
    forceFlush(): Promise<void>;
    selectAggregationTemporality(instrumentType: InstrumentType): AggregationTemporality;
}
import { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { ExportResult } from '@opentelemetry/core';
import { openiap } from '@openiap/nodeapi';
export declare class MultiSpanExporter implements SpanExporter {
    private exporters;
    constructor(exporters: SpanExporter[]);
    addExporter(exporter: SpanExporter): void;
    export(spans: ReadableSpan[], callback: (result: ExportResult) => void): void;
    forceFlush(): Promise<void>;
    shutdown(): Promise<void>;
}
