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

import Constants from "@app/Constants";

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
                        .addChoices(Constants.AGENTS())
                )
                .toJSON()
        );
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const agentName = interaction.options.getString("agent", true);
        await interaction.deferReply();

        try {
            const response = await fetch(
                `https://valorant-api.com/v1/agents?isPlayableCharacter=true`
            );
            const { data } = await response.json();

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

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            const embed = EmbedUtil.getErrorEmbed(
                "An error occurred while fetching agent data."
            );
            await interaction.editReply({ embeds: [embed] });
        }
    }
}
