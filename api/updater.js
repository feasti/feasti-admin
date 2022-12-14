const cron = require('node-cron')
const moment = require('moment')
const Orders = require('../models/orders.model')
const NewRestaurant = require('../models/newrest.model')
const currentOrder = require('../models/currentorders.model')

// module.exports = function () {
//     //  const orders=await Orders.find({status:'accepted'})
//     cron.schedule('*/1 * * * *', () => {
//         console.log('running on Sundays of January and September');
//     });
// }

const job = cron.schedule('*/2 * * * *', async () => {
    const today = moment().format('DD-MMM-YYYY')
    // const today=moment().forma
    await Orders.find({ $and: [{ start_date: today }, { status: 'accepted' }] }).updateMany({}, { $set: { status: 'started' } })
});

module.exports = job