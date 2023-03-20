declare const os: any;
declare const path: any;
declare const fs: any;
declare const childProcess: any;
declare const args: string[];
declare let serviceName: string;
declare let command: string;
declare function installService(svcName: string, serviceName: string, script: string): void;
declare function UninstallService(svcName: string, serviceName: string): void;
