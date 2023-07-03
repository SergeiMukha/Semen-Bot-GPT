require("dotenv").config();
const { Markup } = require("telegraf");

const startKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("\u{1F5C3} Вибрати базу даних", "chooseDatabase")],
    [Markup.button.callback("\u{1F4DD} Шаблони баз даних", "reviewTemplates")]
])
const databaseActionsKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback("\u{1F4D5} Переглянути", "reviewDatabase"),
        Markup.button.callback("\u{1F4E9} Перемістити", "moveDatabase"),
        Markup.button.callback("\u{1F5D1} Видалити", "deleteDatabase")
    ],
    [Markup.button.callback("\u{1F170} Перейменувати базу", "renameDatabase")],
    [Markup.button.callback("\u{1F916} Відправити запит Chat GPT", "makeChatGPTRequest")]
])

const endChatSessionKeyboard = Markup.keyboard([
    ["\u{1F6D1} Завершити сесію"]
]).oneTime(true).resize();

const navigationKeyboard = Markup.keyboard([
    Markup.button.text("\u{1F519} Назад"),
    Markup.button.text("\u{1F5C3} Повернутись на початкове меню")
]).resize();

module.exports = {
    startKeyboard,
    databaseActionsKeyboard,
    endChatSessionKeyboard,
    navigationKeyboard
}