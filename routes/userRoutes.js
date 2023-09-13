const express = require('express')
const router = express.Router()

const { find } = require('../controllers/userController')

router.route('/').get(find)

module.exports = router