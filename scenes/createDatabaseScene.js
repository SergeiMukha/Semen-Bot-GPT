require("dotenv").config();

const { Scenes: { BaseScene }, Markup } = require("telegraf");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class CreateDatabaseScene {
    constructor() {
        const scene = new BaseScene("createDatabase");

        scene.enter(ctx => { deleteRecentKeyboard(ctx); ctx.reply("Введіть назву для бази даних:", { reply_markup: { remove_keyboard: true } }); });
        
        scene.on("text", this.getName);
        scene.on("callback_query", this.createDatabase);

        scene.on("message", (ctx) => ctx.reply("Це не те, що мені треба"));

        return scene;
    }

    async getName(ctx) {
        const name = ctx.message.text;
        ctx.session.name = name;

        const templates = await ctx.session.googleSheetsService.readData(process.env.TEMPLATES_TABLE_ID);
        
        // Configure inline keyboard with templates
        const inlineKeyboardArray = [];

        for(let i = 1; i < templates.length; i++) {
            const templateName = templates[i][0];
            const templateData = templates[i].slice(1);

            const button = Markup.button.callback(templateName, JSON.stringify(templateData));
            inlineKeyboardArray.push(button);
        };

        // Define inline keyboard with inline keyboard array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        const message = await ctx.reply("Оберіть шаблон:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async createDatabase(ctx) {
        const columns = JSON.parse(ctx.callbackQuery.data);

        try {
            // Create database and add it to databases list
            const spreadsheetId = await ctx.session.googleSheetsService.createDatabase(ctx.session.name);
            await ctx.session.googleDriveService.moveSpreadsheetToFolder(spreadsheetId, ctx.session.currentFolderId);

            // Add columns names and delete first unnecessary sheet
            await ctx.session.googleSheetsService.deleteFirstSheet(spreadsheetId);
            await ctx.session.googleSheetsService.writeData(spreadsheetId, [columns]);
        } catch (err) {
            ctx.reply("Помилка. Детальну інформацію щодо помилки ви можете побачити в логах бота.")
    
            console.log(err);
        };
    
        ctx.scene.leave();
    
        await ctx.reply("База даних створена.");

        return ctx.scene.enter("chooseDatabase");
    }
}

module.exports = CreateDatabaseScene;