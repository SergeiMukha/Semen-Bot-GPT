const { startKeyboard } = require("../keyboards");

require("dotenv").config();

async function deleteDatabaseHandler(ctx) {
    const databasesList = await ctx.session.googleSheets.readData(process.env.DATABASES_TABLE_ID);

    for(let i = 0; i < databasesList.length; i++) {
        if(databasesList[i][1] == ctx.session.currentDatabaseId) {
            await ctx.session.googleSheets.deleteRow(i);
        } 
    }

    return await ctx.reply("База успішно видалена.", startKeyboard);
}

module.exports = deleteDatabaseHandler;