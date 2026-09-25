const { db } = require('./dbConnection.js');
const { favorTitleSkipList } = require('../utility/favorTitleSkipList.js');
const banner = require('../data/seed/bannerSeed.json');
const bannerStudent = require('../data/seed/bannerStudent.json');
const users = require('../data/seed/userSeed.json');
const userStudent = require('../data/seed/userStudentSeed.json');

const createDB = () => {
	// Schema Setup
	const createSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL,
        pulls INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(40) NOT NULL,
        is_regular INTEGER NOT NULL CHECK (is_regular IN (0, 1)) DEFAULT 1,
        school VARCHAR(30) NOT NULL,
        club VARCHAR(30) NOT NULL,
        fullname VARCHAR(40) NOT NULL,
        age INTEGER NOT NULL CHECK (age > 0),
        birthday VARCHAR(30) NOT NULL,
        height INTEGER NOT NULL CHECK (height > 0),
        hobbies VARCHAR(150) NOT NULL,
        rarity INTEGER NOT NULL CHECK (rarity BETWEEN 1 AND 3),
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
        copies INTEGER NOT NULL DEFAULT 1 CHECK (copies >= 1),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY(user_id, student_id)
    );
    
    CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type in ('regular', 'limited', 'fest', 'special')),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS banner_student (
        banner_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        FOREIGN KEY (banner_id) REFERENCES banners(id) ON DELETE CASCADE, 
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        PRIMARY KEY(banner_id, student_id)
    );`;

	// Create the database
	db.exec(createSQL);
};

const insertTestData = () => {

};

// Only used when database is empty, AKA Fresh install
const insertScrapedData = (students, favorTitles) => {
	try {
		const dbTransaction = db.transaction(() => {
			for (const student of Object.values(students)) {
				if (favorTitleSkipList.includes(student.title.replaceAll(' ', '_'))) {
					continue;
				}

				student.fullname = student['full name'];
				student.release_date_jp = student['release date jp'];
				student.release_date_gl = student['release date gl'];
			    student.is_regular = student.regular ? '1' : '0';

				const insertStudent = db.prepare(`
                    INSERT INTO students (
                        title, is_regular, school, club, fullname, age, birthday, height, hobbies, rarity,
                        designer, illustrator, voice, release_date_jp, release_date_gl, icon
                    ) VALUES (
                        @title, @is_regular, @school, @club, @fullname, @age, @birthday, @height, @hobbies, @rarity,
                        @designer, @illustrator, @voice, @release_date_jp, @release_date_gl, @icon
                )`);
				const info = insertStudent.run(student);
				const favorTitleData = favorTitles[student.title];
				const variants = Object.keys(favorTitles[student.title]);
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
		console.log(`Insertion failed: ${error}`);
		return error;
	}
};

const deleteTables = () => {
	const SQL = `
        DROP TABLE IF EXISTS banner_student;
        DROP TABLE IF EXISTS user_student;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS students;
        DROP TABLE IF EXISTS favor_titles;
        DROP TABLE IF EXISTS wallets;
        DROP TABLE IF EXISTS banners;
    `;
	db.exec(SQL);
};

const initializeDatabase = () => {
	deleteTables();
	createDB();

	// Insert students and favor titles
	const releasedStudents = require('../utility/releasedStudents.json');
	const unreleasedStudents = require('../utility/unreleasedStudents.json');
	const students = { ...releasedStudents, ...unreleasedStudents };
	const favorTitles = require('../utility/favorTitles.json');
	insertScrapedData(students, favorTitles);
};

module.exports = {
	initializeDatabase,
};

initializeDatabase();