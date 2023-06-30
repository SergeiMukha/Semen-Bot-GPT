const { Scenes: { BaseScene }, Markup } = require("telegraf");
const startHandler = require("../handlers/startHandler");

const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");
const updateDatabaseLastChangedTime = require("../utils/updateDatabaseLastChangedTime");

class EditEntryScene {
    constructor() {
        const scene = new BaseScene("editEntry");

        // Define enter and text handlers
        scene.enter(this.enter);
        scene.on("text", this.editEntry);

        // Define actions buttons
        scene.action("resumeEntryEdit", ctx => ctx.scene.enter("getEntryRow"));
        scene.action("getBackToRow", ctx => { ctx.scene.enter("editDatabase"); deleteRecentKeyboard(ctx); });
        scene.action("getBackStart", async ctx => {
            // Delete recent keyboard
            deleteRecentKeyboard(ctx);

            // Delete scene data and leave it
            delete ctx.session.editSceneData;
            ctx.scene.leave();

            // Execute start handler
            startHandler(ctx);
        });

        // Define insuring handler
        scene.on("message", ctx => ctx.reply("Це не те, що мені треба"))

        return scene;
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        return ctx.reply("Введіть нове значення:");
    }

    async editEntry(ctx) {
        // Get all necessary data to update DB
        const newValue = ctx.message.text;

        const entryId = ctx.session.editSceneData.entryId;
        const rowId = ctx.session.editSceneData.rowId;
        const rowData = ctx.session.editSceneData.rowData;
        
        // Update array with new value
        rowData[entryId] = newValue;

        const date = new Date();
        rowData[ctx.session.columns.length+1] = date.toISOString();

        await updateDatabaseLastChangedTime(ctx);

        // Update row in DB with new row
        await ctx.session.googleSheetsService.updateRow(
            ctx.session.currentDatabaseId,
            rowId,
            rowData
        );

        await ctx.reply("Готово!");

        // Define actions inline keyboard
        const inlineKeyboard = Markup.inlineKeyboard([
            [Markup.button.callback("Продовжити редагування контакту", "resumeEntryEdit")], // To resume editing row
            [Markup.button.callback("Повернутись до вибору контакту", "getBackToRow")], // To get back to rows choosing
            [Markup.button.callback("Повернутись до початку", "getBackStart")], // To get back to start keyboard
        ]);

        // Send keyboard and save its ID to be able to delete it later
        const message = await ctx.reply("Що ви хочете далі робити?", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }
};

module.exports = EditEntryScene;