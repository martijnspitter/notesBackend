const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type ProjectUsers {
      _id: ID!
      project: Project!
      user: User!
      createdAt: String!
      updatedAt: String!
    }

    type Project {
      _id: ID!
      title: String!
      description: String!
      createdAt: String!
      updatedAt: String!
      creator: User!
    }

    type Note {
      _id: ID!
      title: String!
      items: [Item!] 
      creator: User!
      project: Project!
    }

    type Item { 
      _id: ID!
      title: String!
      todos: [Todo!]
      description: String
      dueDate: String
      creator: User!
      note: Note!
      createdAt: String!
      updatedAt: String!
    }

    type Todo {
      _id: ID!
      text: String!
      check: Boolean!
      creator: User!
      item: Item!
    }

    type User {
      _id: ID!
      email: String!
      username: String!
      password: String
      createdProjects: [Project!]
      createdNotes: [Note!]
    }

    type AuthData {
      userId: ID!
      email: String!
      username: String!
      token: String!
      tokenExpiration: Int!
    }

  input UserInput {
    _id: ID
    email: String!
    username: String!
    password: String!
  }

  input ProjectInput {
    _id: ID
    title: String!
    description: String!
      
    }

  input NoteInput {
    _id: ID
      title: String!
      project: ID! 
     }

  input ItemInput {
    _id: ID
    title: String!
    note: ID!
    
  }

  input TodoInput {
    itemId: ID!
    text: String!
    check: Boolean!
  }

  input EditItemInput {
    itemId: ID!, 
    title: String, 
    description: String, 
    dueDate: String 
  }

  input EditTodoInput {
    todoId: ID!,
    text: String,
    check: Boolean
  }

  type RootQuery {
    projectusers: [ProjectUsers!]!
    projects: [Project!]!
    notes(projectId: ID!): [Note!]!
    items(noteId: ID!): [Item!]
    item(itemId: ID!): Item!
    todos(itemId: ID!): [Todo!]!
    user: User
    login(email: String!, password: String!): AuthData!
  }

  type RootMutation {
    createProject(input: ProjectInput): Project
    createNote(input: NoteInput): Note
    deleteNote(noteId: ID!): Note
    createUser(input: UserInput): User
    createItem(input: ItemInput): Item
    editItem(input: EditItemInput ): Item
    createTodo(input: TodoInput): Todo
    editTodo(input: EditTodoInput): Todo
    deleteTodo(todoId: ID!): Todo
    addUserToProject(projectId: ID!): ProjectUsers!
    removeUserFromProject(userProjectsId: ID!): ProjectUsers!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
  `);
