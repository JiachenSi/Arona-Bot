const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('../config.json');
const fs = require('node:fs');

const uploadEmojis = () => {
	return new Promise((resolve, reject) => {
		const envelopIcons = [
			{ attachment: './images/assets/1_star_envelope.png', name: 'one_star' },
			{ attachment: './images/assets/2_star_envelope.png', name: 'two_star' },
			{ attachment: './images/assets/3_star_envelope.png', name: 'three_star' },
		];

		const releasedStudents = require('./releasedStudents.json');
		const unreleasedStudents = require('./unreleasedStudents.json');
		const students = Object.values({ ...releasedStudents, ...unreleasedStudents });

		try {
			const client = new Client({ intents: [GatewayIntentBits.Guilds] });

			client.once('clientReady', async () => {
				const existingEmojis = await client.application.emojis.fetch();
				const emojis = {};
				// Gacha Envelop
				for (const icon of envelopIcons) {
					const exists = existingEmojis.find(e => e.name == icon.name);
					if (!exists) {
						console.log(`Upload - ${icon.name}`);
						const emoji = {};
						const res = await client.application.emojis.create(icon);
						emoji.text = `<:${res.name}:${res.id}>`;
						emojis[res.name] = emoji;
					}
				}
				// Students
				const updatedStudents = [];
				for (const student of students) {
					if (student.path != undefined) {
						const icon = {};
						icon.name = student.title.replaceAll(' ', '_').replace(/[^a-zA-Z0-9_]/g, '');
						icon.attachment = student.path;
						const exists = existingEmojis.find(e => e.name == icon.name);
						if (!exists) {
							console.log(`Upload - ${icon.name}`);
							const emoji = {};
							const res = await client.application.emojis.create(icon);
							emoji.text = `<:${res.name}:${res.id}>`;
							emojis[res.name] = emoji;
							student.emoji = emoji.text;
							updatedStudents.push(student);
						}
					}
				}

				fs.writeFileSync('./utility/emojis.json', JSON.stringify(emojis));
				fs.writeFileSync('./utility/students.json', JSON.stringify(updatedStudents));
				client.destroy();
				resolve();
			});

			client.login(token);
		}
		catch (error) {
			reject(error);
		}
	});
};

const deleteEmojis = async () => {
	return new Promise((resolve, reject) => {
		try {
			const client = new Client({ intents: [GatewayIntentBits.Guilds] });

			client.once('clientReady', async () => {
				const existingEmojis = await client.application.emojis.fetch();
				for (const emoji of existingEmojis.values()) {
					await emoji.delete();
					console.log('delete');
				}
				console.log('all deleted');
				client.destroy();
				resolve();
			});
			client.login(token);
		}
		catch (error) {
			reject(error);
		}
	});
};

const fetchEmoji = () => {
	return new Promise((resolve, reject) => {
		try {
			const client = new Client({ intents: [GatewayIntentBits.Guilds] });

			client.once('clientReady', async () => {
				const existingEmojis = await client.application.emojis.fetch();
				console.log(existingEmojis.get('1554051747280982036').name);
				resolve();
			});
			client.login(token);
		}
		catch (error) {
			reject(error);
		}
	});
};

module.exports = { uploadEmojis };

const reupload = async () => {
	await deleteEmojis();
	await uploadEmojis();
};

fetchEmoji();
// reupload();