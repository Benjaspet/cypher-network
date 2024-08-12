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
import { HexColorString } from "discord.js";

import Config from "@structs/Config";

import agents from "@app/agents.json";

await Config.parse();

export default class Constants {
    public static TOKEN = Config.env(
        Config.get("development") ? "TOKEN-DEV" : "TOKEN"
    );
    public static API_KEY = Config.get("apiKey");
    public static DEFAULT_EMBED_COLOR = () =>
        Config.get("embedColor") as HexColorString;
    public static EMOJI_SUCCESS = () => Config.get("emojis").success;
    public static EMOJI_ERROR = () => Config.get("emojis").error;
    public static INVITE_URL = () =>
        `https://discord.com/oauth2/authorize?client_id=${Config.get("clientId")}&permissions=274878187520&integration_type=0&scope=bot+applications.commands`;
    public static AUTHORIZE_URL = () => {
        const config = Config.get("oauth");
        return `https://discord.com/oauth2/authorize?client_id=${Config.get("clientId")}&response_type=code&redirect_uri=${encodeURI(config.redirectUri)}&scope=${config.scopes.join("+")}`;
    };
    public static AGENTS = () =>
        agents.map((agent) => ({ name: agent, value: agent }));
}
