const { db } = require('./dbConnection.js');

const get1Stars = () => {
	const students = db.prepare('SELECT * FROM students WHERE rarity=1').all();
	return students;
};

const get2Stars = (studentIds) => {

};

const get3Star = (studentId) => {

};

get1Stars();