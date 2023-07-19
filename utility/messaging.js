const Pusher = require('pusher')

const pusher = new Pusher({
    appId: "1630244",
    key: "5792e4bd07e747ad775e",
    secret: "31b678b2a366a32091da",
    cluster: "mt1",
    useTLS: true
})

module.exports = pusher;