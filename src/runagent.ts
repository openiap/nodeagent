import { agent } from "./agent";
import { Logger } from "./Logger";
import { runner } from "./runner";
import { sleep } from "./util";
async function main() {
  try {
    agent.globalpackageid = process.env.forcedpackageid || process.env.packageid || "";
    const onexit = async () => {
      for (let s = runner.streams.length - 1; s >= 0; s--) {
        const stream = runner.streams[s];
        Logger.instrumentation.info("*** Kill stream: " + stream.id, { streamid: stream.id });
        await runner.kill(agent.client, stream.id);
      }
      Logger.instrumentation.info("*** Exit", { });
      process.exit(0);
    };
    process.on('SIGINT', onexit)
    process.on('SIGTERM', onexit)
    process.on('SIGQUIT', onexit)
    await agent.init()
    while (true) {
      await sleep(10);
    }
  } catch (error) {
    Logger.instrumentation.error(error, { });
  }
}

main();