import { agent } from "./agent";
async function main() {
  try {
    agent.globalpackageid = process.env.forcedpackageid || process.env.packageid || "";
    process.on('SIGINT', () => { process.exit(0) })
    process.on('SIGTERM', () => { process.exit(0) })
    process.on('SIGQUIT', () => { process.exit(0) })
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
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error(error);
  }
}

main();