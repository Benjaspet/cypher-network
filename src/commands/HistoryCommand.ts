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

export default class HistoryCommand
    extends Command
    implements ACommand
{
    private readonly client: Client;

    constructor(client: Client) {
        super("history", {
            name: "history",
            description: "Fetch the provided player's most recent matches.",
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
        const region: string = interaction.options.getString("region")!;
        await interaction.deferReply();
        try {
            await fetch(
                `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}?api_key=HDEV-04d0ed17-947a-49c0-871a-41ca3314250d`
            )
                .then((response) => response.json())
                .then(async (res) => {
                    const { data } = res;
                    const matches: any[] = data;
                    let i = matches.length > 10 ? 10 : matches.length;
                    let fieldData = [];
                    let embed = new EmbedBuilder();
                    for (let j = 0; j < i; j++) {
                        const currentMatch = matches[j];
                        const p: any = currentMatch.players.all_players.find(
                            (player: any) => player.name === name
                        );
                        const score: number = p.stats.score;
                        const kills: number = p.stats.kills;
                        const deaths: number = p.stats.deaths;
                        const assists: number = p.stats.assists;
                        const headshots: number = p.stats.headshots;
                        const bodyshots: number = p.stats.bodyshots;
                        const legshots: number = p.stats.legshots;
                        embed.setThumbnail(p.assets.card.small);
                        fieldData.push({
                            name: `${currentMatch.metadata.map} [${currentMatch.metadata.mode}]`,
                            value:
                                `• K/D/A: **${kills} / ${deaths} / ${assists}**` +
                                `\n` +
                                `• Score: **${score}**` +
                                `\n` +
                                `• Headshots: **${headshots}**` +
                                `\n` +
                                `• Bodyshots: **${bodyshots}**` +
                                `\n` +
                                `• Legshots: **${legshots}**`
                        });
                    }
                    embed.addFields(fieldData);
                    embed.setAuthor({
                        name: `Recent Matches: ${decodeURIComponent(name)}#${tag}`
                    });
                    embed.setColor(
                        CypherNetworkConstants.DEFAULT_EMBED_COLOR()
                    );
                    embed.setFooter({
                        text: "Cypher Network",
                        iconURL: this.client.user?.displayAvatarURL()
                    });
                    embed.setTimestamp();
                    return void (await interaction.editReply({
                        embeds: [embed.toJSON()]
                    }));
                });
        } catch (e) {
            const embed = EmbedUtil.getErrorEmbed(
                "An error occurred while fetching competitive data."
            );
            return void (await interaction.editReply({ embeds: [embed] }));
        }
    }
}
