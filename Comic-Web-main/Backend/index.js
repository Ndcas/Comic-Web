const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); 
const expressRateLimit = require('express-rate-limit');
const expressSlowDown = require('express-slow-down');
const { declareAssociation } = require('./database/association');
const adminRouter = require('./routers/admin.router');
const baoCaoRouter = require('./routers/baocao.router');
const nguoiDungRouter = require('./routers/nguoidung.router');
const truyenRouter = require('./routers/truyen.router');

dotenv.config();

declareAssociation();

const PORT = process.env.PORT || 8080;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'comicwebcookie';

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(COOKIE_SECRET));


app.use(cors({
  origin: "http://localhost:5174", 
  credentials: true                
}));

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});