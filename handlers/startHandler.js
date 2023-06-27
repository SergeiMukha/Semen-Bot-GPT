const { startKeyboard } = require("../keyboards");
const GoogleSheets = require("../GoogleSheetsAPI/googleSheetsService");
const GoogleDriveService = require("../GoogleDriveAPI/googleDriveService");

async function startHandler(ctx) {
    // Initialize all necessery components
    ctx.session.messages = [];
    ctx.session.googleSheetsService = await new GoogleSheets();
    ctx.session.googleDriveService = await new GoogleDriveService();

    const message = await ctx.reply("Вітаю! Оберіть дію:", startKeyboard);
    ctx.session.recentKeyboardId = message.message_id;

    return;
}

module.exports = startHandler;