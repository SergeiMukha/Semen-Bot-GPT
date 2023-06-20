const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { startKeyboard, databaseFunctionsKeyboard } = require("../keyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class EditDatabaseScene {
    constructor() {
        const scene = new BaseScene("editDatabase");

        // Define enter, cancel and back handlers
        scene.enter(this.enter);
    
        scene.action("cancel", ctx => { deleteRecentKeyboard(ctx); ctx.scene.leave(); ctx.reply("Оберіть дію:", startKeyboard) });
        scene.action("back", ctx => { deleteRecentKeyboard(ctx); ctx.scene.leave(); ctx.reply("Оберіть дію:", databaseFunctionsKeyboard) });
        scene.action("addNewEntry", ctx => { deleteRecentKeyboard(ctx); ctx.scene.enter("addDatabaseEntry") })

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
        // Delete default keyboard
        ctx.reply("Ховаю клавіатуру", {
            reply_markup: { remove_keyboard: true },
        })
        .then(message => ctx.telegram.deleteMessage(ctx.chat.id, message.message_id))

        // Define object where all scene data will store
        ctx.session.editSceneData = {};

        // Get DB data
        const data = await ctx.session.googleSheets.readData(ctx.session.currentDatabaseId);
        if(!data) ctx.reply("Ця база даних пуста.")
        data.shift();

        // Configure inline keyboard array
        const inlineKeyboardArray = []

        for(let i = 0; i < data.length; i++) {
            let row = "";

            for(let j = 0; j < data[i].length; j++) {
                const entry = data[i][j];

                row += `${entry}`;

                // * If this element is the last in the row then don't add " - " in the end 
                if(j+1==data[i].length) continue;

                row += " - "
            }

            // Define button and push it to the array
            const button = Markup.button.callback(row, i);
            inlineKeyboardArray.push([button]);
        }

        // Define cancel and back buttons and push it into array
        const backButton = Markup.button.callback("Назад", "back");
        const cancelButton = Markup.button.callback("Скасувати", "cancel");

        inlineKeyboardArray.push([backButton, cancelButton]);

        const addNewEntryButon = Markup.button.callback("Додати новий контакт", "addNewEntry");
        inlineKeyboardArray.push([addNewEntryButon]);

        // Define inline keyboard with that array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        // Sending keyboard and save its ID to be able to delete it later
        const message = await ctx.reply("Оберіть контакт для редагування:", inlineKeyboard);
        ctx.session.recentKeyboardId = message.message_id;

        return;
    }
}

module.exports = EditDatabaseScene;