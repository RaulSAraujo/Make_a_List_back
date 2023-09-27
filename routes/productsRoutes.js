const express = require('express')
const router = express.Router()

const { find, findProduct, create, update, destroy } = require('../controllers/productsController')

router.route('/list').get(find)
router.route('/').get(findProduct)
router.route('/').post(create)
router.route('/').put(update)
router.route('/').delete(destroy)

module.exports = router