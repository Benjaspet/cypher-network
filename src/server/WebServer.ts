import Elysia from "elysia";
import { html } from "@elysiajs/html";

import skinPreview from "@routes/SkinPreview";

import Config from "@structs/Config";

import Constants from "@app/Constants";
import { logger } from "@app/CypherNetwork";

class WebServer {
    private readonly app: Elysia;

    /**
     * Creates a web server.
     */
    public static initialize(): WebServer {
        return new WebServer();
    }

    constructor() {
        this.app = new Elysia();

        this.initRoutes();
        this.startServer();
    }

    /**
     * Initializes all routes for the web server.
     * @private
     */
    private initRoutes() {
        this.app
            .use(html())
            .use(skinPreview)
            .get("/", ({ redirect }) => redirect(Constants.INVITE_URL()));
    }

    /**
     * Starts the web server.
     * @private
     */
    private startServer() {
        this.app.listen(Config.get("web").port, (server) => {
            logger.info(
                `🚀 Web server started on ${server?.hostname}:${server?.port}`
            );
        });
    }
}

export default WebServer;
