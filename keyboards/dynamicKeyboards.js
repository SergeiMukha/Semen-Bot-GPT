const { Markup } = require("telegraf");

// Configure inline keyboard for folder items
async function configureFolderItemsInlineKeyboardArray(items) {
    // Configure inline keyboard array with this list
    const inlineKeyboardArray = []

    for(let i = 0; i < items.length; i++) {
        const item = items[i];
        if(item.id == process.env.TEMPLATES_TABLE_ID) {
            continue;
        }

        const btnText = (item.mimeType=="application/vnd.google-apps.spreadsheet" ? "\u{1F4CB} " : "\u{1F4C1} ") + item.name;
        const btnCallbackData = item.id;

        const button = Markup.button.callback(btnText, btnCallbackData);
        inlineKeyboardArray.push([button]);
    }

    // Define back, create database and create folder button button
    const createDatabaseButton = Markup.button.callback("\u{1F195}\u{1F4CB} Створити таблицю", "createDatabase");
    const createFolderButton = Markup.button.callback("\u{1F195}\u{1F4C1} Створити папку", "createFolder");
    const backButton = Markup.button.callback("\u{1F519} Назад", "back");

    inlineKeyboardArray.push(
        [
            createDatabaseButton,
            createFolderButton
        ],
        [ backButton ]
    );

    return inlineKeyboardArray;
}

// Configure pages inline keyboard array
async function configurePageInlineKeyboardArray(data, page, columnsLength) {
    // Configure inline keyboard array
    const inlineKeyboardArray = [];

    for(let i = 0; i < 10; i++) {
        // Get index of the element considering the page number
        // The size of one page is 10 entry rows
        // So the index will be 10 multiplied by page plus "i"
        const index = i+10*page;

        // If index = length of data then it is the last entry row
        if(index==data.length) {
            break;
        }

        // Get entry row by its index
        const entryRow = data[index];

        // Define button and push it to the array
        const button = Markup.button.callback(`\u{2709} ${entryRow[0]}(${entryRow[columnsLength+1]})`, index+1);
        inlineKeyboardArray.push([button]);
    }

    // Define pages moving buttons
    const movingButtons = [];
    // If the page number is more than 0 then add previous page button
    if(page > 0) movingButtons.push(Markup.button.callback("\u{2B05} Попередня сторінка", "previous"));
    // If the page biggest entry row index is lower than length of the data then add next page button
    if((9+page*10)+1<data.length) movingButtons.push(Markup.button.callback("Наступна сторінка \u{27A1}", "next"));

    inlineKeyboardArray.push(movingButtons);

    return inlineKeyboardArray;
}

module.exports = {
    configureFolderItemsInlineKeyboardArray,
    configurePageInlineKeyboardArray
}