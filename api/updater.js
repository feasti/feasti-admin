const cron = require('node-cron');
const moment = require('moment');
const Orders = require('../models/orders.model'); // Replace with your Orders model

const job = cron.schedule('0 0 * * *', async () => {
    const today = moment().startOf('day');
    const filter = {
        $or: [
            { status: 'pending', start_date: today },
            { status: 'accepted', start_date: today }
        ]
    };
    const update = { status: 'started' };
    const options = { multi: true };

    const result = await Orders.updateMany(filter, update, options);

    console.log(`Updated ${result} orders to started`);
});

module.exports = job