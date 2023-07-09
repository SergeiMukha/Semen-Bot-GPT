const { Scenes: { BaseScene } } = require("telegraf");
const deleteDatabaseHandler = require("../handlers/deleteDatabaseHandler");
const { databaseActionsKeyboard } = require("../keyboards/staticKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class DatabaseActionsScene {
    constructor() {
        const scene = new BaseScene("databaseActions");

        scene.enter(this.enter);

        scene.action("reviewDatabase", (ctx) => ctx.scene.enter("reviewDatabase"));
        
        scene.action("moveDatabase", ctx => ctx.scene.enter("moveDatabase"));
        
        scene.action("deleteDatabase", deleteDatabaseHandler);
        
        scene.action("makeChatGPTRequest", ctx => ctx.scene.enter("makeChatGPTRequest"));

        scene.action("renameDatabase", async ctx => ctx.scene.enter("renameDatabase"));

        scene.hears("\u{1F519} Назад", this.back);

        return scene;
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        const message = await ctx.reply("Що ви хочете зробити з цією базою даних?", databaseActionsKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async back(ctx) {
        return await ctx.scene.enter("chooseDatabase");
    }
}

module.exports = DatabaseActionsScene;