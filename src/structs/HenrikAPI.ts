import Constants from "@app/Constants";

const BASE_URL = "https://api.henrikdev.xyz/valorant/v1";

class HenrikAPI {
    /**
     * Fetches an account's details by its name and tag.
     *
     * @param name The account's name.
     * @param tag The account's tag.
     */
    public static async getAccount(
        name: string,
        tag: string
    ): Promise<AccountDetailsResponse> {
        const response = await fetch(
            `${BASE_URL}/account/${name}/${tag}?api_key=${Constants.API_KEY}`
        );
        const { data, status } = await response.json();

        if (status != 200) {
            throw new Error(`Failed to fetch account details: ${data}`);
        }

        return data as AccountDetailsResponse;
    }
}

export default HenrikAPI;

/// <editor-fold desc="Type Definitions">

export type AccountDetailsResponse = {
    puuid: string; // The player's UUID.
    name: string;
    tag: string;
    region: string;
    account_level: number;
    card: {
        id: string;
        small: string;
        large: string;
        wide: string;
    };
};

/// </editor-fold>
