const admin = require("firebase-admin");
const serviceAccount = require('../firebase.json')
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

const add = (accumulator, curr) => parseFloat(accumulator) + parseFloat(curr);

// Function to send a notification to a specific chef
async function sendOrderNotificationToChef(chefToken, orderId, customerName) {
    const message = {
        token: chefToken,
        notification: {
            title: 'New Order Received',
            body: `Order #${orderId} from ${customerName}`,
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Notification sent successfully:', response);
    } catch (error) {
        console.log('Error sending notification:', error);
    }
}

module.exports = { add, sendOrderNotificationToChef };