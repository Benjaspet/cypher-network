import { logger } from "@app/CypherNetwork";

import { connect, Mongoose } from "mongoose";
import * as process from "node:process";

import config from "../../config.json";

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
