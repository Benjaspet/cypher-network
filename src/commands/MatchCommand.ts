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

export default class MatchCommand
    extends Command
    implements ACommand
{
    private readonly client: Client;

    constructor(client: Client) {
        super("match", {
            name: "match",
            description: "Get VALORANT match data by match ID.",
            options: [
                {
                    name: "id",
                    description: "The ID of the match.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        });
        this.client = client;
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const matchId = interaction.options.getString("id")!;
        await interaction.deferReply();
        try {
            await fetch(
                `https://api.henrikdev.xyz/valorant/v2/match/${matchId}?api_key=HDEV-04d0ed17-947a-49c0-871a-41ca3314250d`
            )
                .then((response) => response.json())
                .then(async (res) => {
                    const { data } = res;
                    const preparedFieldData = [];
                    for (const player of data.players.all_players) {
                        preparedFieldData.push({
                            name: `Player: ${player.name}#${player.tag}`,
                            value:
                                `• Agent: **${player.character}**` +
                                `\n` +
                                `• Level: **${player.level}**` +
                                `\n` +
                                `• Score: **${player.stats.score}**` +
                                `\n` +
                                `• K/D/A: **${player.stats.kills} / ${player.stats.deaths} / ${player.stats.assists}**` +
                                `\n` +
                                `• Head/Body/Legshots: **${player.stats.headshots} / ${player.stats.bodyshots} / ${player.stats.legshots}**` +
                                `\n` +
                                `• Damage (Given/Taken): **${player.damage_made} / ${player.damage_received}**` +
                                `\n` +
                                `• Small Card: [**click here!**](${player.assets.card.small})` +
                                `\n` +
                                `• Large Card: [**click here!**](${player.assets.card.large})` +
                                `\n` +
                                `• Agent Image: [**click here!**](${player.assets.agent.small})` +
                                `\n`
                        });
                    }
                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: `Match Data: ${data.metadata.mode} [${data.metadata.region.toUpperCase()}]`,
                            iconURL:
                                data.players.all_players[0].assets.agent.small
                        })
                        .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR())
                        .setDescription(
                            `• Map: **${data.metadata.map}**` +
                                `\n` +
                                `• Duration: **${Math.floor(data.metadata.game_length / 60)} minutes**` +
                                `\n` +
                                `• Rounds Played: **${data.metadata.rounds_played}**` +
                                `\n` +
                                `• Mode: **${data.metadata.mode}**` +
                                `\n` +
                                `• Queue Type: **${data.metadata.queue}**` +
                                `\n` +
                                `• Region: **${data.metadata.region.toUpperCase()}**` +
                                `\n` +
                                `• Region Cluster: **${data.metadata.cluster}**`
                        )

                        .addFields(preparedFieldData)
                        .setThumbnail(
                            data.players.all_players[0].assets.card.small
                        )
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
            console.log(e);
            const embed = EmbedUtil.getErrorEmbed(
                "An error occurred while match competitive data."
            );
            return void (await interaction.editReply({ embeds: [embed] }));
        }
    }
}
