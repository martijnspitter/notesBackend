const { dateToString } = require('../../helpers/date');
const { user, singleProject, items } = require('./mergeHelpers');

const Note = require('../../models/note');
const User = require('../../models/user');
const Project = require('../../models/project');

module.exports = {
	notes: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed see the notes for this project');
		}
		try {
			const notes = await Note.find({ project: args.projectId }).lean();
			return notes.map((note) => {
				return {
					...note,
					creator: user.bind(this, note.creator),
					project: singleProject.bind(this, note.project),
					items: items.bind(this, note.items),
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
	deleteNote: async (args, req) => {}
};
