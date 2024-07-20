import Config from "@structs/Config";

import { logger } from "@app/CypherNetwork";

import { Mongoose, connect } from "mongoose";
import * as process from "node:process";

class Database {
    public static instance?: Mongoose;

    /**
     * Initializes the database.
     */
    public static async initialize(): Promise<void> {
        try {
            Database.instance = await connect(Config.get("database").mongoUri);
        } catch (error: any) {
            logger.error("Unable to connect to the database.", error);
            process.exit(1);
        }
    }
}

export default Database;
