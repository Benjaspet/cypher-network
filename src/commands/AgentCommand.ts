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
import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";

import ACommand from "@structs/ACommand";

import EmbedUtil from "@utils/EmbedUtil";

import { ICommand } from "@defs/ICommand";

import fetch from "node-fetch";

export default class AgentCommand extends ACommand implements ICommand {
    constructor(private readonly client: Client) {
        super(
            new SlashCommandBuilder()
                .setName("agent")
                .setDescription("Fetch agent details from VALORANT.")
                .addStringOption((option) =>
                    option
                        .setName("agent")
                        .setDescription("The name of the agent.")
                        .setRequired(true)
                        .addChoices(
                            { name: "Brimstone", value: "Brimstone" },
                            { name: "Phoenix", value: "Phoenix" },
                            { name: "Sage", value: "Sage" },
                            { name: "Sova", value: "Sova" },
                            { name: "Viper", value: "Viper" },
                            { name: "Cypher", value: "Cypher" },
                            { name: "Reyna", value: "Reyna" },
                            { name: "Killjoy", value: "Killjoy" },
                            { name: "Breach", value: "Breach" },
                            { name: "Omen", value: "Omen" },
                            { name: "Jett", value: "Jett" },
                            { name: "Raze", value: "Raze" },
                            { name: "Skye", value: "Skye" },
                            { name: "Yoru", value: "Yoru" },
                            { name: "Astra", value: "Astra" },
                            { name: "KAY/O", value: "KAY/O" },
                            { name: "Chamber", value: "Chamber" },
                            { name: "Neon", value: "Neon" },
                            { name: "Fade", value: "Fade" },
                            { name: "Harbor", value: "Harbor" },
                            { name: "Gekko", value: "Gekko" },
                            { name: "Deadlock", value: "Deadlock" },
                            { name: "Iso", value: "Iso" },
                            { name: "Clove", value: "Clove" }
                        )
                )
                .toJSON()
        );
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;
        const agentName = interaction.options.getString("agent", true);
        await interaction.deferReply();
        try {
            await fetch(
                `https://valorant-api.com/v1/agents?isPlayableCharacter=true`
            )
                .then((response) => response.json())
                .then(async (res) => {
                    const { data } = res;
                    const agent = data.find(
                        (agent: { displayName: string }) =>
                            agent.displayName === agentName
                    );
                    const embed = EmbedUtil.getEmbed(this.client)
                        .setAuthor({
                            name: agent.displayName,
                            iconURL: agent.displayIcon
                        })
                        .setThumbnail(agent.displayIcon)
                        .setDescription(agent.description)
                        .addFields([
                            {
                                name: "Role",
                                value: agent.role.displayName,
                                inline: true
                            }
                        ]);

                    agent.abilities.forEach((ability: any) => {
                        embed.addFields([
                            {
                                name: ability.displayName,
                                value: ability.description
                            }
                        ]);
                    });

                    return void (await interaction.editReply({
                        embeds: [embed]
                    }));
                });
        } catch (e) {
            const embed = EmbedUtil.getErrorEmbed(
                "An error occurred while fetching agent data."
            );
            return void (await interaction.editReply({ embeds: [embed] }));
        }
    }
}
