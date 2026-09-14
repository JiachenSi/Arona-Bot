const sharp = require('sharp');
const studentList = require('./releasedStudents.json');

const constructImages = async () => {
	const macrons = [257, 299, 363, 275, 333];
	const students = Object.keys(studentList);
	for (const student of students) {
		let fullname = studentList[student]['full name'];
		let i = 0;
		for (i; i < fullname.length; i++) {
			// Not an english character or a macron
			if (fullname.charCodeAt(i) > 122 && !macrons.includes(fullname.charCodeAt(i))) {
				break;
			}
		}
		fullname = fullname.slice(0, i);
		const svg = `
        <svg width="558" height="106">
            <style>
                .name {
                    text-anchor: middle;
                    font-family: "YuGothic";
                    font-size: 32px;
                    font-weight: 1000;
                    fill: rgb(79, 104, 129);
                    stroke: white;
                    stroke-width: 4px;
                    paint-order: stroke;
                    line-height: 32px;
                    transform: scale(1, 0.9);
                    letter-spacing: 0px;
                }
            </style>
            <text x="347.5" y="46" class="name">
                ${fullname.toUpperCase()}
            </text>
        </svg>
        `;
		const textImage = await sharp(Buffer.from(svg)).toBuffer();

		const studentName = student.replaceAll(' ', '_');
		const studentImg = `./images/emblems/studentImages/Emblem_Icon_Favor_${studentName}.png`;
		const levels = ['20', '50', '100'];
		for (const level of levels) {
			const path = `./images/emblems/favorTitles/${student}_Favor_Title_(${level}).png`;
			await sharp(`./images/emblems/backgrounds/${level}.png`)
				.composite([
					{ input: studentImg, top: 3, left: 4 },
					{
						input: Buffer.from(textImage),
						left: 0,
						top: 0,
					},
				])
				.toFile(path);
			console.log(`Created - ${path}`);
		}
	}
};

module.exports = {
	constructImages,
};