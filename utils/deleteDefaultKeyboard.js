function deleteDefaultKeyboard(ctx) {
    ctx.reply("Клавіатуру видалено.", { reply_markup: { remove_keyboard: true } })
    .then(message => ctx.telegram.deleteMessage(ctx.chat.id, message.message_id));
};

module.exports = deleteDefaultKeyboard;