const { Keyboard } = require('telegram-keyboard')

const startKeyboard = Keyboard.make([
    ["Створити базу даних", "Вибрати базу даних"],
]).reply()

const databaseFunctionsKeyboard = Keyboard.make([
    ["Переглянути базу даних", "Редагувати базу даних", "Видалити базу даних"],
    ["Відправити запит Chat GPT"],
    ["Повернутись на початок"]
]).reply();

module.exports = {
    startKeyboard,
    databaseFunctionsKeyboard
}