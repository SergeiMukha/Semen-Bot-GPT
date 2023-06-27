const { Scenes: { BaseScene }, Markup } = require("telegraf");
const { Keyboard } = require("telegram-keyboard");

const makeChatGPTRequest = require("../chatGPT/makeChatGPTRequest");
const { databaseFunctionsKeyboard, endChatSessionKeyboard } = require("../keyboards");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class MakeChatGPTRequestScene {
    constructor() {
        const scene = new BaseScene("makeChatGPTRequest");

        // Enter handler
        scene.enter(ctx => { deleteRecentKeyboard(ctx); ctx.reply("Введіть запит:", endChatSessionKeyboard); });

        // End Chat GPT session button handler
        scene.hears("Завершити сесію", async ctx => {
            ctx.scene.leave();
            
            ctx.session.messages = [];
            
            const message = await ctx.reply("Що ви хочете зробити з цією базою даних?", databaseFunctionsKeyboard);
            ctx.session.recentKeyboardId = message.message_id;
        })

        // Message to Chat GPT handler
        scene.on("text", this.sendRequest);

        return scene;
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