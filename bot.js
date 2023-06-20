require("dotenv").config();

const { Telegraf, Scenes, session } = require('telegraf');

const GetDatabaseScene = require("./scenes/getDatabaseScene");
const AddDatabaseEntryScene = require("./scenes/addDatabaseEntryScene");
const AddDatabaseScene = require("./scenes/addDatabaseScene");
const EditDatabaseScene = require("./scenes/editDatabaseScene");
const GetEntryRowScene = require("./scenes/getEntryRowScene");
const EditEntryScene = require("./scenes/editEntryScene");
const MakeChatGPTRequestScene = require("./scenes/makeChatGPTRequestScene");

const startHandler = require("./handlers/startHandler");
const readDatabaseHandler = require("./handlers/readDatabaseHandler");
const deleteDatabaseHandler = require("./handlers/deleteDatabaseHandler");

const makeChatGPTRequest = require("./chatGPT/makeChatGPTRequest");
const validateUsage = require("./utils/validateUsage");

// Create a new instance of the Telegraf bot
const bot = new Telegraf(process.env.BOT_TOKEN);

const stage = new Scenes.Stage([
    new GetDatabaseScene(),
    new EditDatabaseScene(),
    new AddDatabaseEntryScene(),
    new GetEntryRowScene(),
    new EditEntryScene(),
    new MakeChatGPTRequestScene(),
    new AddDatabaseScene()
])

// Connect telegraf sessions
bot.use(session())
bot.use(stage.middleware());

// Start command handler
bot.start(startHandler);

// Validate necessary components were initialized
bot.on("message", (ctx, next) => {
    if(!validateUsage(ctx)) {
        ctx.reply("Для використання вам спочатку потрібно запустити команду /start.")
        
        return;
    }

    next();
})

// Add new database
bot.hears("Створити базу даних", (ctx) => { ctx.scene.enter("addDatabase") });

// Get database
bot.hears("Вибрати базу даних", (ctx) => ctx.scene.enter("getDatabase"));

bot.hears("Переглянути базу даних", readDatabaseHandler);

bot.hears("Редагувати базу даних", (ctx) => ctx.scene.enter("editDatabase"));

bot.hears("Видалити базу даних", deleteDatabaseHandler);

bot.hears("Відправити запит Chat GPT", ctx => ctx.scene.enter("makeChatGPTRequest"));

bot.hears("Повернутись на початок", startHandler);

// Clear session
bot.command("clear_session", (ctx) => {
    ctx.session.messages = [];
    ctx.reply("Сесія очищена.");
});

// Message handler
bot.on("text", async (ctx) => {
    makeChatGPTRequest(ctx)
});

// Error handler
bot.catch((err, ctx) => {
    console.error(`Error: ${err}`);
    ctx.reply('Помилка, детальніше про помилку у логах бота.');
});

// Start the bot
bot.launch()
