const { pullOne, pullTen } = require('./gacha/gacha');

for (let i = 0; i < 100; i++) {
	console.log(pullTen(364869, 1));
}

for (let i = 0; i < 100; i++) {
	console.log(pullOne(364869, 1));
}