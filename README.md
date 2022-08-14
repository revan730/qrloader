# Qrloader

## What is this ?

You should probably watch [this](https://www.youtube.com/watch?v=ExwqNreocpg) MattKC's video for some context.
My friend was inspired to make his own version where game is actually an html file with built in JS which can fit into QR code and be opened directly in browser after scanning using [data url](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs) trick. I decided to go even further and make it possible to chainload something that won't actually fit into single QR code by dividing it into multiple codes and providing sort of a bootloader to do this

## Is it practical ?

No, probably not, i mean, i cannot really imagine someone using this for something big, as it will take ~ 340 qr codes just to load a megabyte of data. Yikes.

## How does it work ?

Current implementation heavily relies on [Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API) and [Decompression Stream](https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream) from Compression Stream API. Unfortunately at the time i'm writing this both APIs are only available in Chrome. Without them it would be quite a challenge to fit code for both reading QR code content using camera and decompression, as even the current preloader implementation only fits into QR after JS minifying

First step is a preloader, which fits onto QR code and can be opened in browser (with small but, see Limitations section).
 It's job is to read another QR code that will contain the actual "bootloader" in form of gzip compressed base64 encoded text of minified js function. After that, we use Function to make that text executable.

Bootloader is built for specific file we want to load using QR codes, as it contains metadata about the amount of QR codes it has to read, their hashes (to make sure nothing got corrupted) and their order in complete file structure. When it starts, it creates UI and sets up required JS stuff so that it can read QR codes of the file itself.

Then it simply reads QR codes, checks their hash, decompresses the chunk, and repeats with every new QR code until it has complete file, providing it through download.

## Usage
1. Generate preloader QR (or use the one from repo if it wasn't modified)
2. Generate bootloader and payload QR's for your file
3. Load preloader
4. Use preloader to read bootloader's QR code
5. Read payload QR codes, order doesn't matter, just make sure UI shows that they were scanned (block with index of QR code will be green)

## Limitations
1. Currently only Chrome is supported
2. Even though preloader fits inside QR code and can be executed from it, MediaDevices api used for image capturing is not available from insecure context. So to actually run preloader, you will need to save the html and serve it from external web server. Yet technically it still fits inside QR code :)