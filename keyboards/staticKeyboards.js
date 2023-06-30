require("dotenv").config();
const { Markup } = require("telegraf");

const startKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("\u{1F5C3} Вибрати базу даних", "chooseDatabase")],
    [Markup.button.callback("\u{1F4DD} Створити шаблон", "createTemplate")]
])
const databaseFunctionsKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback("\u{1F4D5} Переглянути", "reviewDatabase"),
        Markup.button.callback("\u{270F} Редагувати", "editDatabase"),
        Markup.button.callback("\u{1F4E9} Перемістити", "moveDatabase"),
        Markup.button.callback("\u{1F5D1} Видалити", "deleteDatabase")
    ],
    [Markup.button.callback("\u{1F916} Відправити запит Chat GPT", "makeChatGPTRequest")],
    [Markup.button.callback("\u{1F519} Повернутись до вибору бази даних", "chooseDatabase")]
])

const endChatSessionKeyboard = Markup.keyboard([
    ["\u{1F6D1} Завершити сесію"]
]).oneTime(true).resize();

module.exports = {
    startKeyboard,
    databaseFunctionsKeyboard,
    endChatSessionKeyboard
}