const { Scenes: { BaseScene }, Markup } = require("telegraf");

const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");
const updateDatabaseLastChangedTime = require("../utils/updateDatabaseLastChangedTime");

class GetEntryRowScene {
    constructor() {
        const scene = new BaseScene("getEntryRow");

        // Define enter and back handlers
        scene.enter(this.enter)
        scene.action("back", ctx => { ctx.scene.enter("editDatabase") });
        scene.action("delete", this.deleteEntryRow);

        // Define handler for getting dasta from callback query
        scene.on("callback_query", ctx => {
            // Save entry ID into scene storage
            ctx.session.editSceneData.entryId = ctx.callbackQuery.data;

            // Enter next scene
            ctx.scene.enter("editEntry");
        })

        // Define insuring handler
        scene.on("message", ctx => ctx.reply("Це не те, що мені треба"))

        return scene;
    }

    async deleteEntryRow(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get row ID from scene storage
        const rowId = ctx.session.editSceneData.rowId;

        await ctx.session.googleSheetsService.deleteRow(ctx.session.currentDatabaseId, rowId);
        await updateDatabaseLastChangedTime(ctx);

        await ctx.reply("Контакт видалено.");

        await ctx.scene.enter("editDatabase");
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get row ID from scene storage
        const rowId = ctx.session.editSceneData.rowId;

        // Get data of this row from the DB
        const row = await ctx.session.googleSheetsService.getRow(ctx.session.currentDatabaseId, rowId);
        ctx.session.editSceneData.rowData = [];

        const columns = ctx.session.columns;

        // Configure inline keyboard array
        const inlineKeyboardArray = [];

        for(let id = 0; id < columns.length; id++) {
            const entry = row[id];
            ctx.session.editSceneData.rowData.push(entry);

            const button = Markup.button.callback(`${columns[id]}: ${entry || "Немає інформації"}`, id)
            inlineKeyboardArray.push([button]);
        }

        // Define back and delete buttons and push it into array
        const backButton = Markup.button.callback("\u{1F519} Назад", "back");
        const deleteButton = Markup.button.callback("\u{1F5D1} Видалити контакт", "delete");
        inlineKeyboardArray.push([deleteButton], [backButton]);

        // Define inline keyboard with array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        // Send keyboard and save its ID to be able to delete it later
        const message = await ctx.reply("Що будете редагувати?", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }
};

module.exports = GetEntryRowScene;