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
import { Routes } from "discord-api-types/v10";

import { REST } from "@discordjs/rest";

import CommandManager from "@managers/CommandManager";

import Config from "@structs/Config";

import { logger } from "@app/CypherNetwork";

type Action = {
    delete: boolean;
    guild: boolean;
    global: boolean;
};

export default class DeployManager {
    public action: Action = {
        global: true,
        delete: false,
        guild: true
    };
    private clientId = Config.get("clientId");
    private guildId = Config.get("guildId");

    constructor(action: Action) {
        this.action = action;
        this.init().then(() => {});
    }

    private async init(): Promise<void> {
        const rest = new REST({ version: "10" }).setToken(Config.env("TOKEN"));

        if (!this.action.delete) {
            if (this.action.guild) {
                try {
                    logger.info("Refreshing all guild slash commands..");
                    await rest.put(
                        Routes.applicationGuildCommands(
                            this.clientId,
                            this.guildId
                        ),
                        {
                            body: CommandManager.getCommands()
                        }
                    );
                    logger.info("Updated all guild slash commands.");
                } catch (error: any) {
                    logger.error(error.message);
                }
            } else if (this.action.global) {
                try {
                    logger.info("Refreshing all global slash commands..");
                    await rest.put(Routes.applicationCommands(this.clientId), {
                        body: CommandManager.getCommands()
                    });
                    logger.info("Updated all global slash commands.");
                } catch (error: any) {
                    logger.error(error);
                }
            }
        } else {
            if (this.action.guild) {
                try {
                    logger.info("Deleting all guild slash commands...");
                    await rest.put(
                        Routes.applicationGuildCommands(
                            this.clientId,
                            this.guildId
                        ),
                        {
                            body: []
                        }
                    );
                    logger.info("Deleted all guild slash commands.");
                } catch (error: any) {
                    logger.error(error.message);
                }
            } else if (this.action.global) {
                try {
                    logger.info("Deleting all global slash commands...");
                    await rest.put(Routes.applicationCommands(this.clientId), {
                        body: []
                    });
                    logger.info("Deleted all global slash commands.");
                } catch (error: any) {
                    logger.error(error);
                }
            }
        }
    }
}
