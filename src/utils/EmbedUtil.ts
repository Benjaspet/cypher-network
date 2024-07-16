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
import { Colors, EmbedBuilder } from "discord.js";

import { APIEmbed } from "discord-api-types/v10";

import CypherNetworkConstants from "@constants/CypherNetworkConstants";

export default class EmbedUtil {
    public static getErrorEmbed(content: string): APIEmbed {
        return new EmbedBuilder()
            .setDescription(
                `${CypherNetworkConstants.EMOJI_ERROR()} ${content}`
            )
            .setColor(Colors.Red)
            .toJSON();
    }

    public static getDefaultEmbed(description: string): APIEmbed {
        return new EmbedBuilder()
            .setColor(CypherNetworkConstants.DEFAULT_EMBED_COLOR())
            .setDescription(description)
            .toJSON();
    }
}
