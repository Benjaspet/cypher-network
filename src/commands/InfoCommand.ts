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
    version
} from "discord.js";

import ACommand from "@structs/ACommand";

import EmbedUtil from "@utils/EmbedUtil";

import { ICommand } from "@defs/ICommand";

import messages from "@app/messages.json";

/**
 * Returns a random Cypher quote.
 */
function random() {
    return messages[Math.floor(Math.random() * messages.length)];
}

class InfoCommand extends ACommand implements ICommand {
    constructor(private readonly client: Client) {
        super(
            new SlashCommandBuilder()
                .setName("info")
                .setDescription("Get information about the bot.")
                .toJSON()
        );
    }

    public async execute(event: CommandInteraction): Promise<void> {
        if (!event.isChatInputCommand()) return;

        // Pre-fetch all information needed for the embed.
        const serverCount = this.client.guilds.cache.size;

        const embed = EmbedUtil.getEmbed(this.client)
            .setAuthor({
                name: "Watching where you are..."
            })
            .setDescription(`"*${random()}*"`)
            .addFields([
                {
                    name: "Bot Information",
                    value:
                        `• Powered by DJS ${version}\n` +
                        `• Developed by: Ponjo Studios\n` +
                        `• Server count: ${serverCount}\n`
                },
                {
                    name: "Links",
                    value:
                        "• [Terms of Service](https://docs.benpetrillo.dev/cypher-network/tos.html)\n" +
                        "• [Privacy Policy](https://docs.benpetrillo.dev/cypher-network/privacy-policy.html)"
                }
            ])
            .toJSON();

        await event.reply({ embeds: [embed] });
    }
}

export default InfoCommand;
