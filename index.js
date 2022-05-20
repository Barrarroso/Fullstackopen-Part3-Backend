require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(cors())
//Json-parser, lets you use response.body
app.use(express.json())
//Log requests
app.use(morgan(':method :url :status :res[content-length] - :type :response-time ms'))

morgan.token('type', (req, res) => { 
    if (req.body) {
        return JSON.stringify(req.body)
    }
})

let phonebookData = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

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
app.get('/api/people/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }    
    })
})

//Delete a person
app.delete('/api/people/:id', (request, response) => {
    const id = Number(request.params.id)
    console.log(phonebookData)
    phonebookData = phonebookData.filter(person => person.id !== id)
    console.log(phonebookData)
    response.status(204).end()
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
    const newPerson = {
        name: body.name,
        number: body.number
    }
    newPerson.save().then( result => {
        console.log(`Added ${body.name} number ${body.number} to phonebook`)
        response.json(result)
    })
})

app.get('/info', (request, response) => {
    console.log(request)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZoneName: 'long' };

    const date = new Date().toLocaleString('en-US', options)
    const info = `<div>
    <h2>Phonebook has info for ${phonebookData.length} people</h2>
    <h3>${date}</h3>
    </div>`

    response.send(info)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
