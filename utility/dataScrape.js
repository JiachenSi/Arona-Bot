const fs = require('node:fs');
const axios = require('axios');
const cheerio = require('cheerio');
const { constructImages } = require('./imageCompose.js');
const { favorTitleSkipList } = require('./favorTitleSkipList.js');
let releasedStudents = null;
let unreleasedStudents = null;

if (fs.existsSync('./utility/releasedStudents.json') && fs.existsSync('./utility/unreleasedStudents.json')) {
	releasedStudents = JSON.parse(fs.readFileSync('./utility/releasedStudents.json'));
	unreleasedStudents = JSON.parse(fs.readFileSync('./utility/unreleasedStudents.json'));
}

const fetchStudentInfo = async () => {
	try {
		// Fetch student list
		const response = await axios.get('https://bluearchive.wiki/w/api.php?action=query&list=categorymembers&cmtitle=Category:Characters&cmlimit=max&format=json');
		if (response.status != 200) {
			console.log('Error: Unable to access detail student list');
			return;
		}

		// Fetch individual student info
		// Remove categories
		const categoryMembers = response.data.query.categorymembers.filter((member) => !member.title.includes('Category:'));

		let retrieveAll = true;
		let unreleasedChangeToRelease = false;
		// There is an existing student list
		if (releasedStudents != null && unreleasedStudents != null) {
			// No new students
			if (Object.keys(releasedStudents).length + Object.keys(unreleasedStudents).length == categoryMembers.length) {
				retrieveAll = false;
			}
		}

		let count = 0;
		// Fetch the whole list
		if (retrieveAll) {
			releasedStudents = {};
			unreleasedStudents = {};
			for (const member of categoryMembers) {
				count++;
				const pageId = member.pageid;
				const title = member.title;
				const student = {};

				// Extract text data from student page
				const studentPageResponse = await axios.get(`https://bluearchive.wiki/w/api.php?action=parse&pageid=${pageId}&format=json&prop=text`);
				const page = cheerio.load(studentPageResponse.data.parse.text['*']);

				const [ school, club ] = page('table tr:nth-child(4) td:first-child').attr('title').split(', ');
				student.school = school;
				student.club = club;
				const dataRows = page('tr:has(th.character-profile.character-header) ~ tr');
				dataRows.each((i, el) => {
					const row = page(el);
					const header = row.find('th').text().trim().toLowerCase();
					const field = row.find('td').text().trim();
					student[header] = field;
				});
				console.log(`fetched - ${title} info`);

				// Find name of the icon png
				const iconFileName = `Portrait_${title.replaceAll(' ', '_')}.png`;
				const path = `./images/${iconFileName}`;
				if (!fs.existsSync(path)) {
				// Fetch url
					const iconURLResponse = await axios.get(`https://bluearchive.wiki/w/api.php?action=query&format=json&prop=imageinfo&titles=File:${iconFileName}&iiprop=url`);
					const iconURL = Object.values(iconURLResponse.data.query.pages)[0].imageinfo[0].url;
					// Download
					console.log(`Downloading: ${iconFileName}`);
					const iconBuffer = await axios.get(iconURL, {
						responseType: 'arraybuffer',
						headers: {
							'User-Agent': 'Mozilla/5.0',
							'Referer': 'https://bluearchive.fandom.com/',
						},
					});
					fs.writeFileSync(path, iconBuffer.data);
					console.log(`fetched - ${title} portrait`);
				}

				student['icon'] = path;
				if (student['release date gl'] !== undefined) {
					releasedStudents[title] = student;
				}
				else {
					unreleasedStudents[title] = student;
				}
				console.log(`Extract info - ${title}`);
			}
			console.log(`Added information of ${count} new students`);
		}
		// Check if unreleased students are now in global
		else {
			// Iterate through the unreleased student pages
			const students = Object.keys(unreleasedStudents);
			const titles = students[0];
			for (let i = 1; i < students.length; i++) {
				const student = students[i];
				titles.concat(`|${student}`);
			}
			const studentPageIdsResponse = await axios.get(`https://bluearchive.wiki/w/api.php?action=query&format=json&titles=${titles}`);
			const pageIds = Object.keys(studentPageIdsResponse.data.query.pages);
			const newlyReleasedStudents = {};
			for (const pageId of pageIds) {
				const studentPageResponse = await axios.get(`https://bluearchive.wiki/w/api.php?action=parse&pageid=${pageId}&format=json&prop=text`);
				const page = cheerio.load(studentPageResponse.data.parse.text['*']);
				// Look for specific html element
				const globalReleaseElement = page('th:contains("Release Date GL")');
				// Student released globally
				if (globalReleaseElement.length != 0) {
					count++;
					const releaseDate = globalReleaseElement.next().text();
					const title = studentPageResponse.data.parse.title;
					const studentData = unreleasedStudents[title];
					studentData['release date gl'] = releaseDate;
					// remove from unreleased
					delete unreleasedStudents[title];
					// add to released
					newlyReleasedStudents[title] = studentData;
				}
			}

			// Newly released students
			if (Object.keys(newlyReleasedStudents).length > 0) {
				unreleasedChangeToRelease = true;
				releasedStudents = { ...releasedStudents, ...newlyReleasedStudents };
				console.log(`Moved ${count} students to released`);
			}
		}

		if (retrieveAll || unreleasedChangeToRelease) {
			fs.writeFileSync('./utility/releasedStudents.json', JSON.stringify(releasedStudents));
			fs.writeFileSync('./utility/unreleasedStudents.json', JSON.stringify(unreleasedStudents));
			console.log('Written released student data to ./utility/releasedStudents.json');
			console.log('Written unreleased student data to ./utility/unreleasedStudents.json');
		}
		else {
			console.log('No changes made to student information');
		}
	}
	catch (error) {
		console.log(error);
	}
};

