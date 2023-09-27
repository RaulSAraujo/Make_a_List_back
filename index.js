const cookieParser = require('cookie-parser')
const express = require('express')
const cors = require("cors");

require('dotenv').config()
const app = express()

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware cookie
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Funciona')
})

// Verificação do token
const verifyToken = require('./helpers/verifyToken');
app.use(verifyToken);

const singUpRouter = require('./routes/singUpRoutes')
app.use('/singup', singUpRouter)

const singInRoutes = require('./routes/singInRoutes')
app.use('/singin', singInRoutes)

const userRouter = require('./routes/userRoutes')
app.use('/users', userRouter)

const purchaseListRouter = require('./routes/purchaseListRoutes')
app.use('/purchase-list', purchaseListRouter)

const productsRouter = require('./routes/productsRoutes')
app.use('/products', productsRouter)

const groupsRouter = require('./routes/groupsRoutes')
app.use('/groups', groupsRouter)

// Middleware de erro
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({ error: err.message });
});

app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
})