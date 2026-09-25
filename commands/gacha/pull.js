const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pull')
		.setDescription('Does a x1 or x10 pull on the selected banner')
		.addIntegerOption(option =>
			option
				.setName('amount')
				.setDescription('Number of pulls')
				.setRequired(true)
				.addChoices(
					{ name: '1', value: 1 },
					{ name: '10', value: 10 }),
		),
	async execute(interaction) {
		const amount = interaction.options.getInteger('amount');
		console.log(amount);
		await interaction.reply('run /pull command');
	},
};