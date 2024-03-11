let scanner;

function initializeScanner() {
  const videoElement = document.getElementById('barcodeScanner');

  scanner = new Instascan.Scanner({ video: videoElement });
  scanner.addListener('scan', function (content) {
    document.getElementById('textInput').value = content;
    scanner.stop();
  });

  Instascan.Camera.getCameras()
    .then(function (cameras) {
      if (cameras.length > 0) {
        const selectedCameraId = cameras[0].id; // You can choose a different camera if needed
        scanner.start(cameras.find(camera => camera.id === selectedCameraId));
      } else {
        alert('No cameras found.');
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function selectCamera() {
  scanner.stop(); // Stop the scanner temporarily

  Instascan.Camera.getCameras()
    .then(function (cameras) {
      if (cameras.length > 0) {
        const selectedCamera = prompt('Select a camera:\n\n' + cameras.map(camera => camera.name).join('\n'));

        if (selectedCamera) {
          const camera = cameras.find(c => c.name === selectedCamera);
          if (camera) {
            scanner.start(camera);
          } else {
            alert('Invalid camera selection. Defaulting to the first camera.');
            scanner.start(cameras[0]);
          }
        } else {
          alert('Invalid camera selection. Defaulting to the first camera.');
          scanner.start(cameras[0]);
        }
      } else {
        alert('No cameras found.');
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

// Start with default camera
initializeScanner();

function convertToExcel() {
  const textInput = document.getElementById('textInput').value;
  const rows = textInput.split('\n').map(row => row.split('\t'));
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
  XLSX.writeFile(workbook, 'output.xlsx');
}
