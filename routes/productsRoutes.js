const express = require('express')
const router = express.Router()

const { find, findListProducts, create, update, destroy } = require('../controllers/productsController')

router.route('/').get(find)
router.route('/list').get(findListProducts)
router.route('/').post(create)
router.route('/').put(update)
router.route('/').delete(destroy)

module.exports = router