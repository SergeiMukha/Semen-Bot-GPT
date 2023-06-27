const { Scenes: { BaseScene } } = require("telegraf");
const { configureInlineKeyboardWithFolderItems } = require("../keyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class CreateFolderScene {
    constructor() {
        const scene = new BaseScene("createFolder");

        scene.enter(ctx => { deleteRecentKeyboard(ctx); ctx.reply("Введіть назву для папки:") });

        scene.on("text", this.getName);

        scene.on("message", ctx => ctx.reply("Це не те, що мені треба."));

        return scene;
    }

    async getName(ctx) {
        const name = ctx.message.text;
        const parentFolderId = ctx.session.currentFolderId;

        await ctx.session.googleDriveService.createFolder(name, parentFolderId);

        return ctx.scene.enter("chooseDatabase");
    }
}

module.exports = CreateFolderScene;