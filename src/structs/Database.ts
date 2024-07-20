import { logger } from "@app/CypherNetwork";

import { connect } from "mongoose";
import * as process from "node:process";

import config from "../../config.json";

class Database {

    public static async initialize(): Promise<void> {
        const uri: string = config.database.mongoUri;
        connect(uri)
            .then(async () => {
                logger.info("🚀 MongoDB database connected: " + uri);
            })
            .catch((error: any) => {
                logger.error("Unable to connect to the database.", error);
                process.exit(1);
            });

    }
}

export default Database;
