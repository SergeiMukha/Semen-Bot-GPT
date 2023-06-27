const { Markup } = require("telegraf");

const { Keyboard } = require("telegram-keyboard");

const startKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("Вибрати базу даних", "chooseDatabase")]
])
const databaseFunctionsKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback("Переглянути базу даних", "reviewDatabase"),
        Markup.button.callback("Редагувати базу даних", "editDatabase"),
        Markup.button.callback("Видалити базу даних", "deleteDatabase")
    ],
    [Markup.button.callback("Відправити запит Chat GPT", "makeChatGPTRequest")],
    [Markup.button.callback("Повернутись до вибору бази даних", "chooseDatabase")]
])

const endChatSessionKeyboard = Keyboard.make([
    ["Завершити сесію"]
]).reply();

async function configureInlineKeyboardWithFolderItems(ctx) {
    const items = await ctx.session.googleDriveService.getItemsInFolder(ctx.session.currentFolderId);
    
    // Configure inline keyboard array with this list
    const inlineKeyboardArray = []

    for(let i = 0; i < items.length; i++) {
        const item = items[i];

        const btnText = (item.mimeType=="application/vnd.google-apps.spreadsheet" ? "Таблиця - " : "Папка - ") + item.name;
        const btnCallbackData = item.id;

        const button = Markup.button.callback(btnText, btnCallbackData);
        inlineKeyboardArray.push([button]);
    }

    // Define back, create database and create folder button button
    const createDatabaseButton = Markup.button.callback("Створити таблицю", "createDatabase");
    const createFolderButton = Markup.button.callback("Створити папку", "createFolder");
    const deleteFolderButton = Markup.button.callback("Видалити папку", "deleteFolder");
    const backButton = Markup.button.callback("Назад", "back");

    inlineKeyboardArray.push(
        [
            createDatabaseButton,
            createFolderButton
        ],
        (ctx.session.currentFolderId!="root" && ctx.session.currentFolderId != "0ALn1mc-2LlA9Uk9PVA" ? [deleteFolderButton] : []),
        [ backButton ]
    );

    // Define inline keyboard with inline keyboard array
    const inlineKeyboard = Markup.inlineKeyboard(inlineKeyboardArray);

    return inlineKeyboard;
}

module.exports = {
    startKeyboard,
    databaseFunctionsKeyboard,
    endChatSessionKeyboard,
    configureInlineKeyboardWithFolderItems
}