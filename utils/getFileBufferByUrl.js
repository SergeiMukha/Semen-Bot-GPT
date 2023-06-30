const request = require("request");

function getFileBufferByUrl(url) {
    return new Promise((resolve, reject) => {
        request({ url, encoding: null }, (error, response, body) => {
        if (error) {
            console.error('Error retrieving file:', error);
            reject(error);
        } else if (response.statusCode !== 200) {
            console.error('Failed to retrieve file. Status code:', response.statusCode);
            reject(new Error('Failed to retrieve file'));
        } else {
            resolve(body);
        }
        });
    });
}

module.exports = getFileBufferByUrl;