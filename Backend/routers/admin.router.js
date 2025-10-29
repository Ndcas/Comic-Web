const express = require('express');
const controller = require('../controllers/admin.controller');

const router = express.Router();

// Yêu cầu Email, MatKhau trong body 
// => hanDung (hạn dùng của access token bằng tổng của Date.now() và thời gian sống của token), accessToken, refeshToken (trong cookie)
router.post('/dangNhap', controller.dangNhap);

// Yêu cầu có refreshToken trong cookie
// => hanDung (hạn dùng của access token bằng tổng của Date.now() và thời gian sống của token), accessToken
router.get('/lamMoiAccessToken', controller.lamMoiAccessToken);

module.exports = router;