const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { databaseFunctionsKeyboard } = require("../keyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class ReadDatabaseScene {
    constructor() {
        const scene = new BaseScene("readDatabase");

        // Define enter, back and cancel handlers
        scene.enter(this.enter);
        scene.action("back", ctx => { deleteRecentKeyboard(ctx); ctx.scene.enter("readDatabase") });
        scene.action("cancel", ctx => { deleteRecentKeyboard(ctx); delete ctx.session.columnsNames; ctx.scene.leave(); ctx.reply("Що ви хочете зробити з цією базою даних?", databaseFunctionsKeyboard); })

        // Define callback handler
        scene.on("callback_query", this.getEntryData);

        return scene;
    }

    async getEntryData(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get entry row from database
        const entryRowId = ctx.callbackQuery.data;

        const data = await ctx.session.googleSheets.readData(ctx.session.currentDatabaseId);
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
        // Get data from database
        const data = await ctx.session.googleSheets.readData(ctx.session.currentDatabaseId);
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

        // Define inline keyboard with inline keyboard array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        const message = await ctx.reply("Оберіть контакт, щоб подивитись повну інформацію:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }
}

module.exports = ReadDatabaseScene;