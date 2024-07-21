import { SlashCommandBuilder } from '@discordjs/builders';
import {
    CommandInteraction,
    Client,
    EmbedBuilder,
    AutocompleteInteraction
} from "discord.js";
import ACommand from "@structs/ACommand";
import { ICommand } from "@defs/ICommand";
import EmbedUtil from "@utils/EmbedUtil";
import CypherNetworkConstants from "@app/Constants";

import config from "../../config.json";
import Config from "@structs/Config";

export default class SkinCommand extends ACommand implements ICommand {

    constructor(private readonly client: Client) {
        super(
            new SlashCommandBuilder()
                .setName("skin")
                .setDescription("View a specific weapon skin.")
                .addStringOption(option =>
                    option.setName("skin")
                        .setDescription("The skin to search for.")
                        .setRequired(true)
                        .setAutocomplete(true))
                .addNumberOption(option =>
                    option.setName("level")
                        .setDescription("The skin's level.")
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(5))
                .addBooleanOption(option =>
                    option.setName("preview")
                        .setDescription("View the skin preview?")
                        .setRequired(false)
                )
                .toJSON()
        );
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;
        try {
            const skin: string = interaction.options.getString("skin")!;
            const variant: number = interaction.options.getNumber("variant")!;
            const preview: boolean = interaction.options.getBoolean("preview") || false;
            await fetch(`https://valorant-api.com/v1/weapons/skins`)
                .then(response => response.json())
                .then(async data => {
                    const skins = data.data;
                    const found = skins.find(s => s.displayName === skin);
                    // console.log(found);
                    const chroma = found.levels[variant - 1];

                    if (preview) {

                        const link = encodeURIComponent(chroma.streamedVideo);
                        const skinName = encodeURIComponent(chroma.displayName);

                        let host = Config.get("web").host;
                        if (config.web.deployed) {
                            host += config.web.port;
                        }

                        const uri = `${host}/api/v1/preview?vid=${link}&name=${skinName}`;

                        return void interaction.reply({
                            content: `[⠀](${uri})`
                        });

                    } else {
                        const embed = new EmbedBuilder()
                            .setImage(chroma.fullRender)
                            .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR())

                        return void interaction.reply({
                            embeds: [embed]
                        });
                    }
                })
        } catch (e) {
            console.log(e)
            const embed = EmbedUtil.getErrorEmbed(
                "Could not find a skin with that level/variant."
            );
            return void (await interaction.reply({ embeds: [embed] }));
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
        const focused: string = inter.options.getFocused().toLowerCase();
        try {
            await fetch(`https://valorant-api.com/v1/weapons/skins`)
                .then(response => response.json())
                .then(data => {
                    const skins = this.shuffle(data.data);
                    const filtered = skins.filter(
                        (skin: { displayName: string }) => skin.displayName.toLowerCase().startsWith(focused)
                    );
                    const options = this.reduceTo25Elements(filtered).map((skin: { displayName: string }) => ({
                        name: skin.displayName,
                        value: skin.displayName,
                    }));
                    return void inter.respond(options);
                });
        } catch (e) {
            console.log(e)
            return void inter.respond([ { name: "An error occurred.", value: "a" } ]);
        }
    }
}
