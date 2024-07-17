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
import {
    Client,
    CommandInteraction,
    EmbedBuilder
} from "discord.js";

import { ApplicationCommandOptionType } from "discord-api-types/v10";

import CypherNetworkConstants from "@app/Constants";

import Command from "@structs/Command";

import EmbedUtil from "@utils/EmbedUtil";

import { ACommand } from "@defs/ACommand";

import fetch from "node-fetch";


export default class AgentCommand
    extends Command
    implements ACommand
{
    private readonly client: Client;

    constructor(client: Client) {
        super("agent", {
            name: "agent",
            description: "Fetch agent details from Valorant.",
            options: [
                {
                    name: "agent",
                    description: "The name of the agent.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "Brimstone",
                            value: "Brimstone"
                        },
                        {
                            name: "Phoenix",
                            value: "Phoenix"
                        },
                        {
                            name: "Sage",
                            value: "Sage"
                        },
                        {
                            name: "Sova",
                            value: "Sova"
                        },
                        {
                            name: "Viper",
                            value: "Viper"
                        },
                        {
                            name: "Cypher",
                            value: "Cypher"
                        },
                        {
                            name: "Reyna",
                            value: "Reyna"
                        },
                        {
                            name: "Killjoy",
                            value: "Killjoy"
                        },
                        {
                            name: "Breach",
                            value: "Breach"
                        },
                        {
                            name: "Omen",
                            value: "Omen"
                        },
                        {
                            name: "Jett",
                            value: "Jett"
                        },
                        {
                            name: "Raze",
                            value: "Raze"
                        },
                        {
                            name: "Skye",
                            value: "Skye"
                        },
                        {
                            name: "Yoru",
                            value: "Yoru"
                        },
                        {
                            name: "Astra",
                            value: "Astra"
                        },
                        {
                            name: "KAY/O",
                            value: "KAY/O"
                        },
                        {
                            name: "Chamber",
                            value: "Chamber"
                        },
                        {
                            name: "Neon",
                            value: "Neon"
                        },
                        {
                            name: "Fade",
                            value: "Fade"
                        },
                        {
                            name: "Harbor",
                            value: "Harbor"
                        },
                        {
                            name: "Gekko",
                            value: "Gekko"
                        },
                        {
                            name: "Deadlock",
                            value: "Deadlock"
                        },
                        {
                            name: "Iso",
                            value: "Iso"
                        },
                        {
                            name: "Clove",
                            value: "Clove"
                        }
                    ]
                }
            ]
        });
        this.client = client;
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;
        const agentName = interaction.options.getString("agent", true);
        await interaction.deferReply();
        try {
            await fetch(
                `https://valorant-api.com/v1/agents?isPlayableCharacter=true`
            )
                .then((response) => response.json())
                .then(async (res) => {
                    const {data} = res;
                    const agent = data.find((agent: { displayName: string; }) => agent.displayName.toLowerCase() === agentName.toLowerCase());
                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: agent.displayName,
                            iconURL: agent.displayIcon
                        })
                        .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR())
                        .setDescription(agent.description)
                        .addFields([
                            {
                                name: "Role",
                                value: agent.role.displayName
                            },
                            {
                                name: "Abilities",
                                value: agent.abilities.map((ability: any) =>
                                    `• ${ability.displayName}`
                                ).join("\n")
                            }
                        ])
                        .setFooter({
                            text: "Cypher Network",
                            iconURL: this.client.user?.displayAvatarURL()
                        })
                        .setTimestamp();
                    return void (await interaction.editReply({
                        embeds: [embed]
                    }));
                });
        } catch (e) {
            const embed = EmbedUtil.getErrorEmbed(
                "An error occurred while fetching agent data."
            );
            return void (await interaction.editReply({ embeds: [embed] }));
        }
    }
}
