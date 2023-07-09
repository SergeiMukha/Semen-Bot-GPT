const { Scenes: { BaseScene } } = require("telegraf");
const { stopKeyboard } = require("../keyboards/staticKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class CreateFolderScene {
    constructor() {
        const scene = new BaseScene("createFolder");

        scene.enter(ctx => { deleteRecentKeyboard(ctx); ctx.reply("Введіть назву для папки:", stopKeyboard) });

        scene.hears("\u{1F519} Назад", this.back);

        scene.on("text", this.getName);

        scene.on("message", ctx => ctx.reply("Це не те, що мені треба."));

        return scene;
    }


    async getName(ctx) {
        // Get name and folder ID
        const name = ctx.message.text;
        const parentFolderId = ctx.session.currentFolderId;

        await ctx.reply("Створюю папку...");

        // Create new folder
        const folderId = await ctx.session.googleDriveService.createFolder(name, parentFolderId);

        await ctx.reply("Папку створено.")

        if(ctx.session.sceneData.isMoving) {
            await ctx.session.googleDriveService.moveFile(ctx.session.currentDatabaseId, folderId);

            await ctx.reply("Базу переміщено до створеної папки.")
        }

        delete ctx.session.sceneData;

        return ctx.scene.enter("chooseDatabase");
    }

    
    async back(ctx) {
        return await ctx.scene.enter("chooseDatabase");
    }
}

module.exports = CreateFolderScene;