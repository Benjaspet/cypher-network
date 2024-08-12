/*
 * Copyright © 2024 Ben Petrillo, Kobe Do, Tridip Paul.
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
 * All portions of this software are available for public use,
 * provided that credit is given to the original author(s).
 */
import {
    Client,
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";

import ACommand from "@structs/ACommand";

import EmbedUtil from "@utils/EmbedUtil";

import { ICommand } from "@defs/ICommand";

import CypherNetworkConstants from "@app/Constants";

import fetch from "node-fetch";
import Constants from "@app/Constants";

export default class MatchCommand extends ACommand implements ICommand {
    constructor(private readonly client: Client) {
        super(
            new SlashCommandBuilder()
                .setName("match")
                .setDescription("Get VALORANT match data by ID.")
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("The match ID.")
                        .setRequired(true)
                )
                .toJSON()
        );
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const matchId = interaction.options.getString("id")!;
        await interaction.deferReply();
        try {
            await fetch(
                `https://api.henrikdev.xyz/valorant/v2/match/${matchId}?api_key=${Constants.API_KEY}`
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
