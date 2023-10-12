const express = require('express')
const router = express.Router()

const { find, findListProducts,findDeleted, create, update, shared,leaveList, destroy } = require('../controllers/purchaseListController')

router.route('/').get(find)
router.route('/products').get(findListProducts)
router.route('/deleted').get(findDeleted)
router.route('/').post(create)
router.route('/').put(update)
router.route('/shared').put(shared)
router.route('/leave-list').put(leaveList)
router.route('/').delete(destroy)

module.exports = router