require("dotenv").config();

const { Scenes: { BaseScene }, Markup } = require("telegraf");
const startHandler = require("../handlers/startHandler");
const { configureTemplatesInlineKeyboardArray } = require("../keyboards/dynamicKeyboards");
const { stopKeyboard } = require("../keyboards/staticKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class CreateDatabaseScene {
    constructor() {
        const scene = new BaseScene("createDatabase");

        scene.enter(this.enter);
        
        scene.hears("\u{1F519} Назад", this.back);
        
        scene.on("text", this.getName);

        scene.on("callback_query", this.createDatabase);

        scene.on("message", (ctx) => ctx.reply("Це не те, що мені треба"));

        return scene;
    }

    async enter(ctx) {
        deleteRecentKeyboard(ctx);

        ctx.session.sceneData = {};
        
        ctx.reply("Введіть назву для бази даних:", stopKeyboard);
    }

    async getName(ctx) {
        const name = ctx.message.text;
        ctx.session.sceneData.name = name;

        const templates = await ctx.session.googleSheetsService.readData(process.env.TEMPLATES_TABLE_ID);
        if(templates.slice(1).length == 0) {
            await ctx.reply("Ви ще не створили жодного шаблону.");

            await ctx.scene.leave();

            return startHandler(ctx);
        }
        
        const inlineKeyboardArray = await configureTemplatesInlineKeyboardArray(templates);

        // Define inline keyboard with inline keyboard array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        const message = await ctx.reply("Оберіть шаблон:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }

    async createDatabase(ctx) {
        const columns = (await ctx.session.googleSheetsService.readData(process.env.TEMPLATES_TABLE_ID))[ctx.callbackQuery.data].slice(1);

        await ctx.reply("Створюю базу даних...");
        try {
            // Create database and add it to databases list
            const spreadsheetId = await ctx.session.googleSheetsService.createDatabase(ctx.session.sceneData.name);
            await ctx.session.googleDriveService.moveSpreadsheetToFolder(spreadsheetId, ctx.session.currentFolderId);

            // Add columns names and delete first unnecessary sheet
            await ctx.session.googleSheetsService.deleteFirstSheet(spreadsheetId);
            await ctx.session.googleSheetsService.writeData(spreadsheetId, [columns]);

            // Creating media folder for this DB
            await ctx.session.googleDriveService.createFolder(spreadsheetId, process.env.MEDIA_FOLDER_ID);
            
            ctx.session.currentDatabaseId = spreadsheetId;
        } catch (err) {
            ctx.reply("Помилка. Детальну інформацію щодо помилки ви можете побачити в логах бота.")
    
            console.log(err);
        };
    
        ctx.scene.leave();
    
        await ctx.reply("База даних створена.");

        return ctx.scene.enter("addDatabaseRow");
    }

    async back(ctx) {
        delete ctx.session.sceneData;

        return await ctx.scene.enter("chooseDatabase");
    }
}

module.exports = CreateDatabaseScene;