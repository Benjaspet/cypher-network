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
import {AutocompleteInteraction, Client, CommandInteraction, SlashCommandBuilder} from "discord.js";

import ACommand from "@structs/ACommand";

import EmbedUtil from "@utils/EmbedUtil";

import { ICommand } from "@defs/ICommand";

import fetch from "node-fetch";

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
                            .setName("playercard")
                            .setDescription("Gets the cards from VALORANT")
                            .setAutocomplete(true)
                )
                .toJSON()
        );
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;
        const buddy: string = interaction.options.getString("buddy")!;
        const card: string = interaction.options.getString("playercard")!;

        try {
            if (buddy) {
                await fetch(`https://valorant-api.com/v1/buddies`)
                    .then((response) => response.json())
                    .then(async ({ data }) => {
                        const found = data.find(
                            (found: { displayName: string }) =>
                                found.displayName === buddy
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
                    .then((response) => response.json())
                    .then(async ({ data }) => {
                        const found = data.find(
                            (found: { displayName: string }) =>
                                found.displayName === card
                        );
                        const embed = EmbedUtil.getEmbed(this.client)
                            .setAuthor({
                                name: found.displayName,
                                iconURL: found.smallArt
                            })
                            .setImage(found.wideArt)
                            .toJSON();
                        await interaction.reply({ embeds: [embed] });
                    });
            }
        } catch (e) {
            console.log(e);
            return void interaction.reply({
                content: "An error occurred."
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
        if(!inter.isAutocomplete()) return;
        const focused: string = inter.options.getFocused().toLowerCase();
        const commandFocus: string = inter.options.getFocused(true).name;
        try {
            let apiFocus: string = "";
            switch (commandFocus) {
                case "buddy":
                    apiFocus = "buddies";
                    break;
                case "playercard":
                    apiFocus = "playercards";
                    break;
            }
            await fetch(`https://valorant-api.com/v1/${apiFocus}`)
                .then((response) => response.json())
                .then((data) => {
                    const items: Types[] = this.shuffle(data.data);
                    const filtered = items.filter(
                        (item: Types) => item.displayName.toLowerCase().startsWith(focused)
                    );
                    const options = this.reduceTo25Elements(filtered).map(
                        (item: Types) => ({
                            name: item.displayName,
                            value: item.displayName
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
    }
}
