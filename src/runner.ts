import { spawn, execSync, ChildProcessWithoutNullStreams } from 'child_process';
import { Stream, Readable } from 'stream';
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { config } from '@openiap/nodeapi';
const { info, err } = config;
export class runner_process {
    id: string;
    pid: number;
    p: ChildProcessWithoutNullStreams;
    forcekilled: boolean;
}
export class runner_stream {
    id: string;
    stream: Readable;
}
export class runner {
    public static processs: runner_process[] = [];
    public static streams: runner_stream[] = [];
    public static addstream(streamid: string, stream: Readable) {
        let s = runner.streams.find(x => x.id == streamid)
        if (s != null) throw new Error("Stream " + streamid + " already exists")
        s = new runner_stream();
        s.id = streamid;
        s.stream = stream;
        runner.streams.push(s);
        return s;
    }
    public static notifyStream(streamid: string, message: Buffer | string) {
        const s = this.ensurestream(streamid);
        if(message != null && !Buffer.isBuffer(message)) {
            message = Buffer.from(message + "\n");
        }
        s.stream.push(message);
    }
    public static removestream(streamid: string) {
        let s = runner.streams.find(x => x.id == streamid)
        if(s != null) {
            s.stream.push(null);
            runner.streams = runner.streams.filter(x => x.id != streamid);
        }
    }    
    public static ensurestream(streamid: string) {
        let s = runner.streams.find(x => x.id == streamid)
        if (s == null) {
            s = new runner_stream();
            s.stream = new Stream.Readable();
            s.stream.read = function () {};
            s.id = streamid;
            runner.streams.push(s);
        }
        return s;
    }    
    public static async runit(packagepath:string, streamid:string, command:string, parameters:string[], clearstream: boolean) {
        return new Promise((resolve, reject) => {
            try {
                // , stdio: ['pipe', 'pipe', 'pipe']
                // , stdio: 'pipe'
                const childProcess = spawn(command, parameters, { cwd: packagepath  })
                const pid = childProcess.pid;
                const p:runner_process = { id: streamid, pid, p: childProcess, forcekilled: false }
                runner.notifyStream(streamid, `Child process started as pid ${pid}`);
                runner.processs.push(p);
                const catchoutput = (data: any) => {
                    if(data != null) {
                        var s:string = data.toString();
                        if(s.startsWith("Debugger listening")) return;
                        if(s.startsWith("Debugger attached")) return;
                        if(s.startsWith("Waiting for the debugger to")) return;
                    }
                    runner.notifyStream(streamid, data)
                };
                childProcess.stdio[1]?.on('data', catchoutput);
                childProcess.stdio[2]?.on('data', catchoutput);
                childProcess.stdio[3]?.on('data', catchoutput);
                // childProcess.stdout.on('data', catchoutput);
                // childProcess.stderr.on('data', catchoutput);
                childProcess.stdout.on('close', (code: any) => {
                    if (code == false || code == null) {
                        runner.notifyStream(streamid, `Child process ${pid} exited`);
                    } else {
                        runner.notifyStream(streamid, `Child process ${pid} exited with code ${code}`);
                        p.forcekilled = true;
                    }
                    runner.processs = runner.processs.filter(x => x.pid != pid);
                    if (clearstream == true) {
                        runner.removestream(streamid);
                    }
                    resolve(!p.forcekilled);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    public static findInPath(exec:string):string | null {
        try {
            let command;
            switch (process.platform) {
                case 'linux':
                case 'darwin':
                    command = 'which ' + exec;
                    break;
                case 'win32':
                    command = 'where ' + exec;
                    break;
                default:
                    throw new Error(`Unsupported platform: ${process.platform}`);
            }
            const stdout = execSync(command, { stdio: 'pipe' }).toString();
            return stdout.trim() || null;
        } catch (error) {
            throw error;
        }
    }
    public static kill(streamid: string) {
        const p = runner.processs.filter(x => x.id == streamid);
        for(var i=0;i<p.length;i++) {
            runner.notifyStream(streamid, "Sent kill signal to process " + p[i].p.pid);
            p[i].forcekilled = true;
            p[i].p.kill();
        }
    }
    public static findPythonPath() {
        return runner.findInPath("python")
    }
    public static findDotnetPath() {
        return runner.findInPath("dotnet")
    }
    public static findXvfbPath() {
        return runner.findInPath("xvfb-run")
    }
    public static async pipinstall(packagepath:string, streamid:string, pythonpath:string) {
        if (fs.existsSync(path.join(packagepath, "requirements.txt.done"))) return;
        if (fs.existsSync(path.join(packagepath, "requirements.txt"))) {
            runner.notifyStream(streamid, "************************");
            runner.notifyStream(streamid, "**** Running pip install");
            runner.notifyStream(streamid, "************************");

            if ((await runner.runit(packagepath, streamid, pythonpath, ["-m", "pip", "install", "-r", path.join(packagepath, "requirements.txt")], false)) == true) {
                fs.writeFileSync(path.join(packagepath, "requirements.txt.done"), "done");
            }
        }
    }
    public static async npminstall(packagepath:string, streamid:string): Promise<boolean> {
        if (fs.existsSync(path.join(packagepath, "npm.install.done"))) {
            return false;
        } else if (fs.existsSync(path.join(packagepath, "package.json"))) {
            runner.notifyStream(streamid, "************************");
            runner.notifyStream(streamid, "**** Running npm install");
            runner.notifyStream(streamid, "************************");
            const child = (process.platform === 'win32' ? 'npm.cmd' : 'npm')
            if ((await runner.runit(packagepath, streamid, child, ["install"], false)) == true) {
                fs.writeFileSync(path.join(packagepath, "npm.install.done"), "done");
                return true;
            }
        }
        return false;
    }
    public static async runpythonscript(script:string): Promise<string> {
        const pythonpath = runner.findPythonPath();
        if (pythonpath == null) throw new Error("Python not found");
        return new Promise((resolve, reject) => {
            const childProcess = spawn(pythonpath, [script], { cwd: process.cwd() })
            const pid = childProcess.pid;
            let output = "";
            const catchoutput = (data: any) => {
                if(data != null) {
                    var s:string = data.toString();
                    output += s;
                }
            };
            childProcess.stdout.on('data', catchoutput);
            childProcess.stderr.on('data', catchoutput);
            childProcess.stdout.on('close', (code: any) => {
                if (code == false || code == null) {
                    resolve(output);
                } else {
                    reject(output);
                }
            });
        });
    }    
    public static async runpythoncode(code:string): Promise<string> {
        var tempfilename = path.join(os.tmpdir(), "temp.py");
        fs.writeFileSync(tempfilename, code);
        return await this.runpythonscript(tempfilename);
    }    
}