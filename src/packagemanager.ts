import { openiap } from "@openiap/nodeapi";
import { Readable } from 'stream';
import * as fs from "fs";
import * as path from "path";
import * as os from "os"
import * as AdmZip from "adm-zip";
import * as tar from "tar";
import { config } from '@openiap/nodeapi';
import { runner, runner_stream } from "./runner";
const { info, err } = config;
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
export class packagemanager {
  public static packagefolder = path.join(os.homedir(), ".openiap", "packages");
  public static async getpackages(client: openiap, languages: string[]): Promise<ipackage[]> {
    if(client == null) {
      if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
      var _packages: ipackage[] = [];
      var files = fs.readdirSync(packagemanager.packagefolder);
      for(var i = 0; i < files.length; i++) {
        if(files[i].endsWith(".json")) {
          var pkg = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder, files[i])).toString());
          if(pkg != null && pkg._type == "package") _packages.push(pkg);
        }
      }
      return _packages;
    }
    var _packages = await client.Query<ipackage>({ query: { "_type": "package", "language": { "$in": languages } }, collectionname: "agents" });
    return _packages;
  }
  public static async reloadpackage(client: openiap, id: string, force: boolean): Promise<ipackage> {
    var pkg = await client.FindOne<ipackage>({ query: { "_type": "package", "_id": id }, collectionname: "agents" });
    if(pkg == null) return null;
    if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
    if(force == false && fs.existsSync(path.join(packagemanager.packagefolder, pkg._id + ".json"))) {
      var document = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder, pkg._id + ".json")).toString());
      if(document.version == pkg.version) return pkg;
    }
    packagemanager.deleteDirectoryRecursiveSync(path.join(packagemanager.packagefolder, pkg._id));
    fs.writeFileSync(path.join(packagemanager.packagefolder, pkg._id + ".json"), JSON.stringify(pkg, null, 2))
    if (pkg.fileid != null && pkg.fileid != "") {
      console.log("get package " + pkg.name);
      await packagemanager.getpackage(client, pkg._id);
    }
  }
  public static async reloadpackages(client: openiap, languages: string[], force: boolean): Promise<ipackage[]> {
    var packages = await packagemanager.getpackages(client, languages);
    if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
    for (var i = 0; i < packages.length; i++) {
      try {
        if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
        if(force == false && fs.existsSync(path.join(packagemanager.packagefolder, packages[i]._id + ".json"))) {
          var document = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder, packages[i]._id + ".json")).toString());
          if(document.version == packages[i].version) continue;
        }
        packagemanager.deleteDirectoryRecursiveSync(path.join(packagemanager.packagefolder, packages[i]._id));
        fs.writeFileSync(path.join(packagemanager.packagefolder, packages[i]._id + ".json"), JSON.stringify(packages[i], null, 2))
        if (packages[i].fileid != null && packages[i].fileid != "") {
          console.log("get package " + packages[i].name + " v" + packages[i].version + " " + packages[i]._id);
          await packagemanager.getpackage(client, packages[i]._id);
        }
      } catch (error) {
        console.error(error);
      }
    }
    return packages;
  }
  public static async getpackage(client: openiap, id: string): Promise<ipackage> {
    if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
    let pkg: ipackage = null;
    if(fs.existsSync(path.join(packagemanager.packagefolder, id + ".json"))) {
      pkg = JSON.parse(fs.readFileSync(path.join(packagemanager.packagefolder, id + ".json")).toString())
    } else {
      pkg = await client.FindOne<ipackage>({ collectionname: "agents", query: { _id: id, "_type": "package" } });
      if(pkg != null) fs.writeFileSync(path.join(packagemanager.packagefolder, id + ".json"), JSON.stringify(pkg, null, 2))
    }     
    if(pkg == null) throw new Error("Failed to find package: " + id);
    // console.log("Downloading file " + pkg.fileid)
    const reply = await client.DownloadFile({ id: pkg.fileid, folder: packagemanager.packagefolder });
    const filename = path.join(packagemanager.packagefolder, reply.filename);
    try {
      if (path.extname(filename) == ".zip") {
        var zip = new AdmZip(filename);
        zip.extractAllTo(path.join(packagemanager.packagefolder, id), true);
      } else if (path.extname(filename) == ".tar.gz" || path.extname(filename) == ".tgz") {
        var dest = path.join(packagemanager.packagefolder, id);
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
      fs.unlinkSync(filename);
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
  private static addstream(streamid: string, streamqueue: string, stream: Readable) {
    let s = runner.streams.find(x => x.id == streamid)
    if (s != null) throw new Error("Stream " + streamid + " already exists")
    s = new runner_stream();
    s.id = streamid;
    s.stream = stream;
    s.streamqueue = streamqueue;
    runner.streams.push(s);
    return s;
  }
  public static async runpackage(client: openiap, id: string, streamid: string, streamqueue: string, stream: Readable, wait: boolean, env: any = {}): Promise<number> {
    if (streamid == null || streamid == "") throw new Error("streamid is null or empty");
    if(packagemanager.packagefolder == null || packagemanager.packagefolder == "") throw new Error("packagemanager.packagefolder is null or empty");
    try {
      var s = packagemanager.addstream(streamid, streamqueue, stream)
      const pck = await packagemanager.getpackage(client, id);
      if(pck == null) throw new Error("Failed to find package: " + id);
      s.packagename = pck.name;
      s.packageid = pck._id;
      var packagepath = packagemanager.getpackagepath(path.join(packagemanager.packagefolder, id));
      if (fs.existsSync(packagepath)) {
        let command = packagemanager.getscriptpath(packagepath)
        if (command == "" || command == null) throw new Error("Failed locating a command to run, EXIT")
        if (command.endsWith(".py")) {
          var python = runner.findPythonPath();
          if (python == "") throw new Error("Failed locating python, is python installed and in the path?")
          await runner.pipinstall(client, packagepath, streamid, python)
          if (wait) {
            return await runner.runit(client, packagepath, streamid, python, ["-u", command], true, env)
          } else {
            runner.runit(client, packagepath, streamid, python, ["-u", command], true, env)
            return 0;
          }
        } else if (command.endsWith(".js") || command == "npm run start") {
          // const nodePath = path.join(app.getAppPath(), 'node_modules', '.bin', 'node');
          // const nodePath = "node"
          const nodePath = runner.findNodePath();
          if (nodePath == "") throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH))
          await runner.npminstall(client, packagepath, streamid);
          if (wait) {
            return await runner.runit(client, packagepath, streamid, nodePath, [command], true, env)
          } else {
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
          runner.notifyStream(client, streamid, "Package not found in " + packagemanager.packagefolder);
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
    var ppath = path.join(packagemanager.packagefolder, id);
    packagemanager.deleteDirectoryRecursiveSync(ppath);

  }
  public static deleteDirectoryRecursiveSync(dirPath: string) {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach((file, index) => {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          packagemanager.deleteDirectoryRecursiveSync(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  }
}
