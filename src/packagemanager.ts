import { openiap } from "@openiap/nodeapi";
import * as fs from "fs";
import * as path from "path";
import * as os from "os"
import * as AdmZip from "adm-zip";
import * as tar from "tar";
import { config } from '@openiap/nodeapi';
import { runner } from "./runner";
const { info, err } = config;
export class packagemanager {
  public static packagefolder = path.join(os.homedir(), ".openiap", "packages");
  public static async getpackage(client: openiap, fileid: string, id: string) {
    const reply = await client.DownloadFile({ id: fileid });
    if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder);
    try {
      if (path.extname(reply.filename) == ".zip") {
        var zip = new AdmZip(reply.filename);
        zip.extractAllTo(path.join(packagemanager.packagefolder, id), true);
      } else if (path.extname(reply.filename) == ".tar.gz" || path.extname(reply.filename) == ".tgz") {
        var dest = path.join(packagemanager.packagefolder, id);
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest);
        }
        try {
          await tar.x({
            file: reply.filename,
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
      fs.unlinkSync(reply.filename);
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
  }
  public static async runpackage(id: string, streamid: string, remote: boolean) {
    if (streamid == null || streamid == "") throw new Error("streamid is null or empty");
    try {
      var packagepath = packagemanager.getpackagepath(path.join(packagemanager.packagefolder, id));
      if (fs.existsSync(packagepath)) {
        let command = packagemanager.getscriptpath(packagepath)
        if (command == "") throw new Error("Failed locating a command to run, EXIT")
        if (command.endsWith(".py")) {
          var python = runner.findPythonPath();
          await runner.pipinstall(packagepath, streamid, python)
          runner.runit(packagepath, streamid, python, [command], true)
        } else if (command.endsWith(".js") || command == "npm run start") {
          // const nodePath = path.join(app.getAppPath(), 'node_modules', '.bin', 'node');
          // const nodePath = "node"
          const nodePath = runner.findNodePath();
          await runner.npminstall(packagepath, streamid);
          runner.runit(packagepath, streamid, nodePath, [command], true)
        } else {
          var dotnet = runner.findDotnetPath();
          runner.runit(packagepath, streamid, dotnet, ["run"], true)
        }
      } else {
        runner.notifyStream(streamid, "Package not found in " + packagepath);
        runner.removestream(streamid);
      }
    } catch (error) {
      runner.notifyStream(streamid, error.message);
      runner.removestream(streamid);
    }
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
