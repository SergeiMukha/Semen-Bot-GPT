const { Scenes: { BaseScene }, Markup } = require("telegraf");

const makeChatGPTRequest = require("../chatGPT/makeChatGPTRequest");
const { endChatSessionKeyboard, navigationKeyboard } = require("../keyboards/staticKeyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class MakeChatGPTRequestScene {
    constructor() {
        const scene = new BaseScene("makeChatGPTRequest");

        // Enter handler
        scene.enter(ctx => { deleteRecentKeyboard(ctx); ctx.reply("Введіть запит:", endChatSessionKeyboard); });

        // End Chat GPT session button handler
        scene.hears("\u{1F6D1} Завершити сесію", this.finishSession);
        scene.hears("\u{1F519} Назад", this.finishSession);

        // Message to Chat GPT handler
        scene.on("text", this.sendRequest);

        return scene;
    }

    async finishSession(ctx) {
        ctx.session.messages = [];

        await ctx.reply("Сесію завершено.", navigationKeyboard)

        return await ctx.scene.enter("databaseActions");
    }

    async sendRequest(ctx) {
        const databaseData = await ctx.session.googleSheetsService.readData(ctx.session.currentDatabaseId);

        // Get columns names
        const columnsNames = []
        for(let i = 0; i < databaseData[0].length; i++) {
            columnsNames.push(`${databaseData[0][i]}`);
        }

        // Configure messages fot Chat GPT
        for(let i = 1; i < databaseData.length; i++) {
            let resultString = "";
            for(let j = 0; j < databaseData[i].length; j++) {
                const entry = databaseData[i][j];

                resultString += `${columnsNames[j]}: ${entry}\n`
            }

            // Push the database to the Chat GPT messages history
            ctx.session.messages.push({ role: "user", content: resultString });
        }

        // Make request to Chat GPT
        const answer = await makeChatGPTRequest(ctx);

        // If there is no problems then send an answer from Chat GPT
        if(answer) {
            ctx.reply(answer, endChatSessionKeyboard);

            ctx.session.messages.push({ role: "assistant", content: answer })
        }
    }
}

module.exports = MakeChatGPTRequestScene;