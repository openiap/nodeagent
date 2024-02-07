/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from 'child_process';
import { Readable } from 'stream';
import { openiap } from '@openiap/nodeapi';
import { ipackageport } from './packagemanager';
export declare class runner_process {
    id: string;
    pid: number;
    p: ChildProcessWithoutNullStreams;
    forcekilled: boolean;
}
export declare class runner_stream {
    id: string;
    stream: Readable;
    streamqueues: string[];
    packageid: string;
    packagename: string;
    schedulename: string;
    buffer: Buffer;
    ports: ipackageport[];
}
export declare class runner {
    static processs: runner_process[];
    static streams: runner_stream[];
    static commandstreams: string[];
    static notifyStream(client: openiap, streamid: string, message: Buffer | string, addtobuffer?: boolean): Promise<void>;
    static removestream(client: openiap, streamid: string, success: boolean, buffer: string): void;
    static runit(client: openiap, packagepath: string, streamid: string, command: string, parameters: string[], clearstream: boolean, env?: any): Promise<number>;
    static findInPath(exec: string): string | null;
    static findInPath2(exec: string): string | null;
    private static _kill;
    static killProcessAndChildren(client: openiap, streamid: string, pid: number): Promise<void>;
    static kill(client: openiap, streamid: string): Promise<void>;
    static findPythonPath(): string;
    static findCondaPath(): string;
    static findPwShPath(): string;
    static findDotnetPath(): string;
    static findXvfbPath(): string;
    static findNodePath(): string;
    static findNPMPath(): string;
    static findChromiumPath(): string;
    static findChromePath(): string;
    static Generatenpmrc(client: openiap, packagepath: string, streamid: string): Promise<void>;
    static pipinstall(client: openiap, packagepath: string, streamid: string, pythonpath: string): Promise<void>;
    static condaenv(packagepath: string, condapath: string): Promise<void>;
    static condainstall(client: openiap, packagepath: string, streamid: string, condapath: string): Promise<string>;
    static npminstall(client: openiap, packagepath: string, streamid: string): Promise<boolean>;
    static runpythonscript(script: string): Promise<string>;
    static runpythoncode(code: string): Promise<string>;
    static findChildProcesses(pid: number): string[];
}
