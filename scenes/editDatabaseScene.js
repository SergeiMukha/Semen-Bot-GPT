const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { configurePageInlineKeyboardArray } = require("../keyboards/dynamicKeyboards");
const { databaseFunctionsKeyboard } = require("../keyboards/staticKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class EditDatabaseScene {
    constructor() {
        const scene = new BaseScene("editDatabase");

        // Define enter and back handlers
        scene.enter(this.enter.bind(this));
    
        scene.action("back", async ctx => {
            deleteRecentKeyboard(ctx);

            ctx.scene.leave();
            
            const message = await ctx.reply("Оберіть дію:", databaseFunctionsKeyboard);
            ctx.session.recentKeyboardId = message.message_id;
        });
        scene.action("addNewEntry", ctx => { ctx.scene.enter("addDatabaseEntry") })
        scene.action("next", ctx => { ctx.session.page += 1; return this.getPageData(ctx) });
        scene.action("previous", ctx => { ctx.session.page -= 1; return this.getPageData(ctx) });

        // Define handler for getting data from callback query
        scene.on("callback_query", (ctx) => {
            // Save row ID into scene storage
            ctx.session.editSceneData.rowId = ctx.callbackQuery.data;

            // Enter next scene
            ctx.scene.enter("getEntryRow");
        });

        // Define insuring handler
        scene.on("message", ctx => ctx.reply("Це не те, що мені треба"))

        return scene;
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Define object where all scene data will store
        ctx.session.page = 0;
        ctx.session.editSceneData = {};

        this.getPageData(ctx);
    }

    // Get data by current page
    async getPageData(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get DB data
        const data = await ctx.session.googleSheetsService.readData(ctx.session.currentDatabaseId);
        if(!data) ctx.reply("Ця база даних пуста.")

        ctx.session.columns = data[0];

        data.shift();

        const inlineKeyboardArray = await configurePageInlineKeyboardArray(data, ctx.session.page, ctx.session.columns.length);

        // Define and add new entry and back buttons and push it into array
        const addNewEntryButon = Markup.button.callback("\u{1F195} Додати новий контакт", "addNewEntry");
        const backButton = Markup.button.callback("\u{1F519} Назад", "back");

        inlineKeyboardArray.push([addNewEntryButon], [backButton]);

        // Define inline keyboard with that array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        // Sending keyboard and save its ID to be able to delete it later
        const message = await ctx.reply("Оберіть контакт для редагування:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }
}

module.exports = EditDatabaseScene;