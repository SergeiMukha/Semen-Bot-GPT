const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

async function deleteDatabaseHandler(ctx) {
    // Delete database
    await ctx.session.googleDriveService.deleteItem(ctx.session.currentDatabaseId);

    // Delete recent keyboard
    deleteRecentKeyboard(ctx);

    await ctx.reply("База успішно видалена.");

    return ctx.scene.enter("chooseDatabase");
}

module.exports = deleteDatabaseHandler;