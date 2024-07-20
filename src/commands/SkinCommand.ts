import { SlashCommandBuilder } from '@discordjs/builders';
import {
    CommandInteraction,
    Client,
    EmbedBuilder,
    AutocompleteInteraction,
    AttachmentBuilder
} from "discord.js";
import ACommand from "@structs/ACommand";
import { ICommand } from "@defs/ICommand";
import EmbedUtil from "@utils/EmbedUtil";
import CypherNetworkConstants from "@app/Constants";
import axios from "axios";
import * as fs from "node:fs";

import path from 'path';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'child_process';

async function downloadVideo(url: string, outputPath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(outputPath);
    return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function compressAndTrimVideo(inputPath: string, outputPath: string, duration: number) {
    return new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn(ffmpegPath.path, [
            '-i', inputPath,
            '-vf', 'scale=-2:720', // downscaling
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-b:v', '1M', // video bitrate
            '-maxrate', '1M',
            '-bufsize', '2M',
            '-c:a', 'aac',
            '-b:a', '128k', // audio bitrate
            '-t', duration.toString(),
            '-y',
            outputPath
        ]);

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg process exited with code ${code}`));
            }
        });

        ffmpeg.on('error', (err) => {
            reject(err);
        });
    });
}

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
                    option.setName("variant")
                        .setDescription("The skin's variant.")
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(4))
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
            await interaction.deferReply();
            await fetch(`https://valorant-api.com/v1/weapons/skins`)
                .then(response => response.json())
                .then(async data => {
                    const skins = data.data;
                    const found = skins.find(s => s.displayName === skin);
                    console.log(found)
                    const chroma = found.chromas[variant - 1];

                    if (preview) {
                        console.log(chroma.previewVideo)
                        const tempInputPath = path.join(__dirname, 'tempInput.mp4');
                        const tempOutputPath = path.join(__dirname, 'tempOutput.mp4');

                        try {
                            await downloadVideo(chroma.streamedVideo, tempInputPath);
                            await compressAndTrimVideo(tempInputPath, tempOutputPath, 45);

                            const videoBuffer = fs.readFileSync(tempOutputPath);
                            const attachment = new AttachmentBuilder(videoBuffer, { name: 'compressed.mp4' });

                            const embed = new EmbedBuilder()
                                .setImage(chroma.fullRender)
                                .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR())

                            await interaction.editReply({
                                embeds: [embed],
                                files: [attachment]
                            });

                            fs.unlinkSync(tempInputPath);
                            fs.unlinkSync(tempOutputPath);
                        } catch (error) {
                            console.error('Error processing video:', error);
                            await interaction.editReply({ content: 'Error processing the preview video.' });
                        }
                    } else {
                        const embed = new EmbedBuilder()
                            .setImage(chroma.fullRender)
                            .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR())

                        return void interaction.editReply({
                            embeds: [embed]
                        });
                    }
                })
        } catch (e) {
            console.log(e)
            const embed = EmbedUtil.getErrorEmbed(
                "Could not find a skin with that level/variant."
            );
            return void (await interaction.editReply({ embeds: [embed] }));
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
