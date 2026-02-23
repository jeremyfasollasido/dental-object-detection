exports.formatHistoryData = (rows) => {
    if (!Array.isArray(rows)) return {};

    return rows.reduce((acc, item) => {
        const key = item.data_label || new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        if (!acc[key]) acc[key] = [];

        let cleanName = item.patient_name;
        
        // Memperbaiki logika parsing nama pasien
        if (cleanName && typeof cleanName === 'string' && cleanName.startsWith('{')) {
            try {
                const parsed = JSON.parse(cleanName);
                cleanName = parsed.patientName || cleanName;
            } catch (e) {
                console.warn("Failed to parse patient_name:", e.message);
            }
        }

        acc[key].push({
            id: item.id,
            patient_name: cleanName,
            imageUrl: item.image_name,
            // PostgreSQL JSONB otomatis jadi objek di Node.js, tapi kita beri guard
            landmarks: typeof item.landmarks === 'string' ? JSON.parse(item.landmarks) : item.landmarks,
            confidence: item.confidence,
            created_at: item.created_at,
        });

        return acc;
    }, {}); 
};