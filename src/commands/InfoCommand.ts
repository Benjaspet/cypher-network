import Command from "@structs/Command";
import { ACommand } from "@defs/ACommand";
import { Client, CommandInteraction, version } from "discord.js";
import EmbedUtil from "@utils/EmbedUtil";

import messages from "@app/messages.json";

/**
 * Returns a random Cypher quote.
 */
function random() {
    return messages[Math.floor(Math.random() * messages.length)];
}

class InfoCommand extends Command implements ACommand {
    constructor(
        private readonly client: Client
    ) {
        super("info", {
            name: "info",
            description: "Display basic bot information."
        });
    }

    public async execute(event: CommandInteraction): Promise<void> {
        if (!event.isChatInputCommand()) return;

        // Pre-fetch all information needed for the embed.
        const serverCount = this.client.guilds.cache.size;

        let userCount = 0;
        for (const [_id, guild] of this.client.guilds.cache) {
            userCount += guild.memberCount ?? 0;
        }

        const embed = EmbedUtil.getEmbed(this.client)
            .setAuthor({
                name: "Watching where you are..."
            })
            .setDescription(`"*${random()}*"`)
            .addFields([
                {
                    name: "Bot Information",
                    value: `• Powered by DJS ${version}\n` +
                    `• Developed by: Ponjo Studios\n` +
                    `• Server count: ${serverCount}\n` +
                    `• User count: ${userCount}`
                },
                {
                    name: "Links",
                    value: "• [Terms of Service](https://docs.benpetrillo.dev/cypher-network/tos.html)\n" +
                    "• [Privacy Policy](https://docs.benpetrillo.dev/cypher-network/privacy-policy.html)"
                }
            ])
            .toJSON();

        await event.reply({ embeds: [embed] });
    }
}

export default InfoCommand;
