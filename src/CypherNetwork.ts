/*
 * Copyright © 2024 Ben Petrillo, KingRainbow44.
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
import { Client, Partials } from "discord.js";

import ApplicationManager from "@managers/ApplicationManager";
import EventManager from "@managers/EventManager";

import Config from "@structs/Config";
import Database from "@structs/Database";

import WebServer from "@app/WebServer";

import { ILogObj, Logger } from "tslog";

console.clear();

/// <editor-fold defaultstate="collapsed" desc="Logger">

const time: string = "[{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}}]";
export const logger: Logger<ILogObj> = new Logger({
    name: "Cypher Network",
    type: "pretty",
    stylePrettyLogs: true,
    prettyLogTemplate: `${time} [{{logLevelName}}] ➞ `,
    prettyLogTimeZone: "local",
    prettyLogStyles: {
        logLevelName: {
            INFO: ["bold", "blue"],
            DEBUG: ["bold", "green"],
            WARN: ["bold", "yellow"],
            ERROR: ["bold", "red"]
        },
        yyyy: "magenta",
        mm: "magenta",
        dd: "magenta",
        hh: "magenta",
        MM: "magenta",
        ss: "magenta",
        filePathWithLine: "magenta"
    }
});

/// </editor-fold>

await Config.parse();
await Database.initialize();

WebServer.initialize();

export const client: Client = new Client({
    partials: [Partials.Channel, Partials.GuildMember, Partials.Message],
    allowedMentions: { parse: ["users", "everyone"], repliedUser: true },
    intents: []
});

await new ApplicationManager(client).login();
new EventManager(client);
