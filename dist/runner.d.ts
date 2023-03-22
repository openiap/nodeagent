/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from 'child_process';
import { Readable } from 'stream';
export declare class runner_process {
    id: string;
    pid: number;
    p: ChildProcessWithoutNullStreams;
    forcekilled: boolean;
}
export declare class runner_stream {
    id: string;
    stream: Readable;
}
export declare class runner {
    static processs: runner_process[];
    static streams: runner_stream[];
    static addstream(streamid: string, stream: Readable): runner_stream;
    static notifyStream(streamid: string, message: Buffer | string): void;
    static removestream(streamid: string): void;
    static ensurestream(streamid: string): runner_stream;
    static runit(packagepath: string, streamid: string, command: string, parameters: string[], clearstream: boolean): Promise<unknown>;
    static findInPath(exec: string): string | null;
    static kill(streamid: string): void;
    static findPythonPath(): string;
    static findDotnetPath(): string;
    static findXvfbPath(): string;
    static pipinstall(packagepath: string, streamid: string, pythonpath: string): Promise<void>;
    static npminstall(packagepath: string, streamid: string): Promise<boolean>;
    static runpythonscript(script: string): Promise<string>;
    static runpythoncode(code: string): Promise<string>;
}