const fetchFavorTitleBgs = async () => {
	const favorTitleBgs = {};
	const bgs = ['Emblem_BG_Favor_20.png', 'Emblem_BG_Favor_50.png', 'Emblem_BG_Favor_100.png'];
	for (const bg of bgs) {
		const title = bg.split('_')[3];
		const path = `./images/emblems/backgrounds/${title}`;
		if (fs.existsSync(path)) continue;

		const backgroundImage = {};
		backgroundImage.title = title;
		const bgRes = await axios(`https://bluearchive.wiki/w/api.php?action=query&format=json&prop=imageinfo&titles=File:${bg}&iiprop=url`);
		const url = Object.values(bgRes.data.query.pages)[0].imageinfo[0].url;
		const bgBuffer = await axios(url, {
			responseType: 'arraybuffer',
			headers: {
				'User-Agent': 'Mozilla/5.0',
				'Referer': 'https://bluearchive.fandom.com/',
			},
		});
		backgroundImage.path = path;
		fs.writeFileSync(path, bgBuffer.data);
		favorTitleBgs[title] = backgroundImage;
	}
	fs.writeFileSync('./images/emblems/favorTitleBgs.json', JSON.stringify(favorTitleBgs));
	console.log('Fetched favor title backgrounds');
};

const fetchFavorTitleIcons = async () => {
	// Import student info list
	const studentList = { ...releasedStudents, ...unreleasedStudents };
	const students = Object.keys(studentList).map((name) => name.replaceAll(' ', '_'));

	// Fetch favor title student images
	const favorTitleStudentImages = {};
	for (const student of students) {
		// Skip as no favor title exists
		if (favorTitleSkipList.includes(student)) {
			continue;
		}

		const studentImg = {};
		const imageName = `Emblem_Icon_Favor_${student.replaceAll(' ', '_')}.png`;
		const path = `images/emblems/studentImages/${imageName}`;
		if (fs.existsSync(path)) {
			console.log(`${path} already exists`);
			continue;
		}

		const imageRes = await axios.get(`https://bluearchive.wiki/w/api.php?action=query&format=json&prop=imageinfo&titles=File:${imageName}&iiprop=url`);
		const url = Object.values(imageRes.data.query.pages)[0].imageinfo[0].url;
		const studentImgBuffer = await axios(url, {
			responseType: 'arraybuffer',
			headers: {
				'User-Agent': 'Mozilla/5.0',
				'Referer': 'https://bluearchive.fandom.com/',
			},
		});
		fs.writeFileSync(path, studentImgBuffer.data);
		studentImg.path = path;
		favorTitleStudentImages[student] = studentImg;
		console.log(`fetched - ${imageName}`);
	}
	fs.writeFileSync('./images/emblems/favorTitleStudentImages.json', JSON.stringify(favorTitleStudentImages));
	console.log('Fetched favor title student icons');
};

const fetchAndConstructFavorTitles = async () => {
	await fetchFavorTitleBgs();
	await fetchFavorTitleIcons();
	await constructImages({ ...releasedStudents, ...unreleasedStudents });
};

const fetch = async () => {
	try {
		// Create require image folder structure
		fs.mkdirSync('images', { recursive: true });
		fs.mkdirSync('images/emblems', { recursive: true });
		fs.mkdirSync('images/emblems/backgrounds', { recursive: true });
		fs.mkdirSync('images/emblems/favorTitles', { recursive: true });
		fs.mkdirSync('images/emblems/studentImages', { recursive: true });

		// Scrape
		await fetchStudentInfo();
		await fetchAndConstructFavorTitles();
		return true;
	}
	catch (e) {
		console.log(`Fetch failed: ${e.message}`);
		return false;
	}

};

fetch();
