const { Scenes: { BaseScene } } = require("telegraf");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");
const updateDatabaseLastChangedTime = require("../utils/updateDatabaseLastChangedTime");

class RenameDatabaseScene {
    constructor() {
        const scene = new BaseScene("renameDatabase");

        scene.enter(this.enter);

        scene.hears("\u{1F519} Назад", this.back);

        scene.on("text", this.rename);

        return scene;
    };

    async enter(ctx) {
        deleteRecentKeyboard(ctx);

        return await ctx.reply("Введіть нову назву для бази:");
    }

    async rename(ctx) {
        const newName = ctx.message.text;

        await ctx.session.googleDriveService.changeFileName(ctx.session.currentDatabaseId, newName);

        updateDatabaseLastChangedTime(ctx);

        await ctx.reply("Базу перейменовано.");

        return await ctx.scene.enter("databaseActions");
    }

    async back(ctx) {
        return await ctx.scene.enter("databaseActions");
    }
};

module.exports = RenameDatabaseScene;