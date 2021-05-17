const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people)
    })
})

app.get("/api/persons/:id", (req, res) => {
    Person.findById(req.params.id)
    .then((person) => {
        if (person) {
            res.json(person)
        }
        else {
            res.status(404).end()
        }
    })
})

app.get('/info', (req, res) => {
    const time = new Date();
    Person.find({}).then((persons) => {
        res.send(
            `<div><p>Phonebook has info for ${persons.length} people</p><p>${time}</p></div>`
        )
    })
})
  
app.delete("/api/persons/:id", (req, res) => {
    Person.findByIdAndRemove(req.params.id)
    .then(() => {
        res.status(204).end()
    })
})
  
app.post("/api/persons", (req, res) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json(
            { error: "content missing" }
        )
    }
    const person = new Person({
      name: body.name,
      number: body.number,
    })
    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})