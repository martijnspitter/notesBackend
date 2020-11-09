const { dateToString } = require('../../helpers/date');
const { user, items } = require('./mergeHelpers');

const Todo = require('../../models/todo');
const Item = require('../../models/item');

module.exports = {
	todos: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed see the notes for this project');
		}
		try {
			const todos = await Todo.find({ item: args.itemId }).lean();
			return todos.map((todo) => {
				return {
					...todo,
					creator: user.bind(this, todo.creator),
					item: items.bind(this, todo.item),
					createdAt: dateToString(todo.createdAt),
					updatedAt: dateToString(todo.updatedAt)
				};
			});
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	createTodo: async (args, req) => {
		const todo = new Todo({
			text: args.input.text,
			check: args.input.check,
			item: args.input.itemId,
			creator: req.userId
		});

		try {
			if (!req.isAuth) {
				throw new Error('You are not allowed to create a Project');
			}
			const result = await todo.save();
			const todoCreated = {
				...result._doc,
				_id: result.id,
				createdAt: dateToString(result.createdAt),
				updatedAt: dateToString(result.updatedAt),
				creator: user.bind(this, result.creator),
				item: items.bind(this, result.item)
			};

			const itemExist = await Item.findById(args.input.itemId);

			if (!itemExist) {
				throw new Error('Item does not exists');
			}
			await itemExist.todos.push(result);
			await itemExist.save();

			return todoCreated;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	editTodo: async (args, req) => {
		try {
			const update = {
				text: args.input.text,
				check: args.input.check
			};
			const todo = await Todo.findOneAndUpdate({ _id: args.input.todoId }, update, { new: true }).lean();

			return {
				...todo,
				creator: user.bind(this, todo.creator),
				item: items.bind(this, todo.item),
				createdAt: dateToString(todo.createdAt),
				updatedAt: dateToString(todo.updatedAt)
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	deleteTodo: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed see the items for this project');
		}
		try {
			const todo = await Todo.findByIdAndDelete(args.todoId).lean();

			const todoRemoved = {
				...todo,
				creator: user.bind(this, todo.creator),
				item: items.bind(this, todo.item),
				createdAt: dateToString(todo.createdAt),
				updatedAt: dateToString(todo.updatedAt)
			};

			const itemExist = await Item.findById(todo.item);

			if (!itemExist) {
				throw new Error('Item does not exists');
			}

			// shallow comparison because args.todoId is string and todo._id is an id object
			const index = itemExist.todos.findIndex((todo) => todo._id == args.todoId);

			await itemExist.todos.splice(index, 1);

			await itemExist.save();

			return todoRemoved;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};
