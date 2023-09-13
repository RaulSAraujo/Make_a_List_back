const express = require('express')
const router = express.Router()

const { find, create, update, destroy } = require('../controllers/userController')

router.route('/').get(find)
router.route('/').post(create)
router.route('/').put(update)
router.route('/').delete(destroy)

module.exports = router