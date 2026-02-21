const cron = require('node-cron');
const pool = require('../config/db');

// Schedule a task to run every day at midnight
const initScheduler = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running scheduled task to clean up old detections... (every 3 days)');
        try{
            const deleteQuery = 'DELETE FROM detection WHERE created_at < NOW() - INTERVAL \'3 days\'';
            const result = await pool.query(deleteQuery);
            console.log(`Deleted ${result.rowCount} old detection records.`);
        } catch (error) {
            console.error('Error during scheduled cleanup:', error);
        }
    });
    console.log('Scheduler initialized to clean up old detections every 3 days.');
};

module.exports = initScheduler;