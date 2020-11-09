const { dateToString } = require('../../helpers/date');
const { user, users, notes, projects } = require('./mergeHelpers');

const Project = require('../../models/project');
const User = require('../../models/user');
const Note = require('../../models/note');
const Item = require('../../models/item');
const Todo = require('../../models/todo');

module.exports = {
	demo: async (args, req) => {
		try {
			const project = await Project.findById('5fa90b5d18366b2ce0f41e6a').lean();

			return {
				...project,
				creator: user.bind(this, project.creator),
				notes: notes.bind(this, project.notes),
				createdAt: dateToString(project.createdAt),
				updatedAt: dateToString(project.updatedAt),
				users: users.bind(this, project.users)
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	projects: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed see the items for this project');
		}
		try {
			const projects = await Project.find().lean();

			return projects.map((project) => {
				return {
					...project,
					creator: user.bind(this, project.creator),
					notes: notes.bind(this, project.notes),
					createdAt: dateToString(project.createdAt),
					updatedAt: dateToString(project.updatedAt),
					users: users.bind(this, project.users)
				};
			});
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	createProject: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed to create a Project');
		}
		const project = new Project({
			title: args.input.title,
			description: args.input.description,
			users: [],
			creator: req.userId
		});
		project.users.push(req.userId);
		try {
			const result = await project.save();
			const projectCreated = {
				...result._doc,
				_id: result.id,
				notes: notes.bind(this, result.notes),
				creator: user.bind(this, result.creator),
				createdAt: dateToString(result.createdAt),
				updatedAt: dateToString(result.updatedAt),
				users: users.bind(this, result.users)
			};

			const userExist = await User.findById(req.userId);

			if (!userExist) {
				throw new Error('User does not exists');
			}
			await userExist.createdProjects.push(result);
			await userExist.projects.push(result);
			await userExist.save();

			return projectCreated;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	editProject: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed to create a Project');
		}
		try {
			const update = {
				title: args.input.title,
				description: args.input.description
			};
			const project = await Project.findOneAndUpdate({ _id: args.input.projectId }, update, { new: true }).lean();

			return {
				...project,
				creator: user.bind(this, project.creator),
				notes: notes.bind(this, project.notes),
				createdAt: dateToString(project.createdAt),
				updatedAt: dateToString(project.updatedAt),
				users: users.bind(this, project.users)
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	addUser: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed to create a Project');
		}
		try {
			const users = args.addUsers.map(async (projectUser) => {
				if (projectUser.remove) {
					const project = await Project.findById(projectUser.projectId);
					const userIndex = project.users.findIndex((user) => user._id == projectUser.userId);
					console.log(userIndex);
					project.users.splice(userIndex, 1);
					await project.save();

					const user = await User.findById(projectUser.userId);
					const projectIndex = user.projects.findIndex((project) => project._id == projectUser.projectId);
					console.log(projectIndex);
					user.projects.splice(projectIndex, 1);
					await user.save();
				} else {
					const project = await Project.findById(projectUser.projectId);
					project.users.push(projectUser.userId);
					await project.save();

					const user = await User.findById(projectUser.userId);
					user.projects.push(projectUser.projectId);
					await user.save();

					return { _id: user._id, username: user.username, projects: projects.bind(this, user.projects) };
				}
			});
			return users;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	deleteProject: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed to create a Project');
		}
		try {
			const project = await Project.findByIdAndDelete(args.projectId).lean();

			const projectRemoved = {
				...project,
				creator: user.bind(this, project.creator),
				notes: notes.bind(this, project.notes),
				createdAt: dateToString(project.createdAt),
				updatedAt: dateToString(project.updatedAt),
				users: users.bind(this, project.users)
			};

			// remove project from createdProjects at user table.
			const userExcists = await User.findById(project.creator);
			const projectIndex = userExcists.createdProjects.findIndex(
				(projectToRemove) => projectToRemove._id === project._id
			);
			userExcists.createdProjects.splice(projectIndex, 1);
			await userExcists.save();

			// remove project from projects at all users.
			await project.users.map(async (user) => {
				const userToEdit = await User.findById(user._id);
				const projectIndex = userToEdit.projects.findIndex((projectToRemove) => projectToRemove._id === project._id);
				userToEdit.projects.splice(projectIndex, 1);

				// if user is also creator of note remove from createdNotes
				userToEdit.createdNotes.map(async (userCreatedNote, index) => {
					const userCreatedNoteId = userCreatedNote.toString();
					return project.notes.map((projectNote) => {
						const projectNoteId = projectNote.toString();

						if (userCreatedNoteId === projectNoteId) {
							userToEdit.createdNotes.splice(index, 1);
						} else return;
					});
				});
				await userToEdit.save();
			});

			// find notes, items and todos connected to the deleted project and delete them
			const notesExcists = await Note.find({ project: args.projectId }).lean();

			notesExcists.map(async (note) => {
				const items = await Item.find({ note: note._id }).lean();
				items.map(async (item) => {
					const todos = await Todo.find({ item: item._id }).lean();
					todos.map(async (todo) => {
						await Todo.findByIdAndDelete(todo._id);
					});
					await Item.findByIdAndDelete(item._id);
				});
				await Note.findByIdAndDelete(note._id);
			});

			return projectRemoved;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};
