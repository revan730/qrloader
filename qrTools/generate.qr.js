'use strict';
const QRCode = require('qrcode');
const { gzip } = require('node-gzip');

const generateCompressedQr = async (data, outputPath) => {
    const compressedBasedData = (await gzip(data)).toString('base64');

    QRCode.toFile(outputPath, `loader://${compressedBasedData}`);
}

const generateBrowserLoadableQr = (data, outputPath) => {
    QRCode.toFile(outputPath, `http://data:text/html;base64,${btoa(data)}`);
}

module.exports = { generateBrowserLoadableQr, generateCompressedQr };

async function test() {
    console.log('Testing');
    await generateCompressedQr('{const newDiv = document.createElement(\'div\');newDiv.innerText = \'This text is created by js from qr code\';const button = document.getElementById("qrScan");document.body.insertBefore(newDiv, button);}', './qr.png');
}
test();