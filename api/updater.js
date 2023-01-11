const cron = require('node-cron')
const moment = require('moment')
const Orders = require('../models/orders.model')
const NewRestaurant = require('../models/newrest.model')
const currentOrder = require('../models/currentorders.model')


const job = cron.schedule('*/2 * * * *', async () => {
    const today = moment().format('DD-MMM-YYYY')
    await Orders.find({ $and: [{ start_date: today }, { $or: [{ status: 'pending' }, { status: 'pending' }] }] }).updateMany({}, { $set: { status: 'started' } })
});

module.exports = job