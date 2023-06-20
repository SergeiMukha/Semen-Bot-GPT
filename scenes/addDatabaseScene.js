require("dotenv").config();

const { Scenes: { BaseScene } } = require("telegraf");
const { startKeyboard } = require("../keyboards");

class AddDatabaseScene {
    constructor() {
        const scene = new BaseScene("addDatabase");

        scene.enter(ctx => ctx.reply("Введіть назву для бази даних:", { reply_markup: { remove_keyboard: true } }));
        
        scene.on("text", this.createDatabase);

        scene.on("message", (ctx) => ctx.reply("Це не те, що мені треба"));

        return scene;
    }

    async createDatabase(ctx) {
        const name = ctx.message.text;

        try {
            // Create database and add it to databases list
            const spreadsheetId = await ctx.session.googleSheets.createDatabase(name);
            await ctx.session.googleSheets.writeData(process.env.DATABASES_TABLE_ID, [[name, spreadsheetId]]);
            
            // Add columns names and delete first unnecessary sheet
            const columnsNames = ["Ім'я", "Адреса", "Номер телефону", "Що продає", "Що купує", "Коментар"];
            await ctx.session.googleSheets.writeData(spreadsheetId, [columnsNames]);
            await ctx.session.googleSheets.deleteFirstSheet(spreadsheetId);
        } catch (err) {
            ctx.reply("Помилка. Детальну інформацію щодо помилки ви можете побачити в логах бота.")
    
            console.log(err);
        };
    
        ctx.scene.leave();
    
        return ctx.reply("База даних створена.", startKeyboard);
    }
}

module.exports = AddDatabaseScene;