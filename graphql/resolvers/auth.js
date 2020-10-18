const User = require('../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const TOKEN_KEY = process.env.TOKEN_KEY;

module.exports = {
	login: async ({ email, password }) => {
		try {
			const user = await User.findOne({ email: email });
			if (!user) {
				throw new Error('Wrong email or password!');
			}
			const isEqual = await bcrypt.compare(password, user.password);
			if (!isEqual) {
				throw new Error('Wrong email or password!');
			}
			const token = jwt.sign({ userId: user.id, email: user.email }, TOKEN_KEY, { expiresIn: '12hr' });
			return { userId: user.id, email: user.email, username: user.username, token: token, tokenExpiration: 1 };
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	createUser: async (args) => {
		try {
			const existingUser = await User.findOne({
				$or: [ { email: args.input.email }, { username: args.input.username } ]
			});
			if (existingUser) {
				throw new Error('User already exists with that email or username');
			}

			const hashedPassword = await bcrypt.hash(args.input.password, 12);
			const user = new User({
				email: args.input.email,
				username: args.input.username,
				password: hashedPassword
			});
			const result = await user.save();

			return {
				...result._doc,
				password: null,
				_id: result.id
			};
		} catch (err) {
			throw err;
		}
	}
};
