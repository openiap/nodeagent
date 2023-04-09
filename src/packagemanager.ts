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
    if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
    const reply = await client.DownloadFile({ id: fileid, folder: packagemanager.packagefolder });
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
  public static async runpackage(client: openiap, id: string, streamid: string, streamqueue: string, wait: boolean) {
    if (streamid == null || streamid == "") throw new Error("streamid is null or empty");
    try {
      var packagepath = packagemanager.getpackagepath(path.join(packagemanager.packagefolder, id));
      if (fs.existsSync(packagepath)) {
        let command = packagemanager.getscriptpath(packagepath)
        if (command == "" || command == null) throw new Error("Failed locating a command to run, EXIT")
        if (command.endsWith(".py")) {
          var python = runner.findPythonPath();
          if (python == "") throw new Error("Failed locating python, is python installed and in the path?")
          await runner.pipinstall(client, packagepath, streamid, python)
          if (wait) {
            await runner.runit(client, packagepath, streamid, python, ["-u", command], true)
          } else {
            runner.runit(client, packagepath, streamid, python, ["-u", command], true)
          }
        } else if (command.endsWith(".js") || command == "npm run start") {
          // const nodePath = path.join(app.getAppPath(), 'node_modules', '.bin', 'node');
          // const nodePath = "node"
          const nodePath = runner.findNodePath();
          if (nodePath == "") throw new Error("Failed locating node, is node installed and in the path? " + JSON.stringify(process.env.PATH))
          await runner.npminstall(client, packagepath, streamid);
          if (wait) {
            await runner.runit(client, packagepath, streamid, nodePath, [command], true)
          } else {
            runner.runit(client, packagepath, streamid, nodePath, [command], true)
          }
        } else {
          var dotnet = runner.findDotnetPath();
          if (dotnet == "") throw new Error("Failed locating dotnet, is dotnet installed and in the path?")
          if (wait) {
            await runner.runit(client, packagepath, streamid, dotnet, ["run"], true)
          } else {
            runner.runit(client, packagepath, streamid, dotnet, ["run"], true)
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
