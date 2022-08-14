function boot() {
    // TODO: Create object for storing methods and data
    // TODO: Store hash array in object

    const bootloaderObj = {
        hashArray: [],
        chunks: new Map(),
        onQrData: data => {
            // TODO: Parse data into hash and payload parts
            // TODO: Base64 decode data
            // TODO: Get SHA-1 of payload and compare
            // TODO: If chunk not loaded yet, add to map and update UI
            // TODO: If all chunks are loaded, create file
        },
        setUIChunkLoaded: index => {
            // TODO: Implement
        },
    }

    window.qrBootloader = bootloaderObj;

    // TODO: Set UI
}