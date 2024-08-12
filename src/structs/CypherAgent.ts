import { randomUUID } from "node:crypto";

class CypherAgent {
    private static tokens: Map<string, string> = new Map();

    /**
     * Generates a random token to be used for Cypher Network.
     *
     * @param userId The user ID to generate a token for.
     */
    public static generateToken(userId: string): string {
        const uuid = randomUUID();
        const token = Bun.hash(`${uuid}.${Date.now()}`).toString();

        // Store the token for later use.
        CypherAgent.tokens.set(token, userId);
        return token;
    }
}

export default CypherAgent;
