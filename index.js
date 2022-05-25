if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
//Json-parser, lets you use response.body
app.use(express.json())

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
            return response.status(404).send({ error: `person with id: ${request.params.id} couldn't be found` })
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
app.post('/api/people', (request, response, next) => {
    const body = request.body
    console.log(body)
    
    if (!body.name || !body.number){
        console.log(body)
        return response.status(400).json({
            error: 'Missing data'
        })
    }
    const newPerson = new Person({
        name: body.name,
        number: body.number
    })
    newPerson.save().then( result => {
        console.log(`Added ${body.name} number ${body.number} to phonebook`)
        response.json(result)
    })
        .catch(error => next(error))
})

app.put('/api/people/:id', (request, response, next) => {
    const body = request.body
    const { number } = request.body


    if (!number){
        console.log(body)
        return response.status(400).json({
            error: 'Missing data'
        })
    }
    //we only update person's phone number
    Person.findByIdAndUpdate(request.params.id, { number }, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.get('/info', (request, response, next) => {

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZoneName: 'long' }
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

// handler of requests with unknown endpoint
const unknownEndpoint = (request, response) => {
    console.log('Unknown endpoint')
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

//Error handlers are the last loaded middlewares
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
        console.log('Malformatted id')
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        console.log('Validation error')
        return response.status(400).send({ error: error.message })
    }
  
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})