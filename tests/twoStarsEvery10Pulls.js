const { pullTen } = require('../gacha/gacha');

for (let i = 0; i < 100; i++) {
	const pulls = pullTen(364869, 1);
	let blues = 0;
	for (const pull of pulls) {
		if (pull.rarity == 1) {
			blues++;
		}
	}

	if (blues == 10) {
		console.log('GACHA RATE PROBLEM DETECTED - ALL BLUES');
		console.log(`After ${i} x10 pulls`);
		break;
	}
}
