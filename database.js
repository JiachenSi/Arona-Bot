const Database = require('better-sqlite3');
const db = new Database('arona_bot.db');
db.pragma('foreign_keys = ON');

const createDB = () => {
	// Schema Setup
	const createSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(40) NOT NULL,
        school VARCHAR(30) NOT NULL,
        club VARCHAR(30) NOT NULL,
        fullname VARCHAR(40) NOT NULL,
        age INTEGER NOT NULL CHECK (age > 0),
        birthday VARCHAR(30) NOT NULL,
        height INTEGER NOT NULL CHECK (height > 0),
        hobbies VARCHAR(150) NOT NULL,
        designer VARCHAR(40) NOT NULL,
        illustrator VARCHAR(40) NOT NULL,
        voice VARCHAR(30) NOT NULL,
        release_date_jp DATE NOT NULL,
        release_date_gl DATE,
        icon VARCHAR(150) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favor_titles  (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        title VARCHAR(40) NOT NULL,
        path VARCHAR(100) NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        pyroxenes INTEGER NOT NULL CHECK (pyroxenes >= 0),
        credits INTEGER NOT NULL CHECK (credits >= 0),
        energy INTEGER NOT NULL CHECK (energy >= 0),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_student (
        user_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        copies INTEGER NOT NULL DEFAULT 0 CHECK (copies >= 0),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY(user_id, student_id)
    );`;

	// Create the database
	db.exec(createSQL);
};

// Only used when database is empty, AKA Fresh install
const insertScrapedData = (students, favorTitles) => {
	try {
		const dbTransaction = db.transaction(() => {
			for (const student of Object.values(students)) {
				const insertStudent = db.prepare(`
                    INSERT INTO students (
                        title, school, club, fullname, age, birthday, height, hobbies,
                        designer, illustrator, voice, release_date_jp, release_date_gl, icon
                    ) VALUES (
                        @title, @school, @club, @fullname, @age, @birthday, @height, @hobbies,
                        @designer, @illustrator, @voice, @release_date_jp, @release_date_gl, @icon
                )`);
				const info = insertStudent.run(student);

				const favorTitleData = favorTitles[student];
				const variants = Object.keys(favorTitles[student]);
				for (const variant of variants) {
					const path = favorTitleData[variant];
					const title = `${student.title} favor title (${variant})`;
					const insertFavorTitle = db.prepare(`
                        INSERT INTO favor_titles (student_id, title, path)
                        VALUES (:id, :title, :path)`);
					insertFavorTitle.run({ id: info.lastInsertRowid, title: title, path: path });
				}
			}
		});
		dbTransaction();
	}
	catch (error) {
		console.log(`Insertion failed: ${error.message}`);
		return error;
	}
};

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

module.exports = {
	createDB,
	insertScrapedData,
	registerNewUser,
};

createDB();