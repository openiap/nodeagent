import { openiap, config, QueueEvent } from "@openiap/nodeapi";
import { runner } from "./runner";
import { packagemanager } from "./packagemanager";
import * as cron from "node-cron";

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
    // if (process.env.packageid != "" && process.env.packageid != null) {
    //   log("packageid is set, run package " + process.env.packageid);
    //   await localrun();
    //   process.exit(0);
    // }
  } catch (error) {
    console.error(error);
    await new Promise(resolve => setTimeout(resolve, 2000));
    process.exit(0);
  }
}
async function onDisconnected(client: openiap) {
  log("Disconnected");
};

async function localrun(packageid: string, env: any, schedule: any) {
  try {
    const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var stream = new Stream.Readable({
      read(size) { }
    });
    var buffer = "";
    stream.on('data', async (data) => {
      if (data == null) return;
      var s = data.toString().replace(/\n$/, "");
      //if(buffer.length < 500) {
        buffer += s;
        log(s);
      //}
    });
    stream.on('end', async () => {
      log("process ended");
    });
    log("run package " + packageid);
    await packagemanager.runpackage(client, packageid, streamid, "", stream, true, env, schedule);
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
let schedules: any[] = [];
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

      if (res.schedules == null || !Array.isArray(res.schedules))  res.schedules = [];
      if (process.env.packageid != "" && process.env.packageid != null) {
        var exists = res.schedules.find((x: any) => x.packageid == process.env.packageid);
        if (exists == null) {
          res.schedules.push({ id: "localrun", name: "localrun", packageid: process.env.packageid, enabled: true, cron: "", env: {"localrun": true} });
        }
        log("packageid is set, run package " + process.env.packageid);
      }
      for (var p = 0; p < res.schedules.length; p++) {
        const _schedule = res.schedules[p];
        let schedule = schedules.find((x: any) => x.name == _schedule.name && x.packageid == _schedule.packageid);
        if(schedule != null && schedule != _schedule) {
          _schedule.task = schedule.task;
          if(_schedule.env == null) _schedule.env = {};
          if(schedule.env == null) schedule.env = {};
          if(JSON.stringify(_schedule.env) != JSON.stringify(schedule.env)) {
            try {
              _schedule.task.stop();
              _schedule.task.restartcounter = 0;
              _schedule.task.lastrestart = new Date();
            } catch (error) {
            }
            _schedule.task = null;
          }          
        }
      }
      for (var p = 0; p < schedules.length; p++) {
        const _schedule = schedules[p];
        let schedule = res.schedules.find((x: any) => x.name == _schedule.name && x.packageid == _schedule.packageid);
        if(schedule == null) {
          try {
            if(_schedule.task != null) {
              _schedule.task.stop();
              _schedule.task = null;
            }
          } catch (error) {
            
          }
        }
      }
      schedules = res.schedules;
      for (var p = 0; p < res.schedules.length; p++) {
        const schedule = res.schedules[p];
        if (schedule.packageid == null || schedule.packageid == "") {
          log("Schedule " + schedule.name + " has no packageid, skip");
          continue;
        }

        if (schedule.cron != null && schedule.cron != "") {
          if (!schedule.enabled) {
            if(schedule.task != null) {
              schedule.task.stop();
              schedule.task = null;
            }
            log("Schedule " + schedule.name + " (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid + " if running");
            for (let s = runner.streams.length -1; s >= 0; s--) {
              const stream = runner.streams[s];
              if (stream.schedulename == schedule.name ) {
                runner.kill(client, stream.id);
              }
            }
          } else {
            log("Schedule " + schedule.name + " (" + schedule.id + ") running every " + schedule.cron);
            if(schedule.task == null) {
              schedule.task = cron.schedule(schedule.cron, async () => {
                if (schedule.enabled) {
                  log("Schedule " + schedule.name + " (" + schedule.id + ") enabled, run now");
                  localrun(schedule.packageid, schedule.env, schedule);
                  // await packagemanager.runpackage(client, schedule.packageid, streamid, "", null, false, schedule.env);
                } else {
                  log("Schedule " + + " (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid + " if running");
                  for (let s = runner.streams.length -1; s >= 0; s--) {
                    const stream = runner.streams[s];
                    if (stream.schedulename == schedule.name) {
                      runner.kill(client, stream.id);
                    }
                  }
                }
              });  
            }
          }
        } else {
          if (schedule.enabled) {
            // const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            // await packagemanager.runpackage(client, schedule.packageid, streamid, "", null, false, schedule.env);
            if (schedule.task == null) {
              log("Schedule " + schedule.name + " enabled, run now");
              schedule.task = {
                timeout: null,
                lastrestart: new Date(),
                restartcounter: 0,
                stop() {
                  if(schedule.task.timeout != null) {
                    clearTimeout(schedule.task.timeout);
                    for (let s = runner.streams.length -1; s >= 0; s--) {
                      const stream = runner.streams[s];
                      if (stream.schedulename == schedule.name) {
                        runner.kill(client, stream.id);
                      }
                    }
                  }
                },
                start() {
                  if(schedule.task.timeout != null) {
                    log("Schedule " + schedule.name + " (" + schedule.id + ") already running");
                    return;
                  }
                  log("Schedule " + schedule.name + " (" + schedule.id + ") started");
                  schedule.task.stop()
                  schedule.task.timeout = setTimeout(() => {
                    localrun(schedule.packageid, schedule.env, schedule).then(() => {
                      try {
                        schedule.task.timeout = null;
                        log("Schedule " + schedule.name + " (" + schedule.id + ") finished");
                        const minutes = (new Date().getTime() - schedule.task.lastrestart.getTime()) / 1000 / 60;
                        if (minutes < 5) {
                          schedule.task.restartcounter++;
                        } else {
                          schedule.task.restartcounter = 0;
                        }
                        schedule.task.lastrestart = new Date();
                        if (schedule.task.restartcounter < 5) {
                          var exists = schedules.find(x => x.name == schedule.name && x.packageid == schedule.packageid );
                          if (exists != null && schedule.task != null) {
                            log("Schedule " + schedule.name + " (" + schedule.id + ") restarted again after " + minutes + " minutes (" + schedule.task.restartcounter + " times)");
                            schedule.task.start();
                          }
                        } else {
                          log("Schedule " + schedule.name + " (" + schedule.id + ") restarted too many times, stop! (" + schedule.task.restartcounter + " times)");
                        }
                      } catch (error) {
                        console.error(error);
                      }
                    }).catch((error) => {
                      try {
                        console.error(error);
                        schedule.task.timeout = null;
                      } catch (e) {
                        console.error(e);
                      }
                    });;
                  }, 100);
                }
              }
              schedule.task.start();
            } else {
              log("Schedule " + schedule.name + " (" + schedule.id + ") allready running");
            }
          } else {
            log("Schedule " + schedule.name + " disabled, kill all instances of package " + schedule.packageid + " if running");
            for (let s = runner.streams.length - 1; s >= 0; s--) {
              const stream = runner.streams[s];
              if (stream.schedulename == schedule.name) {
                runner.kill(client, stream.id);
              }
            }
          }
        }
      }
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
const commandstreams:string[] = [];
async function onQueueMessage(msg: QueueEvent, payload: any, user: any, jwt: string) {
  try {
    // const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let streamid = msg.correlationId;
    if (payload != null && payload.payload != null && payload.command == null) payload = payload.payload;
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

        let env = { "packageid": "", "workitemid": workitem._id }
        if (workitem.payload != null && workitem.payload != "") {
          try {
            wijson = JSON.stringify(workitem.payload);
            env = Object.assign(env, workitem.payload);
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
          if (file.filename == "output.txt") continue;
          // const reply = await client.DownloadFile({ id: file._id, folder: packagepath });
          console.log("Downloaded file: ", file.filename);
          fs.writeFileSync(path.join(packagepath, file.filename), file.file);
        }


        var exitcode = await packagemanager.runpackage(client, payload.packageid, streamid, streamqueue, stream2, true, env);
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
      try {
        await packagemanager.getpackage(client, payload.id);
      } catch (error) {
        console.log(error.message ? error.message : error)
        if (dostream) {
          await client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": false, "completed": true, "error": error.message ? error.message : error, "payload": wipayload }, correlationId: streamid });
        }
        throw error;
      }
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
      var wipath = path.join(packagepath, "workitem.json");
      var wijson = JSON.stringify(payload.payload, null, 2);
      if (fs.existsSync(wipath)) { fs.unlinkSync(wipath); }
      let env = { "packageid": "" }
      if (payload.payload != null) {
        console.log("dump payload to: ", wipath);
        env = Object.assign(env, payload.payload);
        fs.writeFileSync(wipath, wijson);
      }

      wipayload = {};
      try {
        await packagemanager.runpackage(client, payload.id, streamid, streamqueue, stream, true, env);
        if (fs.existsSync(wipath)) {
          console.log("loading", wipath);
          try {
            wipayload = JSON.parse(fs.readFileSync(wipath).toString());
            if (fs.existsSync(wipath)) { fs.unlinkSync(wipath); }
          } catch (error) {
            console.log(error.message ? error.message : error);
          }
        }
        try {
          if (dostream == true && streamqueue != "") await client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": true, "completed": true, "payload": wipayload }, correlationId: streamid });
        } catch (error) {
          _error(error);
          dostream = false;
        }
      } catch (error) {
        try {
          if (dostream == true && streamqueue != "") await client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": false, "completed": true, "error": error.message ? error.message : error, "payload": wipayload }, correlationId: streamid });
        } catch (error) {
          _error(error);
          dostream = false;
        }
      }
      return { "command": "runpackage", "success": true, "completed": false, "payload": wipayload };
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
    if (payload.command == "addcommandstreamid") {
      if (payload.streamqueue == null || payload.streamqueue == "") payload.streamqueue = msg.replyto;
      if(commandstreams.indexOf(payload.streamqueue) == -1) commandstreams.push(payload.streamqueue);
    }
    if (payload.command == "removecommandstreamid") {
      if (payload.streamqueue == null || payload.streamqueue == "") payload.streamqueue = msg.replyto;
      if(commandstreams.indexOf(payload.streamqueue) != -1) commandstreams.splice(commandstreams.indexOf(payload.streamqueue), 1);
    }
    if (payload.command == "setstreamid") {
      if (payload.id == null || payload.id == "") payload.id = payload.streamid;
      if (payload.id == null || payload.id == "") throw new Error("id is required");
      if (payload.streamqueue == null || payload.streamqueue == "") payload.streamqueue = msg.replyto;
      if (payload.streamqueue == null || payload.streamqueue == "") throw new Error("streamqueue is required");
      var processcount = runner.streams.length;
      var counter = 0;
      if(runner.commandstreams.indexOf(payload.streamqueue) == -1 && payload.streamqueue != null && payload.streamqueue != "") {
        runner.commandstreams.push(payload.streamqueue);
      }
      // for (var i = processcount; i >= 0; i--) {
      //   var p = runner.streams[i];
      //   if (p == null) continue
      //   if (p.id == payload.id) {
      //     counter++;
      //     // p.streamqueue = payload.streamqueue;
      //     if(runner.commandstreams.indexOf(payload.streamqueue) == -1 && payload.streamqueue != null && payload.streamqueue != "") {
      //       runner.commandstreams.push(payload.streamqueue);
      //     }
      //   }
      // }
      // const s = runner.ensurestream(streamid, payload.streamqueue);
      const s = runner.streams.find(x => x.id == streamid)
      if(s?.buffer != null && s?.buffer.length > 0) {
        let _message = Buffer.from(s.buffer);

        await client.QueueMessage({ queuename: payload.streamqueue, data: { "command": "stream", "data": _message }, correlationId: streamid });
      }
      // runner.notifyStream(client, payload.id, s.buffer, false)
      return { "command": "setstreamid", "success": true, "count": counter, };
    }
    if (payload.command == "listprocesses") {
      if(runner.commandstreams.indexOf(msg.replyto) == -1 && msg.replyto != null && msg.replyto != "") {
        runner.commandstreams.push(msg.replyto);
      }
      var processcount = runner.streams.length;
      var processes = [];
      for (var i = processcount; i >= 0; i--) {
        var p = runner.streams[i];
        if (p == null) continue;
        processes.push({
          "id": p.id,
          "streamqueues": runner.commandstreams,
          "packagename": p.packagename,
          "packageid": p.packageid,
          "schedulename": p.schedulename,
        });
      }
      return { "command": "listprocesses", "success": true, "count": processcount, "processes": processes };
    }
  } catch (error) {
    console.error(error);
    console.log({ "command": payload.command, "success": false, error: JSON.stringify(error.message) })
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