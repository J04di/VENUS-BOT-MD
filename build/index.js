import "dotenv/config.js";
import { plugins } from "./core/plugins.js";
import { loadAllBotSessions } from "./utils/loadAllBotSessions.js";
import { logger } from "./core/logger.js";
const NODE_VERSION = process.version;
if (!/^v22/.test(NODE_VERSION)) {
    throw new Error(`The application requires version 22 of Node.js to work correctly, the system version of Node.js is '${NODE_VERSION}'`);
}
await plugins.load();
await loadAllBotSessions();
process.on("unhandledRejection", (reason) => {
    logger.warn(reason);
});
process.on("uncaughtException", (err, origin) => {
    logger.fatal(err);
    logger.trace(origin);
    process.exit(0);
});
