const Project = require('../../models/project');
const User = require('../../models/user');
const Note = require('../../models/note');
const Todo = require('../../models/todo');
const Item = require('../../models/item');

const { dateToString } = require('../../helpers/date');

const projects = async (projectIds) => {
	try {
		const projects = await Project.find({ _id: { $in: projectIds } }).lean();
		return projects.map((project) => {
			return {
				...project,
				creator: user.bind(this, project.creator),
				createdAt: dateToString(project.createdAt),
				updatedAt: dateToString(project.updatedAt),
				users: users.bind(this, project.users),
				notes: notes.bind(this, project.notes)
			};
		});
	} catch (err) {
		throw err;
	}
};

const singleProject = async (projectId) => {
	try {
		const project = await Project.findById(projectId).lean();
		return {
			...project,
			creator: user.bind(this, project.creator),
			createdAt: dateToString(project.createdAt),
			updatedAt: dateToString(project.updatedAt)
		};
	} catch (err) {
		throw err;
	}
};

const notes = async (noteIds) => {
	try {
		const notes = await Note.find({ _id: { $in: noteIds } }).lean();

		return notes.map(async (note) => {
			return {
				...note,
				creator: user.bind(this, note.creator),
				items: items.bind(this, note.items),
				createdAt: dateToString(note.createdAt),
				updatedAt: dateToString(note.updatedAt)
			};
		});
	} catch (err) {
		throw err;
	}
};

const singleNote = async (noteId) => {
	try {
		const note = await Note.findById(noteId).lean();

		return {
			...note,
			creator: user.bind(this, note.creator),
			items: items.bind(this, note.items),
			createdAt: dateToString(note.createdAt),
			updatedAt: dateToString(note.updatedAt)
		};
	} catch (err) {
		throw err;
	}
};

const items = async (itemIds, sortBy) => {
	try {
		const items = await Item.find({ _id: { $in: itemIds } }).sort(sortBy).lean();

		return items.map(async (item) => {
			return {
				...item,
				creator: user.bind(this, item.creator),
				todos: todos.bind(this, item.todos),
				note: notes.bind(this, item.note),
				createdAt: dateToString(item.createdAt),
				updatedAt: dateToString(item.updatedAt)
			};
		});
	} catch (err) {
		throw err;
	}
};

const todos = async (todoIds) => {
	try {
		const todos = await Todo.find({ _id: { $in: todoIds } }).lean();

		return todos.map(async (todo) => {
			return {
				...todo,
				creator: user.bind(this, todo.creator),
				item: items.bind(this, todo.note),
				createdAt: dateToString(todo.createdAt),
				updatedAt: dateToString(todo.updatedAt)
			};
		});
	} catch (err) {
		throw err;
	}
};

const user = async (userId) => {
	try {
		const user = await User.findById(userId).lean();
		return {
			...user,
			password: null,
			createdProjects: projects.bind(this, user.createdProjects),
			createdNotes: notes.bind(this, user.createdNotes),
			projects: projects.bind(this, user.projects)
		};
	} catch (err) {
		throw err;
	}
};

const users = async (userIds) => {
	try {
		const users = await User.find({ _id: { $in: userIds } }).lean();

		return users.map(async (user) => {
			return {
				...user,
				password: null,
				createdProjects: projects.bind(this, user.createdProjects),
				createdNotes: notes.bind(this, user.createdNotes),
				projects: projects.bind(this, user.projects)
			};
		});
	} catch (err) {
		throw err;
	}
};

exports.projects = projects;
exports.singleProject = singleProject;
exports.notes = notes;
exports.user = user;
exports.users = users;
exports.todos = todos;
exports.items = items;
exports.singleNote = singleNote;
