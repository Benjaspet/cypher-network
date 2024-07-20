import { User } from "discord.js";
import CypherUser, { ICypherUser } from "@defs/CypherUser";

class DatabaseUtil {
    /**
     * Fetches or creates a user's data.
     *
     * @param user The user to fetch or create data for.
     */
    static async getData(user: User): Promise<ICypherUser> {
        // Check if the user exists.
        let data = await CypherUser.findOne({ _id: user.id });
        if (data != undefined) {
            return data;
        }

        // Create a new user.
        data = new CypherUser({
            _id: user.id
        });
        await data.save();

        return data;
    }
}

export default DatabaseUtil;
