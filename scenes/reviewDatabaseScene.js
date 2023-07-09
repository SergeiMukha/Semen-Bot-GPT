const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { configurePageInlineKeyboardArray } = require("../keyboards/dynamicKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class ReviewDatabaseScene {
    constructor() {
        const scene = new BaseScene("reviewDatabase");

        // Define enter, back and cancel handlers
        scene.enter(this.enter.bind(this));
        scene.hears("\u{1F519} Назад", this.back);

        scene.action("addDatabaseEntry", ctx => ctx.scene.enter("addDatabaseRow"));

        // Define inline page moving handlers
        scene.action("next", ctx => { ctx.session.sceneData.page += 1; return this.getPageData(ctx) });
        scene.action("previous", ctx => { ctx.session.sceneData.page -= 1; return this.getPageData(ctx) });

        // Define callback handler
        scene.on("callback_query", this.getRowId);

        return scene;
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        ctx.session.sceneData = {};

        ctx.session.sceneData.page = 0;

        this.getPageData(ctx);
    }

    async getPageData(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get data from database
        const data = await ctx.session.googleSheetsService.readData(ctx.session.currentDatabaseId);
        if(!data) ctx.reply("Ця база даних пуста.");

        // Get columns names
        const columns = data[0];
        ctx.session.sceneData.columns = columns;

        data.shift();

        // Configure page keyboard array
        const inlineKeyboardArray = await configurePageInlineKeyboardArray(data, ctx.session.sceneData.page, columns.length);

        // Define add row button
        const addRowButton = Markup.button.callback("\u{1F195} Додати контакт", "addDatabaseEntry");
        inlineKeyboardArray.push([addRowButton]);

        // Define inline keyboard with inline keyboard array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        const message = await ctx.reply("Оберіть контакт, щоб подивитись повну інформацію:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async getRowId(ctx) {
        const rowId = ctx.callbackQuery.data;
        ctx.session.sceneData.rowId = rowId;

        return await ctx.scene.enter("reviewRow");
    }

    async back(ctx) {
        deleteRecentKeyboard(ctx);

        delete ctx.session.sceneData;
        
        return await ctx.scene.enter("databaseActions");
    }
}

module.exports = ReviewDatabaseScene;