/*
 * Just fo enabling env variables predefined in .env file.
 * Notice that the path of starting the process do matter.
 * We should call `ts-node ./src/index.ts` at the same directory as liquidator-bot.
 */
var path = require('path');
var dotEnvPath = path.resolve('./.env');
require('dotenv').config({ path: dotEnvPath });
