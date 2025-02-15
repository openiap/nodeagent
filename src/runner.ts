import { exec,  spawn, execSync, ChildProcessWithoutNullStreams } from 'child_process';
import { Stream, Readable } from 'stream';
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { config, openiap } from '@openiap/nodeapi';
import { agent } from './agent';
import * as yaml from "js-yaml";
import { ipackageport } from './packagemanager';
import { sleep } from './util';
import { Logger } from './Logger';

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
        const s = runner.streams.find(x => x.id == streamid)
        if(s == null) return;
        if (message != null && !Buffer.isBuffer(message)) {
            message = Buffer.from(message + "\n");
        }
        s.stream.push(message);
        if(addtobuffer) agent.emit("stream", s, message);
        //if(process.env.DEBUG != null && process.env.DEBUG != "") {
            if (message != null) {
                Logger.instrumentation.info(message.toString(), {streamid});
            }
        //}
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
                        Logger.instrumentation.error("notifyStream: " + error.message, {streamid});
                        const index = runner.commandstreams.indexOf(streamqueue);
                        if(index > -1) runner.commandstreams.splice(index, 1);
                    }).then((result) => {
                        if (result != null && result.command == "timeout") {
                            Logger.instrumentation.info("notifyStream, remove streamqueue " + streamqueue, {streamid});
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
                    Logger.instrumentation.info("notifyStream, remove streamqueue " + streamqueue, {streamid});
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
                        Logger.instrumentation.info("removestream streamid/correlationId: " + streamid + " streamqueue: " + streamqueue, {streamid});
                        client.QueueMessage({ queuename: streamqueue, data, correlationId: streamid }).catch((error) => {
                            Logger.instrumentation.info("removestream, remove streamqueue " + streamqueue, {streamid});
                            const index = runner.commandstreams.indexOf(streamqueue);
                            if(index > -1) runner.commandstreams.splice(index, 1);
                        });
                    }
    
                }
            } catch (error) {
                Logger.instrumentation.error(error, {streamid});
            }
        }
    }
    public static getExecutablePath(baseFolder:string, command:string) {
        const arch = os.arch(); // e.g., 'x64', 'arm64', 'ia32'
        const platform = os.platform(); // e.g., 'linux', 'darwin', 'win32'
        const isWindows = platform === 'win32';
        const extensions = isWindows ? ['.exe', '.cmd', '.com'] : [''];
    
        const platformArch = `${platform}-${arch}`;
        const executables = [];
    
        // Helper function to check if a file is executable
        const isExecutable = (file:string) => {
            const ext = path.extname(file).toLowerCase();
            if (isWindows) {
                return extensions.includes(ext);
            } else {
                try {
                    const stats = fs.statSync(file);
                    return stats.isFile() && (stats.mode & 0o111);
                } catch {
                    return false;
                }
            }
        };
    
        // List all files in the base folder
        const files = fs.readdirSync(baseFolder);
    
        // Collect all executable files
        for (const file of files) {
            const filePath = path.join(baseFolder, file);
            if (isExecutable(filePath)) {
                executables.push(file);
            }
        }
    
        // If only one executable is found, return it
        if (executables.length === 1) {
            return path.join(baseFolder, executables[0]);
        }
    
        // Try to find an exact match with platform-arch
        const exactMatches = executables.filter((file) =>
            file.includes(platformArch)
        );
        if (exactMatches.length === 1) {
            return path.join(baseFolder, exactMatches[0]);
        }
    
        // If no exact match, try to find a match with just the platform
        const platformMatches = executables.filter((file) =>
            file.includes(platform)
        );
        if (platformMatches.length === 1) {
            return path.join(baseFolder, platformMatches[0]);
        }
    
        // If still ambiguous, return an error with the list of executables found
        throw new Error(
            `Multiple executables found: ${executables.join(', ')}. Unable to determine the correct one.`
        );
    }
    public static async runit(client: openiap, packagepath: string, streamid: string, command: string, parameters: string[], clearstream: boolean, env: any = {}): Promise<number> {
        return new Promise((resolve, reject) => {
            try {
                let usingxvf = false;
                //if (clearstream) {
                    var xvfb = runner.findXvfbPath()
                    if (xvfb != null && xvfb != "") {
                        var shellcommand = command;
                        var _parameters = parameters;
                        command = xvfb;
                        parameters = [];
                        parameters.push(`--server-args="-screen 0 1920x1080x24 -ac"`);
                        parameters.push(`--auto-servernum`);
                        parameters.push(`--server-num=1`);
                        parameters.push(shellcommand);
                        parameters = parameters.concat(_parameters);
                        usingxvf = true;
                    }
                //}
                Logger.instrumentation.info('Running command:' + command + " " + parameters.join(" "), {streamid});
                Logger.instrumentation.info('In Working directory:' + packagepath, {streamid});
                // const childProcess = spawn(command, parameters, { cwd: packagepath, env: { ...process.env, ...env } })
                const childProcess = ctrossspawn(command, parameters, { cwd: packagepath, env: { ...process.env, ...env } })

                agent.emit("runit", { streamid, command, parameters, cwd: packagepath, env: { ...process.env, ...env } });

                const pid = childProcess.pid;
                const p: runner_process = { id: streamid, pid, p: childProcess, forcekilled: false }
                runner.processs.push(p);
                if(usingxvf) {
                    runner.notifyStream(client, streamid, `Child process started as pid ${pid} using xvfb`);
                } else {
                    runner.notifyStream(client, streamid, `Child process started as pid ${pid}`);
                }                
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
                }
                if (result.stdout != null && result.stdout.toString() != "") {
                }
            }
            return "";
        } catch (error) {
            return "";
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
        }
    }
    private static async _kill(pid: number) {
        const isWindows = process.platform === 'win32';
        return new Promise((resolve, reject) => {
            if (isWindows) {
                exec(`taskkill /PID ${pid} /T /F`, (err, stdout, stderr) => {
                    if (err) reject(err);
                    else resolve(stdout);
                });
            } else {
                exec(`kill -9 ${pid}`, (err, stdout, stderr) => {
                    if (err) reject(err);
                    else resolve(stdout);
                });
            }
        });
    }
    public static async killProcessAndChildren(client: openiap, streamid: string, pid: number) {
        try {
            const subpids = runner.findChildProcesses(pid);
            for(let i = 0; i < subpids.length; i++) {
                try {
                    await runner.killProcessAndChildren(client, streamid, subpids[i] as any);
                    await runner.notifyStream(client, streamid, "Send SIGTERM to child process " + subpids[i] + " of process " + pid);
                    Logger.instrumentation.info("Send SIGTERM to child process " + subpids[i] + " of process " + pid, {streamid, pid});
                    await runner._kill(subpids[i] as any);
                } catch (error) {
                    runner.notifyStream(client, streamid, "Failed to kill sub process " + subpids[i] + " " + error.message);
                }
            }
        } catch (error) {
            runner.notifyStream(client, streamid, "Failed to kill sub process " + pid + " " + error.message);
        }
    }
    public static async kill(client: openiap, streamid: string) {
        const p = runner.processs.filter(x => x.id == streamid);
        for (var i = 0; i < p.length; i++) {
            const pid = p[i].p.pid;
            await runner.killProcessAndChildren(client, streamid, pid);

            runner.notifyStream(client, streamid, "Send SIGTERM to process " + pid);
            Logger.instrumentation.info("Send SIGTERM to process " + pid, {streamid, pid});
            await sleep(10);
            p[i].forcekilled = true;
            p[i].p.kill('SIGTERM');
            let killDate = new Date();
            while (p[i].p.exitCode == null) {
                await sleep(10);
                if(new Date().getTime() - killDate.getTime() > 5000) {
                    break;
                }
            }
            if(p[i].p.exitCode == null) {
                runner.notifyStream(client, streamid, "Send SIGINT to process " + pid);
                Logger.instrumentation.info("Send SIGINT to process " + pid, {streamid, pid});
                await sleep(10);
                p[i].forcekilled = true;
                p[i].p.kill('SIGINT');
                killDate = new Date();
                while (p[i].p.exitCode == null) {
                    await sleep(10);
                    if(new Date().getTime() - killDate.getTime() > 5000) {
                        break;
                    }
                }
            }
            if(p[i].p.exitCode == null) {
                runner.notifyStream(client, streamid, "Send SIGKILL to process " + pid);
                Logger.instrumentation.info("Send SIGKILL to process " + pid, {streamid, pid});
                await sleep(10);
                p[i].forcekilled = true;
                p[i].p.kill('SIGKILL');
                killDate = new Date();
                while (p[i].p.exitCode == null) {
                    await sleep(10);
                    if(new Date().getTime() - killDate.getTime() > 5000) {
                        break;
                    }
                }
            }
            if(p[i].p.exitCode == null) {
                runner.notifyStream(client, streamid, "Failed to kill process " + pid);
            }
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
    public static findCargoPath() {
        const child = (process.platform === 'win32' ? 'cargo.cmd' : 'cargo')
        return runner.findInPath(child)
    }
    public static findJavaPath() {
        const child = (process.platform === 'win32' ? 'java.exe' : 'java')
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
            let fileContents = fs.readFileSync(path.join(packagepath, envfile), 'utf8');

            const data:any = yaml.load(fileContents);
            if(data != null) envname = data.name;
            if(envname == null || envname == "") {
                data.name = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                envname = data.name
                Logger.instrumentation.error("No name found in conda environment file, auto generated name: " + envname, {streamid});
                fileContents = yaml.dump(data)
                fs.writeFileSync(path.join(packagepath, envfile), fileContents);
            }
        }
        if(envname == null) return envname;
        if (!fs.existsSync(path.join(packagepath, envfile))) return envname;
        let param = ["env", "create", "-f", path.join(packagepath, envfile)]
        if(condapath.indexOf("micromamba") != -1) {
            param = ["env", "create", "-y", "-f", path.join(packagepath, envfile)]
        }
        if(fs.existsSync("/opt/conda/envs/")){
            if(fs.existsSync("/opt/conda/envs/" + envname)){
                let param = ["env", "update", "-f", path.join(packagepath, envfile)];
                if(condapath.indexOf("micromamba") != -1) {
                    param = ["env", "update", "-y", "-f", path.join(packagepath, envfile)];
                }
                runner.notifyStream(client, streamid, "*******************************");
                runner.notifyStream(client, streamid, "**** Running update environment");
                runner.notifyStream(client, streamid, "*******************************");
    
                Logger.instrumentation.info(condapath + " " + param.join(" "), {streamid});
                if ((await runner.runit(client, packagepath, streamid, condapath, param, false)) == 0) {
                    return envname;
                }
                throw new Error("Failed to update environment");
            }
            Logger.instrumentation.info(condapath + " " + param.join(" "), {streamid});
            runner.notifyStream(client, streamid, "*******************************");
            runner.notifyStream(client, streamid, "**** Running create environment");
            runner.notifyStream(client, streamid, "*******************************");
            if ((await runner.runit(client, packagepath, streamid, condapath, param, false)) == 0) {
                return envname;
            }
            throw new Error("Failed to create environment");
        }
        runner.notifyStream(client, streamid, "*******************************");
        runner.notifyStream(client, streamid, "**** Running create environment");
        runner.notifyStream(client, streamid, "*******************************");
        Logger.instrumentation.info(condapath + " " +  param.join(" "), {streamid});
        if ((await runner.runit(client, packagepath, streamid, condapath, param, false)) == 0) {
            return envname;
        }
        throw new Error("Failed to create environment");
    }
    // spawn EINVAL  - https://github.com/nodejs/node/issues/52554
    public static async npminstall(client: openiap, packagepath: string, streamid: string): Promise<boolean> {

        await runner.Generatenpmrc(client, packagepath, streamid);
        if (fs.existsSync(path.join(packagepath, "package.json"))) {
            const nodePath = runner.findNodePath();
            runner.notifyStream(client, streamid, "************************");
            runner.notifyStream(client, streamid, "**** Running npm install");
            runner.notifyStream(client, streamid, "************************");
            const npmpath = runner.findNPMPath();
            if (npmpath == "") throw new Error("Failed locating NPM, is it installed and in the path?")
            if ((await runner.runit(client, packagepath, streamid, npmpath, ["install", "--omit=dev", "--production", "--verbose"], false)) == 0) {
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
    public static findChildProcesses(pid: number): string[] {
        const isWindows = process.platform === 'win32';

        try {
            if (isWindows) {
                const stdout = execSync(`wmic process where (ParentProcessId=${pid}) get ProcessId`, { encoding: 'utf-8' });
                const pids = stdout.split(/\r?\n/).slice(1).filter(line => line.trim() !== '').map(line => line.trim());
                return pids;
            } else {
                const stdout = execSync(`pgrep -P ${pid}`, { encoding: 'utf-8' });
                // Adjusted error handling for Unix-like systems
                const pids = stdout.split(/\n/).filter(pid => pid !== '');
                return pids;
            }
        } catch (error) {
            // Handle errors here
            throw error;
        }
    }
}