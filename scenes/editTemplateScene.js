require("dotenv").config();
const { Scenes: { BaseScene }, Markup } = require("telegraf");
const startHandler = require("../handlers/startHandler");
const { configureTemplateDataInlineKeyboardArray } = require("../keyboards/dynamicKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class EditTemplateScene {
    constructor() {
        const scene = new BaseScene("editTemplate");

        scene.enter(this.enter);

        scene.hears("\u{1F519} Назад", this.back);
        
        scene.action("delete", this.delete);

        scene.on("callback_query", this.getEntryId);
        scene.on("text", this.editEntry);

        return scene;
    };

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        const templateId = ctx.session.sceneData.templateId;

        const templateData = (await ctx.session.googleSheetsService.readData(process.env.TEMPLATES_TABLE_ID))[templateId];
        
        ctx.session.sceneData.templateData = templateData;

        const inlineKeyboardArray = await configureTemplateDataInlineKeyboardArray(templateData);

        const deleteButton = Markup.button.callback("\u{1F5D1} Видалити", "delete");

        inlineKeyboardArray.push([deleteButton]);

        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        const message = await ctx.reply("Натисніть на значення, щоб редагувати:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async getEntryId(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        const entryId = ctx.callbackQuery.data;
        ctx.session.sceneData.entryId = entryId;

        return await ctx.reply("Введіть нове значення:");
    }

    async editEntry(ctx) {
        const newValue = ctx.message.text;

        const entryId = ctx.session.sceneData.entryId;
        const templateData = ctx.session.sceneData.templateData;
        const templateId = ctx.session.sceneData.templateId;

        templateData[entryId] = newValue;

        // Update row in DB with new row
        await ctx.session.googleSheetsService.updateRow(
            process.env.TEMPLATES_TABLE_ID,
            templateId,
            templateData
        );

        await ctx.reply("Готово");

        return await ctx.scene.enter("editTemplate");
    }

    async delete(ctx) {
        deleteRecentKeyboard(ctx);

        const templateId = ctx.session.sceneData.templateId;

        await ctx.session.googleSheetsService.deleteRow(process.env.TEMPLATES_TABLE_ID, templateId);

        await ctx.reply("Шаблон видалено");

        return await ctx.scene.enter("reviewTemplates");
    }

    async back(ctx) {
        return await ctx.scene.enter("reviewTemplates");
    }
};

module.exports = EditTemplateScene;