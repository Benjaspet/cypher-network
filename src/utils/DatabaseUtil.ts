import { User } from "discord.js";

import CypherUser, { ICypherUser } from "@defs/CypherUser";

class DatabaseUtil {
    /**
     * Fetches or creates a user's data.
     *
     * @param user The user to fetch or create data for.
     */
    static async getDataByUser(user: User): Promise<ICypherUser> {
        return DatabaseUtil.getDataById(user.id);
    }

    /**
     * Fetches or creates a user's data by their ID.
     *
     * @param id The ID of the user to fetch or create data for.
     */
    static async getDataById(id: string): Promise<ICypherUser> {
        // Check if the user exists.
        let data = await CypherUser.findOne({ _id: id });
        if (data != undefined) {
            return data;
        }

        // Create a new user.
        data = new CypherUser({ _id: id });
        await data.save();

        return data;
    }
}

export default DatabaseUtil;
