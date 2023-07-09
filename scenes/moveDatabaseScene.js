const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { configureFoldersInlineKeyboardArray } = require("../keyboards/dynamicKeyboards");
const { stopKeyboard } = require("../keyboards/staticKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class MoveDatabaseScene {
    constructor() {
        const scene = new BaseScene("moveDatabase");

        scene.enter(this.enter);
        
        scene.hears("\u{1F519} Назад", this.back);

        scene.action("previousFolder", this.previousFolder);
        scene.action("move", this.move);

        scene.action("createFolder", this.createFolder);

        scene.on("callback_query", ctx => { ctx.session.currentFolderId = ctx.callbackQuery.data; ctx.scene.enter("moveDatabase"); });

        return scene;
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        ctx.session.sceneData = {};

        // Get all folders in current folder
        const folders = await ctx.session.googleDriveService.getFoldersInFolder(ctx.session.currentFolderId);

        // Configure inline keyboard array with this folders
        const inlineKeyboardArray = await configureFoldersInlineKeyboardArray(folders);

        // If current folder is not root folder then add a back button 
        if(!(await ctx.session.googleDriveService.isRootFolder(ctx.session.currentFolderId))) {
            const backButton = Markup.button.callback("\u{1F519} Перейти у попередню папку", "previousFolder")
            inlineKeyboardArray.push([backButton]);
        };

        // Define inline keyboard
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        // Get current folder's name
        const folderName = await ctx.session.googleDriveService.getFolderName(ctx.session.currentFolderId);

        const messageText = `Наразі Ви у папці <b>${folderName}</b>\nВиберіть папку і натисніть кнопку <b>Перемістити сюди</b>`

        const message = await ctx.replyWithHTML(messageText, inlineKeyboard, stopKeyboard);
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


    async createFolder(ctx) {
        ctx.session.sceneData.isMoving = true;

        return await ctx.scene.enter("createFolder");
    }


    async previousFolder(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Determine parent item of the current folder
        const parentFolderId = await ctx.session.googleDriveService.getFolderParent(ctx.session.currentFolderId);

        // Set current folder ID as parent folder ID
        ctx.session.currentFolderId = parentFolderId

        // Reenter scene with new folder
        return ctx.scene.enter("moveDatabase");
    }

    async back(ctx) {
        return await ctx.scene.enter("databaseActions");
    }
}

module.exports = MoveDatabaseScene;