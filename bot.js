require("dotenv").config();

// Define telegraf components
const { Telegraf, Scenes, session } = require('telegraf');

// Define scenes
const StartScene = require("./scenes/startScene");
const ReviewDatabaseScene = require("./scenes/reviewDatabaseScene");
const ChooseDatabaseScene = require("./scenes/chooseDatabaseScene");
const AddDatabaseRowScene = require("./scenes/addDatabaseRowScene");
const CreateDatabaseScene = require("./scenes/createDatabaseScene");
const EditDatabaseScene = require("./scenes/editDatabaseScene");
const EditRowScene = require("./scenes/editRowScene");
const EditEntryScene = require("./scenes/editEntryScene");
const MakeChatGPTRequestScene = require("./scenes/makeChatGPTRequestScene");
const CreateFolderScene = require("./scenes/createFolderScene");
const CreateTemplateScene = require("./scenes/createTemplateScene");
const MoveDatabaseScene = require("./scenes/moveDatabaseScene");
const DatabaseActionsScene = require("./scenes/databaseActionsScene");
const ReviewRowScene = require("./scenes/reviewRowScene");
const ReviewTemplatesScene = require("./scenes/reviewTemplatesScene");
const EditTemplateScene = require("./scenes/editTemplateScene");
const AddFilesScene = require("./scenes/addFilesScene");
const ReviewFilesScene = require("./scenes/reviewFilesScene");
const RenameFolderScene = require("./scenes/renameFolderScene");
const RenameDatabaseScene = require("./scenes/renameDatabaseScene");
const MoveFolderScene = require("./scenes/moveFolderScene");

// Define other functions
const validateUsage = require("./utils/validateUsage");
const { navigationKeyboard } = require("./keyboards/staticKeyboards");

// Create a new instance of the Telegraf bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Create a stage
const stage = new Scenes.Stage([
    new StartScene(),
    new ReviewDatabaseScene(),
    new ChooseDatabaseScene(),
    new EditDatabaseScene(),
    new AddDatabaseRowScene(),
    new EditRowScene(),
    new EditEntryScene(),
    new MakeChatGPTRequestScene(),
    new CreateDatabaseScene(),
    new CreateFolderScene(),
    new CreateTemplateScene(),
    new MoveDatabaseScene(),
    new DatabaseActionsScene(),
    new ReviewRowScene(),
    new ReviewTemplatesScene(),
    new EditTemplateScene(),
    new AddFilesScene(),
    new ReviewFilesScene(),
    new RenameFolderScene(),
    new RenameDatabaseScene(),
    new MoveFolderScene()
])

// Connect telegraf sessions
bot.use(session())
bot.use(stage);

// Start command handler
bot.start(async ctx => { await ctx.reply("Додаю кнопки...", navigationKeyboard); await ctx.scene.enter("start") });

// bot.on("video", async ctx => console.log(await ctx.telegram.getFileLink(ctx.message.video.file_id)));

// Validate necessary components were initialized
bot.on("callback_query", (ctx, next) => {
    if(!validateUsage(ctx)) {
        ctx.reply("Для використання вам спочатку потрібно запустити команду /start.")
        
        return;
    }

    next();
})

bot.on("message", (ctx, next) => {
    if(!validateUsage(ctx)) {
        ctx.reply("Для використання вам спочатку потрібно запустити команду /start.")
        
        return;
    }

    next();
})

stage.hears("\u{1F5C3} Повернутись на початкове меню", async ctx => await ctx.scene.enter("chooseDatabase"));

// Error handler
bot.catch((err, ctx) => {
    console.error(`Error: ${err}`);
    ctx.reply('Помилка, детальніше про помилку у логах бота.');

    ctx.scene.enter("start");
});

// Start the bot
bot.launch()
