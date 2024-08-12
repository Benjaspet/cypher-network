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

export default class CompetitiveCommand extends ACommand implements ICommand {
    constructor(private readonly client: Client) {
        super(
            new SlashCommandBuilder()
                .setName("competitive")
                .setDescription("Fetch a player's recent competitive matches.")
                .addStringOption((option) =>
                    option
                        .setName("name")
                        .setDescription("The player's name.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("tag")
                        .setDescription("The player's tag.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("region")
                        .setDescription("The player's region.")
                        .setRequired(true)
                        .addChoices(
                            { name: "North America", value: "na" },
                            { name: "Europe", value: "eu" },
                            { name: "Korea", value: "kr" },
                            { name: "Brazil", value: "br" },
                            { name: "Latin America", value: "latam" },
                            { name: "Asia-Pacific", value: "ap" }
                        )
                )
                .toJSON()
        );
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
                `https://api.henrikdev.xyz/valorant/v1/mmr-history/${region}/${name}/${tag}?api_key=${Constants.API_KEY}`
            )
                .then((response) => response.json())
                .then(async (res) => {
                    console.log(res);
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
            console.log(e)
            const embed = EmbedUtil.getErrorEmbed(
                "An error occurred while fetching competitive data."
            );
            return void (await interaction.editReply({ embeds: [embed] }));
        }
    }
}
