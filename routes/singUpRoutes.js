const express = require('express')
const router = express.Router()

const { singup } = require('../controllers/singUpController')

router.route('/').post(singup)

module.exports = router