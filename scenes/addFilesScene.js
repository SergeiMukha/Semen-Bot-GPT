const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { navigationKeyboard } = require("../keyboards/staticKeyboards");
const updateDatabaseLastChangedTime = require("../utils/updateDatabaseLastChangedTime");
const getMediaFolderByDatabaseId = require("../utils/getMediaFolderByDatabaseId");

class AddFilesScene {
    constructor() {
        const scene = new BaseScene("addFiles")

        scene.enter(this.enter);

        scene.hears("\u{1F519} Назад", this.back);

        scene.on("photo", this.getFileAndUpload);
        scene.on("video", this.getFileAndUpload);

        scene.hears("\u{1F6D1} Завершити додавання фото та зберегти контакт.", this.finishAddingRow);

        return scene;
    }

    async enter(ctx) {
        if(!ctx.session.sceneData.rowData[ctx.session.sceneData.columns.length]) {
            ctx.session.sceneData.rowData[ctx.session.sceneData.columns.length] = "";
        }
        
        const endAddingKeyboard = Markup.keyboard([
            ["\u{1F6D1} Завершити додавання фото та зберегти контакт."],
            ["\u{1F519} Назад"],
            ["\u{1F5C3} Повернутись на початкове меню"]
        ]).oneTime(true).resize();

        return await ctx.reply("Додайте фото чи відео", endAddingKeyboard);
    }

    async getFileAndUpload(ctx) {
        const rowData = ctx.session.sceneData.rowData;

        // Get photo or video and get its url
        const photo = ctx.message.photo ? ctx.message.photo[2] : undefined;
        const video = ctx.message.video;

        let fileUrl;
        try {
            fileUrl = (await ctx.telegram.getFileLink((video || photo).file_id)).href;
        } catch (err) {
            if(err.message.includes("file is too big")) {
                return await ctx.reply("Файл завеликий.");
            };
        };

        // Upload file into google drive and save its ID into entries array
        await ctx.reply("Завантажую файл...\nДочакайтесь повного завантаження");

        const mediaFilesFolderId = await getMediaFolderByDatabaseId(ctx);

        try {
            const uploadedFileId = await ctx.session.googleDriveService.uploadPhotoOrVideoByUrl(fileUrl, mediaFilesFolderId);

            rowData[ctx.session.sceneData.columns.length] += `${uploadedFileId};`;
        } catch (err) {
            return await ctx.reply("Не вдалось завантажити файл, спробуйте ще раз.");
        };

        await ctx.reply("Файл додано.");
    };


    // Function for saving data got
    async finishAddingRow(ctx) {
        // Update last changed date for the entry row and database
        const date = new Date();
        ctx.session.sceneData.rowData[ctx.session.sceneData.columns.length+1] = date.toISOString().split(".")[0];

        await updateDatabaseLastChangedTime(ctx);

        if(ctx.session.sceneData.sourceScene == "reviewFiles") {
            await ctx.reply("Додаю нові файли до бази...")

            await ctx.session.googleSheetsService.updateRow(
                ctx.session.currentDatabaseId,
                ctx.session.sceneData.rowId,
                ctx.session.sceneData.rowData
            )

            await ctx.reply("Готово!", navigationKeyboard);

            return ctx.scene.enter("reviewFiles");
        }

        await ctx.reply("Додаю новий контакт...")

        await ctx.session.googleSheetsService.writeData(ctx.session.currentDatabaseId, [ctx.session.sceneData.rowData]);

        await ctx.reply("Готово!", navigationKeyboard);

        delete ctx.session.sceneData.sourceScene

        return ctx.scene.enter("reviewDatabase");
    }

    async back(ctx) {
        await ctx.reply("Відміняю дію...", navigationKeyboard)

        return await ctx.scene.enter(ctx.session.sceneData.sourceScene);
    }
}

module.exports = AddFilesScene;