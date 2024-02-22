import { openiap } from "@openiap/nodeapi";
import { Readable } from 'stream';
import * as fs from "fs";
import * as path from "path";
import * as os from "os"
import * as AdmZip from "adm-zip";
import * as tar from "tar";
import { config } from '@openiap/nodeapi';
import { runner, runner_stream } from "./runner";
import { agent } from "./agent";
import { FindFreePort } from "./PortMapper";
const { info, err } = config;
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

export class packagemanager {

  private static _homedir:string = null;
  public static homedir() {
    if(packagemanager._homedir != null) {
      return packagemanager._homedir;
    }
    packagemanager._homedir = os.homedir();
    if(packagemanager._homedir == "/" || packagemanager._homedir == "") {
      if(fs.existsSync("/home/openiap") == true) {
        console.log("homedir overriden to /home/openiap from:", packagemanager._homedir)
        packagemanager._homedir = "/home/openiap"
      } else {
        console.log("homedir overriden to /tmp from:", packagemanager._homedir)
        packagemanager._homedir = "/tmp"
      }
    }
    return packagemanager._homedir;
  }
  public static packagefolder() {
    if(packagemanager._packagefolder != null) {
      return packagemanager._packagefolder;
    }
    packagemanager._packagefolder = path.join(packagemanager.homedir(), ".openiap", "packages")
    console.log("packagefolder as:", packagemanager._packagefolder)
    return packagemanager._packagefolder;
  }
  private static _packagefolder:string = null;
  public static packages: ipackage[] = [];
  public static async getpackages(client: openiap, languages: string[]): Promise<ipackage[]> {
    if(client == null) {
      if (!fs.existsSync(packagemanager.packagefolder())) fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
      var _packages: ipackage[] = [];
      var files = fs.readdirSync(packagemanager.packagefolder());
      for(var i = 0; i < files.length; i++) {
        if(files[i].endsWith(".json")) {
          var pkg = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder(), files[i])).toString());
          if(pkg != null && pkg._type == "package") _packages.push(pkg);
        }
      }
      packagemanager.packages = _packages
      return JSON.parse(JSON.stringify(_packages));
    }
    var _packages = await client.Query<ipackage>({ query: { "_type": "package", "language": { "$in": languages } }, collectionname: "agents" });
    packagemanager.packages = _packages
    return JSON.parse(JSON.stringify(_packages));
}
  public static async reloadpackage(client: openiap, id: string, force: boolean): Promise<ipackage> {
    var pkg = await client.FindOne<ipackage>({ query: { "_type": "package", "_id": id }, collectionname: "agents" });
    if(pkg == null) return null;
    if (!fs.existsSync(packagemanager.packagefolder())) fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
    if(force == false && fs.existsSync(path.join(packagemanager.packagefolder(), pkg._id + ".json"))) {
      var document = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder(), pkg._id + ".json")).toString());
      if(document.version == pkg.version) return pkg;
    }
    packagemanager.deleteDirectoryRecursiveSync(path.join(packagemanager.packagefolder(), pkg._id));
    if (pkg.fileid != null && pkg.fileid != "") {
      await packagemanager.getpackage(client, pkg._id);
    }
  }
  public static async reloadpackages(client: openiap, languages: string[], force: boolean): Promise<ipackage[]> {
    var packages = await packagemanager.getpackages(client, languages);
    if (!fs.existsSync(packagemanager.packagefolder())) fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
    for (var i = 0; i < packages.length; i++) {
      try {
        if (!fs.existsSync(packagemanager.packagefolder())) fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
        if(force == false && fs.existsSync(path.join(packagemanager.packagefolder(), packages[i]._id + ".json"))) {
          var document = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder(), packages[i]._id + ".json")).toString());
          if(document.version == packages[i].version) continue;
        }
        packagemanager.deleteDirectoryRecursiveSync(path.join(packagemanager.packagefolder(), packages[i]._id));
        // fs.writeFileSync(path.join(packagemanager.packagefolder(), packages[i]._id + ".json"), JSON.stringify(packages[i], null, 2))
        if (packages[i].fileid != null && packages[i].fileid != "") {
          await packagemanager.getpackage(client, packages[i]._id);
        }
      } catch (error) {
        console.error(error);
      }
    }
    return packages;
  }
  public static async getpackage(client: openiap, id: string): Promise<ipackage> {
    if (!fs.existsSync(packagemanager.packagefolder())) fs.mkdirSync(packagemanager.packagefolder(), { recursive: true });
    let pkg: ipackage = null;
    if(fs.existsSync(path.join(packagemanager.packagefolder(), id + ".json"))) {
      pkg = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder(), id + ".json")).toString())
      if(pkg.fileid != "local" && agent.client.connected && agent.client.signedin) {
        let serverpcks: ipackage[] = null; 
        try { // If offline, this will fail, but we still have the files, so return the local package
          // serverpck = await client.FindOne<ipackage>({ collectionname: "agents", query: { _id: id, "_type": "package" } });
          serverpcks = await client.Query<ipackage>({ collectionname: "agents", query: { _id: id, "_type": "package" } });
        } catch (error) {          
        }
        if(serverpcks != null) {
          if(serverpcks.length == 0) {
            throw new Error("package: " + id + " no longer exists!");
          }
          if(serverpcks[0].fileid == pkg.fileid) {
            pkg = serverpcks[0];
            fs.writeFileSync(path.join(packagemanager.packagefolder(), id + ".json"), JSON.stringify(pkg, null, 2))
            const localpath = path.join(packagemanager.packagefolder(), id)
            if(fs.existsSync(localpath)) {
              let files = fs.readdirSync(localpath);
              if(files.length > 0 ) {
                return pkg;
              }
            }
          } else {
            pkg = serverpcks[0];
            fs.writeFileSync(path.join(packagemanager.packagefolder(), id + ".json"), JSON.stringify(pkg, null, 2))
          }
        }
      }
    } else {
      if(agent.client.connected && agent.client.signedin) {
        pkg = await client.FindOne<ipackage>({ collectionname: "agents", query: { _id: id, "_type": "package" } });
        if(pkg != null) fs.writeFileSync(path.join(packagemanager.packagefolder(), id + ".json"), JSON.stringify(pkg, null, 2))
      }
    }     
    if(pkg == null) throw new Error("Failed to find package: " + id);
    if(!agent.client.connected || !agent.client.signedin) {
      return pkg;
    }
    let filename = "";
    if(pkg.fileid != "local") {
      try {
        const reply = await client.DownloadFile({ id: pkg.fileid, folder: packagemanager.packagefolder() });
        filename = path.join(packagemanager.packagefolder(), reply.filename);
      } catch (error) {
        console.log(error);
      }
      if(filename == "") {
        pkg = await client.FindOne<ipackage>({ collectionname: "agents", query: { _id: id, "_type": "package" } });
        if(pkg != null) fs.writeFileSync(path.join(packagemanager.packagefolder(), id + ".json"), JSON.stringify(pkg, null, 2))
        try {
          const reply = await client.DownloadFile({ id: pkg.fileid, folder: packagemanager.packagefolder() });
          filename = path.join(packagemanager.packagefolder(), reply.filename);
        } catch (error) {
        }
      }
      if(filename == "") {
        throw new Error("Failed to download file: " + pkg.fileid);
      }
    }
    try {
      if (path.extname(filename) == ".zip") {
        var zip = new AdmZip(filename);
        zip.extractAllTo(path.join(packagemanager.packagefolder(), id), true);
      } else if (path.extname(filename) == ".tar.gz" || path.extname(filename) == ".tgz") {
        var dest = path.join(packagemanager.packagefolder(), id);
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        try {
          await tar.x({
            file: filename,
            C: dest
          })
        } catch (error) {
          console.error(error)
          throw error;
        }
      }
    } catch (error) {
      console.error(error);
      throw error
    } finally {
      if(filename != "" && fs.existsSync(filename)) fs.unlinkSync(filename);
      return pkg;
    }
  }
  public static getpackagepath(packagepath: string, first: boolean = true): string {
    if (fs.existsSync(path.join(packagepath, "package.json"))) return packagepath;
    if (fs.existsSync(path.join(packagepath, "agent.js"))) return packagepath;
    if (fs.existsSync(path.join(packagepath, "main.js"))) return packagepath;
    if (fs.existsSync(path.join(packagepath, "index.js"))) return packagepath;
    if (fs.existsSync(path.join(packagepath, "agent.py"))) return packagepath;
    if (fs.existsSync(path.join(packagepath, "main.py"))) return packagepath;
    if (fs.existsSync(path.join(packagepath, "index.py"))) return packagepath;
    // search for a .csproj file
    if (!first) return ""
    if (!fs.existsSync(packagepath)) return ""
    var files = fs.readdirSync(packagepath)
    for (var i = 0; i < files.length; i++) {
      const filepath = path.join(packagepath, files[i])
      if (fs.lstatSync(filepath).isDirectory()) {
        var test = packagemanager.getpackagepath(filepath, false)
        if (test != "") return test;
      }
    }
    return ""
  }
  public static getscriptpath(packagepath: string) {
    if (fs.existsSync(path.join(packagepath, "package.json"))) {
      var project = require(path.join(packagepath, "package.json"))
      if (project.scripts && project.scripts.start) {
        return "npm run start"
      }
      var _main = path.join(packagepath, project.main);
      if (fs.existsSync(_main)) {
        return _main
      }
    }
    if (fs.existsSync(path.join(packagepath, "agent.js"))) return path.join(packagepath, "agent.js");
    if (fs.existsSync(path.join(packagepath, "main.js"))) return path.join(packagepath, "main.js");
    if (fs.existsSync(path.join(packagepath, "index.js"))) return path.join(packagepath, "index.js");
    if (fs.existsSync(path.join(packagepath, "agent.py"))) return path.join(packagepath, "agent.py");
    if (fs.existsSync(path.join(packagepath, "main.py"))) return path.join(packagepath, "main.py");
    if (fs.existsSync(path.join(packagepath, "index.py"))) return path.join(packagepath, "index.py");
    if (fs.existsSync(path.join(packagepath, "index.ps1"))) return path.join(packagepath, "index.ps1");
    if (fs.existsSync(path.join(packagepath, "main.ps1"))) return path.join(packagepath, "main.ps1");
  }
  private static async addstream(streamid: string, streamqueues: string[], stream: Readable, pck: ipackage, env: any) {
    let s = runner.streams.find(x => x.id == streamid)
    if (s != null) throw new Error("Stream " + streamid + " already exists")
    s = new runner_stream();
    s.id = streamid;
    s.ports = [];
    s.stream = stream;
    s.streamqueues = streamqueues;
    if(pck != null) {
      s.packagename = pck.name;
      s.packageid = pck._id;
    }
    runner.streams.push(s);

    if(pck.ports != null) {
      for(let i = 0; i < pck.ports.length; i++) {
        let port: number = pck.ports[i].port;
        if(port == null || (port as any) == "") port = 0;
        port = await FindFreePort(port);
        // @ts-ignore
        if(pck.ports[i].name != null && pck.ports[i].portname == null) pck.ports[i].portname = pck.ports[i].name;
        var newp = { port: port, portname: pck.ports[i].portname, protocol: pck.ports[i].protocol, web: pck.ports[i].web };
        if(newp.portname == null || newp.portname == "") { newp.portname = "PORT" + port; }
        s.ports.push(newp);
        if(env != null) {
          env[pck.ports[i].portname] = port;
          if(pck.ports.length == 1) {
            env["PORT"] = port;
          }
        }
      }
    }
    agent.emit("streamadded", s);
    return s;
  }
  public static async runpackage(client: openiap, id: string, streamid: string, streamqueues: string[], stream: Readable, wait: boolean, env: any = {}, schedule: any = undefined): Promise<number> {
    if (streamid == null || streamid == "") throw new Error("streamid is null or empty");
    if(packagemanager.packagefolder() == null || packagemanager.packagefolder() == "") throw new Error("packagemanager.packagefolder is null or empty");
    try {
      let pck: ipackage = null;
      let s: runner_stream = null;
      try {
        pck = await packagemanager.getpackage(client, id);
        s = await packagemanager.addstream(streamid, streamqueues, stream, pck, env)
      } catch (error) {
        throw error;
      }
      if(s == null) s = await packagemanager.addstream(streamid, streamqueues, stream, pck, env)

      if(pck == null) throw new Error("Failed to find package: " + id);
      s.packagename = pck.name;
      s.packageid = pck._id;
      s.schedulename = "";
      if(schedule != null) {
        s.schedulename = schedule.name;
      }
      var processcount = runner.streams.length;
      var processes = [];
      for (var i = processcount; i >= 0; i--) {
        var p = runner.streams[i];
        if (p == null) continue;
        if(p.schedulename == null || p.schedulename == "") {
          var b = true;
        }
        processes.push({
          "id": p.id,
          "streamqueues": runner.commandstreams,
          "packagename": p.packagename,
          "packageid": p.packageid,
          "schedulename": p.schedulename,
        });
      }
      let message = { "command": "listprocesses", "success": true, "count": processcount, "processes": processes }

      for (let i = runner.commandstreams.length - 1; i >= 0; i--) {
        const streamqueue = runner.commandstreams[i];
        if(streamqueue != streamid) {
          try {
            await client.QueueMessage({ queuename: streamqueue, data: message, correlationId: streamid });
          } catch (error) {
            console.log("runpackage, remove streamqueue " + streamqueue);
            runner.commandstreams.splice(i, 1);
          }
        }
      }
      var packagepath = packagemanager.getpackagepath(path.join(packagemanager.packagefolder(), id));
      if (fs.existsSync(packagepath)) {
        let command = packagemanager.getscriptpath(packagepath)
        if (command == "" || command == null) throw new Error("Failed locating a command to run, EXIT")
        if (command.endsWith(".py")) {
          var python = runner.findPythonPath();
          if (python == "") throw new Error("Failed locating python, is python installed and in the path?")
          var conda = runner.findCondaPath();
          var condaname = null;
          if(conda != null && conda != "") {
            condaname = await runner.condainstall(client, packagepath, streamid, conda)
          }
          if(condaname == null) {
            await runner.pipinstall(client, packagepath, streamid, python)
          }
          if (wait) {
            if(condaname != null) {
              console.log(conda)
              console.log(["run", "-n", condaname, "python", "-u", command])
              return await runner.runit(client, packagepath, streamid, conda, ["run", "-n", condaname, "python", "-u", command], true, env)
            }
            console.log(python)
            console.log(["-u", command])
          return await runner.runit(client, packagepath, streamid, python, ["-u", command], true, env)
          }
          if(condaname != null) {
            console.log(conda)
            console.log(["run", "-n", condaname, "python", "-u", command])
            runner.runit(client, packagepath, streamid, conda, ["run", "-n", condaname, "python", "-u", command], true, env)
            return 0;
          }
          console.log(python)
          console.log(["-u", command])
          runner.runit(client, packagepath, streamid, python, ["-u", command], true, env)
          return 0;
        } else if (command.endsWith(".js") || command == "npm run start") {
          // const nodePath = path.join(app.getAppPath(), 'node_modules', '.bin', 'node');
          // const nodePath = "node"
          const nodePath = runner.findNodePath();
          if (nodePath == "") throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH))
          await runner.npminstall(client, packagepath, streamid);
          if (wait) {
            if(command == "npm run start") {
              const npmpath = runner.findNPMPath();
              return await runner.runit(client, packagepath, streamid, npmpath, ["run", "start"], true, env)
            }
            return await runner.runit(client, packagepath, streamid, nodePath, [command], true, env)
          } else {
            if(command == "npm run start") {
              const npmpath = runner.findNPMPath();
              runner.runit(client, packagepath, streamid, npmpath, ["run", "start"], true, env)
              return 0;
            }
            runner.runit(client, packagepath, streamid, nodePath, [command], true, env)
            return 0;
          }
        } else if (command.endsWith(".ps1")) {
          const pwshPath = runner.findPwShPath();
          if (pwshPath == "") throw new Error("Failed locating powershell, is powershell installed and in the path? " + JSON.stringify(process.env.PATH))
          if (wait) {
            var exitcode = await runner.runit(client, packagepath, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env);
            return exitcode
          } else {
            runner.runit(client, packagepath, streamid, pwshPath, ["-ExecutionPolicy", "Bypass", "-File", command], true, env)
            return 0;
          }
        } else {
          var dotnet = runner.findDotnetPath();
          if (dotnet == "") throw new Error("Failed locating dotnet, is dotnet installed and in the path?")
          if (wait) {
            return await runner.runit(client, packagepath, streamid, dotnet, ["run"], true, env)
          } else {
            runner.runit(client, packagepath, streamid, dotnet, ["run"], true, env)
            return 0;
          }
        }
      } else {
        if (packagepath == null || packagepath == "") {
          runner.notifyStream(client, streamid, "Package not found in " + packagemanager.packagefolder());
        } else {
          runner.notifyStream(client, streamid, "Package not found in " + packagepath);
        }
        runner.removestream(client, streamid, false, "");
      }
    } catch (error) {
      runner.notifyStream(client, streamid, error.message);
      runner.removestream(client, streamid, false, "");
    }
    return 0;
  }
  public static async removepackage(id: string) {
    var ppath = path.join(packagemanager.packagefolder(), id);
    packagemanager.deleteDirectoryRecursiveSync(ppath);

  }
  public static deleteDirectoryRecursiveSync(dirPath: string) {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach((file, index) => {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          if(file == "node_modules" && process.env.skip_node_modules != null && process.env.skip_node_modules != "") return;
          packagemanager.deleteDirectoryRecursiveSync(curPath);
        } else { // delete file
          try {
            fs.unlinkSync(curPath);  
          } catch (error) {
            console.log(error.message + " while unlinkSync " + curPath)
          }
        }
      });
      try {
      fs.rmdirSync(dirPath);
      } catch (error) {
        console.log(error.message + " while rmdirSync " + dirPath)
      }
    }
  }
}
