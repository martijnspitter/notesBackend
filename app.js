const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const isAuth = require('./middleware/isAuth');
const cors = require('cors');

const mongoose = require('mongoose');

require('dotenv').config();

const MONGO_USER = process.env.MONGO_USER || 'root';
const MONGO_PASS = process.env.MONGODB_PASS;

const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');

const app = express();

var corsOptions = {
	origin: 'http://digitalgarden.martijnspitter.nl'
};

var localCorsOptions = {
	origin: 'http://localhost:3000'
};

app.use(cors(localCorsOptions));

app.use(bodyParser.json());

app.use(isAuth);

app.use(
	'/graphql',
	graphqlHTTP({
		schema: graphqlSchema,
		rootValue: graphqlResolvers,
		graphiql: true
	})
);

mongoose
	.connect(
		`mongodb+srv://${MONGO_USER}:${MONGO_PASS}@martijnspitterdatabase.mthi9.mongodb.net/Notes?retryWrites=true&w=majority`
	)
	.then(() => {
		const PORT = process.env.PORT || 5000;
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}.`);
		});
	})
	.catch((err) => {
		console.log(err);
	});
