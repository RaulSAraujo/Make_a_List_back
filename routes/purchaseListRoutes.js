const express = require('express')
const router = express.Router()

const { find, findListProducts, create, update, shared, destroy } = require('../controllers/purchaseListController')

router.route('/').get(find)
router.route('/products').get(findListProducts)
router.route('/').post(create)
router.route('/').put(update)
router.route('/shared').put(shared)
router.route('/').delete(destroy)

module.exports = router