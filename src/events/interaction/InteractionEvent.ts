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
import { Client, ClientEvents, GuildMember, Interaction } from "discord.js";

import CommandManager from "@managers/CommandManager";

import EmbedUtil from "@utils/EmbedUtil";

import { IEvent } from "@defs/IEvent";

import { logger } from "@app/CypherNetwork";

export default class InteractionEvent implements IEvent {
    public name: keyof ClientEvents;
    public once: boolean;
    public readonly client: Client;

    constructor(client: Client, name: keyof ClientEvents, once: boolean) {
        this.name = name;
        this.once = once;
        this.client = client;
    }

    public async execute(inter: Interaction): Promise<void> {
        if (inter.inGuild() && inter.member instanceof GuildMember) {
            if (inter.isCommand()) {
                const name: string = inter.commandName;
                const command = CommandManager.commands.get(name);
                if (command != undefined) {
                    command.execute(inter);
                }
            } else if (inter.isAutocomplete()) {
                logger.info("Autocomplete event.");
                const focusedName: string = inter.commandName;
                const command = CommandManager.commands.get(focusedName);
                if (command != undefined) {
                    command.autocomplete(inter);
                }
            }
        } else {
            const embed = EmbedUtil.getDefaultEmbed(
                "Please run this command in a guild."
            );
            if (inter.isCommand() || inter.isButton()) {
                return void (await inter.reply({ embeds: [embed] }));
            } else return;
        }
    }
}
