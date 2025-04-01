/// <reference types="node" />
import { openiap } from "@openiap/nodeapi";
import { Readable } from 'stream';
import { runner_stream } from "./runner";
export interface ipackageport {
    port: number;
    portname: string;
    protocol: string;
    web: boolean;
}
export interface ipackage {
    _id: string;
    name: string;
    description: string;
    version: string;
    fileid: string;
    language: string;
    daemon: boolean;
    chrome: boolean;
    chromium: boolean;
    main: string;
    ports: ipackageport[];
}
export declare class packagemanager {
    private static _homedir;
    static homedir(): string;
    static packagefolder(): string;
    private static _packagefolder;
    static packages: ipackage[];
    static getpackages(client: openiap, languages: string[]): Promise<ipackage[]>;
    static reloadpackage(client: openiap, id: string, force: boolean): Promise<ipackage>;
    static reloadpackages(client: openiap, languages: string[], force: boolean): Promise<ipackage[]>;
    static getpackage(client: openiap, id: string, download: boolean): Promise<ipackage>;
    static getpackagepath(packagepath: string, first?: boolean): string;
    static getscriptpath(packagepath: string): string;
    private static addstream;
    static preparepackage(client: openiap, packageid: string, streamid: string): Promise<void>;
    static runpackage(client: openiap, packageid: string, streamid: string, streamqueues: string[], stream: Readable, wait: boolean, env?: any, schedule?: any): Promise<{
        exitcode: number;
        stream: runner_stream;
    }>;
    static removepackage(id: string): Promise<void>;
    static deleteDirectoryRecursiveSync(dirPath: string): void;
}
