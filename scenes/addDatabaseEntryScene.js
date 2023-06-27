const { Scenes: { WizardScene } } = require("telegraf");
const deleteRecentKeyboard = require("../utils/deleteRecentKeyboard");

class AddDatabaseEntryScene {
    constructor() {
        const addDatabaseEntryScene = new WizardScene(
            "addDatabaseEntry",
            this.getName,
            this.getAddress,
            this.getNumber,
            this.getSellProduct,
            this.getBuyProduct,
            this.getComment
        );
        addDatabaseEntryScene.enter(ctx => { deleteRecentKeyboard(ctx); ctx.reply("Введіть ім'я:") })

        return addDatabaseEntryScene;
    }

    getName(ctx) {
        ctx.wizard.state.data = [];

        const name = ctx.message.text;

        ctx.wizard.state.data.push(name);

        ctx.reply("Введіть адресу:");

        return ctx.wizard.next();
    }

    getAddress(ctx) {
        const address = ctx.message.text;

        ctx.wizard.state.data.push(address);

        ctx.reply("Введіть номер телефону:");

        return ctx.wizard.next();
    }

    getNumber(ctx) {
        const number = ctx.message.text;

        ctx.wizard.state.data.push(number);

        ctx.reply("Введіть, що контакт продає:");

        return ctx.wizard.next();
    }

    getSellProduct(ctx) {
        const product = ctx.message.text;

        ctx.wizard.state.data.push(product);

        ctx.reply("Введіть, що контакт купує:");

        return ctx.wizard.next();
    }

    getBuyProduct(ctx) {
        const product = ctx.message.text;

        ctx.wizard.state.data.push(product);

        ctx.reply("Введіть коментар:");

        return ctx.wizard.next();
    }

    async getComment(ctx) {
        const comment = ctx.message.text;

        ctx.wizard.state.data.push(comment);

        await ctx.session.googleSheetsService.writeData(ctx.session.currentDatabaseId, [ctx.wizard.state.data]);

        await ctx.reply("Готово!");

        await ctx.scene.leave();

        return ctx.scene.enter("editDatabase");
    }
}

module.exports = AddDatabaseEntryScene;