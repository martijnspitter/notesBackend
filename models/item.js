const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const itemSchema = new Schema(
	{
		title: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: false
		},
		todos: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Todo'
			}
		],
		dueDate: {
			type: Date,
			required: false
		},
		position: {
			type: Number,
			required: true
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		note: {
			type: Schema.Types.ObjectId,
			ref: 'Note'
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
