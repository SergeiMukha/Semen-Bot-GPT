async function setCurrentDatabaseInChatGPTSession(ctx) {
    const db = await ctx.session.googleSheetsParser.getData(ctx.message.text)

    const dbForChatGPT = `${db}\n\nце база даних.`
    ctx.session.messages.push({ role: "user", content: dbForChatGPT });
}

module.exports = setCurrentDatabaseInChatGPTSession;