require("dotenv").config();

async function getMediaFolderByDatabaseId(ctx) {
    const folderId = await ctx.session.googleDriveService.getFileIdByNameInFolder(
        ctx.session.currentDatabaseId,
        process.env.MEDIA_FOLDER_ID
    )

    return folderId;
}

module.exports = getMediaFolderByDatabaseId;