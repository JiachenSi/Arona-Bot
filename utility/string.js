const cleanString = (string) => {
	return string.replaceAll(' ', '_').replace(/[^a-zA-Z0-9_]/g, '');
};

module.exports = { cleanString };