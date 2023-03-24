import { openiap, config, QueueEvent } from "@openiap/nodeapi";
import { runner } from "./runner";
import { packagemanager } from "./packagemanager";
import * as os from "os"
import * as path from "path";
import * as fs from "fs"
import { Stream } from 'stream';

process.on('SIGINT', ()=> { process.exit(0) })
process.on('SIGTERM', ()=> { process.exit(0) })
process.on('SIGQUIT', ()=> { process.exit(0) })

const client: openiap = new openiap()
client.allowconnectgiveup = false;
client.agent = "nodeagent"
var myproject = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
client.version = myproject.version;
var assistentConfig: any = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
var agentid = "";
// When injected from docker, use the injected agentid
if(process.env.agentid != "" && process.env.agentid != null) agentid = process.env.agentid;
var localqueue = "";
var languages = ["nodejs"];
function reloadAndParseConfig():boolean {
  config.doDumpStack = true
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
    assistentConfig = {};
    assistentConfig.apiurl = process.env["apiurl"];
    assistentConfig.jwt = process.env["jwt"];
    if(assistentConfig.apiurl != null && assistentConfig.apiurl != "") {
      return true;
    }
    console.log("failed locating config to load from " + path.join(os.homedir(), ".openiap", "config.json"))
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
    console.log("connected");
  }).catch((err) => {
    console.error(err);
  });
}
async function onConnected(client: openiap) {
  var u = new URL(client.url);
  process.env.apiurl = client.url;
  await RegisterAgent()
  if (client.client == null || client.client.user == null) {
    console.log('connected, but not signed in, close connection again');
    return client.Close();
  }
  await reloadpackages()
  var watchid = await client.Watch({ paths: [], collectionname: "agents" }, async (operation: string, document: any) => {
    try {
      if (document._type == "package") {
        if(operation == "insert") {
          console.log("package " + document.name + " inserted, reload packages");
          await reloadpackages()
        } else if(operation == "replace") {
          console.log("package " + document.name + " updated, delete and reload");
          packagemanager.removepackage(document._id);
          await packagemanager.getpackage(client, document.fileid, document._id);
        } else if (operation == "delete") {
          console.log("package " + document.name + " deleted, cleanup after package");
          packagemanager.removepackage(document._id);
        }
      } else if (document._type == "agent") {
        if(document._id == agentid)  {
          console.log("agent changed, reload config");
          await RegisterAgent()
        } else {
          console.log("Another agent was changed, do nothing");
        }        
      } else {
        console.log("unknown type " + document._type + " changed, do nothing");
      }
    } catch (error) {
      console.error(error);
    }
  });
  console.log("watch registered with id", watchid);
  if(process.env.packageid != "" && process.env.packageid != null) {
    console.log("packageid is set, run package " + process.env.packageid);
    await localrun();
  }
}
async function onDisconnected(client: openiap) {
  console.log("Disconnected");
};

async function localrun() {
  const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  var stream = new Stream.Readable({
    read(size) { }
  });
  var buffer = "";
  stream.on('data', async (data) => {
    if(data == null) return;
    var s = data.toString().replace(/\n$/, "");
    console.log(s);
  });
  stream.on('end', async () => {
    console.log("process ended");
  });
  runner.addstream(streamid, stream);  
  await packagemanager.runpackage(process.env.packageid, streamid, false);
}
async function reloadpackages() {
  var _packages = await client.Query<any>({ query: { "_type": "package", "language": { "$in": languages } }, collectionname: "agents" });
  if (_packages != null) {
    for (var i = 0; i < _packages.length; i++) {
      try {
        if (fs.existsSync(path.join(packagemanager.packagefolder, _packages[i]._id))) continue;
        if (_packages[i].fileid != null && _packages[i].fileid != "") {
          await packagemanager.getpackage(client, _packages[i].fileid, _packages[i]._id);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}
async function RegisterAgent() {
  try {
    var u = new URL(client.url);
    console.log("Registering agent with " + u.hostname + " as " + client.client.user.username);
    var data = JSON.stringify({ hostname: os.hostname(), os: os.platform(), arch: os.arch(), username: os.userInfo().username, version: myproject.version, "languages": languages, "chrome": true, "chromium": true, "maxpackages": 50 })
    var res: any = await client.CustomCommand({
      id: agentid, command: "registeragent",
      data
    });
    if (res != null) res = JSON.parse(res);
    if (res != null && res.slug != "" && res._id != null && res._id != "") {
      localqueue = await client.RegisterQueue({ queuename: res.slug }, onQueueMessage);
      agentid = res._id;
      var config = {agentid, jwt: res.jwt};
      if(fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
        config = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
      }
      config.agentid = agentid;

      if(process.env["apiurl"] != null && process.env["apiurl"] != "") {
        console.log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)")
      } else {
        if(res.jwt != null && res.jwt != "") {
          config.jwt = res.jwt;
          process.env.jwt = res.jwt;
        }
        fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config));
      }
      console.log("Registed agent as " + agentid + " and queue " + localqueue + " ( from " + res.slug + " )");
    } else {
      console.log("Registrering agent seems to have failed without an error !?!");
      if(res == null) {
        console.log("res is null");
      } else {
        console.log(JSON.stringify(res, null, 2));
      }
    }
    if (res.jwt != null && res.jwt != "") {
      await client.Signin({ jwt: res.jwt });
      console.log('Re-authenticated to ' + u.hostname + ' as ' + client.client.user.username);
    }
    reloadAndParseConfig();
  } catch (error) {
    console.error(error);
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
    const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    if(payload != null && payload.payload != null) payload = payload.payload;
    // console.log("onQueueMessage");
    // console.log(payload);
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
    console.log("commandqueue: " + commandqueue + " streamqueue: " + streamqueue + " dostream: " + dostream)
    if(commandqueue == null) commandqueue = "";
    if(streamqueue == null) streamqueue = "";
    if (payload.command == "runpackage") {
      if(payload.id == null || payload.id == "") throw new Error("id is required");
      var packagepath = packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.id));
      if (packagepath == "") {
        console.log("package not found");
        return { "command": "error", error: "package not found" };
      }
      var stream = new Stream.Readable({
        read(size) { }
      });
      var buffer = "";
      stream.on('data', async (data) => {
        if(dostream) {
          try {
            await client.QueueMessage({ queuename: streamqueue, data: {"command": "stream", "data": data} });
          } catch (error) {
            console.error(error);
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
          if(commandqueue != "") await client.QueueMessage({ queuename: commandqueue, data });
        } catch (error) {
          console.error(error);
        }
        try {
          if(dostream == true && streamqueue != "") await client.QueueMessage({ queuename: streamqueue, data });
        } catch (error) {
          console.error(error);
        }
      });
      runner.addstream(streamid, stream);  
      await packagemanager.runpackage(payload.id, streamid, true);
      try {
        if(dostream == true && streamqueue != "") await client.QueueMessage({ queuename: streamqueue, data: { "command": "success" } });
      } catch (error) {
        console.error(error);
        dostream = false;
      }
      return { "command": "success" };
    }  
  } catch (error) {
    return { "command": "error", error: JSON.stringify(error.message) };    
  }
}
async function main() {
  init()
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
main();