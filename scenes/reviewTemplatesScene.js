const { Scenes: { BaseScene }, Markup } = require("telegraf");
const startHandler = require("../handlers/startHandler");
const { configureTemplatesInlineKeyboardArray } = require("../keyboards/dynamicKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class ReviewTemplatesScene {
    constructor() {
        const scene = new BaseScene("reviewTemplates");

        scene.enter(this.enter);

        scene.hears("\u{1F519} Назад", this.back);

        scene.action("createTemplate", ctx => ctx.scene.enter("createTemplate"));

        scene.on("callback_query", this.editTemplate);

        return scene;
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        ctx.session.sceneData = {};

        const templates = (await ctx.session.googleSheetsService.readData(process.env.TEMPLATES_TABLE_ID));

        const inlineKeyboardArray = await configureTemplatesInlineKeyboardArray(templates);

        const createTemplateButton = Markup.button.callback("\u{1F195} Створити шаблон", "createTemplate");
        inlineKeyboardArray.push([createTemplateButton]);

        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        const message = await ctx.reply("Ось список шаблонів, що ви створювали:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async editTemplate(ctx) {
        ctx.session.sceneData.templateId = ctx.callbackQuery.data;

        return await ctx.scene.enter("editTemplate");
    }

    async back(ctx) {
        delete ctx.session.sceneData;

        return await ctx.scene.enter("start");
    }
}

module.exports = ReviewTemplatesScene;