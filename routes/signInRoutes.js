const express = require('express')
const router = express.Router()

const { singin } = require('../controllers/signInController')

router.route('/').post(singin)

module.exports = router