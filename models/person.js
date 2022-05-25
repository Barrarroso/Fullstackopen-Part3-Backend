const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log(process.env.MONGODB_URI)

console.log('Connecting to', url)

mongoose.connect(url).then(result => {
    console.log('Connected to MongoDB successfully')    
}).catch( error => {
    console.log('Error connecting to MongoDB:', error.message)
})


const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true
    },
    /*Valid formats for number:
        (123) 456-7890
        (123)456-7890
        123-456-7890
        123.456.7890
        1234567890
        +31636363634
        075-63546725
    */
    number: {
        type: String,
        validate: {
            validator: (v) => {
                return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(v)
            },
            message: 'invalid phone number'
        },
        required: true
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)