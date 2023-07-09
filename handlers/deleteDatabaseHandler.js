const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");
const getMediaFolderByDatabaseId = require("../utils/getMediaFolderByDatabaseId");

async function deleteDatabaseHandler(ctx) {
    // Delete media folder
    const mediaFolderId = await getMediaFolderByDatabaseId(ctx);

    await ctx.session.googleDriveService.deleteItem(mediaFolderId);

    // Delete database
    await ctx.session.googleDriveService.deleteItem(ctx.session.currentDatabaseId);

    // Delete recent keyboard
    deleteRecentKeyboard(ctx);

    await ctx.reply("База успішно видалена.");

    return ctx.scene.enter("chooseDatabase");
}

module.exports = deleteDatabaseHandler;