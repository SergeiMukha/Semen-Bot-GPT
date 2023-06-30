const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { configureFoldersInlineKeyboardArray } = require("../keyboards/dynamicKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class MoveDatabaseScene {
    constructor() {
        const scene = new BaseScene("moveDatabase");

        scene.enter(this.enter);
        
        scene.action("back", this.back);
        scene.action("move", this.move);

        scene.on("callback_query", ctx => { ctx.session.currentFolderId = ctx.callbackQuery.data; ctx.scene.enter("moveDatabase"); });

        return scene;
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get all folders in current folder
        const folders = await ctx.session.googleDriveService.getFoldersInFolder(ctx.session.currentFolderId);

        // Configure inline keyboard array with this folders
        const inlineKeyboardArray = await configureFoldersInlineKeyboardArray(folders);

        // If current folder is not root folder then add a back button 
        if(!(await ctx.session.googleDriveService.isRootFolder(ctx.session.currentFolderId))) {
            const backButton = Markup.button.callback("\u{1F519} Назад", "back")
            inlineKeyboardArray.push([backButton]);
        };

        // Define inline keyboard
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        // Get current folder's name
        const folderName = await ctx.session.googleDriveService.getFolderName(ctx.session.currentFolderId);

        // Form the message text and send it with inline keyboard to user
        const messageText = `Наразі ви у папці <b>${folderName}</b>\nВиберіть папку і натисніть кнопку <b>Перемістити сюди</b>`

        const message = await ctx.replyWithHTML(messageText, inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async move(ctx) {
        // Get database and folder IDs
        const databaseId = ctx.session.currentDatabaseId;
        const folderId = ctx.session.currentFolderId;

        await ctx.reply("Переміщую...");

        // Move database into the folder
        await ctx.session.googleDriveService.moveFile(databaseId, folderId);

        await ctx.reply("Папку переміщено.");

        await ctx.scene.enter("chooseDatabase")
    }

    async back(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Determine parent item of the current folder
        const parentFolderId = await ctx.session.googleDriveService.getFolderParent(ctx.session.currentFolderId);

        // Set current folder ID as parent folder ID
        ctx.session.currentFolderId = parentFolderId

        // Reenter scene with new folder
        return ctx.scene.enter("moveDatabase");
    }
}

module.exports = MoveDatabaseScene;