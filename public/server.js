const express = require('express')
const app = express()
const path = require('path')

app.use(express.json())

var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: '181980660ef645f9b05e8a49bd4801df',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Hello Internet!')

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    rollbar.info('Student list was requested')
    res.status(200).send(students)
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   rollbar.info('Post new student was hit.')

   try {
       if (index === -1 && name !== '') {
        rollbar.info('Student name was added.')
           students.push(name)
           res.status(200).send(students)
       } else if (name === ''){
        rollbar.warning('No name was added before post.')
           res.status(400).send('You must enter a name.')
       } else {
        rollbar.error('Student aleady existed on list.')
           res.status(400).send('That student already exists.')
       }
   } catch (err) {
       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
