const { Scenes: { BaseScene }, Markup } = require("telegraf");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");
const updateDatabaseLastChangedTime = require("../utils/updateDatabaseLastChangedTime");

class AddDatabaseEntryScene {
    constructor() {
        const scene = new BaseScene("addDatabaseEntry");
        scene.enter(this.enter.bind(this));

        scene.on("text", this.getEntry.bind(this));
        scene.on("photo", this.getFileAndSaveRow.bind(this));
        scene.on("video", this.getFileAndSaveRow.bind(this));

        // Handlers for adding photo or video choice buttons
        scene.action("addPhoto", async ctx => await ctx.reply("Відправте фото чи відео:"));
        scene.action("finish", this.saveRow.bind(this));

        return scene;
    }


    async enter(ctx) {
        // Define counter for iterating columns
        ctx.session.counter = 0;

        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get columns of current database
        const columns = (await ctx.session.googleSheetsService.readData(ctx.session.currentDatabaseId))[0];
        ctx.session.columns = columns;

        // Define array for entries to add to a database
        ctx.session.entriesToAdd = [];

        await ctx.replyWithHTML(`Введіть <b>${ctx.session.columns[ctx.session.counter]}</b>:`);
    }


    async getEntry(ctx) {
        const entry = ctx.message.text;

        // If it is the last column to enter
        if(ctx.session.counter+1 == ctx.session.columns.length) {
            ctx.session.counter += 1;
            
            ctx.session.entriesToAdd.push(entry);

            // Define buttons for adding photo or video choice
            const photoButtons = Markup.inlineKeyboard([
                [Markup.button.callback("Так", "addPhoto")],
                [Markup.button.callback("Ні", "finish")]
            ])

            return await ctx.reply("Бажаєте додати фото чи відео?", photoButtons);
        };

        // If it's not the last columnt to enter
        if(ctx.session.counter+1 < ctx.session.columns.length) {
            ctx.session.counter += 1;
            
            ctx.session.entriesToAdd.push(entry);

            return await ctx.replyWithHTML(`Введіть <b>${ctx.session.columns[ctx.session.counter]}</b>:`);
        };

        // If columns exceeded and the user have to provide photo or video
        if(ctx.session.counter+1 > ctx.session.columns.length) {
            return await ctx.reply("Відправте фото чи відео:");
        };
    }


    async getFileAndSaveRow(ctx) {
        // If counter didn't finish iterating columns
        if(ctx.session.counter+1 < ctx.session.columns.length) {
            return await ctx.reply("Введіть текст.")
        }

        // Get photo or video and get its url
        const photo = ctx.message.photo ? ctx.message.photo[2] : undefined;
        const video = ctx.message.video;
        const fileUrl = (await ctx.telegram.getFileLink((video || photo).file_id)).href;

        // Upload file into google drive and save its ID into entries array
        await ctx.reply("Завантажую файл...");

        const uploadedFileId = await ctx.session.googleDriveService.uploadPhotoOrVideoByUrl(fileUrl);
        ctx.session.entriesToAdd.push(uploadedFileId);

        return await this.saveRow.bind(this)(ctx);
    }


    // Function for saving data got
    async saveRow(ctx) {
        // Update last changed date for the entry row and database
        const date = new Date();
        ctx.session.entriesToAdd[ctx.session.columns.length+1] = date.toISOString();

        await updateDatabaseLastChangedTime(ctx);

        await ctx.reply("Додаю новий контакт...")

        await ctx.session.googleSheetsService.writeData(ctx.session.currentDatabaseId, [ctx.session.entriesToAdd]);

        await ctx.reply("Готово!");
        
        delete ctx.session.columns;
        delete ctx.session.entriesToAdd;
        delete ctx.session.counter;

        await ctx.scene.leave();

        return ctx.scene.enter("editDatabase");
    }
}

module.exports = AddDatabaseEntryScene;