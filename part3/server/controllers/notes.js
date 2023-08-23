const app = require("express").Router()
const Note = require("../models/note")
const User = require('../models/user')
const jwt = require('jsonwebtoken')


const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.replace('Bearer ', '')
    }
    return null
  }

app.get("/",async(request, response) => {
    let result = await Note.find({}).populate("user",{username: 1, name:1});
        response.json(result);
    });

app.get("/:id", async (request, response) => {
    const myId = request.params.id;
    const result = await Note.findById(myId);
        response.json(result);
    })


app.delete("/", (request, response) => {
    Note.find({}).then((result) => {
        response.json(result);
    });

});

app.post("/", async (request, response, next) => {

    const myNewPost = request.body;
try{
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(400).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
 
    // const user = await User.findById(myNewPost.userId);
    
    const note = new Note({
        content: myNewPost.content,
        important: myNewPost.important,
        user:user.id,
    })
    
        const savedNote = await note.save();
        response.status(201).json(savedNote)
        user.notes = user.notes.concat(savedNote.id)
        await user.save();
    }
    catch (e) {
        next(e);
    }
});

app.put('/', (request, response, next) => {
const body = request.body
      const note = {content:body.content,important:body.important}
    Note.findByIdAndUpdate(
        request.params.id, note,
        { new: true, runValidators: true }
    )
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error));
});
    module.exports = app;