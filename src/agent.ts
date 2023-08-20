import { openiap, config, QueueEvent, Workitem } from "@openiap/nodeapi";
import { runner } from "./runner";
import { ipackage, packagemanager } from "./packagemanager";
import * as cron from "node-cron";
import { EventEmitter } from "events";

import * as os from "os"
import * as path from "path";
import * as fs from "fs"
import { Stream } from 'stream';

let elog: any = null;
if (os.platform() === 'win32') {
  // let EventLogger = require('node-windows').EventLogger;
  // elog = new EventLogger('nodeagent');
}

export class agent  {
  public static client: openiap;
  public static assistantConfig: any = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" };
  public static agentid = "";
  public static localqueue = "";
  public static languages = ["nodejs"];
  public static dockeragent: boolean = false;
  public static lastreload = new Date();
  public static schedules: any[] = [];
  public static myproject = { version: "" };
  public static num_workitemqueue_jobs = 0;
  public static max_workitemqueue_jobs = 1;
  public static maxrestarts = 5;
  public static maxrestartsminutes = 5;
  public static killonpackageupdate = true;
  public static exitonfailedschedule = true;
  public static eventEmitter = new EventEmitter();
  public static globalpackageid: string = "";
  public static addListener(eventName: string | symbol, listener: (...args: any[]) => void) {
    agent.eventEmitter.addListener(eventName, listener);
  }
  public static on(eventName: string | symbol, listener: (...args: any[]) => void) {
    agent.eventEmitter.on(eventName, listener);
  }
  public static once(eventName: string | symbol, listener: (...args: any[]) => void) {
    agent.eventEmitter.once(eventName, listener);
  }
  public static off(eventName: string | symbol, listener: (...args: any[]) => void) {
    agent.eventEmitter.off(eventName, listener);
  }
  public static removeListener(eventName: string | symbol, listener: (...args: any[]) => void) {
    agent.eventEmitter.removeListener(eventName, listener);
  }
  public static removeAllListeners(eventName?: string | symbol) {
    agent.eventEmitter.removeAllListeners(eventName);
  }
  public static setMaxListeners(n: number) {
    agent.eventEmitter.setMaxListeners(n);
  }
  public static getMaxListeners() {
    return agent.eventEmitter.getMaxListeners();
  }
  public static listeners(eventName: string | symbol) {
    return agent.eventEmitter.listeners(eventName);
  }
  public static rawListeners(eventName: string | symbol) {
    return agent.eventEmitter.rawListeners(eventName);
  }
  public static emit(eventName: string | symbol, ...args: any[]) {
    return agent.eventEmitter.emit(eventName, ...args);
  }
  public static listenerCount(eventName: string | symbol) {
    return agent.eventEmitter.listenerCount(eventName);
  }
  public static prependListener(eventName: string | symbol, listener: (...args: any[]) => void) {
    agent.eventEmitter.prependListener(eventName, listener);
  }
  public static prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void) {
    agent.eventEmitter.prependOnceListener(eventName, listener);
  }
  public static eventNames() {
    return agent.eventEmitter.eventNames();
  }
  

  
  public static async init(_client: openiap = undefined) {
    this.setMaxListeners(500);
    if (_client == null) {
      agent.client = new openiap()
      agent.client.allowconnectgiveup = false;
      agent.client.agent = "nodeagent"
    } else {
      agent.client = _client;
    }
    agent.client.on('connected', agent.onConnected);
    agent.client.on('disconnected', agent.onDisconnected);
    log("Agent starting!!!")
    if (process.env.maxjobs != null && process.env.maxjobs != null) {
      agent.max_workitemqueue_jobs = parseInt(process.env.maxjobs);
    }
    if (process.env.maxrestarts != null && process.env.maxrestarts != null) {
      agent.maxrestarts = parseInt(process.env.maxrestarts);
    }
    if (process.env.maxrestartsminutes != null && process.env.maxrestartsminutes != null) {
      agent.maxrestartsminutes = parseInt(process.env.maxrestartsminutes);
    }
    if (process.env.exitonfailedschedule != null && process.env.exitonfailedschedule != null) {
      if(process.env.exitonfailedschedule == "0" || process.env.exitonfailedschedule.toLowerCase() == "false" || process.env.exitonfailedschedule.toLowerCase() == "no") {
        agent.exitonfailedschedule = false;
      } else {
        agent.exitonfailedschedule = true;
      }
    }
    if (process.env.killonpackageupdate != null && process.env.killonpackageupdate != null) {
      if(process.env.killonpackageupdate == "0" || process.env.killonpackageupdate.toLowerCase() == "false" || process.env.killonpackageupdate.toLowerCase() == "no") {
        agent.killonpackageupdate = false;
      } else {
        agent.killonpackageupdate = true;
      }
    }
    
    
      
    let myproject = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
    this.client.version = myproject.version;
    log("version: " + this.client.version);
    // When injected from docker, use the injected agentid
    agent.assistantConfig = { "apiurl": "wss://app.openiap.io/ws/v2", jwt: "", agentid: "" }
    agent.dockeragent = false;
    if (process.env.agentid != "" && process.env.agentid != null) {
      agent.agentid = process.env.agentid;
      agent.dockeragent = true;
    }
    agent.localqueue = "";
    agent.languages = ["nodejs"];
    // let client = new openiap();
    config.doDumpStack = true
    if (!agent.reloadAndParseConfig()) {
      return;
    }
    try {
      let pypath = runner.findPythonPath();
      if (pypath != null && pypath != "") {
        agent.languages.push("python");
      }
    } catch (error) {

    }
    try {
      let pypath = runner.findDotnetPath();
      if (pypath != null && pypath != "") {
        agent.languages.push("dotnet");
      }
    } catch (error) {

    }
    try {
      let pwshpath = runner.findPwShPath();
      if (pwshpath != null && pwshpath != "") {
        agent.languages.push("powershell");
      }
    } catch (error) {

    }

    if (_client == null) {
      await agent.client.connect();
    }
  }

  public static reloadAndParseConfig(): boolean {
    config.doDumpStack = true
    agent.assistantConfig = {};
    agent.assistantConfig.apiurl = process.env["apiurl"];
    if (agent.assistantConfig.apiurl == null || agent.assistantConfig.apiurl == "") {
      agent.assistantConfig.apiurl = process.env["grpcapiurl"];
    }
    if (agent.assistantConfig.apiurl == null || agent.assistantConfig.apiurl == "") {
      agent.assistantConfig.apiurl = process.env["wsapiurl"];
    }
    agent.assistantConfig.jwt = process.env["jwt"];
    if (agent.dockeragent) {
      return true;
    }

    if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
      agent.assistantConfig = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
      process.env["NODE_ENV"] = "production";
      if (agent.assistantConfig.apiurl) {
        process.env["apiurl"] = agent.assistantConfig.apiurl;
        agent.client.url = agent.assistantConfig.apiurl;
      }
      if (agent.assistantConfig.jwt) {
        process.env["jwt"] = agent.assistantConfig.jwt;
        agent.client.jwt = agent.assistantConfig.jwt;
      }
      if (agent.assistantConfig.agentid != null && agent.assistantConfig.agentid != "") {
        agent.agentid = agent.assistantConfig.agentid;
      }
      return true;
    } else {
      if (agent.assistantConfig.apiurl == null || agent.assistantConfig.apiurl == "") {
        log("failed locating config to load from " + path.join(os.homedir(), ".openiap", "config.json"))
        process.exit(1);
        return false;
      }
    }
    return true;
  }
  private static async onConnected(client: openiap) {
    try {
      let u = new URL(client.url);
      process.env.apiurl = client.url;
      await agent.RegisterAgent()
      if (client.client == null || client.client.user == null) {
        log('connected, but not signed in, close connection again');
        return client.Close();
      }
      log("registering watch on agents")
      let watchid = await client.Watch({ paths: [], collectionname: "agents" }, async (operation: string, document: any) => {
        try {
          if (document._type == "package") {
            if (operation == "insert") {
              log("package " + document.name + " inserted, reload packages");
              await agent.reloadpackages(false)
            } else if (operation == "replace") {
              log("package " + document.name + " (" +  document._id + " ) updated.");
              packagemanager.removepackage(document._id);
              if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
              await packagemanager.getpackage(agent.client, document._id);

              if(agent.killonpackageupdate) {
                log("Kill all instances of package " + document.name + " (" + document._id + ") if running");
                for (let s = runner.streams.length - 1; s >= 0; s--) {
                  const stream = runner.streams[s];
                  if (stream.packageid == document._id) {
                    runner.kill(agent.client, stream.id);
                  }
                }
              }
            } else if (operation == "delete") {
              log("package " + document.name + " deleted, cleanup after package");
              packagemanager.removepackage(document._id);
            }
          } else if (document._type == "agent") {
            if (document._id == agent.agentid) {
              if (agent.lastreload.getTime() + 1000 > new Date().getTime()) {
                log("agent changed, but last reload was less than 1 second ago, do nothing");
                return;
              }
              agent.lastreload = new Date();
              log("agent changed, reload config");
              await agent.RegisterAgent()
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
    } catch (error) {
      _error(error);
      await new Promise(resolve => setTimeout(resolve, 2000));
      process.exit(0);
    }
  }
  private static async onDisconnected(client: openiap) {
    log("Disconnected");
  };

  public static async localrun(packageid: string, streamid: string, payload: any, _env: any, schedule: any): Promise<[number, string, any]> {
    const pck = await packagemanager.getpackage(agent.client, packageid);
    const packagepath = packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", packageid));
    if (packagepath == "") {
      log("Package " + packageid + " not found");
      return [2, "Package " + packageid + " not found", payload];
    }
    // var _env = {"payloadfile": ""};
    // if(env != null) _env = Object.assign(_env, env);

    try {
      const payloadfile = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ".json";
      const wipath = path.join(packagepath, payloadfile);
      if (fs.existsSync(wipath)) { fs.unlinkSync(wipath); }
      if (payload != null) { _env = Object.assign(_env, payload); }
      _env["payloadfile"] = payloadfile;

      if (payload != null) {
        let wijson = JSON.stringify(payload, null, 2);
        fs.writeFileSync(wipath, wijson);
      }
      if (streamid == null || streamid == "") {
        streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
      let stream = new Stream.Readable({
        read(size) { }
      });
      let buffer: Buffer = Buffer.from("");
      stream.on('data', async (data) => {
        if (data == null) return;
        if (Buffer.isBuffer(data)) {
          buffer = Buffer.concat([buffer, data]);
        } else {
          buffer = Buffer.concat([buffer, Buffer.from(data)]);
        }
        if(buffer.length > 1000000) {
            // keep first 500k and remove rest
            buffer = buffer.subarray(0, 500000);
        }
      });
      // stream.on('end', async () => { log("process ended"); });
      log("run package " + pck.name + " (" + packageid + ")");
      const exitcode = await packagemanager.runpackage(agent.client, packageid, streamid, [], stream, true, _env, schedule);
      // log("run complete");

      let wipayload = payload;
      if (fs.existsSync(wipath)) {
        try {
          wipayload = JSON.parse(fs.readFileSync(wipath).toString());
          if (fs.existsSync(wipath)) { fs.unlinkSync(wipath); }
        } catch (error) {
          log("Error loading payload from " + wipath + " " + (error.message ? error.message : error));
        }
      }
      return [exitcode, buffer.toString(), wipayload];
    } catch (error) {
      _error(error);
    }
  }
  public static async reloadpackages(force: boolean): Promise<ipackage[]> {
    try {
      log("reloadpackages")
      if (agent.globalpackageid != "" && agent.globalpackageid != null) {
        return [await packagemanager.reloadpackage(agent.client, agent.globalpackageid, force)];
      } else {
        return await packagemanager.reloadpackages(agent.client, agent.languages, force);
      }
    } catch (error) {
      _error(error);
    }
  }

  public static async RegisterAgent() {
    try {
      let u = new URL(agent.client.url);
      log("Registering agent with " + u.hostname + " as " + agent.client.client.user.username);
      let chromium = runner.findChromiumPath() != "";
      let chrome = runner.findChromePath() != "";
      let daemon = undefined;
      if (!agent.dockeragent) daemon = true;
      let data = JSON.stringify({ hostname: os.hostname(), os: os.platform(), arch: os.arch(), username: os.userInfo().username, version: agent.myproject.version, "languages": agent.languages, chrome, chromium, daemon, "maxpackages": 50 })
      let res: any = await agent.client.CustomCommand({
        id: agent.agentid, command: "registeragent",
        data
      });
      if (res != null) res = JSON.parse(res);
      if (res != null && res.environment != null) {
        let keys = Object.keys(res.environment);
        for (let i = 0; i < keys.length; i++) {
          process.env[keys[i]] = res.environment[keys[i]];
        }
      }
      if (res != null && res.slug != "" && res._id != null && res._id != "") {
        agent.localqueue = await agent.client.RegisterQueue({ queuename: res.slug + "agent" }, agent.onQueueMessage);
        agent.agentid = res._id;
        let config = { agentid: agent.agentid, jwt: res.jwt, apiurl: agent.client.url };
        if (fs.existsSync(path.join(os.homedir(), ".openiap", "config.json"))) {
          config = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".openiap", "config.json"), "utf8"));
        }
        config.agentid = agent.agentid;

        // if (process.env["apiurl"] != null && process.env["apiurl"] != "") {
        //   log("Skip updating config.json as apiurl is set in environment variable (probably running as a service)")
        // } else {
        if (res.jwt != null && res.jwt != "") {
          process.env.jwt = res.jwt;
        }
        if (agent.client.url != null && agent.client.url != "") {
          config.apiurl = agent.client.url;
        }
        if (!fs.existsSync(packagemanager.packagefolder)) fs.mkdirSync(packagemanager.packagefolder, { recursive: true });
        fs.writeFileSync(path.join(os.homedir(), ".openiap", "config.json"), JSON.stringify(config));
        // }

        if (res.schedules == null || !Array.isArray(res.schedules)) res.schedules = [];
        if (agent.globalpackageid != "" && agent.globalpackageid != null) {
          let exists = res.schedules.find((x: any) => x.packageid == agent.globalpackageid);
          if (exists == null) {
            let name = process.env.forcedpackageid || "localrun";
            res.schedules.push({ id: "localrun", name, packageid: agent.globalpackageid, enabled: true, cron: "", env: { "localrun": true } });
          }
          log("packageid is set, run package " + agent.globalpackageid);
        }
        for (let p = 0; p < res.schedules.length; p++) {
          const _schedule = res.schedules[p];
          let schedule = agent.schedules.find((x: any) => x.name == _schedule.name && x.packageid == _schedule.packageid);
          if (schedule != null && schedule != _schedule) {
            _schedule.task = schedule.task;
            if (_schedule.env == null) _schedule.env = {};
            if (schedule.env == null) schedule.env = {};
            if (_schedule.cron == null || _schedule.cron == "") _schedule.cron = "";
            if (schedule.cron == null || schedule.cron == "") schedule.cron = "";
            if (JSON.stringify(_schedule.env) != JSON.stringify(schedule.env) || _schedule.cron != schedule.cron) {
              try {
                log("Schedule " + _schedule.name + " (" + _schedule.id + ") updated, kill all instances of package " + _schedule.packageid + " if running");
                for (let s = runner.streams.length - 1; s >= 0; s--) {
                  const stream = runner.streams[s];
                  if (stream.schedulename == _schedule.name) {
                    runner.kill(agent.client, stream.id);
                  }
                }
              } catch (error) {
              }
            }
          }
        }
        for (let p = 0; p < agent.schedules.length; p++) {
          const _schedule = agent.schedules[p];
          let schedule = res.schedules.find((x: any) => x.name == _schedule.name && x.packageid == _schedule.packageid);
          if (schedule == null) {
            try {
              if (_schedule.task != null) {
                _schedule.task.stop();
                _schedule.task = null;
              }
              log("Schedule " + _schedule.name + " (" + _schedule.id + ") removed, kill all instances of package " + _schedule.packageid + " if running");
              for (let s = runner.streams.length - 1; s >= 0; s--) {
                const stream = runner.streams[s];
                if (stream.schedulename == _schedule.name) {
                  runner.kill(agent.client, stream.id);
                }
              }

            } catch (error) {

            }
          }
        }
        var streams = runner.streams;
        console.log("streams: " + runner.streams.length + " current schedules: " + agent.schedules.length + " new schedules: " + res.schedules.length)
        agent.schedules = res.schedules;
        for (let p = 0; p < res.schedules.length; p++) {
          const schedule = res.schedules[p];
          if (schedule.packageid == null || schedule.packageid == "") {
            log("Schedule " + schedule.name + " has no packageid, skip");
            continue;
          }

          if (schedule.cron != null && schedule.cron != "") {
            if (!schedule.enabled) {
              if (schedule.task != null) {
                schedule.task.stop();
                schedule.task = null;
              }
              log("Schedule " + schedule.name + " (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid + " if running");
              for (let s = runner.streams.length - 1; s >= 0; s--) {
                const stream = runner.streams[s];
                if (stream.schedulename == schedule.name) {
                  runner.kill(agent.client, stream.id);
                }
              }
            } else {
              log("Schedule " + schedule.name + " (" + schedule.id + ") running every " + schedule.cron);
              if (schedule.task == null) {
                schedule.task = cron.schedule(schedule.cron, async () => {
                  if (schedule.enabled) {
                    log("Schedule " + schedule.name + " (" + schedule.id + ") enabled, run now");
                    agent.localrun(schedule.packageid, null, null, schedule.env, schedule);
                  } else {
                    log("Schedule " + + " (" + schedule.id + ") disabled, kill all instances of package " + schedule.packageid + " if running");
                    for (let s = runner.streams.length - 1; s >= 0; s--) {
                      const stream = runner.streams[s];
                      if (stream.schedulename == schedule.name) {
                        runner.kill(agent.client, stream.id);
                      }
                    }
                  }
                });
              }
            }
          } else {
            if (schedule.enabled) {
              if (schedule.task == null) {
                log("Schedule " + schedule.name + " enabled, run now");
                schedule.task = {
                  timeout: null,
                  lastrestart: new Date(),
                  restartcounter: 0,
                  stop() {
                    if (schedule.task.timeout != null) {
                      clearTimeout(schedule.task.timeout);
                      for (let s = runner.streams.length - 1; s >= 0; s--) {
                        const stream = runner.streams[s];
                        if (stream.schedulename == schedule.name) {
                          runner.kill(agent.client, stream.id);
                        }
                      }
                    }
                  },
                  start() {
                    if (schedule.task.timeout != null) {
                      log("Schedule " + schedule.name + " (" + schedule.id + ") already running");
                      return;
                    }
                    log("Schedule " + schedule.name + " (" + schedule.id + ") started");
                    schedule.task.stop()
                    schedule.task.timeout = setTimeout(() => {
                      agent.localrun(schedule.packageid, null, null, schedule.env, schedule).then((result) => {
                        if (schedule.task == null) return;
                        const [exitcode, output, payload] = result;
                        try {
                          schedule.task.timeout = null;
                          if(exitcode != 0) {
                            log("Schedule " + schedule.name + " (" + schedule.id + ") finished with exitcode " + exitcode + '\n' + output);
                          } else {
                            log("Schedule " + schedule.name + " (" + schedule.id + ") finished (exitcode " + exitcode + ")");
                          }
                          const minutes = (new Date().getTime() - schedule.task.lastrestart.getTime()) / 1000 / 60;
                          if (minutes < agent.maxrestartsminutes) {
                            schedule.task.restartcounter++;
                          } else {
                            schedule.task.restartcounter = 0;
                          }
                          schedule.task.lastrestart = new Date();
                          if (schedule.task.restartcounter < agent.maxrestarts) {
                            let exists = agent.schedules.find(x => x.name == schedule.name && x.packageid == schedule.packageid);
                            if (exists != null && schedule.task != null) {
                              log("Schedule " + schedule.name + " (" + schedule.id + ") stopped after " + minutes.toFixed(2) + " minutes (" + schedule.task.restartcounter + " of " + agent.maxrestarts + ")");
                              schedule.task.start();
                            }
                          } else {
                            const hascronjobs = agent.schedules.find(x => x.cron != null && x.cron != "" && x.enabled == true);
                            if (hascronjobs == null && agent.exitonfailedschedule == true) {
                              log("Schedule " + schedule.name + " (" + schedule.id + ") stopped " + schedule.task.restartcounter + " times, no cron jobs running, exit agent completly!");
                              process.exit(0);
                            } else {
                              log("Schedule " + schedule.name + " (" + schedule.id + ") stopped " + schedule.task.restartcounter + " times, stop schedule");
                            }
                          }
                        } catch (error) {
                          _error(error);
                        }
                      }).catch((error) => {
                        try {
                          _error(error);
                          schedule.task.timeout = null;
                        } catch (e) {
                          _error(e);
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
                  runner.kill(agent.client, stream.id);
                }
              }
            }
          }
        }
        log("Registed agent as " + res.name + " (" + agent.agentid + ") and queue " + agent.localqueue + " ( from " + res.slug + " )");
      } else {
        log("Registrering agent seems to have failed without an error !?!");
        if (res == null) {
          log("res is null");
        } else {
          log(JSON.stringify(res, null, 2));
        }
      }
      if (res.jwt != null && res.jwt != "") {
        await agent.client.Signin({ jwt: res.jwt });
        log('Re-authenticated to ' + u.hostname + ' as ' + agent.client.client.user.username);
      }
      agent.reloadAndParseConfig();
    } catch (error) {
      _error(error);
      process.env["apiurl"] = "";
      process.env["jwt"] = "";
      try {
        agent.client.Close();
      } catch (error) {
      }
    }
  }

  private static async onQueueMessage(msg: QueueEvent, payload: any, user: any, jwt: string) {
    try {
      // const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      let streamid = msg.correlationId;
      if (payload != null && payload.payload != null && payload.command == null) payload = payload.payload;
      if (payload.streamid != null && payload.streamid != "") streamid = payload.streamid;
      // log("onQueueMessage");
      // log(payload);
      let streamqueue = msg.replyto;
      if (payload.queuename != null && payload.queuename != "") {
        streamqueue = payload.queuename;
      }
      let dostream = true;
      if (payload.stream == "false" || payload.stream == false) {
        dostream = false;
      }
      if (payload.command == null || payload.command == "" || payload.command == "invoke") {
        if (agent.num_workitemqueue_jobs >= agent.max_workitemqueue_jobs) {
          return { "command": payload.command, "success": false, error: "Busy running " + agent.num_workitemqueue_jobs + " jobs ( max " + agent.max_workitemqueue_jobs + " )" };
        }
        agent.num_workitemqueue_jobs++;
        let packagepath = "";
        let original: string[] = [];
        let workitem: Workitem = null;
        try {
          if (streamid == null || streamid == "") {
            dostream = false;
            streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          }
          if (payload.wiq == null) {
            log("payload missing wiq " + JSON.stringify(payload, null, 2));
            return { "command": payload.command, "success": false, error: "payload missing wiq" };
          }
          if (payload.packageid == null) {
            log("payload missing packageid " + JSON.stringify(payload, null, 2));
            return { "command": payload.command, "success": false, error: "payload missing packageid" };
          }
          await packagemanager.getpackage(agent.client, payload.packageid);
          packagepath = packagemanager.getpackagepath(path.join(os.homedir(), ".openiap", "packages", payload.packageid));

          workitem = await agent.client.PopWorkitem({ wiq: payload.wiq, includefiles: false, compressed: false });
          if (workitem == null) {
            log("No more workitems for " + payload.wiq);
            try {
              if (dostream) await agent.client.QueueMessage({ queuename: streamqueue, data: { "command": "stream", "data": Buffer.from("No more workitems for " + payload.wiq) }, correlationId: streamid });
            } catch (error) {
              log(error.message ? error.message : error);
            }
            return { "command": "invoke", "success": false, "completed": true, error: "No more workitems for " + payload.wiq };
          }

          let files = fs.readdirSync(packagepath);
          files.forEach(file => {
            let filename = path.join(packagepath, file);
            if (fs.lstatSync(filename).isFile()) original.push(file);
          });

          let env = { "packageid": "", "workitemid": workitem._id }
          for (let i = 0; i < workitem.files.length; i++) {
            const file = workitem.files[i];
            if (file.filename == "output.txt") continue;
            const reply = await this.client.DownloadFile({ id: file._id, folder: packagepath });
            log("Downloaded file: " + reply.filename);
            // log("Downloaded file: " + file.filename);
            // fs.writeFileSync(path.join(packagepath, file.filename), file.file);
          }
          const [exitcode, output, newpayload] = await agent.localrun(payload.packageid, streamid, workitem.payload, env, null);
          try {
            workitem.state = "successful";
            if (exitcode != 0) {
              workitem.state = "retry";
            }
            if (newpayload != null) workitem.payload = JSON.stringify(newpayload);

            fs.writeFileSync(path.join(packagepath, "output.txt"), output);
            files = fs.readdirSync(packagepath);
            files = files.filter(x => original.indexOf(x) == -1);
            files.forEach(file => {
              let filename = path.join(packagepath, file);
              if (fs.lstatSync(filename).isFile()) {
                log("adding file: " + file);
                workitem.files.push({ filename: file, file: fs.readFileSync(filename), _id: null, compressed: false })
                fs.unlinkSync(filename);
              }
            });
            await agent.client.UpdateWorkitem({ workitem });
            try {
              if (dostream == true && streamqueue != "") await agent.client.QueueMessage({ queuename: streamqueue, data: { "command": "invoke", "success": true, "completed": true }, correlationId: streamid });
            } catch (error) {
              log(error.message ? error.message : error);
            }
          } catch (error) {
            _error(error);
            dostream = false;
          }
          return { "command": "invoke", "success": true, "completed": false };
        } catch (error) {
          _error(error);
          log("!!!error: " + error.message ? error.message : error);

          workitem.errormessage = (error.message != null) ? error.message : error;
          workitem.state = "retry";
          workitem.errortype = "application";
          await agent.client.UpdateWorkitem({ workitem });
          return { "command": payload.command, "success": false, error: JSON.stringify(error.message) };
        } finally {
          agent.num_workitemqueue_jobs--;
          if (agent.num_workitemqueue_jobs < 0) agent.num_workitemqueue_jobs = 0;
        }
      }
      if (user == null || jwt == null || jwt == "") {
        _error("not authenticated");
        return { "command": payload.command, "success": false, error: "not authenticated" };
      }
      log("onQueueMessage " + msg.correlationId)
      log("command: " + payload.command + " streamqueue: " + streamqueue + " dostream: " + dostream)
      if (streamqueue == null) streamqueue = "";
      if (payload.command == "runpackage") {
        if (payload.id == null || payload.id == "") throw new Error("id is required");

        agent.localrun(payload.id, streamid, payload.payload, null, null).then((result) => {
          const [exitcode, output, payload] = result;
          try {
            const success = exitcode == 0;
            if (dostream == true && streamqueue != "") agent.client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", success, "completed": true, exitcode, output, payload }, correlationId: streamid });
          } catch (error) {
            log(error.message ? error.message : error);
          }
        }).catch((error) => {
          const output = error.output;
          try {
            if (dostream == true && streamqueue != "") agent.client.QueueMessage({ queuename: streamqueue, data: { "command": "runpackage", "success": false, "completed": true, "output": output, "error": error.message ? error.message : error, "payload": payload.payload }, correlationId: streamid });
          } catch (error) {
            log(error.message ? error.message : error);
          }
        });

        return { "command": "runpackage", "success": true, "completed": false };
      }
      if (payload.command == "kill") {
        if (payload.id == null || payload.id == "") payload.id = payload.streamid;
        if (payload.id == null || payload.id == "") throw new Error("id is required");
        runner.kill(agent.client, payload.id);
        return { "command": "kill", "success": true };
      }
      if (payload.command == "killall") {
        let processcount = runner.processs.length;
        for (let i = processcount; i >= 0; i--) {
          runner.kill(agent.client, runner.processs[i].id);
        }
        return { "command": "killall", "success": true, "count": processcount };
      }
      if (payload.command == "addcommandstreamid") {
        if (payload.streamqueue == null || payload.streamqueue == "") payload.streamqueue = msg.replyto;
        if (runner.commandstreams.indexOf(payload.streamqueue) == -1) runner.commandstreams.push(payload.streamqueue);
      }
      if (payload.command == "removecommandstreamid") {
        if (payload.streamqueue == null || payload.streamqueue == "") payload.streamqueue = msg.replyto;
        if (runner.commandstreams.indexOf(payload.streamqueue) != -1) {
          console.log("remove " + payload.streamqueue + " from commandstreams")
          runner.commandstreams.splice(runner.commandstreams.indexOf(payload.streamqueue), 1);
        }
      }
      if (payload.command == "setstreamid") {
        if (payload.id == null || payload.id == "") payload.id = payload.streamid;
        if (payload.id == null || payload.id == "") throw new Error("id is required");
        if (payload.streamqueue == null || payload.streamqueue == "") payload.streamqueue = msg.replyto;
        if (payload.streamqueue == null || payload.streamqueue == "") throw new Error("streamqueue is required");
        let processcount = runner.streams.length;
        let counter = 0;
        if (runner.commandstreams.indexOf(payload.streamqueue) == -1 && payload.streamqueue != null && payload.streamqueue != "") {
          console.log("Add streamqueue " + payload.streamqueue + " to commandstreams")
          runner.commandstreams.push(payload.streamqueue);
        }
        // for (let i = processcount; i >= 0; i--) {
        //   let p = runner.streams[i];
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
        if (s?.buffer != null && s?.buffer.length > 0) {
          let _message = Buffer.from(s.buffer);
          try {
            await agent.client.QueueMessage({ queuename: payload.streamqueue, data: { "command": "stream", "data": _message }, correlationId: streamid });
          } catch (error) {
            log(error.message ? error.message : error);
          }
        }
        // runner.notifyStream(agent.client, payload.id, s.buffer, false)
        return { "command": "setstreamid", "success": true, "count": counter, };
      }
      if (payload.command == "listprocesses") {
        if (runner.commandstreams.indexOf(msg.replyto) == -1 && msg.replyto != null && msg.replyto != "") {
          console.log("Add streamqueue " + payload.streamqueue + " to commandstreams")
          runner.commandstreams.push(msg.replyto);
        }
        let processcount = runner.streams.length;
        let processes = [];
        for (let i = processcount; i >= 0; i--) {
          let p = runner.streams[i];
          if (p == null) continue;
          processes.push({
            "id": p.id,
            "streamqueues": runner.commandstreams,
            "packagename": p.packagename,
            "packageid": p.packageid,
            "schedulename": p.schedulename,
            "buffersize": (p.buffer == null ? 0 : p.buffer.length),
          });
        }
        return { "command": "listprocesses", "success": true, "count": processcount, "processes": processes };
      }
    } catch (error) {
      _error(error);
      log(JSON.stringify({ "command": payload.command, "success": false, error: JSON.stringify(error.message) }))
      return { "command": payload.command, "success": false, error: JSON.stringify(error.message) };
    } finally {
      log("commandstreams:" + runner.commandstreams.length);
    }
  }

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
