import { spawn, execSync, ChildProcessWithoutNullStreams } from 'child_process';
import { Stream, Readable } from 'stream';
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { config, openiap } from '@openiap/nodeapi';
const { info, err } = config;
export class runner_process {
    id: string;
    pid: number;
    p: ChildProcessWithoutNullStreams;
    forcekilled: boolean;
    streamqueue: string;
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
    public static async notifyStream(client: openiap, streamid: string, message: Buffer | string): Promise<void> {
        const s = this.ensurestream(streamid);
        if (message != null && !Buffer.isBuffer(message)) {
            message = Buffer.from(message + "\n");
        }
        s.stream.push(message);
        const p = this.processs.find(x => x.id == streamid);
        if (p != null && p.streamqueue != null && p.streamqueue != "") {
            try {
                if (message == null) {
                    await client.QueueMessage({ queuename: p.streamqueue, data: { "command": "completed", "data": message }, correlationId: streamid });
                } else {
                    await client.QueueMessage({ queuename: p.streamqueue, data: { "command": "stream", "data": message }, correlationId: streamid });
                }
            } catch (error) {
                console.error(error.message);
                p.streamqueue = "";
            }
        }
    }
    public static removestream(streamid: string) {
        let s = runner.streams.find(x => x.id == streamid)
        if (s != null) {
            s.stream.push(null);
            runner.streams = runner.streams.filter(x => x.id != streamid);
        }
    }
    public static ensurestream(streamid: string) {
        let s = runner.streams.find(x => x.id == streamid)
        if (s == null) {
            s = new runner_stream();
            s.stream = new Stream.Readable();
            s.stream.read = function () { };
            s.id = streamid;
            runner.streams.push(s);
        }
        return s;
    }
    public static async runit(client: openiap, packagepath: string, streamid: string, streamqueue: string, command: string, parameters: string[], clearstream: boolean) {
        return new Promise((resolve, reject) => {
            try {
                // , stdio: ['pipe', 'pipe', 'pipe']
                // , stdio: 'pipe'
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
                const childProcess = spawn(command, parameters, { cwd: packagepath, env: { ...process.env, log_with_colors: "false" } })
                const pid = childProcess.pid;
                const p: runner_process = { id: streamid, pid, p: childProcess, forcekilled: false, streamqueue }
                runner.notifyStream(client, streamid, `Child process started as pid ${pid}`);
                runner.processs.push(p);
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
                // childProcess.stdout.on('data', catchoutput);
                // childProcess.stderr.on('data', catchoutput);
                childProcess.stdout.on('close', (code: any) => {
                    if (code == false || code == null) {
                        runner.notifyStream(client, streamid, `Child process ${pid} exited`);
                    } else {
                        runner.notifyStream(client, streamid, `Child process ${pid} exited with code ${code}`);
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
    public static findInPath(exec: string): string | null {
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
            return stdout.trim() || "";
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
        // const child = (process.platform === 'win32' ? 'npm.cmd' : 'npm')
        return runner.findInPath("npm")
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
    public static async pipinstall(client: openiap, packagepath: string, streamid: string, streamqueue: string, pythonpath: string) {
        if (fs.existsSync(path.join(packagepath, "requirements.txt.done"))) return;
        if (fs.existsSync(path.join(packagepath, "requirements.txt"))) {
            runner.notifyStream(client, streamid, "************************");
            runner.notifyStream(client, streamid, "**** Running pip install");
            runner.notifyStream(client, streamid, "************************");

            if ((await runner.runit(client, packagepath, streamid, streamqueue, pythonpath, ["-m", "pip", "install", "-r", path.join(packagepath, "requirements.txt")], false)) == true) {
                fs.writeFileSync(path.join(packagepath, "requirements.txt.done"), "done");
            }
        }
    }
    public static async npminstall(client: openiap, packagepath: string, streamid: string, streamqueue: string): Promise<boolean> {
        if (fs.existsSync(path.join(packagepath, "npm.install.done"))) {
            return false;
        } else if (fs.existsSync(path.join(packagepath, "package.json"))) {
            const nodePath = runner.findNodePath();
            runner.notifyStream(client, streamid, "************************");
            runner.notifyStream(client, streamid, "**** Running npm install");
            runner.notifyStream(client, streamid, "************************");
            const npmpath = runner.findNPMPath();
            if (npmpath == "") throw new Error("Failed locating NPM, is it installed and in the path?")
            if ((await runner.runit(client, packagepath, streamid, streamqueue, npmpath, ["install"], false)) == true) {
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