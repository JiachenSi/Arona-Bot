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

module.exports = { registerNewUser };