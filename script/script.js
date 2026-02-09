let scanning = false;
let currentStream;
let videoSource = 'environment'; // Por defecto a la cámara trasera

function iniciarCamara() {
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: videoSource }, 
        audio: false 
    })
    .then(stream => {
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.play();
        currentStream = stream; // Guardar el stream actual

        // Inicia la detección de códigos
        setTimeout(() => {
            scanning = true;
            detectarCodigo(video);
        }, 1000);
    })
    .catch(error => {
        alert("No se pudo acceder a la cámara: " + error);
    });
}

function cambiarCamara() {
    // Detenemos el stream actual
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    // Cambiamos la fuente de la cámara
    videoSource = (videoSource === 'environment') ? 'user' : 'environment';
    iniciarCamara();
}

function detectarCodigo(video) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const detect = () => {
        if (scanning) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const codeQR = jsQR(imageData.data, canvas.width, canvas.height);
            
            if (codeQR) {
                mostrarResultado(codeQR.data);
                scanning = false;
                return;
            }

            // Configuración para Quagga
            Quagga.decodeSingle({
                decoder: {
                    readers: ["code_128_reader", "ean_reader"] // Puedes agregar más lectores si deseas.
                },
                locate: true,
                src: video.srcObject
            }, (result) => {
                if (result && result.codeResult) {
                    mostrarResultado(result.codeResult.code);
                    scanning = false;
                }
            });
        }
        requestAnimationFrame(detect);
    };
    detect();
}

function mostrarResultado(resultado) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `Resultado: ${resultado}`;
}