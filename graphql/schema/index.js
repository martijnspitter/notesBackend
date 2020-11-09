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
      notes: [Note!]
      createdAt: String!
      updatedAt: String!
      creator: User!
      users: [User!]
    }

    type Note {
      _id: ID!
      title: String!
      items: [Item!] 
      creator: User!
      project: Project!
      position: Int
    }

    type Item { 
      _id: ID!
      title: String!
      todos: [Todo!]
      description: String
      dueDate: String
      position: Int 
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
      email: String
      username: String!
      password: String
      createdProjects: [Project!]
      createdNotes: [Note!]
      projects: [Project!]
    }

    type UserSmall {
      _id: ID!
      username: String!
    }

    type AuthData {
      userId: ID!
      email: String!
      username: String!
      token: String!
      tokenExpiration: Int!
      projects: [Project!]
      createdProjects: [Project!]
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
      position: Int 
     }

  input editNotePosition {
    noteId: ID!
    projectId: ID!
    position: Int!
  }

  input ItemInput {
    _id: ID
    title: String!
    note: ID!
    position: Int
  }

  input TodoInput {
    itemId: ID!
    text: String!
    check: Boolean!
  }

  input EditItemInput {
    itemId: ID!
    title: String 
    description: String
    dueDate: String 
    position: Int
  }

  input editItemPosition {
    noteId: ID!
    itemId: ID!
    position: Int!
    target: ID!
  }

  input EditTodoInput {
    todoId: ID!
    text: String
    check: Boolean
  }

  input projectUser {
    projectId: ID!
    userId: ID!
    remove: Boolean
  }
  
  input addUsers {
    projectUsers: [projectUser!]
  }

  input editProject {
    projectId: ID!
    title: String!
    description: String!
  }



  enum Order {
    ASC
    DESC
  }
  
  input SortBy {
    field: String!
    order: Order!
  }

  type RootQuery {
    projectusers(projectId: ID!): [ProjectUsers!]!
    projects(userId: ID!): [Project!]!
    notes(projectId: ID!, sortBy: SortBy): [Note!]!
    items(noteId: ID!, sortBy: SortBy): [Item!]
    item(itemId: ID!, projectId: ID!): Item!
    todos(itemId: ID!): [Todo!]!
    user: User
    users: [User!]
    login(email: String!, password: String!): AuthData!
    demo: Project!
  }

  type RootMutation {
    createProject(input: ProjectInput): Project
    createNote(input: NoteInput): Note
    deleteNote(noteId: ID!): Note
    createUser(input: UserInput): User
    createItem(input: ItemInput): Item
    editItem(input: EditItemInput ): Item
    deleteItem(itemId: ID!): Item
    createTodo(input: TodoInput): Todo
    editTodo(input: EditTodoInput): Todo
    deleteTodo(todoId: ID!): Todo
    editNotePosition(input: editNotePosition): Note
    editItemPosition(input: editItemPosition): Item
    addUser(addUsers: [projectUser!]!): [UserSmall]
    editProject(input: editProject): Project!
    deleteProject(projectId: ID!): Project
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
  `);
