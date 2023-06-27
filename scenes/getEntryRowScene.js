const { Scenes: { BaseScene }, Markup } = require("telegraf");

const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class GetEntryRowScene {
    constructor() {
        const scene = new BaseScene("getEntryRow");

        // Define enter and back handlers
        scene.enter(this.enter)
        scene.action("back", ctx => { ctx.scene.enter("editDatabase") });

        // Define handler for getting data from callback query
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

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get row ID from scene storage
        const rowId = ctx.session.editSceneData.rowId;

        // Get data of this row from the DB
        const row = await ctx.session.googleSheetsService.getRow(ctx.session.currentDatabaseId, rowId);
        ctx.session.editSceneData.rowData = row;

        // Configure inline keyboard array
        const inlineKeyboardArray = [];

        for(let id = 0; id < row.length; id++) {
            const entry = row[id];

            const button = Markup.button.callback(entry, id)
            inlineKeyboardArray.push([button]);
        }

        // Define back button and push it into array
        const backButton = Markup.button.callback("Назад", "back");
        inlineKeyboardArray.push([backButton]);

        // Define inline keyboard with array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        // Send keyboard and save its ID to be able to delete it later
        const message = await ctx.reply("Що будете редагувати?", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }
};

module.exports = GetEntryRowScene;