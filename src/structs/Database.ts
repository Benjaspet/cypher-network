import Config from "@structs/Config";

import { Mongoose, connect } from "mongoose";
import * as process from "node:process";

class Database {
    private static instance: Mongoose;

    /**
     * Returns the database instance, or initializes it.
     */
    public static async getInstance(): Promise<Mongoose> {
        if (!Database.instance) {
            await Database.initialize();
        }

        return Database.instance;
    }

    public static async initialize(): Promise<void> {
        const uri = Config.get("database").mongoUri;
        try {
            Database.instance = await connect(uri);
            // logger.info(`🚀 Connected to MongoDB instance: ${uri}`);
        } catch (e) {
            // logger.error(`Failed to connect to the database: ${e}`);
            process.exit(1);
        }
    }
}

export default Database;
