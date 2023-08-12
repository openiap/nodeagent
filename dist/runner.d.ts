/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from 'child_process';
import { Readable } from 'stream';
import { openiap } from '@openiap/nodeapi';
export declare class runner_process {
    id: string;
    pid: number;
    p: ChildProcessWithoutNullStreams;
    forcekilled: boolean;
}
export declare class runner_stream {
    id: string;
    stream: Readable;
    packageid: string;
    packagename: string;
    buffer: string;
}
export declare class runner {
    static processs: runner_process[];
    static streams: runner_stream[];
    static commandstreams: string[];
    static notifyStream(client: openiap, streamid: string, message: Buffer | string, addtobuffer?: boolean): Promise<void>;
    static removestream(client: openiap, streamid: string, success: boolean, buffer: string): void;
    static ensurestream(streamid: string, streamqueue: string): runner_stream;
    static runit(client: openiap, packagepath: string, streamid: string, command: string, parameters: string[], clearstream: boolean, env?: any): Promise<number>;
    static findInPath(exec: string): string | null;
    static findInPath2(exec: string): string | null;
    static kill(client: openiap, streamid: string): void;
    static findPythonPath(): string;
    static findPwShPath(): string;
    static findDotnetPath(): string;
    static findXvfbPath(): string;
    static findNodePath(): string;
    static findNPMPath(): string;
    static findChromiumPath(): string;
    static findChromePath(): string;
    static pipinstall(client: openiap, packagepath: string, streamid: string, pythonpath: string): Promise<void>;
    static npminstall(client: openiap, packagepath: string, streamid: string): Promise<boolean>;
    static runpythonscript(script: string): Promise<string>;
    static runpythoncode(code: string): Promise<string>;
}
