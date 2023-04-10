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
    if(assistantConfig.apiurl == null || assistantConfig.apiurl == "") {
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
            log("package " + document.name + " updated, delete and reload");
            packagemanager.removepackage(document._id);
            if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
            fs.writeFileSync(path.join(packagemanager.packagefolder, document._id + ".json"), JSON.stringify(document, null, 2))
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
      localqueue = await client.RegisterQueue({ queuename: res.slug }, onQueueMessage);
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
      log("Registed agent as " + agentid + " and queue " + localqueue + " ( from " + res.slug + " )");
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
async function onQueueMessage(msg: QueueEvent, payload: any, user: any, jwt: string) {
  try {
    log("onQueueMessage " + msg.correlationId)
    // const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let streamid = msg.correlationId;
    if (payload != null && payload.payload != null) payload = payload.payload;
    if (payload.streamid != null && payload.streamid != "") streamid = payload.streamid;
    // log("onQueueMessage");
    // log(payload);
    if (user == null || jwt == null || jwt == "") {
      return { "command": payload.command, "success": false, error: "not authenticated" };
    }
    var streamqueue = msg.replyto;
    if (payload.queuename != null && payload.queuename != "") {
      streamqueue = payload.queuename;
    }
    var dostream = true;
    if (payload.stream == "false" || payload.stream == false) {
      dostream = false;
    }
    log("command: " + payload.command + " streamqueue: " + streamqueue + " dostream: " + dostream)
    if (streamqueue == null) streamqueue = "";
    if (payload.command == "runpackage") {
      if (payload.id == null || payload.id == "") throw new Error("id is required");
      await packagemanager.getpackage(client, payload.id);
      var packagepath = packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
      if (packagepath == "") {
        log("Package " + payload.id + " not found");
        if (dostream) await client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("Package " + payload.id + " not found") }, correlationId: streamid });
        return { "command": "runpackage", "success": false, "completed": true , error: "Package " + payload.id + " not found" };
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
      if(payload.streamqueue == null || payload.streamqueue == "") payload.streamqueue = msg.replyto;
      if (payload.streamqueue == null || payload.streamqueue == "") throw new Error("streamqueue is required");
      var processcount = runner.streams.length;
      var counter = 0;
      for (var i = processcount; i >= 0; i--) {
        var p = runner.streams[i];
        if(p == null) continue
        if(p.id==payload.id) {
          counter++;
          p.streamqueue = payload.streamqueue;
        }
      }
      return { "command": "setstreamid", "success": true, "count": counter };
    }
    if (payload.command == "listprocesses") {
      var processcount = runner.streams.length;
      var processes = [];
      for (var i = processcount; i >= 0; i--) {
        var p = runner.streams[i];
        if(p == null) continue;
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