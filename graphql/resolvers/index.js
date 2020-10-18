const authResolver = require('./auth');
const notesResolver = require('./notes');
const projectsResolver = require('./projects');
const projectUsersResolver = require('./projectUsers');
const todosResolver = require('./todos');
const itemsResolver = require('./item');

const rootResolver = {
	...authResolver,
	...notesResolver,
	...projectsResolver,
	...projectUsersResolver,
	...todosResolver,
	...itemsResolver
};

module.exports = rootResolver;
