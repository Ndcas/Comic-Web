require('dotenv').config();

const { declareAssociation } = require('./database/association');
const adminRouter = require('./routers/admin.router');
const baoCaoRouter = require('./routers/baocao.router');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressRateLimit = require('express-rate-limit');
const expressSlowDown = require('express-slow-down');
const logger = require('./utils/logger');
const multer = require('multer');
const nguoiDungRouter = require('./routers/nguoidung.router');
const truyenRouter = require('./routers/truyen.router');

declareAssociation();

const PORT = process.env.PORT;
const COOKIE_SECRET = process.env.COOKIE_SECRET;

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser(COOKIE_SECRET));

const limiter = expressRateLimit({
    windowMs: 60000,
    max: 120
});

app.use(limiter);

const slower = expressSlowDown({
    windowMs: 60000,
    delayAfter: 60,
    delayMs: () => 300
});

app.use(slower);

app.use('/admin', adminRouter);

app.use('/baoCao', baoCaoRouter);

app.use('/nguoiDung', nguoiDungRouter);

app.use('/truyen', truyenRouter);

app.use((error, req, res, next) => {
    if (!(error instanceof multer.MulterError)) {
        return next(error);
    }
    switch (error.code) {
        case 'LIMIT_FILE_SIZE':
            return res.status(400).json({ error: 'File quá lớn' });
        case 'LIMIT_FILE_COUNT':
            return res.status(400).json({ error: 'Quá nhiều file' });
        default:
            logger.error('Lỗi xử lý file tải lên', error);
            return res.status(400).json({ error: 'Lỗi không xác định liên quan tới file được tải lên' });
    }
});

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});