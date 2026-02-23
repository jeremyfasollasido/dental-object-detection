const pool = require('./src/config/db');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS detection (
    id SERIAL PRIMARY KEY,
    patient_name TEXT,
    image_name TEXT,           
    cloudinary_id TEXT,        
    landmarks JSONB,           
    confidence DECIMAL(5,4),   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function initDatabase() {
    try {
        console.log("Loading database configuration from environment variables...");
        await pool.query(createTableQuery);
        console.log("Detection table successfully initialized in Aiven PostgreSQL database.");
        
        // verification
        const res = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log("Table List:", res.rows.map(r => r.tablename));
        
    } catch (err) {
        console.error("Failed to initialize database:", err.message);
    } finally {
        await pool.end();
    }
}

initDatabase();