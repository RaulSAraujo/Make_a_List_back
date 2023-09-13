const cookieParser = require('cookie-parser')
const express = require('express')

require('dotenv').config()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//cookie middleware
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Funciona')
})

const singUpRoutes = require('./routes/singUpRoutes')
app.use('/singup', singUpRoutes)

const singInRoutes = require('./routes/singInRoutes')
app.use('/signin', singInRoutes)

const userRouter = require('./routes/userRoutes')
app.use('/users', userRouter)

app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
})