const { Scenes: { BaseScene } } = require("telegraf");

const makeChatGPTRequest = require("../chatGPT/makeChatGPTRequest");
const { databaseFunctionsKeyboard } = require("../keyboards");

class MakeChatGPTRequestScene {
    constructor() {
        const scene = new BaseScene("makeChatGPTRequest");

        scene.enter(ctx => ctx.reply("Введіть запит:", { reply_markup: { remove_keyboard: true } }));

        scene.on("text", this.sendRequest);

        return scene;
    }

    async sendRequest(ctx) {
        const databaseData = await ctx.session.googleSheets.readData(ctx.session.currentDatabaseId);

        // Format this data to string with ";" separator
        let resultString = "";
        for(let i = 0; i < databaseData.length; i++) {
            for(let j = 0; j < databaseData[i].length; j++) {
                const entry = databaseData[i][j];

                resultString += `${entry}`;

                if(j+1==databaseData[i].length) continue;

                resultString += ";"
            }

            resultString += "\n"
        }

        // Push the database to the Chat GPT messages history
        ctx.session.messages.push({ role: "user", content: resultString+"\n\nце база даних." });

        // Make request to Chat GPT
        const answer = await makeChatGPTRequest(ctx);

        // If there is no problems then send an answer from Chat GPT
        if(answer) ctx.reply(answer, databaseFunctionsKeyboard);

        // Leave the scene
        return await ctx.scene.leave();
    }
}

module.exports = MakeChatGPTRequestScene;