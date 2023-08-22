const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
    app_name: { type: String, required: true },
    platform: {
        type: String, // 'android' or 'ios'
        required: true,
    },
    versionNumber: {
        type: String,
        required: true,
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    releaseNotes: {
        type: String,
    },
});

const Version = mongoose.model('Version', versionSchema);

module.exports = Version;
