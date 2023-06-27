const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

async function deleteFolderHandler(ctx) {
    // Get parent folder
    const parentFolder = await ctx.session.googleDriveService.getFolderParent(ctx.session.currentFolderId);
    
    // Delete database
    await ctx.session.googleDriveService.deleteItem(ctx.session.currentFolderId);

    // Set parent folder ID as current folder ID 
    ctx.session.currentFolderId = parentFolder;

    // Delete recent keyboard
    deleteRecentKeyboard(ctx);

    await ctx.reply("Папка успішно видалена.");

    return ctx.scene.enter("chooseDatabase");
}

module.exports = deleteFolderHandler;