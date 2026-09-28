const { SeparatorBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	MessageFlags,
	SlashCommandBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ComponentType } = require('discord.js');
const { pullTen, pullOne } = require('../../gacha/gacha');
const emojis = require('../../utility/emojis.json');
const { cleanString } = require('../../utility/string');

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
		const discordId = interaction.user.id;
		const amount = interaction.options.getInteger('amount');
		const username = interaction.user.username;

		const pull = async (i) => {
			const bannerId = 1;
			let isTenPull = true;
			let result;
			if (amount == 10) {
				result = pullTen(discordId, bannerId);
			}
			else {
				result = pullOne(discordId, bannerId);
				isTenPull = false;
			}

			const beforeRevealTitle = new TextDisplayBuilder().setContent(`# ${username} is pulling...`);
			const seperator = new SeparatorBuilder();

			let beforeReveal;
			if (isTenPull) {
				beforeReveal = tenPullBeforeRevealSection(result, false);
			}
			else {
				beforeReveal = singlePullBeforeRevealSection(result, false);
			}
			const revealBtn = new ButtonBuilder().setCustomId('reveal').setLabel('🔍Reveal').setStyle(ButtonStyle.Secondary);
			const beforeRevealActionRow = new ActionRowBuilder().addComponents(revealBtn);
			const beforeRevealContainer = new ContainerBuilder()
				.setAccentColor(0x86D9FF)
				.addTextDisplayComponents(beforeRevealTitle)
				.addSeparatorComponents(seperator)
				.addTextDisplayComponents(...beforeReveal)
				.addActionRowComponents(beforeRevealActionRow);

			const response = await i.reply({
				components: [beforeRevealContainer],
				withResponse: true,
				flags: MessageFlags.IsComponentsV2,
			});

			const buttonCollector = response.resource.message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 3_600_000,
			});

			let afterReveal;
			if (isTenPull) {
				afterReveal = tenPullAfterRevealSection(result);
			}
			else {
				afterReveal = singlePullAfterRevealSection(result);
			}

			const afterRevealTitle = new TextDisplayBuilder().setContent(`# ${username}'s pull`);
			const pullAgainButton = new ButtonBuilder().setCustomId('pullAgain').setLabel('Pull Again :pyroxene_placeholder:').setStyle(ButtonStyle.Primary);
			const afterRevealActionRow = new ActionRowBuilder().addComponents(pullAgainButton);

			const afterRevealContainer = new ContainerBuilder()
				.setAccentColor(0x86D9FF)
				.addTextDisplayComponents(afterRevealTitle)
				.addSeparatorComponents(seperator)
				.addTextDisplayComponents(...beforeReveal)
				.addSeparatorComponents(seperator)
				.addTextDisplayComponents(...afterReveal)
				.addActionRowComponents(afterRevealActionRow);

			buttonCollector.on('collect', async (secondInteraction) => {
				console.log(secondInteraction.customId);
				if (secondInteraction.customId == 'reveal') {
					await secondInteraction.update({
						components: [afterRevealContainer],
						flags: MessageFlags.IsComponentsV2,
					});
				}
				else {
					await pull(secondInteraction, true);
				}

			});
		};

		await pull(interaction, false);
	},
};


const tenPullBeforeRevealSection = (result) => {
	let rowOneText = '';
	let rowTwoText = '';
	count = 0;
	for (const pull of result) {
		count++;
		let icon;
		if (pull.rarity == 1) {
			icon = emojis['one_star'].text;

		}
		else if (pull.rarity == 2) {
			icon = emojis['two_star'].text;

		}
		else {
			icon = emojis['three_star'].text;
		}

		if (count <= 5) {
			rowOneText = rowOneText.concat(icon + ' ');
		}
		else {
			rowTwoText = rowTwoText.concat(icon + ' ');
		}
	}
	const row1 = new TextDisplayBuilder().setContent(rowOneText);
	const row2 = new TextDisplayBuilder().setContent(rowTwoText);
	return [row1, row2];
};

const singlePullBeforeRevealSection = (result) => {
	let text;
	const pull = result[0];
	if (pull.rarity == 1) {
		text = emojis['one_star'].text;
	}
	else if (pull.rarity == 2) {
		text = emojis['two_star'].text;
	}
	else {
		text = emojis['three_star'].text;
	}

	const row = new TextDisplayBuilder().setContent(text);
	return [row];
};

const tenPullAfterRevealSection = (result) => {
	let rowOneText = '';
	let rowTwoText = '';
	count = 0;
	for (const pull of result) {
		count++;
		const student = cleanString(pull.title);

		const icon = emojis[student].text;
		console.log(icon);
		if (count <= 5) {
			rowOneText = rowOneText.concat(icon + ' ');
		}
		else {
			rowTwoText = rowTwoText.concat(icon + ' ');
		}
	}
	const row1 = new TextDisplayBuilder().setContent(rowOneText);
	const row2 = new TextDisplayBuilder().setContent(rowTwoText);
	return [row1, row2];
};

const singlePullAfterRevealSection = (result) => {
	const pull = result[0];
	const student = cleanString(pull.title);
	const icon = emojis[student].text;
	const text = icon;

	const row = new TextDisplayBuilder().setContent(text);
	return [row];
};