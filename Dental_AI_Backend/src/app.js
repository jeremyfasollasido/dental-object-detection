const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const initScheduler = require('./utils/scheduler');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
    res.status( err.status || 500).json({
        success: false,
        message : err.message
    });
});

initScheduler();

module.exports = app;

if(process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}