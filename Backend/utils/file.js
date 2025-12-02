const fs = require('fs/promises');
const logger = require('./logger');

async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        logger.error(`Lỗi khi xóa file ${filePath}`, error);
    }
}

module.exports = { deleteFile };