require("dotenv").config();

const { Scenes: { BaseScene } } = require("telegraf");
const { startKeyboard } = require("../keyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class CreateDatabaseScene {
    constructor() {
        const scene = new BaseScene("createDatabase");

        scene.enter(ctx => { deleteRecentKeyboard(ctx); ctx.reply("Введіть назву для бази даних:", { reply_markup: { remove_keyboard: true } }); });
        
        scene.on("text", this.createDatabase);

        scene.on("message", (ctx) => ctx.reply("Це не те, що мені треба"));

        return scene;
    }

    async createDatabase(ctx) {
        const name = ctx.message.text;

        try {
            // Create database and add it to databases list
            const spreadsheetId = await ctx.session.googleSheetsService.createDatabase(name);
            await ctx.session.googleDriveService.moveSpreadsheetToFolder(spreadsheetId, ctx.session.currentFolderId);

            // Add columns names and delete first unnecessary sheet
            const columnsNames = ["Ім'я", "Адреса", "Номер телефону", "Що продає", "Що купує", "Коментар"];
            await ctx.session.googleSheetsService.writeData(spreadsheetId, [columnsNames]);
            await ctx.session.googleSheetsService.deleteFirstSheet(spreadsheetId);
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