const { db } = require('./dbConnection.js');

const get1Stars = () => {
	const sql = `
		SELECT id, title
		FROM students 
		WHERE rarity=1 
		AND release_date_gl IS NOT NULL
	`;

	const students = db.prepare(sql).all();
	return students;
};

const get2Stars = () => {
	const sql = `
		SELECT id, title
		FROM students 
		WHERE rarity=2 
		AND release_date_gl IS NOT NULL
	`;

	const students = db.prepare(sql).all();
	return students;
};

const get3Stars = () => {
	const sql = `
		SELECT id, title
		FROM students 
		WHERE rarity=3 
		AND release_date_gl IS NOT NULL
		AND is_regular == 1
	`;

	const students = db.prepare(sql).all();
	return students;
};

module.exports = {
	get1Stars,
	get2Stars,
	get3Stars,
};