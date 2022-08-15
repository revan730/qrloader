function boot() {
    const bootloaderObj = {
        hashArray: ['af5338579cd8db25fd0e14fc5763daa377242c00', '7ce8c9f21816c0b20286fb539968f47ec0e4ebc9'],
        chunks: new Map(),
        getRawQrData: async function(cap) {
            const bitmap = await cap.grabFrame();
            const barcodeScanner = new BarcodeDetector();
            const data = await barcodeScanner.detect(bitmap);
            if (data[0]) {
                const rawValue = data[0].rawValue;
                if (rawValue.startsWith('loader://')) {
                    const basedComped = rawValue.slice(9);
                    return basedComped;
                }
            }
        },
        getSha1: async function(data) {
            const encoded = new TextEncoder().encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-1', encoded);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray
                .map((bytes) => bytes.toString(16).padStart(2, '0'))
                .join('');
            return hashHex;
        },
        decompress: async function(data) {
            const b = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
            const ds = new DecompressionStream('gzip');
            const wr = ds.writable.getWriter();
            wr.write(b);
            wr.close();
            const decompArr = await (new Response(ds.readable)).arrayBuffer();
            const decomp = new TextDecoder().decode(decompArr);
            return decomp;
        },
        videoCaptureInterval: async function(ic) {
            const data = await this.getRawQrData(ic);
            if (data) {
                console.log('Got QR (boot)');
                console.log(data);
                const hash = data.split('.')[0];
                const payload = data.split('.')[1];
                const calculatedSha = await this.getSha1(payload);
                console.log(`Expected hash ${hash}, calculated: ${calculatedSha}`);
                if (calculatedSha === hash) {
                    if (this.hashArray.find(h => h === hash) && !this.chunks.has(hash)) {
                        const data = await this.decompress(payload);
                        this.chunks.set(hash, data);
                        this.setUIChunkLoaded(this.hashArray.indexOf(hash));
                        if (this.chunks.size === this.hashArray.length) {
                            let t = '';
                            for (let i = 0;i < this.hashArray.length;i++) {
                                console.log(`hash array elem ${i} is ${this.hashArray[i]}`);
                                t += this.chunks.get(this.hashArray[i]);
                            }

                            const b = new Blob([t]);
                            const a = document.createElement('a');
                            document.body.appendChild(a);
                            a.style = 'display: none';
                            const url = window.URL.createObjectURL(b);
                            a.href = url;
                            a.download = 'result';
                            a.click();
                            window.URL.revokeObjectURL(url);
                        }
                    }
                }
            }
        },
        setUIChunkLoaded: function(i) {
            const uiElem = document.getElementById(`hshBlk${i}`);
            uiElem.style.backgroundColor = 'greenyellow';
        },
    }

    window.qrBootloader = bootloaderObj;

    const uiDiv = document.getElementById('bootUI');
    const hint = document.createElement('p');
    hint.innerText = 'Scanned codes:';
    uiDiv.appendChild(hint);
    const chunksDiv = document.createElement('div');
    chunksDiv.style.display = 'flex';
    chunksDiv.style.flexDirection = 'row';
    chunksDiv.style.gap = '20px';
    for (let i = 0;i < bootloaderObj.hashArray.length;i++) {
        const block = document.createElement('div');
        block.setAttribute('id', `hshBlk${i}`);
        block.innerText = `${i + 1}`;
        block.style.border = '0.2rem outset black';
        block.style.padding = '5px';
        chunksDiv.appendChild(block);
    }
    uiDiv.appendChild(chunksDiv);
    clearInterval(window.scanInterval);
    window.scanInterval = setInterval(() => {
        const ic = new ImageCapture(window.stream.getVideoTracks()[0]);
        bootloaderObj.videoCaptureInterval(ic);
    }, 1000);
}