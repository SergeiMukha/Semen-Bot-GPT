function deleteRecentKeyboard(ctx) {
    const keyboardId = ctx.session.recentKeyboardId;
    const chatId = ctx.chat.id;

    ctx.telegram.deleteMessage(chatId, keyboardId);
}

module.exports = deleteRecentKeyboard;