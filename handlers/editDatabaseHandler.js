async function editDatabaseHandler(ctx) {
    const data = await ctx.session.googleSheets.readData(ctx.session.currentDatabaseId);
    if(!data) ctx.reply("Ця база даних пуста.")

    const replyMarkup = {
        inline_keyboard: []
    };

    for(let i = 0; i < data.length; i++) {
        let row = "";

        for(let j = 0; j < data[i].length; j++) {
            const entry = data[i][j];

            row += `${entry}`;

            if(j+1==data[i].length) continue;

            row += " - "
        }

        const button = { text: row, callback_data: i+1 }
        replyMarkup.inline_keyboard.push([button]);
    }

    return ctx.reply("Оберіть контакт для редагування:", { reply_markup: replyMarkup })
}

module.exports = editDatabaseHandler;