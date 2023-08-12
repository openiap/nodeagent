/// <reference types="node" />
import { openiap } from "@openiap/nodeapi";
import { Readable } from 'stream';
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
}
export declare class packagemanager {
    static packagefolder: string;
    static getpackages(client: openiap, languages: string[]): Promise<ipackage[]>;
    static reloadpackage(client: openiap, id: string, force: boolean): Promise<ipackage>;
    static reloadpackages(client: openiap, languages: string[], force: boolean): Promise<ipackage[]>;
    static getpackage(client: openiap, id: string): Promise<ipackage>;
    static getpackagepath(packagepath: string, first?: boolean): string;
    static getscriptpath(packagepath: string): string;
    private static addstream;
    static runpackage(client: openiap, id: string, streamid: string, streamqueue: string, stream: Readable, wait: boolean, env?: any, schedule?: any): Promise<number>;
    static removepackage(id: string): Promise<void>;
    static deleteDirectoryRecursiveSync(dirPath: string): void;
}
