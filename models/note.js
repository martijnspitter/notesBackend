const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema(
	{
		title: {
			type: String,
			required: true
		},
		items: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Item'
			}
		],
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		project: {
			type: Schema.Types.ObjectId,
			ref: 'Project'
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
