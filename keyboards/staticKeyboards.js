require("dotenv").config();
const { Markup } = require("telegraf");

const startKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("Вибрати базу даних", "chooseDatabase")],
    [Markup.button.callback("Створити шаблон", "createTemplate")]
])
const databaseFunctionsKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback("\u{1F4D5} Переглянути базу даних", "reviewDatabase"),
        Markup.button.callback("\u{270F} Редагувати базу даних", "editDatabase"),
        Markup.button.callback("\u{1F5D1} Видалити базу даних", "deleteDatabase")
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