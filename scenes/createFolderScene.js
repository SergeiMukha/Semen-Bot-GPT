const { Scenes: { BaseScene } } = require("telegraf");
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
        // Get name and folder ID
        const name = ctx.message.text;
        const parentFolderId = ctx.session.currentFolderId;

        // Create new folder
        await ctx.session.googleDriveService.createFolder(name, parentFolderId);

        return ctx.scene.enter("chooseDatabase");
    }
}

module.exports = CreateFolderScene;