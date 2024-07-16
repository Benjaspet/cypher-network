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

export default class MostRecentCommand
    extends Command
    implements ApplicationCommand
{
    private readonly client: Client;

    constructor(client: Client) {
        super("mostrecent", {
            name: "mostrecent",
            description: "Fetch the provided player's most recent match data.",
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

        const name = encodeURIComponent(interaction.options.getString("name")!);
        const tag = encodeURIComponent(interaction.options.getString("tag")!);
        const region = interaction.options.getString("region")!;
        await interaction.deferReply();
        try {
            await fetch(
                `https://api.henrikdev.xyz/valorant/v1/lifetime/matches/${region}/${name}/${tag}?size=1&api_key=HDEV-04d0ed17-947a-49c0-871a-41ca3314250d`
            )
                .then((response) => response.json())
                .then(async (res) => {
                    const { data } = res;
                    const match = data[0];
                    const map: string = match.meta.map.name;
                    const mode: string = match.meta.mode;
                    const season: string =
                        match.meta.season.short.toUpperCase();
                    const cluster: string = match.meta.cluster;
                    const playerTeam: string = match.stats.team;
                    const level: number = match.stats.level;
                    const character: string = match.stats.character.name;
                    const characterIcon: string = `https://media.valorant-api.com/agents/${match.stats.character.id}/displayicon.png`;
                    const score: number = match.stats.score;
                    const kills: number = match.stats.kills;
                    const deaths: number = match.stats.deaths;
                    const assists: number = match.stats.assists;
                    const headShots: number = match.stats.shots.head;
                    const bodyShots: number = match.stats.shots.body;
                    const legShots: number = match.stats.shots.leg;
                    const damageGiven: number = match.stats.damage.made;
                    const damageReceived: number = match.stats.damage.received;
                    const redScore: number = match.teams.red;
                    const blueScore: number = match.teams.blue;
                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: `Recent Match: ${decodeURIComponent(name)}#${tag}`,
                            iconURL: characterIcon
                        })
                        .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR())
                        .setDescription(
                            `• Mode: **${mode}**` +
                                `\n` +
                                `• Map: **${map}**` +
                                `\n` +
                                `• Season: **${season}**` +
                                `\n` +
                                `• Cluster: **${cluster}**` +
                                `\n` +
                                `• Team: **${playerTeam}**` +
                                `\n` +
                                `• Level: **${level}**` +
                                `\n` +
                                `• Character: **${character}**` +
                                `\n`
                        )
                        .addFields([
                            {
                                name: "Player Statistics",
                                value:
                                    `• Score: **${score}**` +
                                    `\n` +
                                    `• Kills: **${kills}**` +
                                    `\n` +
                                    `• Deaths: **${deaths}**` +
                                    `\n` +
                                    `• Assists: **${assists}**` +
                                    `\n` +
                                    `• Headshots: **${headShots}**` +
                                    `\n` +
                                    `• Bodyshots: **${bodyShots}**` +
                                    `\n` +
                                    `• Legshots: **${legShots}**` +
                                    `\n` +
                                    `• Damage Given: **${damageGiven}**` +
                                    `\n` +
                                    `• Damage Received: **${damageReceived}**`
                            },
                            {
                                name: "Final Score",
                                value:
                                    `• Red Team: **${redScore}**` +
                                    `\n` +
                                    `• Blue Team: **${blueScore}**`
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
