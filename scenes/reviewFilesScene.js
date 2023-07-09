const { Scenes: { BaseScene }, Markup } = require("telegraf");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class ReviewFilesScene {
    constructor() {
        const scene = new BaseScene("reviewFiles");

        scene.enter(this.enter);

        scene.hears("\u{1F519} Назад", this.back);

        scene.action("reviewPhotos", this.sendPhotos);
        scene.action("reviewVideos", this.sendVideos);

        scene.action("addFile", this.addFile);

        scene.on("callback_query", this.deleteFile);

        scene.on("text", ctx => ctx.telegram.editMessageText())

        return scene;
    };

    async enter(ctx) {
        deleteRecentKeyboard(ctx);

        const inlineKeyboard = Markup.inlineKeyboard([
            [Markup.button.callback("\u{1F304} Фото", "reviewPhotos")],
            [Markup.button.callback("\u{1F3A5} Відео", "reviewVideos")],
            [Markup.button.callback("\u{1F195} Додати фото/відео", "addFile")]
        ]);

        const message = await ctx.reply("Оберіть, що ви хочете переглянути:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    };

    async sendPhotos(ctx) {
        deleteRecentKeyboard(ctx);

        // Get entry row's file ID
        const rowData = ctx.session.sceneData.rowData;
        const columns = ctx.session.sceneData.columns;
        const files = rowData[columns.length].split(";");
        files.pop();

        const photos = [];

        for(let i = 0; i < files.length; i++) {
            const fileId = files[i];

            try {
                const fileMimeType = await ctx.session.googleDriveService.getFileMimeType(fileId);

                if(fileMimeType.includes("image")) photos.push(fileId);
            } catch {
                await ctx.reply("Не вдалося заванатажити файл, спробуйте ще раз.")
            };
        }

        if(photos.length == 0) {
            await ctx.reply("Ви ще не додавали фото до цього контакту.");

            return ctx.scene.enter("reviewFiles");
        }

        await ctx.reply("Завантажую фото...");

        await photos.forEach(async fileId => {
            try {
                const deleteButton = Markup.inlineKeyboard([Markup.button.callback("\u{1F5D1} Видалити фото", fileId)]);

                const { fileBuffer } = await ctx.session.googleDriveService.getFileBuffer(fileId);

                await ctx.replyWithPhoto({ source: fileBuffer }, deleteButton);
            } catch (err) {
                await ctx.reply("Не вдалося заванатажити файл, спробуйте ще раз.")
            }
        })
    }

    async sendVideos(ctx) {
        deleteRecentKeyboard(ctx);

        // Get entry row's file ID
        const rowData = ctx.session.sceneData.rowData;
        const columns = ctx.session.sceneData.columns;
        const files = rowData[columns.length].split(";");
        files.pop();

        const videos = [];

        for(let i = 0; i < files.length; i++) {
            const fileId = files[i];

            try {
                const fileMimeType = await ctx.session.googleDriveService.getFileMimeType(fileId);

                if(fileMimeType.includes("video")) videos.push(fileId);
            } catch {
                await ctx.reply("Не вдалося заванатажити файл, спробуйте ще раз.")
            };
        }

        if(videos.length == 0) {
            await ctx.reply("Ви ще не додавали відео до цього контакту.");

            return ctx.scene.enter("reviewFiles");
        }

        await ctx.reply("Завантажую відео...");

        await videos.forEach(async fileId => {
            try {
                const deleteButton = Markup.inlineKeyboard([Markup.button.callback("\u{1F5D1} Видалити відео", fileId)]);

                const { fileBuffer } = await ctx.session.googleDriveService.getFileBuffer(fileId);

                await ctx.replyWithVideo({ source: fileBuffer }, deleteButton);
            } catch (err) {
                await ctx.reply("Не вдалося заванатажити файл, спробуйте ще раз.")
            }
        })
    };

    async deleteFile(ctx) {
        const photoMessageId = ctx.callbackQuery.message.message_id;
        const fileId = ctx.callbackQuery.data;

        const rowId = ctx.session.sceneData.rowId;
        const rowData = ctx.session.sceneData.rowData;
        const columns = ctx.session.sceneData.columns;
        let files = rowData[columns.length];

        rowData[columns.length] = files.replace(`${fileId};`, "");

        await ctx.session.googleSheetsService.updateRow(
            ctx.session.currentDatabaseId,
            rowId,
            rowData
        )

        await ctx.reply("Видаляю файл...");

        await ctx.session.googleDriveService.deleteItem(fileId);

        await ctx.deleteMessage(photoMessageId);

        return await ctx.reply("Файл видалено.");
    }

    async addFile(ctx) {
        ctx.session.sceneData.sourceScene = "reviewFiles";

        return await ctx.scene.enter("addFiles");
    }

    async back(ctx) {
        return await ctx.scene.enter("reviewRow");
    }
};

module.exports = ReviewFilesScene;