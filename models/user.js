const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	createdProjects: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Project'
		}
	],
	createdNotes: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Note'
		}
	],
	projects: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Project'
		}
	]
});

module.exports = mongoose.model('User', userSchema);
