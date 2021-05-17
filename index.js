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

const errorHandler = (error, req, re, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
      return res.status(400).send({ error: 'malformatted id' })
    }
    next(error)
  }
  
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
app.use(requestLogger)


app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people)
    })
})

app.get("/api/persons/:id", (req, res, next) => {
    Person.findById(req.params.id)
    .then((person) => {
        if (person) {
            res.json(person)
        }
        else {
            res.status(404).end()
        }
    }).catch(error => {
        console.log(error)
        res.status(400).send({ error: 'malformatted id' })
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
  
app.delete("/api/persons/:id", (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
    .then(() => {
        res.status(204).end()
    }).catch(error => next(error))
})
  
app.post("/api/persons", (req, res, next) => {
    const body = req.body
    const person = new Person({
      name: body.name,
      number: body.number
    })
    person.save().then(savedPerson => {
        res.json(savedPerson)
    }).catch(error => next(error))
})

app.put("/api/persons/:id", (req, res, next) => {
    const body = req.body
    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, {new: true, runValidators: true, context: 'query',})
    .then(person => {
        res.json(person)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)
  
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})