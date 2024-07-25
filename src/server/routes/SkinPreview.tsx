import Elysia, { Context } from "elysia";

import { logger } from "@app/CypherNetwork";

/**
 * @api [GET] /api/v1/preview/:id
 * @description Gets a skin's preview video.
 */
async function getPreview({
    query: { vid, name }
}: Context<{ query: { vid: string; name: string } }>) {
    logger.info(
        `Previewing ${decodeURIComponent(name)} video: ${decodeURIComponent(vid)}`
    );
    try {
        return (
            <html lang={"en"}>
            <head>
                <title>Preview</title>
                <meta
                    name={"viewport"}
                    content={"width=device-width, initial-scale=1"}
                />
                <meta
                    name={"og:title"}
                    content={decodeURIComponent(name).replaceAll("\n", " - ")}
                />
                <meta name={"theme-color"} content={"#26867c"} />
                <meta
                    name={"twitter:player"}
                    content={decodeURIComponent(vid)}
                />
                <meta name={"twitter:player:width"} content={"1280"} />
                <meta name={"twitter:player:height"} content={"720"} />
                <meta name={"twitter:card"} content={"player"} />
                <meta name={"twitter:site"} content={"Cypher Network"} />
                <style>
                    {`
                body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #000;
                }
                video {
                    width: 75%;
                    height: 75%;
                }
                `}
                </style>
            </head>
            <body>
            <video controls>
                <source src={decodeURIComponent(vid)} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            </body>
            </html>
        );
    } catch (e) {
        logger.error(`An error occurred: ${e}`);
        return (
            <html lang={"en"}>
            <head>
                <title>Error</title>
                <meta
                    name={"viewport"}
                    content={"width=device-width, initial-scale=1"}
                />
                <meta name={"theme-color"} content={"#26867c"} />
            </head>
            <body>
            <h1>Oops! An error occurred.</h1>
            </body>
            </html>
        );
    }
}

export default function (app: Elysia): Elysia {
    return app.group("/api/v1", (app) => app.get("/preview", getPreview));
}
