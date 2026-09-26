const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		// Exit if message is from the bot
		if (message.author.bot) return;
		const id = message.member.id;
		const member = getMember(id);
		const exp = Math.floor(Math.random() * 6) + 5;
		member.currentExp += exp;

		// Check if member levels up
		const expRequired = 10 + (member.level - 1) * 5;
		if (member.currentExp >= expRequired) {
			member.level++;
			member.currentExp -= expRequired;
		}
		updateMember(id, member);
	},
};