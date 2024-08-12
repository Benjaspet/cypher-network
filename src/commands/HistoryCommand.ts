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
import Constants from "@app/Constants";

import fetch from "node-fetch";

export default class HistoryCommand extends ACommand implements ICommand {
    constructor(private readonly client: Client) {
        super(
            new SlashCommandBuilder()
                .setName("history")
                .setDescription("Fetch a player's recent match history.")
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
        const region: string = interaction.options.getString("region")!;
        await interaction.deferReply();
        try {
            await fetch(
                `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}?api_key=${Constants.API_KEY}`
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
