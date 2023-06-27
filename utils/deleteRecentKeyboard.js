async function deleteRecentKeyboard(ctx) {
    const keyboardId = ctx.session.recentKeyboardId;
    const chatId = ctx.chat.id;

    try {
        await ctx.telegram.deleteMessage(chatId, keyboardId);
    } catch {};
}

module.exports = deleteRecentKeyboard;