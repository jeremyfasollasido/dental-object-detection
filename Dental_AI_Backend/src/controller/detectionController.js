const detectionService = require('../service/detectionService');
const excelExportService = require('../service/excelExport');
const pool = require('../config/db');
const storageService = require('../service/storageService');
const historyService = require('../service/historyService');

const processDetection = async (req, res) => {
    try {
        const {patientName} = req.body || {patientName: "Unknown"};
        if (!req.file) {
            return res.status(400).json({ error: "Mohon upload gambar radiologi." });
        }

        const publicUrl = await storageService.uploadToCloud(req.file.buffer);

        const results = await detectionService.detectObjects(req.file.buffer);

        const confiedenceAvg = results.length > 0 ? results.reduce((acc, curr) => acc + curr.confidence, 0) / results.length : 0;

        const insertQuery = 'INSERT INTO detection (image_name, patient_name, landmarks, confidence) VALUES ($1, $2, $3, $4) RETURNING id'; 

        const values = [
            publicUrl,
            patientName, 
            JSON.stringify(results), 
            confiedenceAvg.toFixed(4)];

        pool.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error("Database Insert Error:", err);
                return res.status(500).json({ error: "Failed to save detection results to database." });
            }
            console.log("Detection results saved to database with ID:", result.rows[0].id);
        });

        dbResults = await pool.query(insertQuery, values);
        const insertedId = dbResults.rows[0].id;

        res.status(200).json({
            success: true,
            message: "Deteksi berhasil dilakukan.",
            landmarks: results,
            data:{
                id: insertedId,
                patientName: patientName,
                createdAt: dbResults.rows[0].created_at,
                imageUrl:publicUrl,
                landmarks:results 
            }
        });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const exportDetectionHistory = async (req, res) => {
    try {

        console.log("Full Body:", req.body);
        console.log("Full Query:", req.query);

        const {patientName} = req.body || {patientName: ""};

        console.log("Exporting detection history for patient:", patientName);

        let query = 'SELECT id, patient_name, image_name, created_at FROM detection';
        let values = [];

        if (patientName && patientName.trim() !== "") {
            query += ' WHERE patient_name ILIKE $1 ORDER BY created_at DESC';
            values.push(`%${patientName}%`);
        }else {
            query += " WHERE created_at::date = CURRENT_DATE ORDER BY created_at DESC";
        }

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No detection history found." });
        }

        const workbook = await excelExportService.genenerateDetectionExcel(result.rows);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=detection_history.xlsx');
        res.setHeader('X-Status-Message', 'Download Success'); 
        res.setHeader('X-Total-Count', result.rows.length);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ error: "Failed to export detection history." });
    }
};

const getDetectionHistory = async (req, res) => {
    try {

        const {patientName, startDate, endDate} = req.body || {};

        let query = 
        `SELECT id, patient_name, image_name, landmarks, confidence, created_at,
        TO_CHAR(created_at, 'DD Month YYYY') as date_label 
        FROM detection 
        WHERE 1=1`;

        let values = [];
        let paramIndex = 1;

        if (patientName && patientName.trim() !== "") {
            query += ` AND (patient_name ILIKE $${paramIndex} OR patient_name ILIKE $${paramIndex + 1})`;
            values.push(`%${patientName}%`);
            values.push(`%:"${patientName}"%`)
            paramIndex += 2;
        }

        if (startDate && endDate) {
            query += ` AND created_at::date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            values.push(startDate, endDate);
        } else{
            query += ` AND created_at > CURRENT_DATE - INTERVAL '3 days'`;
        }
        
        const {rows} = await pool.query(query, values);

        const groupedHistory = historyService.formatHistoryData(rows);

        res.status(200).json({
            success: true,
            message: "Detection history retrieved successfully.",
            data: groupedHistory
        });
    } catch (error) {
        console.error("History Retrieval Error:", error);
        res.status(500).json({ error: "Failed to retrieve detection history." });
    }
};


module.exports = { processDetection, exportDetectionHistory, getDetectionHistory };

// Example of how to use this controller in an Express app
// const express = require('express');
// const upload = require('../middleware/upload');
// const detectionController = require('./detectionController');
