const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { databaseFunctionsKeyboard } = require("../keyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class ReviewDatabaseScene {
    constructor() {
        const scene = new BaseScene("reviewDatabase");

        // Define enter, back and cancel handlers
        scene.enter(this.enter);
        scene.action("back", ctx => { ctx.scene.enter("reviewDatabase") });
        scene.action("cancel", async ctx => {
            deleteRecentKeyboard(ctx);

            delete ctx.session.columnsNames;

            ctx.scene.leave();

            const message = await ctx.reply("Що ви хочете зробити з цією базою даних?", databaseFunctionsKeyboard);
            ctx.session.recentKeyboardId = message.message_id;
        })

        // Define callback handler
        scene.on("callback_query", this.getEntryData);

        return scene;
    }

    async getEntryData(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get entry row from database
        const entryRowId = ctx.callbackQuery.data;

        const data = await ctx.session.googleSheetsService.readData(ctx.session.currentDatabaseId);
        const row = data[entryRowId];

        // Configure a text with row data
        const columnsNames = ctx.session.columnsNames;

        let resultString = "";
        for(let i = 0; i < row.length; i++) {
            const entry = row[i];
            const columnName = columnsNames[i];

            resultString += `<b>${columnName}:</b> ${entry}\n`;
        }

        // Define cancel and back buttons
        const inlineBackButton = Markup.inlineKeyboard([
            Markup.button.callback("Назад", "back"),
            Markup.button.callback("Скасувати", "cancel")
        ]);

        // Send message
        const message = await ctx.replyWithHTML(resultString, inlineBackButton);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get data from database
        const data = await ctx.session.googleSheetsService.readData(ctx.session.currentDatabaseId);
        if(!data) ctx.reply("Ця база даних пуста.");

        // Get columns names
        const columnsNames = []
        for(let i = 0; i < data[0].length; i++) {
            columnsNames.push(`${data[0][i]}`);
        }

        ctx.session.columnsNames = columnsNames;

        // Configure inline keyboard array with data
        const inlineKeyboardArray = [];

        for(let i = 1; i < data.length; i++) {
            const button = Markup.button.callback(data[i][0], i);

            inlineKeyboardArray.push([button]);
        };

        // Define back button but it behaves like cancel button
        const backButton = Markup.button.callback("Назад", "cancel");
        inlineKeyboardArray.push([backButton]);

        // Define inline keyboard with inline keyboard array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        const message = await ctx.reply("Оберіть контакт, щоб подивитись повну інформацію:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }
}

module.exports = ReviewDatabaseScene;