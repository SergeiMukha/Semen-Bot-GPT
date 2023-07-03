const { startKeyboard } = require("../keyboards/staticKeyboards");
const GoogleSheetsService = require("../GoogleSheetsAPI/googleSheetsService");
const GoogleDriveService = require("../GoogleDriveAPI/googleDriveService");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

async function startHandler(ctx) {
    // Delete recent keyboard if exist
    deleteRecentKeyboard(ctx);

    // Clear session
    ctx.session = {};

    // Initialize all necessery components
    ctx.session.messages = [];
    ctx.session.googleSheetsService = await new GoogleSheetsService();
    ctx.session.googleDriveService = await new GoogleDriveService();
    
    const message = await ctx.reply("Вітаю!", startKeyboard);
    ctx.session.recentKeyboardId = message.message_id;

    return;
}

module.exports = startHandler;