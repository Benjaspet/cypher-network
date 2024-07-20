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
import { ApplicationCommandData, Client, Collection } from "discord.js";

import AccountCommand from "@commands/AccountCommand";
import AgentCommand from "@commands/AgentCommand";
import CompetitiveCommand from "@commands/CompetitiveCommand";
import HistoryCommand from "@commands/HistoryCommand";
import InfoCommand from "@commands/InfoCommand";
import MatchCommand from "@commands/MatchCommand";
import MostRecentCommand from "@commands/MostRecentCommand";

import Command from "@structs/Command";

import { ACommand } from "@defs/ACommand";

export default class CommandManager {
    public static commands: Collection<string, ACommand> = new Collection<
        string,
        ACommand
    >();

    constructor(client: Client) {
        CommandManager.registerCommands([
            new AccountCommand(client),
            new CompetitiveCommand(client),
            new HistoryCommand(client),
            new MatchCommand(client),
            new MostRecentCommand(client),
            new InfoCommand(client),
            new AgentCommand(client)
        ]);
    }

    /**
     * Returns the application command data for all known commands.
     */
    public static getCommands(): ApplicationCommandData[] {
        return CommandManager.commands.map((cmd) => cmd.getCommandData());
    }

    private static registerCommands(commands: Command[]): void {
        for (const command of commands) {
            CommandManager.commands.set(command.getName(), command);
        }
    }
}
