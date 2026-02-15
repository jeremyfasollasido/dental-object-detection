const LANDMARK_NAMES = [
    'Kanal mandibularis', 'Mental foramwen', 'Nasal septum', 
    'Orbita', 'Palate', 'Prosessus kondiloideus', 
    'Prosessus koronoideus', 'Sinus maksilaris', 'eminensia artikularis'
];


//Post-processing untuk mengubah output tensor YOLO menjadi format JSON

exports.processOutput = (output, confThreshold = 0.25) => {
    const detections = [];
    const num_classes = LANDMARK_NAMES.length; // 9
    const rows = 8400; // Jumlah kolom prediksi per gambar

    console.log("Output length:", output.length);
    console.log("Expected output size:", (num_classes + 4) * rows);
    console.log("Confidence threshold:", confThreshold);

    let maxConfOverall = 0;
    let detectionCount = 0;

    for (let i = 0; i < rows; i++) {
        let maxConf = 0;
        let classId = -1;

        // Mencari skor kepercayaan tertinggi di antara 9 landmark
        for (let j = 0; j < num_classes; j++) {
            // Formula akses: (index_atribut * total_kolom) + kolom_sekarang
            // Atribut ke-0 s/d 3 adalah [x, y, w, h], kelas mulai dari index 4
            const conf = output[(j + 4) * rows + i]; 
            if (conf > maxConf) {
                maxConf = conf;
                classId = j;
            }
        }

        if (maxConf > maxConfOverall) {
            maxConfOverall = maxConf;
        }

        // Filter hasil berdasarkan threshold
        if (maxConf > confThreshold) {
            detectionCount++;
            // YOLOv8 output: cx, cy, width, height dalam pixel (skala 640)
            const cx = output[0 * rows + i];
            const cy = output[1 * rows + i];
            const w = output[2 * rows + i];
            const h = output[3 * rows + i];

            // Konversi ke format x_min, y_min, width, height dalam persentase (0-1)
            // Berguna agar UI React responsif terhadap berbagai ukuran layar
            detections.push({
                label: LANDMARK_NAMES[classId],
                confidence: parseFloat(maxConf.toFixed(4)),
                bbox: [
                    ((cx - w / 2) / 640), // x_min (persentase)
                    ((cy - h / 2) / 640), // y_min (persentase)
                    (w / 640),            // width (persentase)
                    (h / 640)             // height (persentase)
                ]
            });
        }
    }

    console.log("Max confidence found:", maxConfOverall);
    console.log("Detections above threshold:", detectionCount);
    console.log("Detections before NMS:", detections.length);
    
    const nmsResult = this.applyNMS(detections);
    console.log("Detections after NMS:", nmsResult.length);
    console.log("Final detections:", JSON.stringify(nmsResult, null, 2));
    
    return nmsResult;
};

exports.applyNMS = (detections) => {
    const bestDetections = {};
    
    detections.forEach(det => {
        if (!bestDetections[det.label] || det.confidence > bestDetections[det.label].confidence) {
            bestDetections[det.label] = det;
        }
    });

    return Object.values(bestDetections);
};