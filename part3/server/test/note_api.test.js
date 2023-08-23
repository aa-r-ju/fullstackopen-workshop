const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Note = require("../models/note")
const helpers = require("./test_helper");

beforeEach(async () => {
  await Note.deleteMany({})

  const noteObjects = helpers.initialNotes.map(note => new Note(note))
  const promiseArray = noteObjects.map(note => note.save())
  await Promise.all(promiseArray)
})

// const api = supertest(app);

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    // .expect('Content-Type', 'application/json')
  .expect('Content-Type', /application\/json/)
},10000);

test('there are two notes', async () => {
  const response = await helpers.notesInDb()

  expect(response).toHaveLength(helpers.initialNotes.length);
})

test('the first note is about HTTP methods', async () => {
  const response = await helpers.notesInDb();

  expect(response[0].content).toBe(helpers.initialNotes[0].content)
})

test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/notes')

  const contents = response.body.map(r => r.content)

  expect(response.body).toHaveLength(helpers.initialNotes.length + 1)
  expect(contents).toContain('async/await simplifies making async calls' )
})

afterAll(async () => {
  await mongoose.connection.close();
})