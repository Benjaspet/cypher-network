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
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";

import { ICommand } from "@defs/ICommand";

import { logger } from "@app/CypherNetwork";

export type InteractionCommandData =
    RESTPostAPIChatInputApplicationCommandsJSONBody;

export default abstract class ACommand implements ICommand {
    protected constructor(protected readonly data: InteractionCommandData) {}

    /**
     * Run the slash command.
     * @param event The CommandInteraction object.
     * @return Promise<void>
     */

    abstract execute(event: ChatInputCommandInteraction): Promise<void>;

    async autocomplete(_interaction: AutocompleteInteraction): Promise<void> {
        const name: string = this.getName();
        const cased: string = name.charAt(0).toUpperCase() + name.slice(1);
        const commandFile: string = `${cased}Command.ts`;
        void logger.debug(`Autocomplete not implemented for ${commandFile}.`);
    }

    /**
     * Get the slash command data for this command.
     * @return ApplicationCommandData
     */

    public getCommandData(): InteractionCommandData {
        return this.data;
    }

    /**
     * The name of this command.
     * @return string
     */

    public getName(): string {
        return this.data.name;
    }
}
