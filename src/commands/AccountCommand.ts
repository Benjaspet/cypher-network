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
import HenrikAPI from "@structs/HenrikAPI";

import EmbedUtil from "@utils/EmbedUtil";

import { ICommand } from "@defs/ICommand";

import CypherNetworkConstants from "@app/Constants";

export default class AccountCommand extends ACommand implements ICommand {
    constructor(private readonly client: Client) {
        super(
            new SlashCommandBuilder()
                .setName("account")
                .setDescription("Get VALORANT account details.")
                .addStringOption((option) =>
                    option
                        .setName("name")
                        .setDescription("The user's name'.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("tag")
                        .setDescription("The user's tag.")
                        .setRequired(true)
                )
                .addBooleanOption((option) =>
                    option
                        .setName("card")
                        .setDescription("Display only the user's card data.")
                        .setRequired(false)
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

        const card: boolean = interaction.options.getBoolean("card") || false;
        await interaction.deferReply();
        try {
            const {
                puuid,
                region,
                account_level,
                card: {
                    wide: wideCard,
                    small: smallCard,
                    large: largeCard,
                    id: cardId
                }
            } = await HenrikAPI.getAccount(name, tag);

            if (card) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${name}#${tag} [Level ${account_level}]`,
                        iconURL: smallCard
                    })
                    .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR())
                    .setImage(wideCard)
                    .setThumbnail(largeCard)
                    .setDescription(
                        `• Small Card Link: [click here!](${smallCard})` +
                            `\n` +
                            `• Large Card Link: [click here!](${largeCard})` +
                            `\n` +
                            `• Wide Card Link: [click here!](${wideCard})`
                    )
                    .setFooter({
                        text: "Cypher Network",
                        iconURL: this.client.user?.displayAvatarURL()
                    })
                    .setTimestamp()
                    .toJSON();

                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${name}#${tag} [Level ${account_level}]`,
                        iconURL: smallCard
                    })
                    .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR())
                    .setImage(wideCard)
                    .setDescription(
                        `• Region: **${region}**` +
                            `\n` +
                            `• Account Level: **${account_level}**` +
                            `\n` +
                            `• PUUID: **${puuid}**` +
                            `\n` +
                            `• Card ID: **${cardId}**`
                    )
                    .setFooter({
                        text: "Cypher Network",
                        iconURL: this.client.user?.displayAvatarURL()
                    })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (e) {
            console.log(e);
            await interaction.editReply({
                embeds: [EmbedUtil.getErrorEmbed("An error occurred.")]
            });
        }
    }
}
