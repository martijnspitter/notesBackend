const { dateToString } = require('../../helpers/date');
const { user, todos, notes, singleNote } = require('./mergeHelpers');

const Note = require('../../models/note');
const User = require('../../models/user');
const Project = require('../../models/project');
const Item = require('../../models/item');
const Todo = require('../../models/todo');

module.exports = {
	items: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed see the items for this project');
		}
		try {
			const sortBy = {};
			if (args.sortBy) {
				sortBy[args.sortBy.field] = args.sortBy.order === 'ASC' ? 1 : -1;
			}
			const items = await Item.find({ note: args.noteId }).sort(sortBy).lean();

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
			creator: req.userId,
			position: args.input.position
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
	},
	deleteItem: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed see the items for this project');
		}
		try {
			const item = await Item.findByIdAndDelete(args.itemId).lean();

			const itemRemoved = {
				...item,
				creator: user.bind(this, item.creator),
				note: singleNote.bind(this, item.note),
				todos: todos.bind(this, item.todos),
				dueDate: dateToString(item.dueDate),
				createdAt: dateToString(item.createdAt),
				updatedAt: dateToString(item.updatedAt)
			};

			// delete item from note
			const noteExist = await Note.findById(item.note);
			if (!noteExist) {
				throw new Error('Project does not exists');
			}
			// shallow comparison because args.todoId is string and todo._id is an id object
			const itemIndex = noteExist.items.findIndex((item) => item._id == args.itemId);
			await noteExist.items.splice(itemIndex, 1);
			await noteExist.save();

			// delete all the items in the note
			item.todos.forEach(async (todo) => {
				await Todo.findByIdAndDelete(todo._id);
			});

			return itemRemoved;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	editItemPosition: async (args, req) => {
		try {
			if (args.input.noteId == args.input.target) {
				const items = await Item.find({ note: args.input.noteId }).lean();
				const oldIndex = items.findIndex((item) => item._id == args.input.itemId);
				const item = items.find((item) => item._id == args.input.itemId);

				items.splice(oldIndex, 1);
				items.splice(args.input.position, 0, item);

				items.map(async (item, index) => {
					await Item.findOneAndUpdate({ _id: item._id }, { position: index }, { new: true }).lean();
				});
				return { message: 'Changed positions' };
			} else {
				// find source items and splice item to update position via map index.
				const sourceItems = await Item.find({ note: args.input.noteId }).lean();
				// get item here before splicing it.
				const item = sourceItems.find((item) => item._id == args.input.itemId);
				// get index of item in source array
				const oldSourceIndex = sourceItems.findIndex((item) => item._id == args.input.itemId);
				// remove item from source array
				sourceItems.splice(oldSourceIndex, 1);
				// update position via index
				sourceItems.map(async (item, index) => {
					await Item.findOneAndUpdate({ _id: item._id }, { position: index }, { new: true }).lean();
				});

				// delete item from note
				const sourceNote = await Note.findById(args.input.noteId);
				if (!sourceNote) {
					throw new Error('Project does not exists');
				}
				// shallow comparison because args.todoId is string and todo._id is an id object
				const itemIndex = sourceNote.items.findIndex((item) => item._id == args.input.itemId);
				await sourceNote.items.splice(itemIndex, 1);
				await sourceNote.save();

				// get array of items from target note
				const targetItems = await Item.find({ note: args.input.target }).lean();

				// insert item into that array on given position
				targetItems.splice(args.input.position, 0, item);

				// update position of all items in target note via index
				targetItems.map(async (item, index) => {
					await Item.findOneAndUpdate(
						{ _id: item._id },
						{ position: index, note: args.input.target },
						{ new: true }
					).lean();
				});

				// insert item in target note
				const targetNote = await Note.findById(args.input.target);
				if (!targetNote) {
					throw new Error('Project does not exists');
				}
				// insert item into the note (order does not matter - see helper functions)
				await targetNote.items.push(item);
				await targetNote.save();
			}
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};
