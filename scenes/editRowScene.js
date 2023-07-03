const { Scenes: { BaseScene }, Markup } = require("telegraf");

const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");
const updateDatabaseLastChangedTime = require("../utils/updateDatabaseLastChangedTime");

class EditRowScene {
    constructor() {
        const scene = new BaseScene("editRow");

        // Define enter and back handlers
        scene.enter(this.enter)
        scene.hears("\u{1F519} Назад", this.back);

        // Define handler for getting dasta from callback query
        scene.on("callback_query", ctx => {
            // Save entry ID into scene storage
            ctx.session.sceneData.entryId = ctx.callbackQuery.data;

            // Enter next scene
            ctx.scene.enter("editEntry");
        })

        // Define insuring handler
        scene.on("message", ctx => ctx.reply("Це не те, що мені треба"))

        return scene;
    }
    

    async enter(ctx) {
        // Delete recent keyboard
        deleteRecentKeyboard(ctx);

        // Get data of this row from the DB
        const row = ctx.session.sceneData.rowData;

        const columns = ctx.session.sceneData.columns;

        // Configure inline keyboard array
        const inlineKeyboardArray = [];

        for(let id = 0; id < columns.length; id++) {
            const entry = row[id];

            const button = Markup.button.callback(`${columns[id]}: ${entry || "Немає інформації"}`, id)
            inlineKeyboardArray.push([button]);
        }

        // Define inline keyboard with array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        // Send keyboard and save its ID to be able to delete it later
        const message = await ctx.reply("Що будете редагувати?", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }


    async back(ctx) {
        return await ctx.scene.enter("reviewRow");
    }
};

module.exports = EditRowScene;