const { Scenes: { BaseScene }, Markup } = require("telegraf");
const deleteFolderHandler = require("../handlers/deleteFolderHandler");
const startHandler = require("../handlers/startHandler");
const { configureFolderItemsPageInlineKeyboardArray } = require("../keyboards/dynamicKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class ChooseDatabaseScene {
    constructor() {
        const scene = new BaseScene("chooseDatabase");

        // Define handlers
        scene.enter(this.enter);
        scene.action("previousFolder", this.previousFolder);
        scene.action("createDatabase", async ctx => await ctx.scene.enter("createDatabase"));
        scene.action("createFolder", async ctx => await ctx.scene.enter("createFolder"));
        scene.action("renameFolder", async ctx => await ctx.scene.enter("renameFolder"));
        scene.action("moveFolder", async ctx => { await ctx.scene.enter("moveFolder"); ctx.session.sceneData.folderToMove = ctx.session.currentFolderId; })
        scene.action("createNewDatabase", async ctx => await ctx.scene.enter("addDatabase"));
        scene.action("deleteFolder", deleteFolderHandler);

        scene.hears("\u{1F519} Назад", this.back);

        // Define inline page moving handlers
        scene.action("nextPage", ctx => { ctx.session.sceneData.page += 1; return ctx.scene.reenter() });
        scene.action("previousPage", ctx => { ctx.session.sceneData.page -= 1; return ctx.scene.reenter() });

        scene.on("callback_query", this.getItem);

        return scene;
    }

    async enter(ctx) {
        if(!ctx.session.sceneData) ctx.session.sceneData = {};
        if(!ctx.session.sceneData.page) ctx.session.sceneData.page = 0;

        // Set current folder id as "root"
        ctx.session.currentFolderId = ctx.session.currentFolderId || "root";

        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get items of folder
        const items = await ctx.session.googleDriveService.getItemsInFolder(ctx.session.currentFolderId);

        // Get inline keyboard with items in folder and send it to user
        const inlineKeyboardArray = await configureFolderItemsPageInlineKeyboardArray(items, ctx.session.sceneData.page);

        if(!(await ctx.session.googleDriveService.isRootFolder(ctx.session.currentFolderId))) {
            const renameFolderButton = Markup.button.callback("\u{1F170} Перейменувати папку", "renameFolder");
            const deleteFolderButton = Markup.button.callback("\u{1F5D1} Видалити папку", "deleteFolder");
            const moveFolderButton = Markup.button.callback("\u{1F4E9} Перемістити папку", "moveFolder");    
            const backButton = Markup.button.callback("\u{1F519} Перейти у попередню папку", "previousFolder");

            inlineKeyboardArray.push([renameFolderButton, deleteFolderButton], [moveFolderButton], [backButton]);
        };

        // Define inline keyboard with inline keyboard array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        // Get current folder's name
        const folderName = await ctx.session.googleDriveService.getFolderName(ctx.session.currentFolderId);

        const messageText = `Наразі ви у папці <b>${folderName}</b>\nОсь список папок і таблиць в цій папці:`

        const message = await ctx.replyWithHTML(messageText, inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async getItem(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        ctx.session.sceneData.page = 0;

        // Get item ID
        const itemId = ctx.callbackQuery.data;

        // Get item type
        const itemType = await ctx.session.googleDriveService.getItemType(itemId);

        // If item is table
        if(itemType=="Table") {
            // Setting tabel as current database
            ctx.session.currentDatabaseId = itemId;

            return await ctx.scene.enter("databaseActions");
        };

        // If item type is folder
        // Set current folder ID as item ID
        ctx.session.currentFolderId = itemId

        return ctx.scene.enter("chooseDatabase");
    }

    async previousFolder(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);
        
        ctx.session.sceneData.page = 0;
        
        try {
            // Determine parent item of the current folder
            const parentFolderId = await ctx.session.googleDriveService.getFolderParent(ctx.session.currentFolderId);

            // Set current folder ID as parent folder ID
            ctx.session.currentFolderId = parentFolderId

            return ctx.scene.enter("chooseDatabase");
        } catch {
            // If there is an exception then current folder is root and there is no parent folder
            // Then return to start
            delete ctx.session.currentFolderId;

            await ctx.scene.leave();

            startHandler(ctx);
        }
    }
    async back(ctx) {
        return await ctx.scene.enter("start");
    }
}

module.exports = ChooseDatabaseScene;