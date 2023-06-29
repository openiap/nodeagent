import { openiap, config, QueueEvent } from "@openiap/nodeapi";
import { runner } from "./runner";
import { packagemanager } from "./packagemanager";
import * as os from "os"
import * as path from "path";
import * as fs from "fs"
import { Stream } from 'stream';

var elog: any = null;
if (os.platform() === 'win32') {
  // var EventLogger = require('node-windows').EventLogger;
  // elog = new EventLogger('nodeagent');
}

function log(message: string) {
  console.log(message);
  if (elog != null) {
    try {
      elog.info(message);
    } catch (error) {

    }
  }
}
function _error(message: string | Error) {
  console.error(message);
  if (elog != null) {
    try {
      elog.error(message.toString());
    } catch (error) {

    }
  }
}

process.on('SIGINT', () => { process.exit(0) })
process.on('SIGTERM', () => { process.exit(0) })
process.on('SIGQUIT', () => { process.exit(0) })
console.log(JSON.stringify(process.env.PATH, null, 2));

log("Agent starting!!!")
const client: openiap = new openiap()
client.allowconnectgiveup = false;
client.agent = "nodeagent"
var myproject = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
client.version = myproject.version;
console.log("version: " + client.version);
var assistantConfig: any = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
var agentid = "";
// When injected from docker, use the injected agentid
let dockeragent = false;
if (process.env.agentid != "" && process.env.agentid != null) {
  agentid = process.env.agentid;
  dockeragent = true;
}
var localqueue = "";
var languages = ["nodejs"];
function reloadAndParseConfig(): boolean {
  config.doDumpStack = true
  assistantConfig = {};
  assistantConfig.apiurl = process.env["apiurl"];
  if (assistantConfig.apiurl == null || assistantConfig.apiurl == "") {
    assistantConfig.apiurl = process.env["grpcapiurl"];
  }
  if (assistantConfig.apiurl == null || assistantConfig.apiurl == "") {
    assistantConfig.apiurl = process.env["wsapiurl"];
  }
  assistantConfig.jwt = process.env["jwt"];
  if (dockeragent) {
    return true;
  }

  if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
    assistantConfig = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
    process.env["NODE_ENV"] = "production";
    if (assistantConfig.apiurl) {
      process.env["apiurl"] = assistantConfig.apiurl;
      client.url = assistantConfig.apiurl;
    }
    if (assistantConfig.jwt) {
      process.env["jwt"] = assistantConfig.jwt;
      client.jwt = assistantConfig.jwt;
    }
    if (assistantConfig.agentid != null && assistantConfig.agentid != "") {
      agentid = assistantConfig.agentid;
    }
    return true;
  } else {
    if (assistantConfig.apiurl == null || assistantConfig.apiurl == "") {
      log("failed locating config to load from " + path.join(os.homedir(), ".openiap", "config.json"))
      process.exit(1);
      return false;
    }
  }
  return true;
}
function init() {
  // var client = new openiap();
  config.doDumpStack = true
  if (!reloadAndParseConfig()) {
    return;
  }
  try {
    var pypath = runner.findPythonPath();
    if (pypath != null && pypath != "") {
      languages.push("python");
    }
  } catch (error) {

  }
  try {
    var pypath = runner.findDotnetPath();
    if (pypath != null && pypath != "") {
      languages.push("dotnet");
    }
  } catch (error) {

  }
  try {
    var pwshpath = runner.findPwShPath();
    if (pwshpath != null && pwshpath != "") {
      languages.push("powershell");
    }
  } catch (error) {

  }

  client.onConnected = onConnected
  client.onDisconnected = onDisconnected
  client.connect().then(user => {
    log("connected");
  }).catch((err) => {
    _error(err);
  });
}
var lastreload = new Date();
async function onConnected(client: openiap) {
  try {
    var u = new URL(client.url);
    process.env.apiurl = client.url;
    await RegisterAgent()
    if (client.client == null || client.client.user == null) {
      log('connected, but not signed in, close connection again');
      return client.Close();
    }
    // await reloadpackages(false)
    console.log("registering watch on agents")
    var watchid = await client.Watch({ paths: [], collectionname: "agents" }, async (operation: string, document: any) => {
      try {
        if (document._type == "package") {
          if (operation == "insert") {
            log("package " + document.name + " inserted, reload packages");
            await reloadpackages(false)
          } else if (operation == "replace") {
            log("package " + document.name + " updated.");
            log("Remove package " + document._id);
            packagemanager.removepackage(document._id);
            if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
            log("Write  " + document._id + ".json");
            fs.writeFileSync(path.join(packagemanager.packagefolder, document._id + ".json"), JSON.stringify(document, null, 2))
            log("Get package " + document._id);
            await packagemanager.getpackage(client, document._id);
          } else if (operation == "delete") {
            log("package " + document.name + " deleted, cleanup after package");
            packagemanager.removepackage(document._id);
          }
        } else if (document._type == "agent") {
          if (document._id == agentid) {
            if (lastreload.getTime() + 1000 > new Date().getTime()) {
              log("agent changed, but last reload was less than 1 second ago, do nothing");
              return;
            }
            lastreload = new Date();
            log("agent changed, reload config");
            await RegisterAgent()
          } else {
            log("Another agent was changed, do nothing");
          }
        } else {
          log("unknown type " + document._type + " changed, do nothing");
        }
      } catch (error) {
        _error(error);
      }
    });
    log("watch registered with id " + watchid);
    if (process.env.packageid != "" && process.env.packageid != null) {
      log("packageid is set, run package " + process.env.packageid);
      await localrun();
      process.exit(0);
    }
  } catch (error) {
    console.error(error);
    await new Promise(resolve => setTimeout(resolve, 2000));
    process.exit(0);
  }
}
async function onDisconnected(client: openiap) {
  log("Disconnected");
};

