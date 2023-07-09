const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { stopKeyboard } = require("../keyboards/staticKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");
const updateDatabaseLastChangedTime = require("../utils/updateDatabaseLastChangedTime");

class AddDatabaseRowScene {
    constructor() {
        const scene = new BaseScene("addDatabaseRow");

        scene.enter(this.enter);

        scene.hears("\u{1F519} Назад", this.back);

        scene.on("text", this.getEntry);

        return scene;
    }

    async enter(ctx) {
        ctx.session.sceneData = {};

        // Define counter for iterating columns
        ctx.session.sceneData.counter = 0;

        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get columns of current database
        const columns = (await ctx.session.googleSheetsService.readData(ctx.session.currentDatabaseId))[0];
        ctx.session.sceneData.columns = columns;

        // Define array for entries to add to a database
        ctx.session.sceneData.rowData = [];

        await ctx.replyWithHTML(`Введіть <b>${ctx.session.sceneData.columns[ctx.session.sceneData.counter]}</b>:`, stopKeyboard);
    }


    async getEntry(ctx) {
        const entry = ctx.message.text;

        // If it is the last column to enter
        if(ctx.session.sceneData.counter+1 == ctx.session.sceneData.columns.length) {
            ctx.session.sceneData.counter += 1;
            
            ctx.session.sceneData.rowData.push(entry);

            return await ctx.scene.enter("addFiles");
        };

        // If it's not the last columnt to enter
        if(ctx.session.sceneData.counter+1 < ctx.session.sceneData.columns.length) {
            ctx.session.sceneData.counter += 1;
            
            ctx.session.sceneData.rowData.push(entry);

            return await ctx.replyWithHTML(`Введіть <b>${ctx.session.sceneData.columns[ctx.session.sceneData.counter]}</b>:`);
        };
    }

    async back(ctx) {
        return await ctx.scene.enter("reviewDatabase");
    }
}

module.exports = AddDatabaseRowScene;