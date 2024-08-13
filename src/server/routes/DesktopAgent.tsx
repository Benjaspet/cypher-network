import Elysia, { t } from "elysia";

import CypherAgent, { EventType } from "@structs/CypherAgent";

import AgentUtil from "@utils/AgentUtil";
import DatabaseUtil from "@utils/DatabaseUtil";

const app = new Elysia({ prefix: "/agent" })
    .derive(({ headers }) => {
        return {
            token: headers.authorization
        };
    })
    /**
     * @api [POST] /api/v1/agent/auth
     * @description Returns a Cypher Network token for a Riot Games token.
     */
    .post("/auth", async ({ token: riotToken }) => {
        if (!riotToken) {
            return new Response("No token specified.", { status: 400 });
        }

        try {
            const userId = await AgentUtil.prove(riotToken);

            // Check if the user has a Cypher profile.
            const userData = await DatabaseUtil.getDataByUuid(userId);
            if (!userData) {
                return new Response("No Cypher profile found.", { status: 404 });
            }

            return { token: CypherAgent.generateToken(userId) };
        } catch (error) {
            return new Response("Invalid token received.", { status: 401 });
        }
    })
    /**
     * @api [POST] /api/v1/agent/push/:event
     * @param event The event to push to the user.
     * @description A remote procedure call to update the user's status.
     */
    .post("/push/:event", ({ token, body, params: { event } }) => {
        if (!token) {
            return new Response("No token specified.", { status: 400 });
        }

        try {
            const clientData = CypherAgent.tokens.get(token);
            if (!clientData) {
                return new Response("Invalid token specified.", { status: 401 });
            }

            // Check if the event is valid.
            const eventName = event as EventType;
            if (!clientData[`push${eventName}`]) {
                return new Response("Invalid event specified.", { status: 400 });
            }

            try {
                clientData[`push${eventName}`](body);
                return { success: true };
            } catch (error) {
                return new Response("Failed to push event.", { status: 500 });
            }
        } catch (error) {
            return new Response("Invalid token received.", { status: 401 });
        }
    }, {
        type: "application/json",
        body: t.Any()
    });

export default app;
