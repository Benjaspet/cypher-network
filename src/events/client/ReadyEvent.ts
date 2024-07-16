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
import { Client, ClientEvents, Presence } from "discord.js";

import { IEvent } from "@interfaces/IEvent";

import CommandManager from "@managers/CommandManager";
import DeployManager from "@managers/DeployManager";

import Config from "@structs/Config";
import Logger from "@structs/Logger";

import SlashCommandUtil from "@utils/SlashCommandUtil";

export default class ReadyEvent implements IEvent {
    public name: keyof ClientEvents;
    public once: boolean;
    public client: Client;

    constructor(client: Client, name: keyof ClientEvents, once: boolean) {
        this.name = name;
        this.once = once;
        this.client = client;
    }

    public execute() {
        Logger.clear();
        Logger.info(`Logged in as ${this.client.user?.tag ?? "Unknown"}.`);
        this.handlePresence();
        new CommandManager(this.client);
        this.handleApplicationCommands();
    }

    private handlePresence(): void {
        this.updatePresence()
            .then(() => setInterval(() => this.updatePresence(), 500 * 1000))
            .catch(() => this.handlePresence());
        return undefined;
    }

    private async updatePresence(): Promise<Presence | undefined> {
        const { message, status } = Config.get("activity");
        return this.client.user?.setActivity({
            type: Config.parseStatus(status),
            name: message
        });
    }

    private handleApplicationCommands() {
        const settings = Config.get("deploy");
        const commands = SlashCommandUtil.getAllSlashCommandData(this.client);
        new DeployManager(this.client, commands, settings);

        Logger.info("Application commands loaded.");
    }
}
