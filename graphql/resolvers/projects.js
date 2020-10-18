const { dateToString } = require('../../helpers/date');
const { user, notes } = require('./mergeHelpers');

const Project = require('../../models/project');
const User = require('../../models/user');

module.exports = {
	projects: async () => {
		try {
			const projects = await Project.find().lean();

			return projects.map((project) => {
				return {
					...project,
					creator: user.bind(this, project.creator),
					notes: notes.bind(this, project.notes),
					createdAt: dateToString(project.createdAt),
					updatedAt: dateToString(project.updatedAt)
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

			creator: req.userId
		});
		try {
			const result = await project.save();
			const projectCreated = {
				...result._doc,
				_id: result.id,
				notes: notes.bind(this, project.notes),
				creator: user.bind(this, result.creator)
			};

			const userExist = await User.findById(req.userId);

			if (!userExist) {
				throw new Error('User does not exists');
			}
			await userExist.createdProjects.push(result);
			await userExist.save();

			return projectCreated;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};
