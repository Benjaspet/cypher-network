import Elysia from "elysia";
import AgentUtil from "@utils/AgentUtil";
import CypherAgent from "@structs/CypherAgent";

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
            return { token: CypherAgent.generateToken(userId) };
        } catch (error) {
            return new Response(
                "Invalid token received.",
                { status: 401 }
            );
        }
    })
    .post("/push/:event", ({ token, params: { event } }) => {
        return { event, token };
    });

export default app;
