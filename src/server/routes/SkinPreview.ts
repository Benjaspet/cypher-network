import Elysia, { Context } from "elysia";

/**
 * @api [GET] /api/v1/preview/:id
 * @description Gets a skin's preview video.
 */
async function getPreview({ params: { vid } }: Context<{ params: { vid: string } }>) {
    return `Get video preview for ${vid}`;
}

export default function (app: Elysia): Elysia {
    return app.group("/api/v1", app => app
        .get("/preview/:vid", getPreview)
    );
};
