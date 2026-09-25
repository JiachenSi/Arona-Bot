const rates = require('./gacha_rates.json');
bannerType = 'limited';

const pull = () => {
	const roll = Math.random();
	let rarity;
	threeStarCheck = bannerType == 'fest' ? roll < rates['any-3-star-fest'] : roll < rates['any-3-star'];
	if (threeStarCheck) {
		rarity = 3;
	}
	else if (roll < rates['any-3-star'] + rates['any-2-star']) {
		rarity = 2;
	}
	else {
		rarity = 1;
	}


};

const tenPull = () => {
	for (let i = 0; i < 10; i++) {
		pull();
	}
};

module.exports = {
	pull,
	// tenPull,
};