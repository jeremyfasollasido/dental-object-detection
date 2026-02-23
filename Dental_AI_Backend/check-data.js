const pool = require('./src/config/db');

async function checkColumns() {
    try {
        // Query untuk melihat detail kolom secara teknis
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'detection';
        `);
        
        console.log("=== Struktur Kolom di Aiven ===");
        res.rows.forEach(col => {
            console.log(`- ${col.column_name} (${col.data_type})`);
        });

        // Cek jumlah data
        const countRes = await pool.query("SELECT COUNT(*) FROM detection");
        console.log(`\nTotal baris data: ${countRes.rows[0].count}`);

    } catch (err) {
        console.error("❌ Gagal verifikasi:", err.message);
    } finally {
        await pool.end();
    }
}

checkColumns();