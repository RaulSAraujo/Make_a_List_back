const express = require('express')
const router = express.Router()

const { singin } = require('../controllers/singInController')

router.route('/').post(singin)

module.exports = router