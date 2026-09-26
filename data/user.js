const { db } = require('./dbConnection.js');

const registerNewUser = (discordID, name) => {
	try {
		const userStmt = db.prepare('INSERT INTO users (id, name) VALUES (:id, :name)');
		const walletStmt = db.prepare('INSERT INTO wallets (user_id, pyroxenes, credits, energy ) VALUES (:id, 0, 0, 0)');
		const dbTransaction = db.transaction(() => {
			userStmt.run({ id: discordID, name: name });
			walletStmt.run({ id: discordID });
		});
		dbTransaction();
		return null;
	}
	catch (error) {
		console.log(`Registration failed: ${error.message}`);
		return error;
	}
};

const getUserPullCount = (discordId) => {
	try {
		const sql = `
			SELECT id, pulls
			FROM users
			WHERE id == :id
		`;
		const stmt = db.prepare(sql);
		return stmt.all({ id: discordId });
	}
	catch (error) {
		console.log(`Failed to retrieve user pull info: ${error.message}`);
		return error;
	}
};

const addNewStudents = (discordId, pulls, students) => {
	try {
		const dbTransaction = db.transaction(() => {
			const updatePullsSql = `
			UPDATE users
			SET pulls = :pulls
			WHERE id == :id
			`;
			db.prepare(updatePullsSql).run({ pulls: pulls, id: discordId });
			for (const student of students) {
				const addStudentsSql = `
					INSERT INTO user_student (user_id, student_id)
					VALUES (:id, :student)
					ON CONFLICT (user_id, student_id) DO UPDATE SET
						copies = copies + 1
				`;
				continue;
				db.prepare(addStudentsSql).run({ id: discordId, student: student });
			}
		});
		dbTransaction();
	}
	catch (error) {
		console.log(`Failed to add student info: ${error.message}`);
		return error;
	}
};

module.exports = {
	registerNewUser,
	getUserPullCount,
	addNewStudents,
};