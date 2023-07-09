require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    organization: process.env.CHAT_GPT_ORGANIZATION,
    apiKey: process.env.CHAT_GPT_TOKEN
})

const openai = new OpenAIApi(configuration)

const sendMessageToChatGpt = async (messages) => {
    const chat = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages
    })

    const answer = chat.data.choices[0].message
    
    return answer
}

module.exports = sendMessageToChatGpt