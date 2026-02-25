const ort = require('onnxruntime-node');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const https = require('https');
const imageProcessor = require('../utils/imageProcessor');

let session;

const initModel = async () => {
    if (!session) {
        try {
            let modelPath;
            if (process.env.NODE_ENV === 'production') {
                modelPath = '/tmp/best2.onnx';
                if (!fs.existsSync(modelPath)) {
                    console.log('Downloading model from GitHub...');
                    const url = 'https://raw.githubusercontent.com/jeremyfasollasido/dental-object-detection/main/src/models/best2.onnx';
                    const file = fs.createWriteStream(modelPath);
                    https.get(url, (response) => {
                        response.pipe(file);
                        file.on('finish', () => {
                            file.close();
                            console.log('Model downloaded.');
                        });
                    }).on('error', (err) => {
                        console.error('Error downloading model:', err);
                        throw err;
                    });
                    // Wait for download to complete
                    await new Promise((resolve, reject) => {
                        file.on('finish', resolve);
                        file.on('error', reject);
                    });
                }
            } else {
                modelPath = path.join(__dirname, '../models/best2.onnx');
            }
            session = await ort.InferenceSession.create(modelPath);
            console.log("Model YOLOv8 Small berhasil dimuat.");
        } catch (error) {
            console.error("Gagal memuat model ONNX:", error);
            throw new Error("AI Engine Failure");
        }
    }
};

exports.detectObjects = async (imageBuffer) => {
    await initModel();

    //Preprocess the image : resize, normalize, and convert to tensor
    const image = await sharp(imageBuffer)
        .resize(640, 640)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    // Convert from interleaved RGB to planar format [RRRGGGBBB]
    const float32Data = new Float32Array(640 * 640 * 3);
    const pixelCount = 640 * 640;
    
    // Separate channels: interleaved (RGBRGB...) -> planar (RRR...GGG...BBB...)
    for (let i = 0; i < image.data.length; i += 3) {
        const pixelIndex = i / 3;
        float32Data[pixelIndex] = image.data[i] / 255.0;                    // R channel
        float32Data[pixelCount + pixelIndex] = image.data[i + 1] / 255.0;   // G channel
        float32Data[2 * pixelCount + pixelIndex] = image.data[i + 2] / 255.0; // B channel
    }

    const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, 640, 640]);

    const outputs = await session.run({ [session.inputNames[0]]: inputTensor });
    const rawOutput = outputs[session.outputNames[0]].data;

    return imageProcessor.processOutput(rawOutput);
};