async function localrun() {
  try {
    const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var stream = new Stream.Readable({
      read(size) { }
    });
    var buffer = "";
    stream.on('data', async (data) => {
      if (data == null) return;
      var s = data.toString().replace(/\n$/, "");
      log(s);
    });
    stream.on('end', async () => {
      log("process ended");
    });
    log("run package " + process.env.packageid);
    await packagemanager.runpackage(client, process.env.packageid, streamid, "", stream, true);
    log("run complete");
  } catch (error) {
    _error(error);
    process.exit(1);
  }
}
async function reloadpackages(force: boolean) {
  try {
    log("reloadpackages")
    if (process.env.packageid != "" && process.env.packageid != null) {
      await packagemanager.reloadpackage(client, process.env.packageid, force);
    } else {
      await packagemanager.reloadpackages(client, languages, force);
    }
  } catch (error) {
    _error(error);
  }
}
async function RegisterAgent() {
  try {
    var u = new URL(client.url);
    log("Registering agent with " + u.hostname + " as " + client.client.user.username);
    var chromium = runner.findChromiumPath() != "";
    var chrome = runner.findChromePath() != "";
    var daemon = undefined;
    if (!dockeragent) daemon = true;
    var data = JSON.stringify({ hostname: os.hostname(), os: os.platform(), arch: os.arch(), username: os.userInfo().username, version: myproject.version, "languages": languages, chrome, chromium, daemon, "maxpackages": 50 })
    var res: any = await client.CustomCommand({
      id: agentid, command: "registeragent",
      data
    });
    if (res != null) res = JSON.parse(res);
    if (res != null && res.environment != null) {
      var keys = Object.keys(res.environment);
      for (var i = 0; i < keys.length; i++) {
        process.env[keys[i]] = res.environment[keys[i]];
      }
    }
    if (res != null && res.slug != "" && res._id != null && res._id != "") {
      localqueue = await client.RegisterQueue({ queuename: res.slug + "agent" }, onQueueMessage);
      agentid = res._id;
      var config = { agentid, jwt: res.jwt, apiurl: client.url };
      if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
        config = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
      }
      config.agentid = agentid;

      // if (process.env["apiurl"] != null && process.env["apiurl"] != "") {
      //   log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)")
      // } else {
      if (res.jwt != null && res.jwt != "") {
        process.env.jwt = res.jwt;
      }
      if (client.url != null && client.url != "") {
        config.apiurl = client.url;
      }
      if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
      fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config));
      // }
      log("Registed agent as " + res.name + " (" + agentid + ") and queue " + localqueue + " ( from " + res.slug + " )");
    } else {
      log("Registrering agent seems to have failed without an error !?!");
      if (res == null) {
        log("res is null");
      } else {
        log(JSON.stringify(res, null, 2));
      }
    }
    if (res.jwt != null && res.jwt != "") {
      await client.Signin({ jwt: res.jwt });
      log('Re-authenticated to ' + u.hostname + ' as ' + client.client.user.username);
    }
    reloadAndParseConfig();
  } catch (error) {
    _error(error);
    process.env["apiurl"] = "";
    process.env["jwt"] = "";
    try {
      client.Close();
    } catch (error) {
    }
  }
}
let num_workitemqueue_jobs = 0;
let max_workitemqueue_jobs = 1;
if (process.env.maxjobs != null && process.env.maxjobs != null) {
  max_workitemqueue_jobs = parseInt(process.env.maxjobs);
}
async function onQueueMessage(msg: QueueEvent, payload: any, user: any, jwt: string) {
  try {
    // const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let streamid = msg.correlationId;
    if (payload != null && payload.payload != null) payload = payload.payload;
    if (payload.streamid != null && payload.streamid != "") streamid = payload.streamid;
    // log("onQueueMessage");
    // log(payload);
    var streamqueue = msg.replyto;
    if (payload.queuename != null && payload.queuename != "") {
      streamqueue = payload.queuename;
    }
    var dostream = true;
    if (payload.stream == "false" || payload.stream == false) {
      dostream = false;
    }
    if (payload.command == null || payload.command == "" || payload.command == "invoke") {
      if (num_workitemqueue_jobs >= max_workitemqueue_jobs) {
        return { "command": payload.command, "success": false, error: "Busy running " + num_workitemqueue_jobs + " jobs ( max " + max_workitemqueue_jobs + " )" };
      }
      num_workitemqueue_jobs++;
      try {
        if (streamid == null || streamid == "") {
          dostream = false;
          streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        if (payload.wiq == null) {
          console.log("payload missing wiq", JSON.stringify(payload, null, 2));
          return { "command": payload.command, "success": false, error: "payload missing wiq" };
        }
        if (payload.packageid == null) {
          console.log("payload missing packageid", JSON.stringify(payload, null, 2));
          return { "command": payload.command, "success": false, error: "payload missing packageid" };
        }
        await packagemanager.getpackage(client, payload.packageid);
        var packagepath = packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.packageid));
        if (packagepath == "") {
          log("Package " + payload.packageid + " not found");
          if (dostream) await client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("Package " + payload.packageid + " not found") }, correlationId: streamid });
          return { "command": "runpackage", "success": false, "completed": true, error: "Package " + payload.packageid + " not found" };
        }

        var workitem = await client.PopWorkitem({ wiq: payload.wiq, includefiles: false, compressed: false });
        if (workitem == null) {
          log("No more workitems for " + payload.wiq);
          if (dostream) await client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("No more workitems for " + payload.wiq) }, correlationId: streamid });
          return { "command": "runpackage", "success": false, "completed": true, error: "No more workitems for " + payload.wiq };
        }
        var stream2 = new Stream.Readable({
          read(size) { }
        });
        var buffer = "";
        stream2.on('data', async (data) => {
          if (!dostream) {
            if (data != null) buffer += data.toString();
          }
        });
        stream2.on('end', async () => {
          var data = { "command": "runpackage", "success": true, "completed": true, "data": buffer };
          if (buffer == "") delete data.data;
        });
        var wipayload: any = {};
        var wijson: string = "";
        var wipath = path.join(packagepath, "workitem.json");
        if (fs.existsSync(wipath)) { fs.unlinkSync(wipath); }
        var original: string[] = [];
        var files = fs.readdirSync(packagepath);
        files.forEach(file => {
          var filename = path.join(packagepath, file);
          if (fs.lstatSync(filename).isFile()) original.push(file);
        });

        if (workitem.payload != null && workitem.payload != "") {
          try {
            wijson = JSON.stringify(workitem.payload);
            wipayload = JSON.parse(wijson);
            console.log("dump payload to: ", wipath);
            fs.writeFileSync(wipath, wijson);
          } catch (error) {
            console.log("parsing payload: " + (error.message != null) ? error.message : error);
            console.log(workitem.payload);
          }
        }
        for (let i = 0; i < workitem.files.length; i++) {
          const file = workitem.files[i];
          if(file.filename == "output.txt") continue;
          // const reply = await client.DownloadFile({ id: file._id, folder: packagepath });
          console.log("Downloaded file: ", file.filename);
          fs.writeFileSync(path.join(packagepath, file.filename), file.file);
        }


        var exitcode = await packagemanager.runpackage(client, payload.packageid, streamid, streamqueue, stream2, true);
        if (exitcode != 0) { 
          throw new Error("exitcode: " + exitcode); 
        }
        try {
          workitem.state = "successful";
          if (fs.existsSync(wipath)) {
            console.log("loading", wipath);
            try {
              wipayload = JSON.parse(fs.readFileSync(wipath).toString());
              if (fs.existsSync(wipath)) { fs.unlinkSync(wipath); }
            } catch (error) {
              console.log(error.message ? error.message : error);
            }
          }
          workitem.payload = JSON.stringify(wipayload);

          fs.writeFileSync(path.join(packagepath, "output.txt"), buffer);
          files = fs.readdirSync(packagepath);
          files = files.filter(x => original.indexOf(x) == -1);
          files.forEach(file => {
            var filename = path.join(packagepath, file);
            if (fs.lstatSync(filename).isFile()) {
              console.log("adding file: ", file);
              workitem.files.push({ filename: file, file: fs.readFileSync(filename), _id: null, compressed: false })
              fs.unlinkSync(filename);
            }
          });
          await client.UpdateWorkitem({ workitem });
          if (dostream == true && streamqueue != "") await client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": true, "completed": true }, correlationId: streamid });
        } catch (error) {
          _error(error);
          dostream = false;
        }
        return { "command": "runpackage", "success": true, "completed": false };
      } catch (error) {
        console.log(error);
        if (fs.existsSync(wipath)) {
          console.log("loading", wipath);
          try {
            wipayload = JSON.parse(fs.readFileSync(wipath).toString());
            if (fs.existsSync(wipath)) { fs.unlinkSync(wipath); }
          } catch (error) {
            console.log(error.message ? error.message : error);
          }
        }
        console.log("!!!error: ", error.message ? error.message : error);

        fs.writeFileSync(path.join(packagepath, "output.txt"), buffer);
        files = fs.readdirSync(packagepath);
        files = files.filter(x => original.indexOf(x) == -1);
        files.forEach(file => {
          var filename = path.join(packagepath, file);
          if (fs.lstatSync(filename).isFile()) {
            console.log("adding file: ", file);
            workitem.files.push({ filename: file, file: fs.readFileSync(filename), _id: null, compressed: false })
            fs.unlinkSync(filename);
          }
        });

        workitem.payload = JSON.stringify(wipayload);
        workitem.errormessage = (error.message != null) ? error.message : error;
        workitem.state = "retry";
        workitem.errortype = "application";
        await client.UpdateWorkitem({ workitem });
        return { "command": payload.command, "success": false, error: JSON.stringify(error.message) };
      } finally {
        num_workitemqueue_jobs--;
        if (num_workitemqueue_jobs < 0) num_workitemqueue_jobs = 0;
      }
    }
    if (user == null || jwt == null || jwt == "") {
      console.log("not authenticated");
      return { "command": payload.command, "success": false, error: "not authenticated" };
    }
    log("onQueueMessage " + msg.correlationId)
    log("command: " + payload.command + " streamqueue: " + streamqueue + " dostream: " + dostream)
    if (streamqueue == null) streamqueue = "";
    if (payload.command == "runpackage") {
      if (payload.id == null || payload.id == "") throw new Error("id is required");
      await packagemanager.getpackage(client, payload.id);
      var packagepath = packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
      if (packagepath == "") {
        log("Package " + payload.id + " not found");
        if (dostream) await client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("Package " + payload.id + " not found") }, correlationId: streamid });
        return { "command": "runpackage", "success": false, "completed": true, error: "Package " + payload.id + " not found" };
      }
      var stream = new Stream.Readable({
        read(size) { }
      });
      var buffer = "";
      stream.on('data', async (data) => {
        if (!dostream) {
          if (data != null) buffer += data.toString();
        }
      });
      stream.on('end', async () => {
        var data = { "command": "runpackage", "success": true, "completed": true, "data": buffer };
        if (buffer == "") delete data.data;
      });
      await packagemanager.runpackage(client, payload.id, streamid, streamqueue, stream, true);
      try {
        if (dostream == true && streamqueue != "") await client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": true, "completed": true }, correlationId: streamid });
      } catch (error) {
        _error(error);
        dostream = false;
      }
      return { "command": "runpackage", "success": true, "completed": false };
    }
    if (payload.command == "kill") {
      if (payload.id == null || payload.id == "") payload.id = payload.streamid;
      if (payload.id == null || payload.id == "") throw new Error("id is required");
      runner.kill(client, payload.id);
      return { "command": "kill", "success": true };
    }
    if (payload.command == "killall") {
      var processcount = runner.processs.length;
      for (var i = processcount; i >= 0; i--) {
        runner.kill(client, runner.processs[i].id);
      }
      return { "command": "killall", "success": true, "count": processcount };
    }
    if (payload.command == "setstreamid") {
      if (payload.id == null || payload.id == "") payload.id = payload.streamid;
      if (payload.id == null || payload.id == "") throw new Error("id is required");
      if (payload.streamqueue == null || payload.streamqueue == "") payload.streamqueue = msg.replyto;
      if (payload.streamqueue == null || payload.streamqueue == "") throw new Error("streamqueue is required");
      var processcount = runner.streams.length;
      var counter = 0;
      for (var i = processcount; i >= 0; i--) {
        var p = runner.streams[i];
        if (p == null) continue
        if (p.id == payload.id) {
          counter++;
          p.streamqueue = payload.streamqueue;
        }
      }
      const s = runner.ensurestream(streamid, payload.streamqueue);
      runner.notifyStream(client, payload.id, s.buffer, false)
      return { "command": "setstreamid", "success": true, "count": counter, };
    }
    if (payload.command == "listprocesses") {
      var processcount = runner.streams.length;
      var processes = [];
      for (var i = processcount; i >= 0; i--) {
        var p = runner.streams[i];
        if (p == null) continue;
        processes.push({
          "id": p.id,
          "streamqueue": p.streamqueue,
        });
      }
      return { "command": "listprocesses", "success": true, "count": processcount, "processes": processes };
    }
  } catch (error) {
    console.error(error);
    return { "command": payload.command, "success": false, error: JSON.stringify(error.message) };
  }
}
async function main() {
  init()
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
main();