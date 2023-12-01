const fs = require('fs');
const path = require('path');

module.exports.deleteFile = (filePath) => {
    fs.unlink(path.join(__dirname, '..', filePath), (err) => {
        if (err) {
            throw err;
        }
    });
}