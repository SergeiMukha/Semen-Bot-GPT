require("dotenv").config();
const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { navigationKeyboard } = require("../keyboards/staticKeyboards");

class CreateTemplateScene {
    constructor() {
        const scene = new BaseScene("createTemplate");

        scene.enter(this.enter);
        scene.hears("\u{1F4BE} Завершити введення і зберегти шаблон.", this.saveTemplate);

        scene.hears("\u{1F519} Назад", this.stop);

        scene.on("text", this.getColumnName.bind(this));

        return scene;
    }
    

    async enter(ctx) {
        ctx.session.sceneData = {}
        ctx.session.sceneData.columns = [];
        ctx.session.sceneData.counter = 0;
        
        return ctx.reply("Введіть назву для шаблону:", navigationKeyboard)
    }


    async getColumnName(ctx) {
        const columnName = ctx.message.text;

        ctx.session.sceneData.columns.push(columnName);

        const keyboard = Markup.keyboard([
            ["\u{1F4BE} Завершити введення і зберегти шаблон."],
            ["\u{1F519} Назад"],
            ["\u{1F5C3} Повернутись на початкове меню"]
        ]).oneTime(true).resize();

        ctx.session.sceneData.counter += 1;

        return ctx.reply(`Введіть назву для колонки №${ctx.session.sceneData.counter}:`, keyboard)
    }
    
    async saveTemplate(ctx) {
        await ctx.reply("Зберігаю...");

        try {
            await ctx.session.googleSheetsService.writeData(process.env.TEMPLATES_TABLE_ID, [ctx.session.sceneData.columns]);

            await ctx.reply("Шаблон збережено.", navigationKeyboard);
        } catch (err) {
            console.log(err);

            await ctx.reply("Помилка зі збереженням шаблону. Детальніше про помилку в логах бота.");
        }

        delete ctx.session.sceneData;

        await ctx.scene.leave();

        return await ctx.scene.enter("reviewTemplates");
    }

    async stop(ctx) {
        delete ctx.session.sceneData;

        await ctx.reply("Відміна дії...", navigationKeyboard);

        return await ctx.scene.enter("reviewTemplates");
    }
}

module.exports = CreateTemplateScene;