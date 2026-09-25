const { SlashCommandBuilder } = require('discord.js');
const { registerNewUser } = require('../../data/registerUser');

module.exports = {
	data: new SlashCommandBuilder().setName('register').setDescription('Registers a user so they can use Arona-Bot'),
	async execute(interaction) {
		const { id, username } = interaction.user;
		const error = registerNewUser(id, username);
		if (error !== null) {
			if (error.message.includes('UNIQUE')) {
				await interaction.reply(`${username} is already registered`);
			}
			else {
				await interaction.reply(`Failed to register ${username}`);
			}
		}
		else {
			await interaction.reply(`${username} is now registered`);
		}
	},
};