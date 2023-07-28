const User = require('../models/User')

const Note = require('../models/Note')

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all notes
// @route GET /notes
// @access private
const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean()
    if(!notes?.length){
        return res.status(400).json({ message : 'No notes found' })
    }

    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))

    res.json(notesWithUser)
})

const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    if(!user || !title || !text){
        return res.status(400).json({ message : 'All fields are required.' })
    }

    const duplicate = await Note.findOne({ title }).lean().exec()
    
    if(duplicate){
        return res.status(409).json({ message: 'Duplicate note title' })
    }
    
    console.log(user)
    console.log(title)
    console.log(text)
    
    const noteObject = {user, title, text}

    const note = await Note.create(noteObject)
    
    if (note) { // Created 
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }


})

module.exports = {
    getAllNotes,
    createNewNote
}