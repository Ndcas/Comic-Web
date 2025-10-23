const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require('cookie-parser');
const expressRateLimit = require('express-rate-limit');
const expressSlowDown = require('express-slow-down');
const khaiBaoQuanhe = require('./database/association');

dotenv.config();

khaiBaoQuanhe();

const PORT = process.env.PORT || 8080;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'comicwebcookie';

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});