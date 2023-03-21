import { openiap, config, QueueEvent } from "@openiap/nodeapi";
import { runner } from "./runner";
import { packagemanager } from "./packagemanager";
import * as os from "os"
import * as path from "path";
import * as fs from "fs"
import { Stream } from 'stream';

const client: openiap = new openiap()
client.allowconnectgiveup = false;
client.agent = "nodeagent"
var myproject = require(path.join(__dirname, "..", "package.json"));
client.version = myproject.version;
var assistentConfig: any = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
var agentid = "";
var localqueue = "";
var languages = ["nodejs"];
function reloadAndParseConfig():boolean {
  config.doDumpStack = true
  if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
    assistentConfig = require(path.join(os.homedir(), ".openiap", "config.json"));
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
    console.log("failed locating config to load from " + path.join(os.homedir(), ".openiap", "config.json"))
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
  client.connect();
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
        await reloadpackages()
      }
      if (document._type == "agent" && document._id == agentid) {
        await RegisterAgent()
      }
    } catch (error) {
      console.error(error);
    }
  });
  console.log("watch registered with id", watchid);
}
async function onDisconnected(client: openiap) {
  console.log("Disconnected");
};

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
      if (agentid != res._id || (res.jwt != null && res.jwt != "")) {
        agentid = res._id;
        var config = require(path.join(os.homedir(), ".openiap", "config.json"));
        config.agentid = agentid;
        if(res.jwt != null && res.jwt != "") {
          config.jwt = res.jwt;
          process.env.jwt = res.jwt;
        }
        fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config));
        console.log("Registed agent as " + agentid + " and queue " + localqueue + " ( from " + res.slug + " )");
      } else {
        console.log("Registrering agent seems to have failed without an error !?!");
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
    console.log("onQueueMessage");
    if(payload != null && payload.payload != null) payload = payload.payload;
    console.log(payload);
    if (user == null || jwt == null || jwt == "") {
      return { "command": "error", error: "not authenticated" };
    }
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
      stream.on('data', async (data) => {
        try {
          if(payload.stream != null && payload.stream != "") {
            if(data != null) {
              await client.QueueMessage({ queuename: payload.stream, data: data.toString() });
            }          
          }
        } catch (error) {
          console.error(error);
          payload.stream = "";
        }
      });
      stream.on('end', () => {
      });
      runner.addstream(streamid, stream);
  
      await packagemanager.runpackage(payload.id, streamid, true);
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