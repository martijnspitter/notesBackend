const jwt = require('jsonwebtoken');
require('dotenv').config();
const TOKEN_KEY = process.env.TOKEN_KEY;

module.exports = (req, res, next) => {
	const authHeader = req.get('x-access-token');

	if (!authHeader) {
		req.isAuth = false;
		return next();
	}
	// const token = authHeader.split(' ')[1];
	// console.log(token);
	// if (!token || token === '') {
	// 	req.isAuth = false;
	// 	return next();
	// }
	let decodedToken = undefined;
	try {
		decodedToken = jwt.verify(authHeader, TOKEN_KEY);
	} catch (err) {
		console.log(err);
		req.isAuth = false;
		return next();
	}

	if (!decodedToken) {
		req.isAuth = false;
		return next();
	}
	req.isAuth = true;
	req.userId = decodedToken.userId;
	return next();
};
