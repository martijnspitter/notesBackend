const ProjectUsers = require('../../models/projectUsers');
const Project = require('../../models/project');

const { dateToString } = require('../../helpers/date');
const { user, singleProject } = require('./mergeHelpers');

module.exports = {
	projectusers: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed to create a Project');
		}
		try {
			const projectusers = await ProjectUsers.find({ project: args.projectId }).lean();
			return projectusers.map((projectuser) => {
				return {
					...projectuser,
					user: user.bind(this, projectuser.user),
					project: singleProject.bind(this, projectUser.project),
					createdAt: dateToString(projectuser.createdAt),
					updatedAt: dateToString(projectuser.updatedAt)
				};
			});
		} catch (err) {
			throw err;
		}
	},
	addUserToProject: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('You are not allowed to create a Project');
		}
		try {
			const fetchedProject = await Project.findOne({ _id: args.projectId }).lean();
			const projectuser = new ProjectUsers({
				project: fetchedProject,
				user: req.userId
			});
			const result = await projectuser.save();
			return {
				...result,
				_id: result.id,
				createdAt: dateToString(result.createdAt),
				updatedAt: dateToString(result.updatedAt)
			};
		} catch (err) {
			throw err;
		}
	},
	removeUserFromProject: async (args) => {
		try {
			await ProjectUsers.deleteOne({ _id: args.projectId });
			return { message: 'User removed from project' };
		} catch (err) {
			throw err;
		}
	}
};
