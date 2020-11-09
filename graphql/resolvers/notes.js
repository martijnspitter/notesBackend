const { dateToString } = require('../../helpers/date');
const { user, singleProject, items } = require('./mergeHelpers');

const Note = require('../../models/note');
const User = require('../../models/user');
const Project = require('../../models/project');
const Item = require('../../models/item');
const Todo = require('../../models/todo');
const note = require('../../models/note');

module.exports = {
	notes: async (args, req) => {
		try {
			const sortBy = {};
			if (args.sortBy) {
				sortBy[args.sortBy.field] = args.sortBy.order === 'ASC' ? 1 : -1;
			}
			const notes = await Note.find({ project: args.projectId }).sort(sortBy).lean();
			return notes.map((note) => {
				return {
					...note,
					creator: user.bind(this, note.creator),
					project: singleProject.bind(this, note.project),
					items: items.bind(this, note.items, sortBy),
					createdAt: dateToString(note.createdAt),
					updatedAt: dateToString(note.updatedAt)
				};
			});
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	createNote: async (args, req) => {
		const note = new Note({
			title: args.input.title,
			project: args.input.project,
			position: args.input.position,
			creator: req.userId
		});

		try {
			if (!req.isAuth) {
				throw new Error('You are not allowed to create a Project');
			}
			const result = await note.save();
			const noteCreated = {
				...result._doc,
				_id: result.id,
				items: items.bind(this, result.items),
				createdAt: dateToString(result.createdAt),
				updatedAt: dateToString(result.updatedAt),
				creator: user.bind(this, result.creator),
				project: singleProject.bind(this, result.project)
			};
			const userExist = await User.findById(req.userId);
			if (!userExist) {
				throw new Error('User does not exists');
			}
			await userExist.createdNotes.push(result);
			await userExist.save();

			const projectExist = await Project.findById(args.input.project);

			if (!projectExist) {
				throw new Error('Project does not exists');
			}
			await projectExist.notes.push(result);
			await projectExist.save();

			return noteCreated;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	deleteNote: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed see the items for this project');
		}
		try {
			const note = await Note.findByIdAndDelete(args.noteId).lean();

			const noteRemoved = {
				...note,
				creator: user.bind(this, note.creator),
				items: items.bind(this, note.item),
				createdAt: dateToString(note.createdAt),
				updatedAt: dateToString(note.updatedAt)
			};

			// delete from note from project
			const projectExist = await Project.findById(note.project);
			if (!projectExist) {
				throw new Error('Project does not exists');
			}
			// shallow comparison because args.todoId is string and todo._id is an id object
			const noteIndex = projectExist.notes.findIndex((note) => note._id == args.noteId);
			await projectExist.notes.splice(noteIndex, 1);
			await projectExist.save();

			// delete note from user
			const userExist = await User.findById(note.creator);
			if (!userExist) {
				throw new Error('User does not exists');
			}
			// shallow comparison because args.todoId is string and todo._id is an id object
			const createdNoteIndex = userExist.createdNotes.findIndex((note) => note._id == args.noteId);
			await userExist.createdNotes.splice(createdNoteIndex, 1);
			await userExist.save();

			// delete all the items in the note
			const itemsExist = await Item.find({ note: args.noteId }).lean();
			itemsExist.forEach(async (item) => {
				item.todos.forEach(async (todo) => {
					await Todo.findByIdAndDelete(todo._id);
				});
				await Item.findByIdAndDelete(item._id);
			});

			return noteRemoved;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	editNotePosition: async (args, req) => {
		try {
			const notes = await Note.find({ project: args.input.projectId }).lean();
			const oldIndex = notes.findIndex((note) => note._id == args.input.noteId);
			const note = notes.find((note) => note._id == args.input.noteId);

			notes.splice(oldIndex, 1);
			notes.splice(args.input.position, 0, note);

			notes.map(async (note, index) => {
				await Note.findOneAndUpdate({ _id: note._id }, { position: index }, { new: true }).lean();
			});
			return { message: 'Changed positions' };
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};
