const { Scenes: { BaseScene }, Markup } = require("telegraf");
const startHandler = require("../handlers/startHandler");
const { stopKeyboard } = require("../keyboards/staticKeyboards");

const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");
const updateDatabaseLastChangedTime = require("../utils/updateDatabaseLastChangedTime");

class EditEntryScene {
    constructor() {
        const scene = new BaseScene("editEntry");

        // Define enter and text handlers
        scene.enter(this.enter);

        scene.hears("\u{1F519} Назад", this.back);

        scene.on("text", this.editEntry);

        return scene;
    }

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        return ctx.reply("Введіть нове значення:");
    }

    async editEntry(ctx) {
        // Get all necessary data to update DB
        const newValue = ctx.message.text;

        const entryId = ctx.session.sceneData.entryId;
        const rowId = ctx.session.sceneData.rowId;
        const rowData = ctx.session.sceneData.rowData;
        
        // Update array with new value
        rowData[entryId] = newValue;

        const date = new Date();
        rowData[ctx.session.sceneData.columns.length+1] = date.toISOString().split(".")[0];

        await updateDatabaseLastChangedTime(ctx);

        // Update row in DB with new row
        await ctx.session.googleSheetsService.updateRow(
            ctx.session.currentDatabaseId,
            rowId,
            rowData
        );

        await ctx.reply("Готово!");

        return await ctx.scene.enter("editRow");
    }

    
    async back(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        return await ctx.scene.enter("editRow");
    }
};

module.exports = EditEntryScene;