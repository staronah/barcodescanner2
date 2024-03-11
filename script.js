let selectedDeviceId;

function initializeQuagga() {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#barcodeScanner'),
      constraints: {
        deviceId: selectedDeviceId,
        facingMode: "environment",
      },
    },
    decoder: {
      readers: ["ean_reader", "ean_8_reader"],
    },
  });

  Quagga.onDetected(function (result) {
    const barcodeValue = result.codeResult.code;
    document.getElementById('textInput').value = barcodeValue;
    Quagga.stop();
  });

  Quagga.onProcessed(function(result) {
    const drawingCtx = Quagga.canvas.ctx.overlay;
    const drawingCanvas = Quagga.canvas.dom.overlay;

    if (result) {
      if (result.boxes) {
        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
        result.boxes.filter(box => box !== result.box).forEach(box => {
          Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "orange", lineWidth: 2});
        });
      }

      if (result.box) {
        Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
      }

      if (result.codeResult && result.codeResult.code) {
        Quagga.stop();
        document.getElementById('textInput').value = result.codeResult.code;
      }
    }
  });
}

function selectCamera() {
  Quagga.stop();
  Quagga.onDetected(null);  // Disable barcode scanning temporarily

  Quagga.CameraAccess.enumerateDevices()
    .then(function(devices) {
      const cameras = devices.filter(device => device.kind === 'videoinput');

      if (cameras.length === 0) {
        alert('No cameras found.');
        return;
      }

      const cameraList = cameras.map((camera, index) => `${index + 1}. ${camera.label || 'Camera ' + (index + 1)}`).join('\n');
      const selectionPrompt = `Select a camera:\n\n${cameraList}`;
      const selectedCameraIndex = prompt(selectionPrompt, 1);

      if (selectedCameraIndex !== null) {
        const index = parseInt(selectedCameraIndex) - 1;

        if (cameras[index]) {
          selectedDeviceId = cameras[index].deviceId;
        } else {
          alert('Invalid camera selection. Defaulting to the first camera.');
          selectedDeviceId = cameras[0].deviceId;
        }
      }

      initializeQuagga();
      Quagga.start();
    })
    .catch(function(err) {
      console.error(err);
    });
}

// Start with default camera
initializeQuagga();
Quagga.start();

function convertToExcel() {
  const textInput = document.getElementById('textInput').value;
  const rows = textInput.split('\n').map(row => row.split('\t'));
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
  XLSX.writeFile(workbook, 'output.xlsx');
}
