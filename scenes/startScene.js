const { Scenes: { BaseScene } } = require("telegraf");

const { startKeyboard } = require("../keyboards/staticKeyboards");
const GoogleSheetsService = require("../GoogleSheetsAPI/googleSheetsService");
const GoogleDriveService = require("../GoogleDriveAPI/googleDriveService");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class StartScene {
    constructor() {
        const scene = new BaseScene("start");

        scene.enter(this.enter);

        scene.action("chooseDatabase", async ctx => await ctx.scene.enter("chooseDatabase"));
        scene.action("reviewTemplates", async ctx => await ctx.scene.enter("reviewTemplates"));        

        return scene;
    }

    async enter(ctx) {
        // Delete recent keyboard if exist
        deleteRecentKeyboard(ctx);

        // Clear session
        ctx.session.sceneData = {};

        // Initialize all necessery components
        ctx.session.messages = [];
        ctx.session.googleSheetsService = await new GoogleSheetsService();
        ctx.session.googleDriveService = await new GoogleDriveService();
        
        const message = await ctx.reply("Вітаю!", startKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }
}

module.exports = StartScene;