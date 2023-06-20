require("dotenv").config();
const { Markup } = require("telegraf");

async function getDatabasesListHandler(ctx) {
    const databasesList = await ctx.session.googleSheets.readData(process.env.DATABASES_TABLE_ID);

    const inlineKeyboardArray = []

    for(let i = 0; i < databasesList.length; i++) {
        if(databasesList[i].length == 0) continue;

        const btnText = databasesList[i][0];
        const btnCallbackData = databasesList[i][1];

        const button = Markup.button.callback(btnText, btnCallbackData);
        inlineKeyboardArray.push([button]);
    }

    const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

    return ctx.reply("Ось список баз:", inlineKeyboard);
}

module.exports = getDatabasesListHandler;