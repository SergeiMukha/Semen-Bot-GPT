const { Scenes: { BaseScene }, Markup } = require("telegraf");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");
const updateDatabaseLastChangedTime = require("../utils/updateDatabaseLastChangedTime");

class ReviewRowScene {
    constructor() {
        const scene = new BaseScene("reviewRow");

        scene.enter(this.enter.bind(this));

        scene.hears("\u{1F519} Назад", this.back);

        scene.action("edit", ctx => ctx.scene.enter("editRow"));
        scene.action("delete", this.deleteRow.bind(this));

        scene.action("file", ctx => ctx.scene.enter("reviewFiles"));

        return scene;
    }


    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get row from database
        const rowId = ctx.session.sceneData.rowId;
        const rowData = (await ctx.session.googleSheetsService.readData(ctx.session.currentDatabaseId))[rowId];

        ctx.session.sceneData.rowData = rowData;

        const { resultString, inlineButtons } = await this._createDataPage(ctx);

        // Send message
        const message = await ctx.replyWithHTML(resultString, inlineButtons);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }
    

    async sendFile(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

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
        const { resultString, inlineButtons } = await this._createDataPage(ctx);

        const message = await ctx.replyWithHTML(resultString, inlineButtons);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }


    async _createDataPage(ctx) {
        const rowData = ctx.session.sceneData.rowData;
        const columns = ctx.session.sceneData.columns;

        let resultString = "";
        for(let i = 0; i < columns.length; i++) {
            const entry = rowData[i];
            const columnName = columns[i];

            resultString += `<b>${columnName}:</b> ${entry || "Немає інформації"}\n`;
        }

        // Define cancel and back buttons
        const inlineButtons = Markup.inlineKeyboard([
            [Markup.button.callback("\u{1F304} Переглянути фото/відео", "file")],
            [
                Markup.button.callback("\u{270F} Редагувати", "edit"),
                Markup.button.callback("\u{1F5D1} Видалити", "delete")
            ]
        ]);

        return { resultString, inlineButtons }
    }


    async deleteRow(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        this._deleteAllRowMedia(ctx);

        // Get row ID from scene storage
        const rowId = ctx.session.sceneData.rowId;

        await ctx.session.googleSheetsService.deleteRow(ctx.session.currentDatabaseId, rowId);
        await updateDatabaseLastChangedTime(ctx);

        await ctx.reply("Контакт видалено.");

        await ctx.scene.enter("reviewDatabase");
    }


    async _deleteAllRowMedia(ctx) {
        const rowData = ctx.session.sceneData.rowData;
        const files = rowData[ctx.session.sceneData.columns.length].split(";");

        for(let i = 0; i < files.length-1; i++) {
            const fileId = files[i];

            await ctx.session.googleDriveService.deleteItem(fileId);
        };
    }


    async back(ctx) {
        return await ctx.scene.enter("reviewDatabase");
    }
}

module.exports = ReviewRowScene;