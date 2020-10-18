exports.dateToString = (date) => {
	// When a query sends a date null is a string when not modified.
	if (!date || date === 'null') {
		return null;
	}
	return new Date(date).toISOString();
};
