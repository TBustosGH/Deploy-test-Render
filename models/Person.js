const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
//Get the url
const url = process.env.MONGODB_URI

console.log('Connecting to: ', url)
//Connect to MongoDB
mongoose.connect(url)
    .then(result => {
        console.log('Connected to MongoDB.')
    })
    .catch(error => {
        console.log('Unable to connect to MongoDB: ', error.message)
    })

//Create the schema
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        validate: {
            validator: (v) => /\d{3}-\d/.test(v) || /\d{2}-\d/,
            message: props => `${props.value} is not a valid phone number!`
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