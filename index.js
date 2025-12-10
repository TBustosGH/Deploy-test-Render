require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/Person')

const app = express()

app.use(express.json())
app.use(express.static('dist'))

//morgan.token('PostData', (request, response) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') 
        return response.status(400).send({ error: 'malformatted id' })
    else
        return response.status(400).send({ error: `${error.name}, ${error.message}` })

    next(error)
}

//GET: all the phonebook
app.get('/api/persons', (request, response) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
})
//GET: just a person from the phonebook by it's ID
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            response.json(person)
        })
        .catch(error => next(error))
})

//GET: information from the API. How much persons it has in the phonebook & the actual date.
app.get('/info', (request, response) => {
    Person.find({})
        .then(result => {
            const amountOfPersons = result.length
            const now = new Date()
            const week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'September', 'August', 'October', 'November', 'December']
        
            response.send(
                `<div> 
                    <h2>Phonebook has info for ${amountOfPersons} people</h2> 
                    <br /> 
                    <p>Today is 
                        ${week[now.getDay() - 1]}, 
                        ${months[now.getMonth()]}   ${now.getDate()}    ${now.getFullYear()}
                    </p> 
                    <p>Time:
                        ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}
                    </p>
                </div>`
            )
        })
})


//DELETE: a person from the phonebook by it's ID
app.delete('/api/persons/:id', (request, response, next) => {
    const id = String(request.params.id)
    Person.findByIdAndDelete(id)
        .then(result => response.status(204).end())
        .catch(error => next(error))
})


//POST: a person to the phonebook. name & number required!
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    //Error management
    if (!body)  //Checks if the request is empty
        return response.status(400).json({
            error: 'No request'
        })
    else if (!body.name)    //Checks if the request's name is empty
        return response.status(400).json({
            error: 'No name in request'
        })
    else if (!body.number)  //Checks if the request's number is empty
        return response.status(400).json({
            error: 'No number in request'
        })


    const personObject = new Person({
        "name" : body.name,
        "number" : String(body.number)
    })

    personObject.save()
        .then(result => {
            response.json(personObject)
        })
        .catch(error => next(error))
})

//PUT: a person from the phonebook. name & number required!
app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(
        request.params.id, 
        { name, number }, 
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => response.json(updatedPerson))
        .catch(error => next(error))
})


app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})