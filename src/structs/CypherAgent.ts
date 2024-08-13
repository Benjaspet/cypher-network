import { randomUUID } from "node:crypto";

// These are determined from the VALORANT client API.
export type EventType = "PREGAME" | "INGAME";

type EventHandler = {
    [K in EventType as `push${K}`]: (body: unknown) => void;
};

class CypherClientData implements EventHandler {
    constructor(private readonly userId: string) {}

    public pushPREGAME(body: unknown): void {
        console.log("Pre game", this.userId, body);
    }

    public pushINGAME(body: unknown): void {
        console.log("In game", this.userId, body);
    }
}

class CypherAgent {
    public static tokens: Map<string, CypherClientData> = new Map();

    /**
     * Generates a random token to be used for Cypher Network.
     *
     * @param userId The user ID to generate a token for.
     */
    public static generateToken(userId: string): string {
        const uuid = randomUUID();
        const token = Bun.hash(`${uuid}.${Date.now()}`).toString();

        // Store the token for later use.
        CypherAgent.tokens.set(token, new CypherClientData(userId));
        return token;
    }
}

export default CypherAgent;
