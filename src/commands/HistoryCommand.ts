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
    ApplicationCommandData, Client, CommandInteraction,
    EmbedFieldData, MessageEmbed} from "discord.js";
import {ApplicationCommand} from "../types/ApplicationCommand";
import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import Command from "../structs/Command";
import CypherNetworkConstants from "../constants/CypherNetworkConstants";
import EmbedUtil from "../utils/EmbedUtil";
import fetch from "node-fetch";

export default class HistoryCommand extends Command implements ApplicationCommand {

    private readonly client: Client;

    constructor(client: Client) {
        super("history", {
            name: "history",
            description: "Fetch the provided player's most recent matches.",
            options: [
                {
                    name: "name",
                    description: "The player's name.",
                    type: ApplicationCommandOptionTypes.STRING,
                    required: true
                },
                {
                    name: "tag",
                    description: "The player's tag.",
                    type: ApplicationCommandOptionTypes.STRING,
                    required: true
                },
                {
                    name: "region",
                    description: "The region of this player.",
                    type: ApplicationCommandOptionTypes.STRING,
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
        const name: string = encodeURIComponent(interaction.options.getString("name"));
        const tag: string = encodeURIComponent(interaction.options.getString("tag"));
        const region: string = interaction.options.getString("region");
        await interaction.deferReply();
        try {
            await fetch(`https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}?api_key=HDEV-04d0ed17-947a-49c0-871a-41ca3314250d`)
                .then((response) => response.json())
                .then(async res => {
                    const {data} = res;
                    const matches: any[] = data;
                    let i = matches.length > 10 ? 10 : matches.length;
                    let fieldData: EmbedFieldData[] = [];
                    let embed: MessageEmbed = new MessageEmbed();
                    for (let j = 0; j < i; j++) {
                        const currentMatch = matches[j];
                        const p: any = currentMatch.players.all_players.find((player: any) => player.name === name);
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
                            value: `• K/D/A: **${kills} / ${deaths} / ${assists}**` + `\n`
                                + `• Score: **${score}**` + `\n`
                                + `• Headshots: **${headshots}**` + `\n`
                                + `• Bodyshots: **${bodyshots}**` + `\n`
                                + `• Legshots: **${legshots}**`
                        });
                    }
                    embed.addFields(fieldData);
                    embed.setAuthor({name: `Recent Matches: ${decodeURIComponent(name)}#${tag}`});
                    embed.setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR);
                    embed.setFooter({text: "Cypher Network", iconURL: this.client.user.displayAvatarURL()});
                    embed.setTimestamp();
                    return void await interaction.editReply({embeds: [embed]});
                });
        } catch (e) {
            const embed: MessageEmbed = EmbedUtil.getErrorEmbed("An error occurred while fetching competitive data.");
            return void await interaction.editReply({embeds: [embed]});
        }
    }

    public getName(): string {
        return this.name;
    }

    public getCommandData(): ApplicationCommandData {
        return this.data;
    }
}