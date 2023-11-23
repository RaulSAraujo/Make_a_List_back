const express = require('express')
const router = express.Router()

const { find, create, update, addPurchaseList, removePurchaseList, addUsers, removeUsers, destroy } = require('../controllers/groupsController')

router.route('/').get(find)
router.route('/').post(create)
router.route('/').put(update)
router.route('/add-users').put(addUsers)
router.route('/remove-users').put(removeUsers)
router.route('/add-purchase-list').put(addPurchaseList)
router.route('/remove-purchase-list').put(removePurchaseList)
router.route('/').delete(destroy)

module.exports = router