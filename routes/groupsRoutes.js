const express = require('express')
const router = express.Router()

const { find, create, update, addPurchaseList, addUsers, destroy } = require('../controllers/groupsController')

router.route('/').get(find)
router.route('/').post(create)
router.route('/').put(update)
router.route('/add-users').put(addUsers)
router.route('/add-purchase-list').put(addPurchaseList)
router.route('/').delete(destroy)

module.exports = router