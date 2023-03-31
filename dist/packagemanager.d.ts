import { openiap } from "@openiap/nodeapi";
export declare class packagemanager {
    static packagefolder: string;
    static getpackage(client: openiap, fileid: string, id: string): Promise<void>;
    static getpackagepath(packagepath: string, first?: boolean): string;
    static getscriptpath(packagepath: string): string;
    static runpackage(client: openiap, id: string, streamid: string, streamqueue: string, wait: boolean): Promise<void>;
    static removepackage(id: string): Promise<void>;
    static deleteDirectoryRecursiveSync(dirPath: string): void;
}
