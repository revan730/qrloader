'use strict';

const fs = require('fs');
const { generateBrowserLoadableQr } = require('./generate.qr');

const text = fs.readFileSync('../preloader/boot.min.html', 'utf-8');
console.log(btoa(text).length);
generateBrowserLoadableQr(text, './preloader.png');