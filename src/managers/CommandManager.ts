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
import { Client, Collection } from "discord.js";

import AccountCommand from "@commands/AccountCommand";
import CompetitiveCommand from "@commands/CompetitiveCommand";
import HistoryCommand from "@commands/HistoryCommand";
import MatchCommand from "@commands/MatchCommand";
import MostRecentCommand from "@commands/MostRecentCommand";

import Command from "@structs/Command";

import { ApplicationCommand } from "@defs/ApplicationCommand";

export default class CommandManager {
    public static commands: Collection<string, ApplicationCommand> =
        new Collection<string, ApplicationCommand>();
    private readonly client: Client;

    constructor(client: Client) {
        this.client = client;
        CommandManager.registerCommands([
            new AccountCommand(client),
            new CompetitiveCommand(client),
            new HistoryCommand(client),
            new MatchCommand(client),
            new MostRecentCommand(client)
        ]);
    }

    private static registerCommands(commands: Command[]): void {
        for (const command of commands) {
            CommandManager.commands.set(command.getName(), command);
        }
    }
}
