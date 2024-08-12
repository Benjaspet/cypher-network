import * as jose from "jose";
import { FlattenedJWSInput, JSONWebKeySet, JWSHeaderParameters, KeyLike } from "jose";

const RIOT_JWT_KEYS = "https://auth.riotgames.com/jwks.json";

type RemoteJWKSet = {
    (protectedHeader?: JWSHeaderParameters, token?: FlattenedJWSInput): Promise<KeyLike>;
    coolingDown: boolean;
    fresh: boolean;
    reloading: boolean;
    reload: () => Promise<void>;
    jwks: () => (JSONWebKeySet | undefined)
};

/**
 * Backend utilities for interacting with Cypher Agent.
 */
class AgentUtil {
    private static riotKeys: RemoteJWKSet | undefined;

    /**
     * Initializes the agent utilities.
     */
    public static async initialize(): Promise<void> {
        AgentUtil.riotKeys = jose.createRemoteJWKSet(new URL(RIOT_JWT_KEYS));
    }

    /**
     * Returns the user's account ID if the access token is valid.
     *
     * @param accessToken The access token to prove.
     * @throws Error If the access token is invalid.
     */
    public static async prove(accessToken: string): Promise<string> {
        if (!AgentUtil.riotKeys) {
            throw new Error("Riot Games public key not loaded.");
        }

        const { payload } = await jose.jwtVerify(accessToken, AgentUtil.riotKeys);
        if (!payload.sub) {
            throw new Error("Invalid access token, or subject not set.");
        }

        return payload.sub;
    }
}

export default AgentUtil;
