function validateUsage(ctx) {
    const googleSheetsService = ctx.session.googleSheetsService;
    const googleDriveService = ctx.session.googleDriveService;
    const messages = ctx.session.messages;

    if(!googleSheetsService || !googleDriveService || !messages) {
        return false;
    }

    return true;
}

module.exports = validateUsage;