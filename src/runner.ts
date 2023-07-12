import { spawn, execSync, ChildProcessWithoutNullStreams } from 'child_process';
import { Stream, Readable } from 'stream';
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { config, openiap } from '@openiap/nodeapi';
// import { spawnSync } from 'cross-spawn';
const ctrossspawn = require('cross-spawn');

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
    streamqueue: string;
    packageid: string;
    packagename: string;
    buffer: string;
}
export class runner {
    public static processs: runner_process[] = [];
    public static streams: runner_stream[] = [];
    // private static addstream(streamid: string, streamqueue: string, stream: Readable) {
    //     let s = runner.streams.find(x => x.id == streamid)
    //     if (s != null) throw new Error("Stream " + streamid + " already exists")
    //     s = new runner_stream();
    //     s.id = streamid;
    //     s.stream = stream;
    //     s.streamqueue = streamqueue;
    //     runner.streams.push(s);
    //     return s;
    // }
    public static async notifyStream(client: openiap, streamid: string, message: Buffer | string, addtobuffer: boolean = true): Promise<void> {
        const s = this.ensurestream(streamid, "");
        if (message != null && !Buffer.isBuffer(message)) {
            message = Buffer.from(message + "\n");
        }
        s.stream.push(message);
        const streamqueue = s.streamqueue;
        if (streamqueue != null && streamqueue != "") {
            // console.log("notifyStream streamid: " + streamid + " streamqueue: " + streamqueue)
            try {
                if (message == null) {
                    await client.QueueMessage({ queuename: streamqueue, data: { "command": "completed", "data": message }, correlationId: streamid });
                } else {
                    await client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": message }, correlationId: streamid });
                }
            } catch (error) {
                console.error("notifyStream: " + error.message);
                s.streamqueue = "";
            }
        } else {
            // console.log("notifyStream streamid: " + streamid + " streamqueue: not found")
        }
        if(!addtobuffer) return;
        if(s.buffer == null) s.buffer = "";
        s.buffer += message;
        if(s.buffer.length > 1000000) {
            s.buffer = s.buffer.substring(s.buffer.length - 1000000);
        }
    }
    public static removestream(client: openiap, streamid: string, success: boolean, buffer: string) {
        let s = runner.streams.find(x => x.id == streamid)
        if (s != null) {
            s.stream.push(null);
            runner.streams = runner.streams.filter(x => x.id != streamid);
            var data = { "command": "runpackage", success, "completed": true, "data": buffer };
            try {
                if (s.streamqueue != null && s.streamqueue != "") {
                    console.log("removestream streamid/correlationId: " + streamid + " streamqueue: " + s.streamqueue);
                    client.QueueMessage({ queuename: s.streamqueue, data, correlationId: streamid }).catch((error) => {
                        console.error(error);
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
    public static ensurestream(streamid: string, streamqueue: string) {
        let s = runner.streams.find(x => x.id == streamid)
        if (s == null) {
            s = new runner_stream();
            s.streamqueue = streamqueue;
            s.stream = new Stream.Readable();
            s.stream.read = function () { };
            s.id = streamid;
            runner.streams.push(s);
        } else if (streamqueue != null && streamqueue != "") {
            s.streamqueue = streamqueue;
        }
        return s;
    }
    public static async runit(client: openiap, packagepath: string, streamid: string, command: string, parameters: string[], clearstream: boolean): Promise<number> {
        return new Promise((resolve, reject) => {
            try {
                console.log('runit: Running command:', command);
                // , stdio: ['pipe', 'pipe', 'pipe']
                // , stdio: 'pipe'
                // if(command.indexOf(" ") > -1 && !command.startsWith('"')) {
                //     command = '"' + command + '"'
                // }
                if (clearstream) {
                    var xvfb = runner.findXvfbPath()
                    if (xvfb != null && xvfb != "") {
                        var shellcommand = command;
                        var _parameters = parameters;
                        // var shellcommand = '"' + command + '" "' + parameters.join(" ") + '"';
                        command = xvfb;
                        parameters = [];
                        // parameters.push(`-e`);
                        // parameters.push(`/tmp/xvfb.log`);
                        parameters.push(`--server-args="-screen 0 1920x1080x24 -ac"`);
                        // parameters.push(`--server-args="-ac"`);
                        // xvfb-run --auto-servernum --server-num=1 
                        parameters.push(`--auto-servernum`);
                        parameters.push(`--server-num=1`);
                        parameters.push(shellcommand);
                        parameters = parameters.concat(_parameters);
                    }
                }
                console.log('Running command:', command);
                if (parameters != null && Array.isArray(parameters)) console.log('With parameters:', parameters.join(" "));
                const childProcess = spawn(command, parameters, { cwd: packagepath, env: { ...process.env, log_with_colors: "false" } })
                console.log('Current working directory:', packagepath);

                const pid = childProcess.pid;
                const p: runner_process = { id: streamid, pid, p: childProcess, forcekilled: false }
                runner.processs.push(p);
                runner.notifyStream(client, streamid, `Child process started as pid ${pid}`);
                const catchoutput = (data: any) => {
                    if (data != null) {
                        var s: string = data.toString();
                        if (s.startsWith("Debugger listening")) return;
                        if (s.startsWith("Debugger attached")) return;
                        if (s.startsWith("Waiting for the debugger to")) return;
                    }
                    runner.notifyStream(client, streamid, data)
                };
                childProcess.stdio[1]?.on('data', catchoutput);
                childProcess.stdio[2]?.on('data', catchoutput);
                childProcess.stdio[3]?.on('data', catchoutput);
                // childProcess.stdout.on('exit', (code: number) => {
                childProcess.on('close', (code: number) => {
                    // @ts-ignore
                    if (code == false || code == null) {
                        runner.notifyStream(client, streamid, `Child process ${pid} exited`);
                        code = 0;
                    } else {
                        runner.notifyStream(client, streamid, `Child process ${pid} exited with code ${code}`);
                        p.forcekilled = true;
                    }
                    runner.processs = runner.processs.filter(x => x.pid != pid);
                    if (clearstream == true) {
                        runner.removestream(client, streamid, true, "");
                    }
                    resolve(code);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    public static findInPath(exec: string): string | null {
        try {
            let command;
            switch (process.platform) {
                case 'linux':
                case 'darwin':
                    command = 'which';
                    break;
                case 'win32':
                    command = 'where.exe';
                    break;
                default:
                    throw new Error(`Unsupported platform: ${process.platform}`);
            }
            const result: any = ctrossspawn.sync(command, [exec], { stdio: 'pipe' });
            if (result.status === 0) {
                const stdout = result.stdout.toString();
                const lines = stdout.split(/\r?\n/).filter((line: string) => line.trim() !== '')
                    .filter((line: string) => line.toLowerCase().indexOf("windowsapps\\python3.exe") == -1)
                    .filter((line: string) => line.toLowerCase().indexOf("windowsapps\\python.exe") == -1);
                if (lines.length > 0) return lines[0]
            } else {
                if (result.stderr != null) console.log(result.stderr.toString());
                if (result.stdout != null) console.log(result.stdout.toString());
            }
            return "";
        } catch (error) {
            return "";
            // throw error;
        }
    }
    public static findInPath2(exec: string): string | null {
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
            const lines = stdout.split(/\r?\n/).filter(line => line.trim() !== '')
                .filter(line => line.toLowerCase().indexOf("windowsapps\\python3.exe") == -1)
                .filter(line => line.toLowerCase().indexOf("windowsapps\\python.exe") == -1);
            if (lines.length > 0) return lines[0]
            return "";
        } catch (error) {
            return "";
            // throw error;
        }
    }
    public static kill(client: openiap, streamid: string) {
        const p = runner.processs.filter(x => x.id == streamid);
        for (var i = 0; i < p.length; i++) {
            runner.notifyStream(client, streamid, "Sent kill signal to process " + p[i].p.pid);
            p[i].forcekilled = true;
            p[i].p.kill();
        }
    }
    public static findPythonPath() {
        var result = runner.findInPath("python3")
        if (result == "") result = runner.findInPath("python")
        return result;
    }
    public static findPwShPath() {
        var result = runner.findInPath("pwsh")
        if (result == "") result = runner.findInPath("powershell")
        return result;
    }    
    public static findDotnetPath() {
        return runner.findInPath("dotnet")
    }
    public static findXvfbPath() {
        return runner.findInPath("xvfb-run")
    }
    public static findNodePath() {
        return runner.findInPath("node")
    }
    public static findNPMPath() {
        const child = (process.platform === 'win32' ? 'npm.cmd' : 'npm')
        return runner.findInPath(child)
    }
    public static findChromiumPath() {
        var result = runner.findInPath("chromium-browser");
        if (result == "") result = runner.findInPath("chromium");
        return result
    }
    public static findChromePath() {
        var result = runner.findInPath("google-chrome");
        if (result == "") result = runner.findInPath("chrome");
        return result
    }
    public static async pipinstall(client: openiap, packagepath: string, streamid: string, pythonpath: string) {
        if (fs.existsSync(path.join(packagepath, "requirements.txt.done"))) return;
        if (fs.existsSync(path.join(packagepath, "requirements.txt"))) {
            runner.notifyStream(client, streamid, "************************");
            runner.notifyStream(client, streamid, "**** Running pip install");
            runner.notifyStream(client, streamid, "************************");
            if ((await runner.runit(client, packagepath, streamid, pythonpath, ["-m", "pip", "install", "-r", path.join(packagepath, "requirements.txt")], false)) == 0) {
                // WHY is this needed ???
                await runner.runit(client, packagepath, streamid, pythonpath, ["-m", "pip", "install", "--upgrade", "protobuf"], false)
                fs.writeFileSync(path.join(packagepath, "requirements.txt.done"), "done");
            }
        }
    }
    public static async npminstall(client: openiap, packagepath: string, streamid: string): Promise<boolean> {
        if (fs.existsSync(path.join(packagepath, "npm.install.done"))) {
            return false;
        } else if (fs.existsSync(path.join(packagepath, "package.json"))) {
            const nodePath = runner.findNodePath();
            runner.notifyStream(client, streamid, "************************");
            runner.notifyStream(client, streamid, "**** Running npm install");
            runner.notifyStream(client, streamid, "************************");
            const npmpath = runner.findNPMPath();
            if (npmpath == "") throw new Error("Failed locating NPM, is it installed and in the path?")
            if ((await runner.runit(client, packagepath, streamid, npmpath, ["install"], false)) == 0) {
                fs.writeFileSync(path.join(packagepath, "npm.install.done"), "done");
                return true;
            }
        }
        return false;
    }
    public static async runpythonscript(script: string): Promise<string> {
        const pythonpath = runner.findPythonPath();
        if (pythonpath == null) throw new Error("Python not found");
        return new Promise((resolve, reject) => {
            const childProcess = spawn(pythonpath, [script], { cwd: process.cwd() })
            const pid = childProcess.pid;
            let output = "";
            const catchoutput = (data: any) => {
                if (data != null) {
                    var s: string = data.toString();
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
    public static async runpythoncode(code: string): Promise<string> {
        var tempfilename = path.join(os.tmpdir(), "temp.py");
        fs.writeFileSync(tempfilename, code);
        return await this.runpythonscript(tempfilename);
    }
}