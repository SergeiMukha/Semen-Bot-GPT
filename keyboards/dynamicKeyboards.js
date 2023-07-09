const { Markup } = require("telegraf");

// Configure inline keyboard for folder items
async function configureFolderItemsPageInlineKeyboardArray(items, page) {
    // Configure inline keyboard array with this list
    const inlineKeyboardArray = []

    if(items.length != 0) {
        for(let i = 0; i < 10; i++) {
            // Get index of the element considering the page number
            // The size of one page is 10 entry rows
            // So the index will be 10 multiplied by page plus "i"
            const index = i+10*page;

            // If index = length of data then it is the last entry row
            if(index==items.length) {
                break;
            }

            const item = items[index];
            if(item.id == process.env.TEMPLATES_TABLE_ID || item.id == process.env.MEDIA_FOLDER_ID) {
                continue;
            }

            const btnText = (item.mimeType=="application/vnd.google-apps.spreadsheet" ? "\u{1F4CB} " : "\u{1F4C1} ") + item.name;
            const btnCallbackData = item.id;

            const button = Markup.button.callback(btnText, btnCallbackData);
            inlineKeyboardArray.push([button]);
        }

        // Define pages moving buttons
        const movingButtons = [];
        // If the page number is more than 0 then add previous page button
        if(page > 0) movingButtons.push(Markup.button.callback("\u{2B05} Попередня сторінка", "previousPage"));
        // If the page biggest entry row index is lower than length of the data then add next page button
        if((9+page*10)+1<items.length) movingButtons.push(Markup.button.callback("Наступна сторінка \u{27A1}", "nextPage"));

        inlineKeyboardArray.push(movingButtons);
    }

    // Define back, create database and create folder button button
    const createDatabaseButton = Markup.button.callback("\u{1F195}\u{1F4CB} Створити базу", "createDatabase");
    const createFolderButton = Markup.button.callback("\u{1F195}\u{1F4C1} Створити папку", "createFolder");

    inlineKeyboardArray.push(
        [
            createDatabaseButton,
            createFolderButton
        ]
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

        if(!entryRow[0]) continue;

        const date = entryRow[columnsLength+1] ? `(${entryRow[columnsLength+1]})` : "";

        // Define button and push it to the array
        const button = Markup.button.callback(`\u{2709} ${entryRow[0]} ${date}`, index+1);
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

async function configureFoldersInlineKeyboardArray(folders) {
    // Configure inline keyboard array with this list
    const inlineKeyboardArray = []

    for(let i = 0; i < folders.length; i++) {
        const folder = folders[i];

        if(folder.id == process.env.MEDIA_FOLDER_ID) continue;

        const btnText = `\u{1F4C1} ${folder.name}`;
        const btnCallbackData = folder.id;

        const button = Markup.button.callback(btnText, btnCallbackData);
        inlineKeyboardArray.push([button]);
    }

    // Define back, create database and create folder button button
    const moveButton = Markup.button.callback("\u{1F4E9} Перемістити сюди", "move");
    const createFolderButton = Markup.button.callback("\u{1F195}\u{1F4C1} Створити нову папку і перемістити в неї.", "createFolder");

    inlineKeyboardArray.push([moveButton, createFolderButton]);

    return inlineKeyboardArray;
}

async function configureTemplatesInlineKeyboardArray(templates) {
    // Configure inline keyboard with templates
    const inlineKeyboardArray = [];

    for(let i = 1; i < templates.length; i++) {
        const templateName = templates[i][0];
        if(!templateName) continue;

        const button = Markup.button.callback(templateName, i);
        inlineKeyboardArray.push([button]);
    };

    return inlineKeyboardArray;
}

async function configureTemplateDataInlineKeyboardArray(templateData) {
    const inlineKeyboardArray = [];

    for(let i = 0; i < templateData.length; i++) {
        let button;

        if(i == 0) {
            button = Markup.button.callback(`Назва: ${templateData[i]}`, i);
        } else {
            button = Markup.button.callback(templateData[i], i);
        }

        inlineKeyboardArray.push([button]);
    }

    return inlineKeyboardArray;
}

module.exports = {
    configureFolderItemsPageInlineKeyboardArray,
    configurePageInlineKeyboardArray,
    configureFoldersInlineKeyboardArray,
    configureTemplatesInlineKeyboardArray,
    configureTemplateDataInlineKeyboardArray
}