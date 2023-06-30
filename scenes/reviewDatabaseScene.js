const fs = require("fs");

const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { configurePageInlineKeyboardArray } = require("../keyboards/dynamicKeyboards");
const { databaseFunctionsKeyboard } = require("../keyboards/staticKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class ReviewDatabaseScene {
    constructor() {
        const scene = new BaseScene("reviewDatabase");

        // Define enter, back and cancel handlers
        scene.enter(this.enter.bind(this));
        scene.action("back", ctx => { ctx.scene.enter("reviewDatabase") });
        scene.action("cancel", async ctx => {
            deleteRecentKeyboard(ctx);

            delete ctx.session.columnsNames;

            ctx.scene.leave();

            const message = await ctx.reply("Що ви хочете зробити з цією базою даних?", databaseFunctionsKeyboard);
            ctx.session.recentKeyboardId = message.message_id;
        })
        scene.action("next", ctx => { ctx.session.page += 1; return this.getPageData(ctx) });
        scene.action("previous", ctx => { ctx.session.page -= 1; return this.getPageData(ctx) });
        scene.action("file", this.sendFile.bind(this));

        // Define callback handler
        scene.on("callback_query", this.getEntryData.bind(this));

        return scene;
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        ctx.session.page = 0;

        this.getPageData(ctx);
    }

    async getEntryData(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get entry row from database
        const entryRowId = ctx.callbackQuery.data;
        const rowData = (await ctx.session.googleSheetsService.readData(ctx.session.currentDatabaseId))[entryRowId];

        ctx.session.rowData = rowData;

        const { resultString, inlineButtons } = await this.createDataPage(ctx);

        // Send message
        const message = await ctx.replyWithHTML(resultString, inlineButtons);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async getPageData(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get data from database
        const data = await ctx.session.googleSheetsService.readData(ctx.session.currentDatabaseId);
        if(!data) ctx.reply("Ця база даних пуста.");

        // Get columns names
        const columns = data[0];
        ctx.session.columns = columns;

        data.shift();

        // Configure page keyboard array
        const inlineKeyboardArray = await configurePageInlineKeyboardArray(data, ctx.session.page, columns.length);

        // Define back button but it behaves like cancel button
        const backButton = Markup.button.callback("\u{1F519} Назад", "cancel");
        inlineKeyboardArray.push([backButton]);

        // Define inline keyboard with inline keyboard array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        const message = await ctx.reply("Оберіть контакт, щоб подивитись повну інформацію:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async sendFile(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get entry row's file ID
        const row = ctx.session.rowData;
        const columns = ctx.session.columns;
        const fileId = row[columns.length];

        // Get file buffer and send this file to user
        await ctx.reply("Завантажую файл...");
        try {
            const { fileBuffer, mimeType } = await ctx.session.googleDriveService.getFileBuffer(fileId);
    
            if(mimeType.includes("video")) {
                await ctx.replyWithVideo({ source: fileBuffer });
            } else {
                await ctx.replyWithPhoto({ source: fileBuffer });
            }
        } catch {
            await ctx.reply("Не вдалося заванатажити файл, спробуйте ще раз.")
        }

        // Create new entry row data page and send it to user
        const { resultString, inlineButtons } = await this.createDataPage(ctx);

        const message = await ctx.replyWithHTML(resultString, inlineButtons);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async createDataPage(ctx) {
        const row = ctx.session.rowData;
        const columns = ctx.session.columns;
        const fileId = row[columns.length];

        let resultString = "";
        for(let i = 0; i < columns.length; i++) {
            const entry = row[i];
            const columnName = columns[i];

            resultString += `<b>${columnName}:</b> ${entry}\n`;
        }

        // Define cancel and back buttons
        const inlineButtons = Markup.inlineKeyboard([
            fileId ? [Markup.button.callback("Переглянути фото/відео", "file")] : [],
            [Markup.button.callback("\u{1F519} Назад", "back"),
            Markup.button.callback("\u{274C} Скасувати", "cancel")]
        ]);

        return { resultString, inlineButtons }
    }
}

module.exports = ReviewDatabaseScene;