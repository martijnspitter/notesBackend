const { dateToString } = require('../../helpers/date');
const { user, todos, notes, singleNote } = require('./mergeHelpers');

const Item = require('../../models/item');
const Note = require('../../models/note');

module.exports = {
	items: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed see the items for this project');
		}
		try {
			const items = await Item.find({ note: args.noteId }).lean();

			return items.map((item) => {
				return {
					...item,
					creator: user.bind(this, item.creator),
					note: notes.bind(this, item.note),
					todos: todos.bind(this, item.todos),
					dueDate: dateToString(item.dueDate),
					createdAt: dateToString(item.createdAt),
					updatedAt: dateToString(item.updatedAt)
				};
			});
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	item: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed see the items for this project');
		}
		try {
			const item = await Item.findOne({ _id: args.itemId }).lean();

			return {
				...item,
				creator: user.bind(this, item.creator),
				note: singleNote.bind(this, item.note),
				todos: todos.bind(this, item.todos),
				dueDate: dateToString(item.dueDate),
				createdAt: dateToString(item.createdAt),
				updatedAt: dateToString(item.updatedAt)
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	editItem: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed see the items for this project');
		}
		try {
			const update = {
				title: args.input.title,
				description: args.input.description,
				dueDate: dateToString(args.input.dueDate)
			};
			const item = await Item.findOneAndUpdate({ _id: args.input.itemId }, update, { new: true }).lean();

			return {
				...item,
				creator: user.bind(this, item.creator),
				note: singleNote.bind(this, item.note),
				todos: todos.bind(this, item.todos),
				dueDate: dateToString(item.dueDate),
				createdAt: dateToString(item.createdAt),
				updatedAt: dateToString(item.updatedAt)
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	createItem: async (args, req) => {
		const item = new Item({
			title: args.input.title,
			note: args.input.note,
			creator: req.userId
		});

		try {
			if (!req.isAuth) {
				throw new Error('You are not allowed to create an Item');
			}
			const result = await item.save();

			const itemCreated = {
				...result._doc,
				_id: result.id,
				createdAt: dateToString(result.createdAt),
				updatedAt: dateToString(result.updatedAt),
				creator: user.bind(this, result.creator),
				note: notes.bind(this, result.note)
			};

			const noteExist = await Note.findById(args.input.note);

			if (!noteExist) {
				throw new Error('Note does not exists');
			}
			await noteExist.items.push(result);
			await noteExist.save();

			return itemCreated;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};
