const nodemailer = require('nodemailer');

const EMAIL = process.env.EMAIL || 'wordlinkctu@gmail.com';
const APP_EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'pgbijbjpurlmwfxw';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: APP_EMAIL_PASSWORD
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
        console.error('Lỗi khi gửi email', error);
        throw new Error('Lỗi khi gửi email');
    }
}

module.exports = { sendEmail };