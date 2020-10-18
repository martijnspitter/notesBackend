const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const projectSchema = new Schema(
	{
		title: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		notes: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Note'
			}
		]
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
