const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { databaseFunctionsKeyboard } = require("../keyboards");

class GetDatabaseScene {
    constructor() {
        const scene = new BaseScene("getDatabase");

        scene.enter(this.enter);

        scene.on("callback_query", this.getDatabase);
        
        scene.on("message", (ctx) => ctx.reply("Це не те, що мені треба"));

        return scene;
    }

    async enter(ctx) {
        // Get list of databases
        const databasesList = await ctx.session.googleSheets.readData(process.env.DATABASES_TABLE_ID);
        if(!databasesList) {
            await ctx.reply("Ви ще не створювали бази даних.");

            return await ctx.scene.leave();
        }

        // Configure inline keyboard array with this list
        const inlineKeyboardArray = []

        for(let i = 0; i < databasesList.length; i++) {
            if(databasesList[i].length == 0) continue;

            const btnText = databasesList[i][0];
            const btnCallbackData = databasesList[i][1];

            const button = Markup.button.callback(btnText, btnCallbackData);
            inlineKeyboardArray.push([button]);
        }

        // Define inline keyboard with inline keyboard array
        const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

        return ctx.reply("Ось список баз:", inlineKeyboard);
    }

    async getDatabase(ctx) {
        // Getting database ID from callback data
        const databaseId = ctx.callbackQuery.data;

        // Setting database as current
        ctx.session.currentDatabaseId = databaseId;

        await ctx.reply("Що ви хочете зробити з цією базою даних?", databaseFunctionsKeyboard);

        return await ctx.scene.leave();
    }
}

module.exports = GetDatabaseScene;