import { agent } from "./agent";
import { runner } from "./runner";
import { sleep } from "./util";
async function main() {
  try {
    agent.globalpackageid = process.env.forcedpackageid || process.env.packageid || "";
    const onexit = async () => {
      for (let s = runner.streams.length - 1; s >= 0; s--) {
        const stream = runner.streams[s];
        console.log("*** Kill stream: " + stream.id);
        await runner.kill(agent.client, stream.id);
      }
      console.log("*** Exit");;
      process.exit(0);
    };
    process.on('SIGINT', onexit)
    process.on('SIGTERM', onexit)
    process.on('SIGQUIT', onexit)
    await agent.init()
    // agent.reloadpackages(true);
    // agent.on("runit", ( streamid, command, parameters, cwd, env) => {
    // });
    // agent.on("streamadded", ( stream:any ) => {
    //   console.log("***** streamadded")
    // });
    // agent.on("stream", ( stream:any, message: Buffer) => {
    //   if(message != null) console.log("***** stream: " + message.toString());
    //   if(message == null) console.log("***** stream: (null)");
    // });
    // agent.on("streamremoved", (stream: any) => {
    //   console.log("***** streamremoved")
    // });
    while (true) {
      await sleep(10);
    }
  } catch (error) {
    console.error(error);
  }
}

main();