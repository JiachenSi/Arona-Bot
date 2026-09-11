const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("ping").setDescription("Replies in a whimsy way"),
    async execute(interaction) {
        await interaction.reply("pong!");
    }
}