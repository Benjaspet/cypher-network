import Elysia from "elysia";

import Config from "@structs/Config";
import HenrikAPI from "@structs/HenrikAPI";

import DatabaseUtil from "@utils/DatabaseUtil";

import Constants from "@app/Constants";

import DiscordOAuth2 from "discord-oauth2";

const oauth = new DiscordOAuth2();

const app = new Elysia()
    .get("/authorize", ({ redirect }) => redirect(Constants.AUTHORIZE_URL()))
    .get("/oauth2", async ({ query: { code } }) => {
        try {
            const token = await oauth.tokenRequest({
                code,
                grantType: "authorization_code",
                scope: Config.get("oauth").scopes,
                clientId: Config.get("clientId"),
                clientSecret: Config.get("oauth").clientSecret,
                redirectUri: Config.get("oauth").redirectUri
            });

            // Get the user's information.
            const { id } = await oauth.getUser(token.access_token);
            const cypherUser = await DatabaseUtil.getDataById(id);

            // Set the user's Riot Games information.
            const connections = await oauth.getUserConnections(
                token.access_token
            );
            const riotConnection = connections.find(
                (connection) => connection.type === "riotgames"
            );
            if (!riotConnection) {
                return new Response(
                    "No Riot Account connected. Try again after linking an account.",
                    { status: 401 }
                );
            }

            const riotName = riotConnection.name;
            const [name, tag] = riotName.split("#");

            // Fetch the user's ID.
            const { puuid } = await HenrikAPI.getAccount(name, tag);

            cypherUser.riot = {
                riotId: puuid,
                riotName: name,
                riotTag: tag
            };
            await cypherUser.save();

            return { cypherUser };
        } catch (error) {
            return new Response("Invalid code received.", { status: 401 });
        }
    });

export default app;
