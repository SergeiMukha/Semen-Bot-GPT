async function readDatabaseHandler(ctx) {
    const data = await ctx.session.googleSheets.readData(ctx.session.currentDatabaseId);
    if(!data) ctx.reply("Ця база даних пуста.")

    let resultString = "";
    for(let i = 0; i < data.length; i++) {
        resultString += "\n\n"

        for(let j = 0; j < data[i].length; j++) {
            const entry = data[i][j];

            resultString += `${entry}`;

            if(j+1==data[i].length) continue;

            resultString += " - "
        }
    }

    return ctx.reply(resultString);
}

module.exports = readDatabaseHandler;