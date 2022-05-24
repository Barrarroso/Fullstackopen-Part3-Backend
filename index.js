require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')

const app = express()

const url = process.env.MONGODB_URI

console.log(process.env.MONGODB_URI)

console.log("Connecting to", url)

mongoose.connect(url).then(result => {
    console.log("Connected to MongoDB successfully")    
}).catch( error => {
    console.log("Error connecting to MongoDB:", error.message)
})

app.use(express.static('build'))
//Json-parser, lets you use response.body
app.use(express.json())
app.use(cors())

//Log requests
app.use(morgan(':method :url :status :res[content-length] - :type :response-time ms'))

morgan.token('type', (req, res) => { 
    if (req.body) {
        return JSON.stringify(req.body)
    }
})

app.get('/', (request, response) => {
    response.send('<h1>Hi</h1>')
})


//Get all people
app.get('/api/people', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

//Get a single person
app.get('/api/people/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            return response.status(404).send({error: `person with id: ${request.params.id} couldn't be found`})
        }    
    })
    .catch(error => next(error))
})

//Delete a person
app.delete('/api/people/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id).then( result => {
        response.status(204).end()
    }).catch(error => next(error))
})

//Add a person
app.post('/api/people', (request, response) => {
    const body = request.body
    console.log(body)
    
    if (!body.name || !body.number){
        console.log(body)
        return response.status(400).json({
            error: 'Missing data'
        })
    }
    newPerson = new Person({
        name: body.name,
        number: body.number
    })
    newPerson.save().then( result => {
        console.log(`Added ${body.name} number ${body.number} to phonebook`)
        response.json(result)
    })
})

app.put('/api/people/:id', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number){
        console.log(body)
        return response.status(400).json({
            error: 'Missing data'
        })
    }

    // we can only update person's phone number
    const person = {
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZoneName: 'long' };
    const date = new Date().toLocaleString('en-US', options)

    Person.find({}).then(people => {
    
        const info = `<div>
        <h2>Phonebook has info for ${people.length} people</h2>
        <h3>${date}</h3>
        </div>`

        response.send(info)
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// handler of requests with unknown endpoint
const unknownEndpoint = (request, response) => {
    console.log("Unknown endpoint")
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

//Error handlers are the last loaded middlewares
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
        console.log("Malformatted id")
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
}

app.use(errorHandler)