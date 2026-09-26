const { SlashCommandBuilder } = require('discord.js');
const { pullTen, pullOne } = require('../../gacha/gacha');

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
		const bannerId = 1;
		const discordId = interaction.user.id;
		const amount = interaction.options.getInteger('amount');
		let result;
		if (amount == 10) {
			result = pullTen(discordId, bannerId);
		}
		else {
			result = pullOne(discordId, bannerId);
		}
		await interaction.reply(JSON.stringify(result));
	},
};