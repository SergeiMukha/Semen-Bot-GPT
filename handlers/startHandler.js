const { startKeyboard } = require("../keyboards");
const GoogleSheets = require("../googleSheets/googleSheets");

async function startHandler(ctx) {
    // Initialize all necessery components
    ctx.session.messages = [];
    ctx.session.googleSheets = await new GoogleSheets();

    return ctx.reply("Вітаю! Оберіть дію:", startKeyboard);
}

module.exports = startHandler;