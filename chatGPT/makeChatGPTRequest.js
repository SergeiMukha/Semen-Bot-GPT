const sendMessageToChatGpt = require("./sendMessageToChatGpt");

async function makeChatGPTRequest(ctx) {
    // Add new message to chat history
    ctx.session.messages.push({ role: "user", content: ctx.message.text });

    // Add an answer to chat history
    try {
        const answer = await sendMessageToChatGpt(ctx.session.messages);
        ctx.session.messages.push(answer);

        ctx.session.messages = [];

        // Send ChatGPT answer to the user
        return answer.content;
    } catch (err) {
        if(!err.response) {
            ctx.reply("Невідома помилка. Зверніться, будь ласка, до розробника.");

            return;
        }

        if(err.response.status == 400) {
            ctx.reply("Завелика кількість токенів(даних) у вхідному чи вихідному повідомленні, змініть запит, або зменшіть обсяг даних.")
            return;
        } else if(err.response.status == 429) {
            ctx.reply("Забагато запитів в певний проміжок часу.")
            return;
        } else {
            ctx.reply("Невідома помилка. Зверніться, будь ласка, до розробника.")
            return;
        }
    }
}

module.exports = makeChatGPTRequest