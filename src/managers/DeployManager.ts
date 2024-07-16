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
import { Client } from "discord.js";

import { Routes } from "discord-api-types/v10";

import { REST } from "@discordjs/rest";

import Config from "@structs/Config";
import Logger from "@structs/Logger";

import SlashCommandUtil from "@utils/SlashCommandUtil";
import Utilities from "@utils/Utilities";

type Action = {
    delete: boolean;
    guild: boolean;
    global: boolean;
};

export default class DeployManager {
    private readonly client: Client;
    public slashData: any[];
    public action: Action = {
        global: true,
        delete: false,
        guild: true
    };
    private clientId = Config.get("clientId");
    private guildId = Config.get("guildId");

    constructor(client: Client, slashData: any[], action: Action) {
        this.client = client;
        this.slashData = slashData;
        this.action = action;
        this.init().then(() => {});
    }

    private async init(): Promise<void> {
        const rest = new REST({ version: "10" }).setToken(Config.env("TOKEN"));

        if (!this.action.delete) {
            if (this.action.guild) {
                try {
                    Logger.info("Refreshing all guild slash commands..");
                    await rest.put(
                        Routes.applicationGuildCommands(
                            this.clientId,
                            this.guildId
                        ),
                        {
                            body: SlashCommandUtil.getAllSlashCommandData(
                                this.client
                            )
                        }
                    );
                    await Utilities.sleep(1000);
                    Logger.info(
                        "Successfully updated all guild slash commands."
                    );
                } catch (error: any) {
                    Logger.error(error);
                }
            } else if (this.action.global) {
                try {
                    Logger.info("Refreshing all global slash commands..");
                    await rest.put(Routes.applicationCommands(this.clientId), {
                        body: SlashCommandUtil.getAllSlashCommandData(
                            this.client
                        )
                    });
                    await Utilities.sleep(1000);
                    Logger.info(
                        "Successfully updated all global slash commands."
                    );
                } catch (error: any) {
                    Logger.error(error);
                }
            }
        } else {
            if (this.action.guild) {
                try {
                    Logger.info("Deleting all guild slash commands...");
                    await rest.put(
                        Routes.applicationGuildCommands(
                            this.clientId,
                            this.guildId
                        ),
                        {
                            body: []
                        }
                    );
                    Logger.info(
                        "Successfully deleted all guild slash commands."
                    );
                } catch (error: any) {
                    Logger.error(error);
                }
            } else if (this.action.global) {
                try {
                    Logger.info("Deleting all global slash commands...");
                    await rest.put(Routes.applicationCommands(this.clientId), {
                        body: []
                    });
                    Logger.info(
                        "Successfully deleted all global slash commands."
                    );
                } catch (error: any) {
                    Logger.error(error);
                }
            }
        }
    }
}
