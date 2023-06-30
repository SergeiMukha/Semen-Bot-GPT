const { Scenes: { BaseScene }, Markup } = require("telegraf");
const deleteFolderHandler = require("../handlers/deleteFolderHandler");
const startHandler = require("../handlers/startHandler");
const { configureFolderItemsInlineKeyboardArray } = require("../keyboards/dynamicKeyboards");
const { databaseFunctionsKeyboard } = require("../keyboards/staticKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class ChooseDatabaseScene {
    constructor() {
        const scene = new BaseScene("chooseDatabase");

        // Define handlers
        scene.enter(this.enter);
        scene.action("back", this.back);
        scene.action("createDatabase", ctx => ctx.scene.enter("createDatabase"));
        scene.action("createFolder", ctx => ctx.scene.enter("createFolder"));
        scene.action("deleteFolder", deleteFolderHandler)

        scene.on("callback_query", this.getItem);

        return scene;
    }

    async enter(ctx) {
        // Set current folder id as "root"
        ctx.session.currentFolderId = ctx.session.currentFolderId || "root";

        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get items of folder
        const items = await ctx.session.googleDriveService.getItemsInFolder(ctx.session.currentFolderId);

        // Get inline keyboard with items in folder and send it to user
        const inlineKeyboardArray = await configureFolderItemsInlineKeyboardArray(items);

        if(!(await ctx.session.googleDriveService.isRootFolder(ctx.session.currentFolderId))) {
            const deleteFolderButton = Markup.button.callback("\u{1F5D1} Видалити папку", "deleteFolder");

            inlineKeyboardArray.splice(inlineKeyboardArray.length-1, 0, [deleteFolderButton]);
        }

        // Define inline keyboard with inline keyboard array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        const message = await ctx.replyWithHTML("Ось список папок і таблиць:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async getItem(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get item ID
        const itemId = ctx.callbackQuery.data;

        // Get item type
        const itemType = await ctx.session.googleDriveService.getItemType(itemId);

        // If item is table
        if(itemType=="Table") {
            // Setting tabel as current database
            ctx.session.currentDatabaseId = itemId;

            // Sending functions choice to user and leave the scene
            const message = await ctx.reply("Що ви хочете зробити з цією базою даних?", databaseFunctionsKeyboard);
            ctx.session.recentKeyboardId = message.message_id;

            return await ctx.scene.leave();
        };

        // If item type is folder
        // Set current folder ID as item ID
        ctx.session.currentFolderId = itemId

        return ctx.scene.enter("chooseDatabase");
    }

    async back(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);
        
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
}

module.exports = ChooseDatabaseScene;