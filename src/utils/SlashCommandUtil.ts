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
import { Client } from "discord.js";

import AccountCommand from "@commands/AccountCommand";
import CompetitiveCommand from "@commands/CompetitiveCommand";
import HistoryCommand from "@commands/HistoryCommand";
import MatchCommand from "@commands/MatchCommand";
import MostRecentCommand from "@commands/MostRecentCommand";

export default class SlashCommandUtil {
    public static getAllSlashCommandData(client: Client): object[] {
        return [
            new AccountCommand(client).getCommandData(),
            new CompetitiveCommand(client).getCommandData(),
            new HistoryCommand(client).getCommandData(),
            new MatchCommand(client).getCommandData(),
            new MostRecentCommand(client).getCommandData()
        ];
    }
}
