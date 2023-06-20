const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    organization: "org-wKwdyZlm5VKtSk1g35Zxa4mk",
    apiKey: "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"
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