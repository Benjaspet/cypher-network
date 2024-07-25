import { logger } from "@app/CypherNetwork";

import config from "../../config.json";
import { Mongoose, connect } from "mongoose";
import * as process from "node:process";

class Database {
    public static instance: Mongoose;

    public static async initialize(): Promise<void> {
        const uri: string = config.database.mongoUri;
        try {
            Database.instance = await connect(uri);
            logger.info(`🚀 Connected to MongoDB instance: ${uri}`);
        } catch (e) {
            logger.error(`Failed to connect to the database: ${e}`);
            process.exit(1);
        }
    }
}

export default Database;
