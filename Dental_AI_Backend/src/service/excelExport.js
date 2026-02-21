const ExcelJS = require('exceljs');

exports.genenerateDetectionExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Detection History');

    worksheet.columns = [
        {header: 'ID', key: 'id', width: 10},
        {header: 'Patient Name', key: 'patient_name', width: 25},
        {header: 'Image Name', key: 'image_name', width: 25},
        {header: 'Created At', key: 'created_at', width: 20},
    ];

    data.forEach((item) => {
        worksheet.addRow({
            id: item.id,
            patient_name: item.patient_name,
            image_name: item.image_name,
            created_at: item.created_at,
        });
    });

    return workbook;
};