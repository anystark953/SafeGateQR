
// 1. PALITAN ITO NG IYONG MALINIS NA WEB APP URL (WALANG ?id= sa dulo)
const API_URL = "https://script.google.com/macros/s/AKfycbx8tXsqlCiGptlVzdd1JoDWlwl3TQLByne04vI4VP98p6-O6ChMUiT2g55hTy6199PElA/exec";

// 2. Function na kukuha ng data sa Google Sheet gamit ang ID na nakuha ng Camera
function fetchStudentData(studentId) {
    // Baguhin ang status habang naghahanap sa database
    document.getElementById("result").innerHTML = "🔍 VERIFYING...";
    document.getElementById("result").className = "ready";

    // Awtomatikong idudugtong ng code ang ?id= kung ano man ang na-scan ng camera
    fetch(API_URL + "?id=" + studentId)
    .then(res => res.json())
    .then(data => {
        if(data.success){
            // I-display ang mga nakuhang detalye sa UI Card
            document.getElementById("name").innerText = data.firstName + " " + data.lastName;
            document.getElementById("studentID").innerText = data.studentID;
            document.getElementById("grade").innerText = data.grade;
            document.getElementById("section").innerText = data.section;
            document.getElementById("status").innerText = data.status;

            // Pag-aayos sa Google Drive URL kung doon galing ang larawan
            let photoUrl = data.photo;
            if(photoUrl && photoUrl.includes("drive.google.com")){
                const fileId = photoUrl.split("/d/")[1]?.split("/")[0];
                if(fileId) photoUrl = `https://docs.google.com/uc?export=view&id=${fileId}`;
            }

            document.getElementById("photo").src = photoUrl || "https://placehold.co/180x180";
            document.getElementById("result").innerHTML = "✅ VERIFIED";
            document.getElementById("result").className = "verified";
        } else {
            resetCard("❌ INVALID QR CODE", "invalid");
        }
    })
    .catch(err => {
        console.error("Error fetching data:", err);
        resetCard("❌ CONNECTION ERROR", "invalid");
    });
}

function resetCard(message, statusClass) {
    document.getElementById("name").innerText = "Scan Failed";
    document.getElementById("studentID").innerText = "---";
    document.getElementById("grade").innerText = "---";
    document.getElementById("section").innerText = "---";
    document.getElementById("status").innerText = "---";
    document.getElementById("photo").src = "https://placehold.co/180x180";
    document.getElementById("result").innerHTML = message;
    document.getElementById("result").className = statusClass;
}

// 3. PAGPAPAGANA NG CAMERA SCANNER (Html5Qrcode)
function onScanSuccess(decodedText, decodedResult) {
    console.log("Na-scan na Text mula sa QR:", decodedText);

    let scannedId = decodedText.trim();

    // Kung buong URL ang laman ng QR mo (may ?id=), kukunin lang nito ang mismong numero sa dulo
    if (decodedText.includes("id=")) {
        const urlParams = new URLSearchParams(decodedText.split('?')[1] || decodedText.split('&')[1]);
        if (urlParams.has("id")) {
            scannedId = urlParams.get("id");
        } else {
            scannedId = decodedText.split("id=")[1].split("&")[0];
        }
    }
    
    // Awtomatikong ipapasa ang ID sa function para mag-update ang screen nang mag-isa!
    fetchStudentData(scannedId);
}

// Patakbuhin ang Scanner pagka-open ng page gamit ang camera
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 }, /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess);
