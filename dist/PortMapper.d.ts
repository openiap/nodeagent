/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { openiap } from '@openiap/nodeapi';
import * as net from 'net';
export declare class CacheItem {
    seq: number;
    data: Buffer;
}
export declare class HostConnection {
    id: string;
    seq: number;
    sendseq: number;
    replyqueue: string;
    created: Date;
    lastUsed: Date;
    socket: net.Socket;
    cache: CacheItem[];
}
export declare class ClientConnection {
    id: string;
    seq: number;
    sendseq: number;
    replyqueue: string;
    created: Date;
    lastUsed: Date;
    socket: net.Socket;
    cache: CacheItem[];
}
export declare function FindFreePort(preferred: number): Promise<number>;
export declare class HostPortMapper {
    client: openiap;
    port: number;
    portname: string;
    host: string;
    streamid: string;
    connections: Map<string, HostConnection>;
    sendTimer: NodeJS.Timer;
    running: boolean;
    created: Date;
    lastUsed: Date;
    id: string;
    constructor(client: openiap, port: number, portname: string, host: string, streamid: string);
    dispose(): void;
    newConnection(id: string, replyqueue: string): HostConnection;
    removeConnection(id: string): void;
    RemoveOldConnections(): void;
    IncommingData(id: string, seq: number, data: Buffer): void;
    SendCache(): void;
}
export declare class ClientPortMapper {
    client: openiap;
    localport: number;
    portname: string;
    remoteport: number;
    hostqueue: string;
    connections: Map<string, ClientConnection>;
    sendTimer: NodeJS.Timer;
    running: boolean;
    server: net.Server;
    constructor(client: openiap, localport: number, portname: string, remoteport: number, hostqueue: string);
    dispose(): void;
    removeConnection(id: string): void;
    RemoveOldConnections(): void;
    IncommingData(id: string, seq: number, data: Buffer): void;
    SendCache(): void;
}
