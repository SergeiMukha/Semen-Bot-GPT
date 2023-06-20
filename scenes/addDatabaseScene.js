require("dotenv").config();

const { Scenes: { BaseScene } } = require("telegraf");
const { startKeyboard } = require("../keyboards");

const AddDatabaseScene = new BaseScene("addDatabase");

AddDatabaseScene.enter(ctx => ctx.reply("Введіть назву для бази даних:"));

AddDatabaseScene.on("text", async ctx => {
    const name = ctx.message.text;

    // Create new database and add new database to databases table
    try {
        const spreadsheetId = await ctx.session.googleSheets.createDatabase(name);
        await ctx.session.googleSheets.writeData(process.env.DATABASES_TABLE_ID, [[name, spreadsheetId]]);

        const columnsNames = ["Ім'я", "Адреса", "Номер телефону", "Що продає", "Що купує"];
        await ctx.session.googleSheets.writeData(spreadsheetId, [columnsNames]);
        await ctx.session.googleSheets.deleteFirstSheet(spreadsheetId);
    } catch (err) {
        ctx.reply("Помилка. Детальну інформацію щодо помилки ви можете побачити в логах бота.")

        console.log(err);
    };

    ctx.scene.leave();

    return ctx.reply("Готово!", startKeyboard);
});

module.exports = AddDatabaseScene;