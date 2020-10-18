const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectUsersSchema = new Schema(
	{
		project: {
			type: Schema.Types.ObjectId,
			ref: 'Project'
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('ProjectUsers', ProjectUsersSchema);
