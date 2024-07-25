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
    SlashCommandBuilder,
} from "discord.js";

import ACommand from "@structs/ACommand";

import EmbedUtil from "@utils/EmbedUtil";

import { ICommand } from "@defs/ICommand";

import fetch from "node-fetch";

export default class ContentCommand extends ACommand implements ICommand {

    constructor(private readonly client: Client) {
        super(
            new SlashCommandBuilder()
                .setName("content")
                .setDescription("Provides the stuff we consider content for VALORANT")
                .addStringOption(option =>
                        option.setName("buddy")
                            .setDescription("Gets the buddy from VALORANT")
                    //.setAutocomplete(true)
                )
                .addStringOption(option =>
                        option.setName("cards")
                            .setDescription("Gets the cards from VALORANT")
                    //.setAutocomplete(true)
                )
                .toJSON()
        );
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const buddy: string = interaction.options.getString("buddy")!;
        const card: string = interaction.options.getString("cards")!;

        if (buddy) {
            await fetch(`https://valorant-api.com/v1/buddies`)
                .then(response => response.json())
                .then(async ({data}) => {
                    const found = data.find(
                        (found: { displayName: string }) => found.displayName === buddy,
                    );
                    const buddyImage = found.displayIcon;

                    const embed = EmbedUtil.getEmbed(this.client)
                        .setTitle(`${buddy}`)
                        .setImage(buddyImage)
                        .toJSON();

                    await interaction.reply({ embeds: [embed] });
                });
        } else if (card) {
            await fetch(`https://valorant-api.com/v1/playercards`)
                .then(response => response.json())
                .then(async ({data}) => {
                    const found = data.find(
                        (found: { displayName: string }) => found.displayName === card,
                    );
                    const cardImage = found.displayIcon;

                    const embed = EmbedUtil.getEmbed(this.client)
                        .setTitle(`Player Card: ${card}`)
                        .setImage(cardImage)
                        .toJSON();

                    await interaction.reply({ embeds: [embed] });
                });
        }
    }
}
