const rates = require('./gacha_rates.json');
const { get1Stars, get2Stars, get3Stars } = require('../data/getStudents');
const { getUserPullCount, addNewStudents } = require('../data/user');
const { getBanner } = require('../data/banner');
const oneStars = get1Stars();
const twoStars = get2Stars();
const threeStars = get3Stars();

const pull = (pullAmount, bannerId) => {
	// 10th pull
	if (pullAmount % 10 == 0) {
		return chooseSpecial(bannerId);
	}
	else {
		return choose(bannerId);
	}
};

const choose = (bannerId) => {
	const banner = getBanner(bannerId);
	const bannerType = banner.info.type;
	let threeStarRate;
	if (bannerType == 'fest' || bannerType == 'anniversary') {
		threeStarRate = rates['any-3-star-fest'];
	}
	else {
		threeStarRate = rates['any-3-star'];
	}
	const twoStarRate = rates['any-2-star'];
	const roll = Math.random();

	if (roll < threeStarRate) {
		return chooseThreeStar(banner, roll, twoStarRate);
	}
	else if (roll < threeStarRate + twoStarRate) {
		return chooseTwoStar(roll, twoStarRate, threeStarRate);
	}
	else {
		const oneStarRate = 1 - threeStarRate - twoStarRate;
		return chooseOneStar(roll, oneStarRate, twoStarRate, threeStarRate);
	}
};

// Every 10th pull, takes from a gacha pool with no 1 stars.
// The chance of 2 stars becomes the combined chance of 1 & 2 stars of the normal pool
const chooseSpecial = (bannerId) => {
	const banner = getBanner(bannerId);
	const bannerType = banner.info.type;
	let threeStarRate;
	if (bannerType == 'fest' || bannerType == 'anniversary') {
		threeStarRate = rates['any-3-star-fest'];
	}
	else {
		threeStarRate = rates['any-3-star'];
	}
	const twoStarRate = rates['any-2-star'];
	const roll = Math.random();

	if (roll < threeStarRate) {
		return chooseThreeStar(banner, roll, twoStarRate);
	}
	else {
		return chooseTwoStar(roll, twoStarRate, threeStarRate);
	}
};

const chooseOneStar = (roll, oneStarRate, twoStarRate, threeStarRate) => {
	const pullData = {};
	pullData.rarity = 1;
	const divider = oneStarRate / oneStars.length;
	const remainder = roll - threeStarRate - twoStarRate;
	const quotient = Math.floor(remainder / divider);
	pullData.id = Number(oneStars[quotient].id);
	pullData.title = oneStars[quotient].title;
	return pullData;
};

const chooseTwoStar = (roll, twoStarRate, threeStarRate) => {
	const pullData = {};
	pullData.rarity = 2;
	const divider = twoStarRate / twoStars.length;
	const remainder = roll - threeStarRate;
	const quotient = Math.floor(remainder / divider);
	pullData.id = Number(twoStars[quotient].id);
	pullData.title = twoStars[quotient].title;
	return pullData;
};

const chooseThreeStar = (banner, roll, threeStarRate) => {
	const pullData = {};
	pullData.rarity = 3;
	const rateupThreeStarRate = rates['rateup-3-star'];
	const students = banner.students;
	let acc = 0.0;
	for (const student of students) {
		acc += rateupThreeStarRate;
		if (roll < acc) {
			pullData.id = Number(student.id);
			pullData.title = student.title;
			return pullData;
		}
	}
	const divider = (threeStarRate - acc) / threeStars.length;
	const quotient = Math.floor(roll / divider);
	pullData.id = Number(threeStars[quotient].id);
	pullData.title = threeStars[quotient].title;
	return pullData;
};

const pullTen = (discordId, bannerId) => {
	let pulls = Number(getUserPullCount(discordId)[0].pulls);
	const pullData = [];
	for (let i = 0; i < 10; i++) {
		pullData[i] = pull(bannerId);
		pulls++;
	}
	const students = pullData.map(elem => elem.id);
	addNewStudents(discordId, pulls, students);
	return pullData;
};

const pullOne = (discordId, bannerId) => {
	let pulls = Number(getUserPullCount(discordId)[0].pulls);
	const pullData = [ pull(bannerId) ];
	pulls++;
	addNewStudents(discordId, pulls, pullData);
	return pullData;
};

module.exports = {
	pullOne,
	pullTen,
};