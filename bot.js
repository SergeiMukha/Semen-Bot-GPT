require("dotenv").config();

// Define telegraf components
const { Telegraf, Scenes, session } = require('telegraf');

// Define scenes
const ReviewDatabaseScene = require("./scenes/reviewDatabaseScene");
const ChooseDatabaseScene = require("./scenes/chooseDatabaseScene");
const AddDatabaseEntryScene = require("./scenes/addDatabaseEntryScene");
const CreateDatabaseScene = require("./scenes/createDatabaseScene");
const EditDatabaseScene = require("./scenes/editDatabaseScene");
const GetEntryRowScene = require("./scenes/getEntryRowScene");
const EditEntryScene = require("./scenes/editEntryScene");
const MakeChatGPTRequestScene = require("./scenes/makeChatGPTRequestScene");
const CreateFolderScene = require("./scenes/createFolderScene");
const CreateTemplateScene = require("./scenes/createTemplateScene");

// Define handlers
const startHandler = require("./handlers/startHandler");
const deleteDatabaseHandler = require("./handlers/deleteDatabaseHandler");

// Define other functions
const validateUsage = require("./utils/validateUsage");

// Create a new instance of the Telegraf bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Create a stage
const stage = new Scenes.Stage([
    new ReviewDatabaseScene(),
    new ChooseDatabaseScene(),
    new EditDatabaseScene(),
    new AddDatabaseEntryScene(),
    new GetEntryRowScene(),
    new EditEntryScene(),
    new MakeChatGPTRequestScene(),
    new CreateDatabaseScene(),
    new CreateFolderScene(),
    new CreateTemplateScene()
])

// Connect telegraf sessions
bot.use(session())
bot.use(stage.middleware());

// Start command handler
bot.start(startHandler);

bot.on("video", async ctx => console.log(await ctx.telegram.getFileLink(ctx.message.video.file_id)));

bot.on('audio', async (ctx) => {
    const audio = ctx.message.audio;
    
    // Get the file ID of the audio file
    const fileId = audio.file_id;
    
    // Get the URL for the audio file using the file ID
    const fileLink = await ctx.telegram.getFileLink(fileId);
    
    console.log('Audio file URL:', fileLink);
});    

// Validate necessary components were initialized
bot.on("callback_query", (ctx, next) => {
    if(!validateUsage(ctx)) {
        ctx.reply("Для використання вам спочатку потрібно запустити команду /start.")
        
        return;
    }

    next();
})

// Handle keyboard buttons
bot.action("createTemplate", (ctx) => ctx.scene.enter("createTemplate"));

bot.action("createNewDatabase", (ctx) => { ctx.scene.enter("addDatabase") });

bot.action("chooseDatabase", (ctx) => ctx.scene.enter("chooseDatabase"));

bot.action("reviewDatabase", (ctx) => ctx.scene.enter("reviewDatabase"));

bot.action("editDatabase", (ctx) => ctx.scene.enter("editDatabase"));

bot.action("deleteDatabase", deleteDatabaseHandler);

bot.action("makeChatGPTRequest", ctx => ctx.scene.enter("makeChatGPTRequest"));

// Clear session
bot.command("clear_session", (ctx) => {
    ctx.session.messages = [];
    ctx.reply("Сесія очищена.");
});

// Error handler
// bot.catch((err, ctx) => {
//     console.error(`Error: ${err}`);
//     ctx.reply('Помилка, детальніше про помилку у логах бота.');
// });

// Start the bot
bot.launch()
