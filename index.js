const cookieParser = require('cookie-parser')
const express = require('express')

require('dotenv').config()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware cookie
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Funciona')
})

const singUpRoutes = require('./routes/singUpRoutes')
app.use('/singup', singUpRoutes)

const singInRoutes = require('./routes/singInRoutes')
app.use('/signin', singInRoutes)

// Verificação do token
const verifyToken = require('./helpers/verifyToken');
app.use(verifyToken);

const userRouter = require('./routes/userRoutes')
app.use('/users', userRouter)

// Middleware de erro
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({ error: err.message });
});

app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
})