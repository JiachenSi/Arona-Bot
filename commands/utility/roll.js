const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roll")
        .setDescription("Roll a dice of X sides")
        .addIntegerOption((option) => option
            .setName("sides")
            .setDescription("The number of sides the dice has")
            .setRequired(true)
            .setMinValue(2)
            .setMaxValue(10)),
    async execute(interaction) {
        const numSides = interaction.options.getInteger("sides");
        const result = Math.floor(Math.random() * (numSides)) + 1
        await interaction.reply(`You rolled a ${result}`);
    }
}