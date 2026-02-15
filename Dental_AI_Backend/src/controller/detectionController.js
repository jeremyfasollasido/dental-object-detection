const detectionService = require('../service/detectionService');

const processDetection = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Mohon upload gambar radiologi." });
        }

        const results = await detectionService.detectObjects(req.file.buffer);

        res.status(200).json({
            success: true,
            landmarks: results
        });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { processDetection };

// Example of how to use this controller in an Express app
// const express = require('express');
// const upload = require('../middleware/upload');
// const detectionController = require('./detectionController');
