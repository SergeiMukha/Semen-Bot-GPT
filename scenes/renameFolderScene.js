const { Scenes: { BaseScene } } = require("telegraf");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class RenameFolderScene {
    constructor() {
        const scene = new BaseScene("renameFolder");

        scene.enter(this.enter);

        scene.hears("\u{1F519} Назад", this.back);

        scene.on("text", this.rename);

        return scene;
    };

    async enter(ctx) {
        deleteRecentKeyboard(ctx);

        return await ctx.reply("Введіть нову назву для папки:");
    }

    async rename(ctx) {
        const newName = ctx.message.text;

        await ctx.session.googleDriveService.changeFileName(ctx.session.currentFolderId, newName);

        await ctx.reply("Папку перейменовано.");

        return await ctx.scene.enter("chooseDatabase");
    }

    async back(ctx) {
        return await ctx.scene.enter("chooseDatabase");
    }
};

module.exports = RenameFolderScene;