/// <reference types="node" />
import { openiap } from "@openiap/nodeapi";
import { ipackage } from "./packagemanager";
import { EventEmitter } from "events";
export declare class agent_schedule_task {
    constructor(copyfrom: agent_schedule_task);
}
export declare class agent {
    static client: openiap;
    static assistantConfig: any;
    static agentid: string;
    static localqueue: string;
    static languages: string[];
    static dockeragent: boolean;
    static lastreload: Date;
    static schedules: any[];
    static myproject: {
        version: string;
    };
    static num_workitemqueue_jobs: number;
    static max_workitemqueue_jobs: number;
    static maxrestarts: number;
    static maxrestartsminutes: number;
    static killonpackageupdate: boolean;
    static exitonfailedschedule: boolean;
    static eventEmitter: EventEmitter;
    static globalpackageid: string;
    static addListener(eventName: string | symbol, listener: (...args: any[]) => void): void;
    static on(eventName: string | symbol, listener: (...args: any[]) => void): void;
    static once(eventName: string | symbol, listener: (...args: any[]) => void): void;
    static off(eventName: string | symbol, listener: (...args: any[]) => void): void;
    static removeListener(eventName: string | symbol, listener: (...args: any[]) => void): void;
    static removeAllListeners(eventName?: string | symbol): void;
    static setMaxListeners(n: number): void;
    static getMaxListeners(): number;
    static listeners(eventName: string | symbol): Function[];
    static rawListeners(eventName: string | symbol): Function[];
    static emit(eventName: string | symbol, ...args: any[]): boolean;
    static listenerCount(eventName: string | symbol): number;
    static prependListener(eventName: string | symbol, listener: (...args: any[]) => void): void;
    static prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): void;
    static eventNames(): (string | symbol)[];
    static init(_client?: openiap): Promise<void>;
    static reloadAndParseConfig(): boolean;
    private static onConnected;
    private static onDisconnected;
    static localrun(packageid: string, streamid: string, payload: any, env: any, schedule: any): Promise<[number, string, any]>;
    static reloadpackages(force: boolean): Promise<ipackage[]>;
    static RegisterAgent(): Promise<void>;
    private static onQueueMessage;
}
