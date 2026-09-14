const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');
const { initiateStorage, loadUserData, getMember, updateMember } = require('./data_layer.js');

// Create bot client instance
// Specifies what kind of events the bot subscribes to
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
] });

client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	// Check if data file already exists, otherwise create it
	if (!fs.existsSync('./data.json')) {
		console.log('data.json could not be found, creating new data file');
		initiateStorage(readyClient);
	}
	else {
		loadUserData();
	}
});

// Slash commands
client.on(Events.InteractionCreate, async (interaction) => {
	// Exit if non-slash command encountered
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
		else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

client.on(Events.MessageCreate, async (message) => {
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
});

client.commands = new Collection();

const folderPath = path.join(__dirname, 'commands');
const commandsFolders = fs.readdirSync(folderPath);

for (const folder of commandsFolders) {
	const commandsPath = path.join(folderPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property`);
		}
	}
}

client.login(token);