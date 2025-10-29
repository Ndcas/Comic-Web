const logger = require('./logger');
const nodemailer = require('nodemailer');

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD
    }
});

async function sendEmail(to, subject, html) {
    try {
        await transporter.sendMail({
            from: `ComicWeb <${appEmail}>`,
            to: to,
            subject: subject,
            html: html
        });
    } catch (error) {
        logger.error('Lỗi khi gửi email', error);
        throw new Error('Lỗi khi gửi email');
    }
}

module.exports = { sendEmail };