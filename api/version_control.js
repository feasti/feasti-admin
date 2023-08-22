// Express Routes
const express = require('express');
const router = express.Router();
const Version = require('../models/version.model');

// Endpoint to check for updates
router.post('/check-update', async (req, res) => {
    const { platform, currentVersion } = req.body;

    // Query the database to get the latest version info for the platform
    const latestVersionInfo = await Version.findOne({ platform }).sort('-releaseDate');

    if (!latestVersionInfo || currentVersion === latestVersionInfo.versionNumber) {
        // No update available
        return res.json({ updateAvailable: false });
    }

    // Update available
    return res.json({
        updateAvailable: true,
        latestVersion: latestVersionInfo.versionNumber,
        releaseNotes: latestVersionInfo.releaseNotes,
    });
});

// Define a route to insert sample data
router.post('/insert-sample-data', async (req, res) => {
    try {
        const sampleVersions = [
            {
                app_name: 'feasti',
                platform: 'android',
                versionNumber: '1.0.30',
                releaseDate: new Date('2023-08-22'),
                releaseNotes: 'Initial release',
            },
            {
                app_name: 'feasti',
                platform: 'ios',
                versionNumber: '1.0.30',
                releaseDate: new Date('2023-08-22'),
                releaseNotes: 'Bug fixes and performance improvements',
            },
        ];

        await Version.insertMany(sampleVersions);
        res.status(201).json({ message: 'Sample data inserted successfully.' });
    } catch (error) {
        console.error('Error inserting sample data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
