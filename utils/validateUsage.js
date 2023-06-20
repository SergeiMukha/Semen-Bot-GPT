function validateUsage(ctx) {
    const googleSheetsParser = ctx.session.googleSheets;
    const messages = ctx.session.messages;

    if(!googleSheetsParser || !messages) {
        return false;
    }

    return true;
}

module.exports = validateUsage;