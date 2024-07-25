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
    AutocompleteInteraction,
    Client, ColorResolvable,
    CommandInteraction, EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";

import ACommand from "@structs/ACommand";

import { ICommand } from "@defs/ICommand";

import fetch from "node-fetch";
import Config from "@structs/Config";

export default class ContentCommand extends ACommand implements ICommand {
    constructor(private readonly client: Client) {
        super(
            new SlashCommandBuilder()
                .setName("content")
                .setDescription(
                    "Provides the stuff we consider content for VALORANT"
                )
                .addStringOption(
                    (option) =>
                        option
                            .setName("buddy")
                            .setDescription("Gets the buddy from VALORANT")
                            .setAutocomplete(true)
                )
                .addStringOption(
                    (option) =>
                        option
                            .setName("card")
                            .setDescription("Gets the cards from VALORANT")
                            .setAutocomplete(true)
                )
                .toJSON()
        );
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const buddy: string = interaction.options.getString("buddy")!;
        const card: string = interaction.options.getString("card")!;

        if (buddy) {
            await fetch(`https://valorant-api.com/v1/buddies`)
                .then((response) => response.json())
                .then(async ({ data }) => {
                    const found = data.find(
                        (found: { displayName: string }) =>
                            found.displayName === buddy
                    );
                    const buddyImage = found.displayIcon;

                    const embed = new EmbedBuilder()
                        .setColor(Config.get("embedColor") as ColorResolvable)
                        .setImage(buddyImage)
                        .setFooter({ text: buddy, iconURL: buddyImage})

                    await interaction.reply({ embeds: [embed] });
                });
        } else if (card) {
            await fetch(`https://valorant-api.com/v1/playercards`)
                .then((response) => response.json())
                .then(async ({ data }) => {
                    const found = data.find(
                        (found: { displayName: string }) =>
                            found.displayName === card
                    );

                    const embed = new EmbedBuilder()
                        .setColor(Config.get("embedColor") as ColorResolvable)
                        .setAuthor({ name: card, iconURL: found.displayIcon })
                        .setImage(found.wideArt)
                        .toJSON();

                    await interaction.reply({ embeds: [embed] });
                });
        }
    }

    private reduceTo25Elements<T>(list: T[]): T[] {
        return list.length > 25 ? list.slice(0, 25) : list;
    }

    private shuffle<T>(list: T[]): T[] {
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    public async autocomplete(inter: AutocompleteInteraction): Promise<void> {
        if (!inter.isAutocomplete()) return;
        const option = inter.options.getFocused().toLowerCase();
        const focused = inter.options.getFocused(true).name;
        switch (focused) {
            case "buddy":
                try {
                    fetch(`https://valorant-api.com/v1/buddies`)
                        .then(response => response.json())
                        .then(data => {
                            const buddies = data.data;
                            const filtered = buddies.filter(
                                (buddy: { displayName: string }) =>
                                    buddy.displayName.toLowerCase().startsWith(option)
                            );
                            if (filtered.length === 0) {
                                return void inter.respond([
                                    { name: "No buddies found.", value: "a" }
                                ]);
                            }
                            const options = this.reduceTo25Elements(filtered).map(
                                (buddy: { displayName: string }) => ({
                                    name: buddy.displayName,
                                    value: buddy.displayName
                                })
                            );
                            return void inter.respond(options);
                        });
                } catch (e) {
                    console.log(e);
                    return void inter.respond([
                        { name: "An error occurred.", value: "a" }
                    ]);
                }
                break;
            case "card":
                try {
                    fetch(`https://valorant-api.com/v1/playercards`)
                        .then(response => response.json())
                        .then(data => {
                            const cards = this.shuffle(this.reduceTo25Elements(data.data));
                            const filtered = cards.filter(
                                (card: { displayName: string }) =>
                                    card.displayName.toLowerCase().startsWith(option)
                            );
                            if (filtered.length === 0) {
                                return void inter.respond([
                                    { name: "No cards found.", value: "a" }
                                ]);
                            }
                            const options = this.reduceTo25Elements(filtered).map(
                                (card: { displayName: string }) => ({
                                    name: card.displayName,
                                    value: card.displayName
                                })
                            );
                            return void inter.respond(options);
                        });
                } catch (e) {
                    console.log(e);
                    return void inter.respond([
                        { name: "An error occurred.", value: "a" }
                    ]);
                }
                break;
        }
    }
}
