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
    ApplicationCommandData,
    Client,
    CommandInteraction,
    EmbedBuilder
} from "discord.js";

import { ApplicationCommandOptionType } from "discord-api-types/v10";

import CypherNetworkConstants from "@constants/CypherNetworkConstants";

import Command from "@structs/Command";

import EmbedUtil from "@utils/EmbedUtil";

import { ApplicationCommand } from "@defs/ApplicationCommand";

import fetch from "node-fetch";

export default class CompetitiveCommand
    extends Command
    implements ApplicationCommand
{
    private readonly client: Client;

    constructor(client: Client) {
        super("competitive", {
            name: "competitive",
            description: "Fetch recent competitive match data for VALORANT.",
            options: [
                {
                    name: "name",
                    description: "The player's name.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "tag",
                    description: "The player's tag.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "region",
                    description: "The region of this player.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "North America",
                            value: "na"
                        },
                        {
                            name: "Europe",
                            value: "eu"
                        },
                        {
                            name: "Korea",
                            value: "kr"
                        },
                        {
                            name: "Brazil",
                            value: "br"
                        },
                        {
                            name: "Latin America",
                            value: "latam"
                        },
                        {
                            name: "Asia-Pacific",
                            value: "ap"
                        }
                    ]
                }
            ]
        });
        this.client = client;
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const name: string = encodeURIComponent(
            interaction.options.getString("name")!
        );
        const tag: string = encodeURIComponent(
            interaction.options.getString("tag")!
        );
        const region: string = encodeURIComponent(
            interaction.options.getString("region")!
        );
        await interaction.deferReply();
        try {
            await fetch(
                `https://api.henrikdev.xyz/valorant/v1/mmr-history/${region}/${name}/${tag}?api_key=HDEV-04d0ed17-947a-49c0-871a-41ca3314250d`
            )
                .then((response) => response.json())
                .then(async (res) => {
                    const { data } = res;
                    const preparedFieldData = [];
                    const toAccess: any[] =
                        data.length > 10 ? data.slice(0, 10) : data;
                    for (const match of toAccess) {
                        preparedFieldData.push({
                            name: `Map: ${match.map.name}`,
                            value:
                                `• Outcome: ${match.mmr_change_to_last_game > 0 ? "**WIN**" : "**LOSS**"}` +
                                `\n` +
                                `• Rating: **${match.currenttierpatched} [${match.ranking_in_tier} MMR]**` +
                                `\n` +
                                `• MMR Change: **${match.mmr_change_to_last_game}**` +
                                `\n` +
                                `• Total Elo: **${match.elo}**` +
                                `\n` +
                                `• Match Date: **${match.date}**` +
                                `\n` +
                                `• Match ID: **${match.match_id}**`
                        });
                    }
                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: `Competitive: ${decodeURIComponent(name)}#${tag}`,
                            iconURL: data[0].images.small
                        })
                        .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR())
                        .addFields(preparedFieldData)
                        .setFooter({
                            text: "Cypher Network",
                            iconURL: this.client.user?.displayAvatarURL()
                        })
                        .setTimestamp()
                        .toJSON();
                    return void (await interaction.editReply({
                        embeds: [embed]
                    }));
                });
        } catch (e) {
            const embed = EmbedUtil.getErrorEmbed(
                "An error occurred while fetching competitive data."
            );
            return void (await interaction.editReply({ embeds: [embed] }));
        }
    }

    public getName(): string {
        return this.name;
    }

    public getCommandData(): ApplicationCommandData {
        return this.data;
    }
}
