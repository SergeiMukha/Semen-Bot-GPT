require("dotenv").config();
const { Scenes: { BaseScene }, Markup } = require("telegraf");
const startHandler = require("../handlers/startHandler");

class CreateTemplateScene {
    constructor() {
        this.counter = 0;

        const scene = new BaseScene("createTemplate");

        scene.enter(ctx => { ctx.session.columns = []; return ctx.reply("Введіть назву для шаблону:") });
        scene.hears("\u{1F4BE} Завершити введення і зберегти шаблон.", this.saveTemplate);

        scene.on("text", this.getColumnName.bind(this));

        return scene;
    }

    async getColumnName(ctx) {
        const columnName = ctx.message.text;

        ctx.session.columns.push(columnName);

        const inlineKeyboard = Markup.keyboard([Markup.button.text("\u{1F4BE} Завершити введення і зберегти шаблон.")]).oneTime(true).resize();

        this.counter += 1;

        return ctx.reply(`Введіть назву для колонки колонки №${this.counter}:`, inlineKeyboard)
    }
    
    async saveTemplate(ctx) {
        await ctx.reply("Зберігаю...");

        try {
            await ctx.session.googleSheetsService.writeData(process.env.TEMPLATES_TABLE_ID, [ctx.session.columns]);

            await ctx.reply("Шаблон збережено.");
        } catch (err) {
            console.log(err);

            await ctx.reply("Помилка зі збереженням шаблону. Детальніше про помилку в логах бота.");
        }

        await ctx.scene.leave();

        return startHandler(ctx);
    }
}

module.exports = CreateTemplateScene;