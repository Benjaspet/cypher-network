import { Schema, Document } from "mongoose";
import Database from "@structs/Database";

const riotSchema = new Schema({
    riotId: String, // The Riot Games account ID of the user.
    riotName: String, // The Riot Games account name of the user.
    riotTag: String, // The Riot Games account tag of the user.
});

const discordSchema = new Schema({
    tokenType: String, // The Discord OAuth2 token type.
    accessToken: String, // The last known Discord OAuth2 token.
    refreshToken: String, // The Discord OAuth2 refresh token.
    issueTime: Number, // The time the Discord OAuth2 token was issued.
    expiresIn: Number, // The duration (in milliseconds) after which the token expires.
});

const userSchema = new Schema({
    _id: { type: String, required: true }, // The Discord user's ID.
    riot: riotSchema, // The Riot Games account of the user.
    discord: discordSchema, // The Discord account of the user.
});

export interface ICypherUser extends Document {
    _id: string;
    riot: {
        riotId: string;
        riotName: string;
        riotTag: string;
    } | undefined;
    discord: {
        tokenType: string;
        accessToken: string;
        refreshToken: string;
        issueTime: number;
        expiresIn: number;
    } | undefined;
}

const model = Database.instance!.model<ICypherUser>("CypherUser", userSchema);
export default model;
