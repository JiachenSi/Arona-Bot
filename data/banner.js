const { db } = require('./dbConnection.js');

const getBanner = (bannerId) => {
	const banner = [];
	const bannerSql = `
        SELECT *
        FROM banners
        WHERE id == :id
    `;
	banner.info = db.prepare(bannerSql).all({ id: bannerId });
	const studentsSql = `
        SELECT student_id
        FROM banner_student
        WHERE banner_id == :id
    `;
	const studentIdRows = db.prepare(studentsSql).all({ id: bannerId });
	banner.students = [];
	for (const row of studentIdRows) {
		const getStudentInfoSql = `
            SELECT id, title
            FROM students
            WHERE id == :id
        `;
		const student = db.prepare(getStudentInfoSql).all({ id: Number(row.student_id) });
		banner.students.push(student[0]);
	}
	return banner;
};

module.exports = { getBanner };