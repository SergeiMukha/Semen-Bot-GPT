const re = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/

async function updateDatabaseLastChangedTime(ctx) {
    const currentFileName = await ctx.session.googleDriveService.getFileName(ctx.session.currentDatabaseId);

    const dateFromFileName = re.exec(currentFileName) ? re.exec(currentFileName)[0] : undefined;

    let currentFileNameWithoutDate;
    if(dateFromFileName) {
        currentFileNameWithoutDate = currentFileName.replace(`(${dateFromFileName})`, "");
    }

    const date = new Date();

    const time = date.toISOString().split(".")[0];

    const newFileName = `${currentFileNameWithoutDate || currentFileName} (${time})`;

    await ctx.session.googleDriveService.changeFileName(ctx.session.currentDatabaseId, newFileName);
};

module.exports = updateDatabaseLastChangedTime;