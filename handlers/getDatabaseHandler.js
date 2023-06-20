const { databaseFunctionsKeyboard } = require("../keyboards");

async function getDatabaseHandler(ctx) {
    const databaseId = ctx.callbackQuery.data;

    ctx.session.currentDatabaseId = databaseId;

    return ctx.reply("Що ви хочете зробити з цією базою даних?", databaseFunctionsKeyboard)
}

module.exports = getDatabaseHandler;