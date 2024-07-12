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
    MessageEmbed
} from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

import CypherNetworkConstants from "@constants/CypherNetworkConstants";

import Command from "@structs/Command";

import EmbedUtil from "@utils/EmbedUtil";

import { ApplicationCommand } from "@defs/ApplicationCommand";

import fetch from "node-fetch";

export default class AccountCommand
    extends Command
    implements ApplicationCommand
{
    private readonly client: Client;

    constructor(client: Client) {
        super("account", {
            name: "account",
            description: "Get VALORANT account details.",
            options: [
                {
                    name: "name",
                    description: "The user's name'.",
                    type: ApplicationCommandOptionTypes.STRING,
                    required: true
                },
                {
                    name: "tag",
                    description: "The user's tag.",
                    type: ApplicationCommandOptionTypes.STRING,
                    required: true
                },
                {
                    name: "card",
                    description: "Display only the user's card data.",
                    type: ApplicationCommandOptionTypes.BOOLEAN,
                    required: false
                }
            ]
        });
        this.client = client;
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const name: string = encodeURIComponent(
            interaction.options.getString("name")
        );
        const tag: string = encodeURIComponent(
            interaction.options.getString("tag")
        );
        const card: boolean = interaction.options.getBoolean("card") || false;
        await interaction.deferReply();
        try {
            await fetch(
                `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}?api_key=HDEV-04d0ed17-947a-49c0-871a-41ca3314250d`
            )
                .then((response) => response.json())
                .then(async (res) => {
                    const { data } = res;
                    const puuid: string = data.puuid;
                    const region: string = data.region.toUpperCase();
                    const accountLevel: number = data.account_level;
                    const smallCard: string = data.card.small;
                    const largeCard: string = data.card.large;
                    const wideCard: string = data.card.wide;
                    const cardId: string = data.card.id;
                    if (card) {
                        const embed: MessageEmbed = new MessageEmbed()
                            .setAuthor({
                                name: `${data.name}#${data.tag} [Level ${accountLevel}]`,
                                iconURL: smallCard
                            })
                            .setColor(
                                CypherNetworkConstants.DEFAULT_EMBED_COLOR
                            )
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
                                iconURL: this.client.user.displayAvatarURL()
                            })
                            .setTimestamp();
                        return void (await interaction.editReply({
                            embeds: [embed]
                        }));
                    }
                    const embed: MessageEmbed = new MessageEmbed()
                        .setAuthor({
                            name: `${data.name}#${data.tag} [Level ${accountLevel}]`,
                            iconURL: smallCard
                        })
                        .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR)
                        .setImage(wideCard)
                        .setDescription(
                            `• Region: **${region}**` +
                                `\n` +
                                `• Account Level: **${accountLevel}**` +
                                `\n` +
                                `• PUUID: **${puuid}**` +
                                `\n` +
                                `• Card ID: **${cardId}**`
                        )
                        .setFooter({
                            text: "Cypher Network",
                            iconURL: this.client.user.displayAvatarURL()
                        })
                        .setTimestamp();
                    return void (await interaction.editReply({
                        embeds: [embed]
                    }));
                });
        } catch (e) {
            console.log(e);
            return void (await interaction.editReply({
                embeds: [EmbedUtil.getErrorEmbed("An error occurred.")]
            }));
        }
    }

    public getName(): string {
        return this.name;
    }

    public getCommandData(): ApplicationCommandData {
        return this.data;
    }
}
