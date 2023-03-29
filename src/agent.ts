import { openiap, config, QueueEvent } from "@openiap/nodeapi";
import { runner } from "./runner";
import { packagemanager } from "./packagemanager";
import * as os from "os"
import * as path from "path";
import * as fs from "fs"
import { Stream } from 'stream';

var elog:any = null;
if (os.platform() === 'win32') {
  // var EventLogger = require('node-windows').EventLogger;
  // elog = new EventLogger('nodeagent');
}

function log(message:string) {
  console.log(message);
  if(elog != null) {
    try {
      elog.info(message);
    } catch (error) {
      
    }
  }
}
function _error(message:string|Error) {
  console.error(message);
  if(elog != null) {
    try {
      elog.error(message.toString());
    } catch (error) {
      
    }
  }
}

process.on('SIGINT', ()=> { process.exit(0) })
process.on('SIGTERM', ()=> { process.exit(0) })
process.on('SIGQUIT', ()=> { process.exit(0) })

log("Agent starting!!!")
const client: openiap = new openiap()
client.allowconnectgiveup = false;
client.agent = "nodeagent"
var myproject = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
client.version = myproject.version;
var assistentConfig: any = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
var agentid = "";
// When injected from docker, use the injected agentid
if(process.env.agentid != "" && process.env.agentid != null) agentid = process.env.agentid;
var dockeragent = false;
var localqueue = "";
var languages = ["nodejs"];
function reloadAndParseConfig():boolean {
  config.doDumpStack = true
  assistentConfig = {};
  assistentConfig.apiurl = process.env["apiurl"];
  if(assistentConfig.apiurl == null || assistentConfig.apiurl == "") {
    assistentConfig.apiurl = process.env["grpcapiurl"];
  }
  if(assistentConfig.apiurl == null || assistentConfig.apiurl == "") {
    assistentConfig.apiurl = process.env["wsapiurl"];
  }
  assistentConfig.jwt = process.env["jwt"];
  if(assistentConfig.apiurl != null && assistentConfig.apiurl != "") {
    dockeragent = true;
    return true;
  }

  if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
    assistentConfig = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
    process.env["NODE_ENV"] = "production";
    if (assistentConfig.apiurl) {
      process.env["apiurl"] = assistentConfig.apiurl;
      client.url = assistentConfig.apiurl;
    }
    if (assistentConfig.jwt) {
      process.env["jwt"] = assistentConfig.jwt;
      client.jwt = assistentConfig.jwt;
    }
    if (assistentConfig.agentid != null && assistentConfig.agentid != "") {
      agentid = assistentConfig.agentid;
    }
    return true;
  } else {
    log("failed locating config to load from " + path.join(os.homedir(), ".openiap", "config.json"))
    process.exit(1);
  }
  return false;
}
function init() {
  // var client = new openiap();
  config.doDumpStack = true
  if(!reloadAndParseConfig()) {
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
  client.connect().then(user=> {
    log("connected");
  }).catch((err) => {
    _error(err);
  });
}
var lastreload = new Date();
async function onConnected(client: openiap) {
  var u = new URL(client.url);
  process.env.apiurl = client.url;
  await RegisterAgent()
  if (client.client == null || client.client.user == null) {
    log('connected, but not signed in, close connection again');
    return client.Close();
  }
  await reloadpackages()
  var watchid = await client.Watch({ paths: [], collectionname: "agents" }, async (operation: string, document: any) => {
    try {
      if (document._type == "package") {
        if(operation == "insert") {
          log("package " + document.name + " inserted, reload packages");
          await reloadpackages()
        } else if(operation == "replace") {
          log("package " + document.name + " updated, delete and reload");
          packagemanager.removepackage(document._id);
          await packagemanager.getpackage(client, document.fileid, document._id);
        } else if (operation == "delete") {
          log("package " + document.name + " deleted, cleanup after package");
          packagemanager.removepackage(document._id);
        }
      } else if (document._type == "agent") {
        if(document._id == agentid)  {
          if(lastreload.getTime() + 1000 > new Date().getTime()) {
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
  if(process.env.packageid != "" && process.env.packageid != null) {
    log("packageid is set, run package " + process.env.packageid);
    await localrun();
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
      if(data == null) return;
      var s = data.toString().replace(/\n$/, "");
      log(s);
    });
    stream.on('end', async () => {
      log("process ended");
    });
    runner.addstream(streamid, stream);
    log("run package " + process.env.packageid);
    await packagemanager.runpackage(process.env.packageid, streamid, true);
    log("run complete");
  } catch (error) {
    _error(error);
    process.exit(1);
  }
}
async function reloadpackages() {
  try {
    log("reloadpackages")
    if(process.env.packageid != "" && process.env.packageid != null) {
      // packagemanager.deleteDirectoryRecursiveSync(path.join(packagemanager.packagefolder, process.env.packageid));
      var _packages = await client.Query<any>({ query: { "_type": "package", "_id": process.env.packageid }, collectionname: "agents" });
    } else {
      var _packages = await client.Query<any>({ query: { "_type": "package", "language": { "$in": languages } }, collectionname: "agents" });
    }
    log("Got " + _packages.length + " packages to handle")
    if (_packages != null) {
      for (var i = 0; i < _packages.length; i++) {
        try {
          if (fs.existsSync(path.join(packagemanager.packagefolder, _packages[i]._id))) continue;
          if (_packages[i].fileid != null && _packages[i].fileid != "") {
            log("get package " + _packages[i].name);
            await packagemanager.getpackage(client, _packages[i].fileid, _packages[i]._id);
          }
        } catch (error) {
          _error(error);
        }
      }
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
    if(!dockeragent) daemon = true;
    var data = JSON.stringify({ hostname: os.hostname(), os: os.platform(), arch: os.arch(), username: os.userInfo().username, version: myproject.version, "languages": languages, chrome, chromium, daemon, "maxpackages": 50 })
    var res: any = await client.CustomCommand({
      id: agentid, command: "registeragent",
      data
    });
    if (res != null) res = JSON.parse(res);
    if(res != null && res.environment != null) {
      var keys = Object.keys(res.environment);
      for(var i = 0; i < keys.length; i++) {
        process.env[keys[i]] = res.environment[keys[i]];
      }
    }
    if (res != null && res.slug != "" && res._id != null && res._id != "") {
      localqueue = await client.RegisterQueue({ queuename: res.slug }, onQueueMessage);
      agentid = res._id;
      var config = {agentid, jwt: res.jwt};
      if(fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
        config = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
      }
      config.agentid = agentid;

      if(process.env["apiurl"] != null && process.env["apiurl"] != "") {
        log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)")
      } else {
        if(res.jwt != null && res.jwt != "") {
          config.jwt = res.jwt;
          process.env.jwt = res.jwt;
        }
        fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config));
      }
      log("Registed agent as " + agentid + " and queue " + localqueue + " ( from " + res.slug + " )");
    } else {
      log("Registrering agent seems to have failed without an error !?!");
      if(res == null) {
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
    if(payload != null && payload.payload != null) payload = payload.payload;
    if(payload.streamid != null && payload.streamid != "") streamid = payload.streamid;
    // log("onQueueMessage");
    // log(payload);
    if (user == null || jwt == null || jwt == "") {
      return { "command": "error", error: "not authenticated" };
    }
    var commandqueue = msg.replyto;
    var streamqueue = msg.replyto;
    if (payload.queuename != null && payload.queuename != "") {
      streamqueue = payload.queuename;
    }
    var dostream = true;
    if(payload.stream == "false" || payload.stream == false) {
      dostream = false;
    }
    log("commandqueue: " + commandqueue + " streamqueue: " + streamqueue + " dostream: " + dostream)
    if(commandqueue == null) commandqueue = "";
    if(streamqueue == null) streamqueue = "";
    if (payload.command == "runpackage") {
      if(payload.id == null || payload.id == "") throw new Error("id is required");
      var packagepath = packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
      if (packagepath == "") {
        try {
          var _packages = await client.Query<any>({ query: { "_type": "package", "_id": payload.id }, collectionname: "agents" });
          if(_packages.length > 0) {
            log("get package " + _packages[0].name);
            await packagemanager.getpackage(client, _packages[0].fileid, payload.id);
            packagepath = packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
          } else {
            log("Cannot find package with id " + payload.id);
          }
          
        } catch (error) {
          
        }
      }
      if (packagepath == "") {
        log("Package " + payload.id + " not found");
        if(dostream) await client.QueueMessage({ queuename: streamqueue, data: {"command": "stream", "data": Buffer.from("Package " + payload.id + " not found")}, correlationId: streamid });
        if(commandqueue != "") await client.QueueMessage({ queuename: commandqueue, data: {"command": "completed"}, correlationId: streamid });
        return { "command": "error", error: "Package " + payload.id + " not found" };
      }
      var stream = new Stream.Readable({
        read(size) { }
      });
      var buffer = "";
      stream.on('data', async (data) => {
        if(dostream) {
          try {
            await client.QueueMessage({ queuename: streamqueue, data: {"command": "stream", "data": data}, correlationId: streamid });
          } catch (error) {
            _error(error);
            dostream = false;
          }
        } else {
          if(data != null) buffer += data.toString();
        }
      });
      stream.on('end', async () => {
        var data = {"command": "completed", "data": buffer};
        if(buffer == "") delete data.data;
        try {
          if(commandqueue != "") await client.QueueMessage({ queuename: commandqueue, data, correlationId: streamid });
        } catch (error) {
          _error(error);
        }
        try {
          if(dostream == true && streamqueue != "") await client.QueueMessage({ queuename: streamqueue, data, correlationId: streamid });
        } catch (error) {
          _error(error);
        }
      });
      runner.addstream(streamid, stream);  
      await packagemanager.runpackage(payload.id, streamid, true);
      try {
        if(dostream == true && streamqueue != "") await client.QueueMessage({ queuename: streamqueue, data: { "command": "success" }, correlationId: streamid });
      } catch (error) {
        _error(error);
        dostream = false;
      }
      return { "command": "success" };
    }
    if (payload.command == "kill") {
      if(payload.id == null || payload.id == "") payload.id = payload.streamid;
      if(payload.id == null || payload.id == "") throw new Error("id is required");
      runner.kill(payload.id);
      return { "command": "success" };
    }
  } catch (error) {
    return { "command": "error", error: JSON.stringify(error.message) };    
  }
}
async function main() {
  init()
  if (os.platform() === 'win32') {
    // const Service = require('node-windows').Service;
    // let scriptPath = path.join(__dirname, "agent.js");
    // const svc = new Service({
    //   name: "nodeagent",
    //   description: "nodeagent",
    //   script: scriptPath
    // });
    // svc.on('install', () => { log("Service installed"); });
    // svc.on('alreadyinstalled', () => { log("Service already installed"); });
    // svc.on('invalidinstallation', () => { log("Service invalid installation"); });
    // svc.on('uninstall', () => { log("Service uninstalled"); });
    // svc.on('alreadyuninstalled', () => { log("Service already uninstalled"); });
    // svc.on('start', () => { log("Service started"); });
    // svc.on('stop', () => { log("Service stopped"); });
    // svc.on('error', () => { log("Service error"); });
    // while(svc.status != "running") {
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    // }    
  }
  while (true) {
    log("looping");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
main();