/*
 * Copyright © 2023 Ben Petrillo. All rights reserved.
 *
 * Project licensed under the MIT License: https://www.mit.edu/~amini/LICENSE.md
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * All portions of this software are available for public use, provided that
 * credit is given to the original author(s).
 */
import { ActivityType } from "discord.js";

import { logger } from "@app/CypherNetwork";

import { writeFile } from "node:fs/promises";

type JsonConfig = {
    clientId: string;
    guildId: string;
    embedColor: string; // This should be a parsable hex code.
    development: boolean;
    apiKey: string;
    activity: {
        status: string; // This gets parsed later.
        message: string;
    };
    deploy: {
        delete: boolean;
        guild: boolean;
        global: boolean;
    };
    emojis: {
        success: string;
        error: string;
    };
    database: {
        mongoUri: string;
    };
    web: {
        host: string;
        deployed: boolean;
        port: number;
    };
    oauth: {
        clientSecret: string;
        redirectUri: string;
        scopes: string[];
    };
};

const defaultConfig = {
    clientId: "0",
    guildId: "0",
    embedColor: "#000000",
    development: false,
    apiKey: "",
    activity: {
        status: "watching",
        message: "where you're hiding."
    },
    deploy: {
        delete: false,
        guild: false,
        global: false
    },
    emojis: {
        success: "0",
        error: "0"
    },
    database: {
        mongoUri: "mongodb://localhost:27017"
    },
    web: {
        host: "http://localhost",
        deployed: false,
        port: 3000
    },
    oauth: {
        clientSecret: "",
        redirectUri: "",
        scopes: ["identify", "connections"]
    }
} satisfies JsonConfig;

export default class Config {
    private static instance: JsonConfig = defaultConfig;

    /**
     * Loads the configuration from the JSON file.
     */
    public static async parse(): Promise<void> {
        const configFile = Bun.file("config.json");
        if (!(await configFile.exists())) {
            // Write the default configuration.
            await writeFile(
                "config.json",
                JSON.stringify(defaultConfig, null, 4)
            );
        } else
            try {
                // Parse the configuration.
                Config.instance = await configFile.json();
            } catch (error: any) {
                logger.error(
                    "Unable to parse the configuration file. Using defaults."
                );
            }
    }

    /**
     * Parse a status string into an ActivityType.
     * Defaults to `ActivityType.Playing`.
     *
     * @param status The status string to parse.
     */
    public static parseStatus(status: string): ActivityType {
        switch (status) {
            default:
            case "playing":
                return ActivityType.Playing;
            case "listening":
                return ActivityType.Listening;
            case "watching":
                return ActivityType.Watching;
            case "competing":
                return ActivityType.Competing;
            case "streaming":
                return ActivityType.Streaming;
        }
    }

    /**
     * Fetches a value from the configuration.
     *
     * @param key The key to fetch.
     */
    public static get<K extends keyof JsonConfig>(key: K): JsonConfig[K] {
        return Config.instance[key] ?? defaultConfig[key];
    }

    /**
     * Fetches a value from the environment.
     *
     * @param value The value to fetch.
     */
    public static env(value: string): any {
        return process.env[value];
    }
}
