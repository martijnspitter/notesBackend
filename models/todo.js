const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const todoSchema = new Schema(
	{
		text: {
			type: String,
			required: true
		},
		check: {
			type: Boolean,
			required: true
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		item: {
			type: Schema.Types.ObjectId,
			ref: 'Item'
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Todo', todoSchema);
