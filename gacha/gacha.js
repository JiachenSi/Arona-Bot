const rates = require('./gacha_rates.json');
const { get1Stars, get2Stars, get3Stars } = require('../data/getStudents');
const { getUserPullCount, addNewStudents } = require('../data/user');
const oneStars = get1Stars();
const twoStars = get2Stars();
const threeStars = get3Stars();

const pull = () => {
	const bannerType = 'limited';
	let threeStarRate;
	if (bannerType == 'fest' || bannerType == 'anniversary') {
		threeStarRate = rates['any-3-star-fest'];
	}
	else {
		threeStarRate = rates['any-3-star'];
	}
	const twoStarRate = rates['any-2-star'];
	const oneStarRate = 1 - threeStarRate - twoStarRate;
	const roll = Math.random();
	if (roll < threeStarRate) {
		const divider = threeStarRate / threeStars.length;
		const quotient = Math.floor(roll / divider);
		return [3, threeStars[quotient]];
	}
	else if (roll < threeStarRate + twoStarRate) {
		const divider = twoStarRate / twoStars.length;
		const remainder = roll - threeStarRate;
		const quotient = Math.floor(remainder / divider);
		return [2, twoStars[quotient]];
	}
	else {
		const divider = oneStarRate / oneStars.length;
		const remainder = roll - threeStarRate - twoStarRate;
		const quotient = Math.floor(remainder / divider);
		return [1, oneStars[quotient]];
	}
};

const tenPull = (discordId) => {
	let pulls = getUserPullCount(discordId);
	const pullData = [];
	for (let i = 0; i < 10; i++) {
		pullData[i] = pull();
		pulls++;
	}
	const students = pullData.map(e => e[1]);
	addNewStudents(discordId, pulls, students);
};

const pullOne = (discordId) => {
	let pulls = getUserPullCount(discordId);
	const pullData = pull();
	pulls++;
	const student = pullData[1];
	addNewStudents(discordId, pulls, [student]);
};

module.exports = {
	pullOne,
	tenPull,
};

tenPull();