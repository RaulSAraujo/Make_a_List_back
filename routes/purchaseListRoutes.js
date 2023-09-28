const express = require('express')
const router = express.Router()

const { find, create, update, shared, destroy } = require('../controllers/purchaseListController')

router.route('/').get(find)
router.route('/').post(create)
router.route('/').put(update)
router.route('/shared').put(shared)
router.route('/').delete(destroy)

module.exports = router