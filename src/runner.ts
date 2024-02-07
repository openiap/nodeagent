import { spawn, execSync, ChildProcessWithoutNullStreams } from 'child_process';
import { Stream, Readable } from 'stream';
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { config, openiap } from '@openiap/nodeapi';
import { agent } from './agent';
import * as yaml from "js-yaml";
import { ipackageport } from './packagemanager';

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
    // streamqueue: string;
    streamqueues: string[];
    packageid: string;
    packagename: string;
    schedulename: string;
    buffer: Buffer;
    ports: ipackageport[];
}
let lastping = new Date();
export class runner {
    public static processs: runner_process[] = [];
    public static streams: runner_stream[] = [];
    public static commandstreams: string[] = [];
    public static async notifyStream(client: openiap, streamid: string, message: Buffer | string, addtobuffer: boolean = true): Promise<void> {
        // const s = this.ensurestream(streamid, "");
        const s = runner.streams.find(x => x.id == streamid)
        if(s == null) return;
        if (message != null && !Buffer.isBuffer(message)) {
            message = Buffer.from(message + "\n");
        }
        s.stream.push(message);
        if(addtobuffer) agent.emit("stream", s, message);

        if(addtobuffer && message != null) {
            if(s.buffer == null) s.buffer = Buffer.from("");
            if(Buffer.isBuffer(message)) {
                s.buffer = Buffer.concat([s.buffer, message]);
            } else {
                s.buffer = Buffer.concat([s.buffer, Buffer.from(message)]);
            }
            if(s.buffer.length > 1000000) {
                // keep first 500k and remove rest
                s.buffer = s.buffer.subarray(0, 500000);
            }
        }

        const now = new Date();
        const minutes = (now.getTime() - lastping.getTime()) / 60000;
        if(minutes > 5) {
            lastping = now;
        }
        for (let i = runner.commandstreams.length - 1; i >= 0; i--) {
            const streamqueue = runner.commandstreams[i];
            if (streamqueue != null && streamqueue != "") {
                if(minutes > 5) { // backwars compatibility with older builds of openflow 1.5
                    client.QueueMessage({ queuename: streamqueue, data: { "command": "ping" } }, true).catch((error) => {
                        console.error("notifyStream: " + error.message);
                        const index = runner.commandstreams.indexOf(streamqueue);
                        if(index > -1) runner.commandstreams.splice(index, 1);
                    }).then((result) => {
                        if (result != null && result.command == "timeout") {
                            console.log("notifyStream, remove streamqueue " + streamqueue);
                            const index = runner.commandstreams.indexOf(streamqueue);
                            if(index > -1) runner.commandstreams.splice(index, 1);
                        }
                    });
                }
                try {
                    if (message == null) {
                        await client.QueueMessage({ queuename: streamqueue, data: { "command": "completed", "data": message }, correlationId: streamid });
                    } else {
                        await client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": message }, correlationId: streamid });
                    }
                } catch (error) {
                    console.log("notifyStream, remove streamqueue " + streamqueue);
                    runner.commandstreams.splice(i, 1);
                }
            } else {
                runner.commandstreams.splice(i, 1);
            }
        }
    }
    public static removestream(client: openiap, streamid: string, success: boolean, buffer: string) {
        let s = runner.streams.find(x => x.id == streamid)
        if (s != null) {
            s.stream.push(null);
            runner.streams = runner.streams.filter(x => x.id != streamid);
            agent.emit("streamremoved", s);
            var data = { "command": "runpackage", success, "completed": true, "data": buffer };
            try {
                for (let i = runner.commandstreams.length - 1; i >= 0; i--) {
                    const streamqueue = runner.commandstreams[i];
                    if (streamqueue != null && streamqueue != "") {
                        console.log("removestream streamid/correlationId: " + streamid + " streamqueue: " + streamqueue);
                        client.QueueMessage({ queuename: streamqueue, data, correlationId: streamid }).catch((error) => {
                            console.log("removestream, remove streamqueue " + streamqueue);
                            const index = runner.commandstreams.indexOf(streamqueue);
                            if(index > -1) runner.commandstreams.splice(index, 1);
                        });
                    }
    
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
    public static async runit(client: openiap, packagepath: string, streamid: string, command: string, parameters: string[], clearstream: boolean, env: any = {}): Promise<number> {
        return new Promise((resolve, reject) => {
            try {
                // console.log('runit: Running command:', command);
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
                        parameters.push(`--server-args="-screen 0 1920x1080x24 -ac"`);
                        parameters.push(`--auto-servernum`);
                        parameters.push(`--server-num=1`);
                        parameters.push(shellcommand);
                        parameters = parameters.concat(_parameters);
                    }
                }
                console.log('Running command:', command + " " + parameters.join(" "));
                // if (parameters != null && Array.isArray(parameters)) console.log('With parameters:', parameters.join(" "));
                const childProcess = spawn(command, parameters, { cwd: packagepath, env: { ...process.env, ...env } })
                // console.log('Current working directory:', packagepath);

                agent.emit("runit", { streamid, command, parameters, cwd: packagepath, env: { ...process.env, ...env } });

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
                if (result.stderr != null && result.stderr.toString() != "") {
                    // console.log(result.stderr.toString());
                }
                if (result.stdout != null && result.stdout.toString() != "") {
                    // console.log(result.stdout.toString());
                }
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
    public static findCondaPath() {
        var result = runner.findInPath("conda")
        if (result == "") result = runner.findInPath("micromamba")
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
    public static async Generatenpmrc(client: openiap, packagepath: string, streamid: string) {
        const npmrcFile = path.join(packagepath, ".npmrc");
        if (fs.existsSync(npmrcFile)) return;
        let HTTP_PROXY = process.env.HTTP_PROXY;
        let HTTPS_PROXY = process.env.HTTPS_PROXY;
        let NO_PROXY = process.env.NO_PROXY;
        let NPM_REGISTRY = process.env.NPM_REGISTRY;
        let NPM_TOKEN = process.env.NPM_TOKEN;
        if(HTTP_PROXY == null || HTTP_PROXY == "" || HTTP_PROXY == "undefined" || HTTP_PROXY == "null") HTTP_PROXY = "";
        if(HTTPS_PROXY == null || HTTPS_PROXY == "" || HTTPS_PROXY == "undefined" || HTTPS_PROXY == "null") HTTPS_PROXY = "";
        if(NO_PROXY == null || NO_PROXY == "" || NO_PROXY == "undefined" || NO_PROXY == "null") NO_PROXY = "";
        if(NPM_REGISTRY == null || NPM_REGISTRY == "" || NPM_REGISTRY == "undefined" || NPM_REGISTRY == "null") NPM_REGISTRY = "";
        if(NPM_TOKEN == null || NPM_TOKEN == "" || NPM_TOKEN == "undefined" || NPM_TOKEN == "null") NPM_TOKEN = "";
        if (HTTP_PROXY != "" || HTTPS_PROXY != "" || NPM_REGISTRY != "") {
            // According to https://docs.npmjs.com/cli/v7/using-npm/config it should be picked up by environment variables, 
            // HTTP_PROXY, HTTPS_PROXY and NO_PROXY 
            let content = "";
            if (HTTP_PROXY != "") content += "proxy=" + HTTP_PROXY + "\n";
            if (HTTPS_PROXY != "") content += "https-proxy=" + HTTPS_PROXY + "\n";
            if (NO_PROXY != "") content += "noproxy=" + NO_PROXY + "\n";
            if(NPM_REGISTRY != null && NPM_REGISTRY != "") {
                content += "\n" + "registry=" + NPM_REGISTRY;
                if(NPM_TOKEN != null && NPM_TOKEN != "") {
                    content += "\n" + NPM_REGISTRY.replace("https:", "").replace("http:", "") + ":_authToken=" + NPM_TOKEN;
                }
            } else {
                content += "\n" + "registry=http://registry.npmjs.org/";
                if(NPM_TOKEN != null && NPM_TOKEN != "") {
                    content += "\n" + "//registry.npmjs.org/:_authToken=" + NPM_TOKEN;
                }
            }

            fs.writeFileSync(npmrcFile, content);
          }
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
    public static async condaenv(packagepath: string, condapath: string) {
        let CONDA_PREFIX=process.env.CONDA_PREFIX;
        if(CONDA_PREFIX == null || CONDA_PREFIX == "") CONDA_PREFIX = "";
    }
    public static async condainstall(client: openiap, packagepath: string, streamid: string, condapath: string): Promise<string> {
        var envname = null;
        // create envoruiment and install packages
        var envfile = ""
        if(fs.existsSync(path.join(packagepath, "conda.yaml"))) envfile = "conda.yaml"
        if(fs.existsSync(path.join(packagepath, "conda.yml"))) envfile = "conda.yml"
        if(fs.existsSync(path.join(packagepath, "environment.yml"))) envfile = "environment.yml"
        if(fs.existsSync(path.join(packagepath, "environment.yaml"))) envfile = "environment.yaml"
        if (envfile != "") {
            const fileContents = fs.readFileSync(path.join(packagepath, envfile), 'utf8');

            const data:any = yaml.load(fileContents);
            if(data != null) envname = data.name;
            if(envname == null || envname == "") {
                envname = null;
                console.error("No name found in conda environment file, skipping conda install");
            }
        }
        if(envname == null) return envname;
        if (!fs.existsSync(path.join(packagepath, envfile))) return envname;
        // docker work around
        if(fs.existsSync("/opt/conda/envs/")){
            if(fs.existsSync("/opt/conda/envs/" + envname)){
                runner.notifyStream(client, streamid, "************************");
                runner.notifyStream(client, streamid, "**** Updating conda env ");
                runner.notifyStream(client, streamid, "************************");
                await runner.runit(client, packagepath, streamid, condapath, ["env", "update", "-f", path.join(packagepath, envfile)], false);
                return envname;;
            }
            runner.notifyStream(client, streamid, "************************");
            runner.notifyStream(client, streamid, "**** Creating conda env ");
            runner.notifyStream(client, streamid, "************************");
            await runner.runit(client, packagepath, streamid, condapath, ["env", "update", "-f", path.join(packagepath, envfile)], false);
            return envname;
        }
        if (fs.existsSync(path.join(packagepath, "conda.yaml.done"))) return envname;
        runner.notifyStream(client, streamid, "************************");
        runner.notifyStream(client, streamid, "**** Running conda install");
        runner.notifyStream(client, streamid, "************************");
        if ((await runner.runit(client, packagepath, streamid, condapath, ["env", "create", "-f", path.join(packagepath, envfile)], false)) == 0) {
            fs.writeFileSync(path.join(packagepath, "conda.yaml.done"), "done");
        }
        return envname;
    }
    public static async npminstall(client: openiap, packagepath: string, streamid: string): Promise<boolean> {
        await runner.Generatenpmrc(client, packagepath, streamid);
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