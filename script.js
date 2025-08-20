let img = new Image();
let canvas = document.getElementById("comicCanvas");
let ctx = canvas.getContext("2d");
let texts = []; // {text,x,y,font}
let filters = {blur:0,contrast:100,saturate:100,brightness:100};
let selectedTextIndex = null; // which caption is selected

// Handle Image Upload
document.getElementById("imgUpload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    resizeCanvas();
    draw();
  };
});

// Resize canvas to fit image but keep aspect ratio inside preview
function resizeCanvas() {
  const maxWidth = window.innerWidth - 300; // minus sidebar
  const maxHeight = window.innerHeight;
  let scale = Math.min(maxWidth / img.width, maxHeight / img.height);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
}

// Draw image and all captions with current filters
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.filter = `blur(${filters.blur}px) contrast(${filters.contrast}%) saturate(${filters.saturate}%) brightness(${filters.brightness}%)`;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.filter = "none";
  
  texts.forEach((t,i) => {
    ctx.font = `bold 32px '${t.font}', sans-serif`;
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.strokeStyle = (i === selectedTextIndex) ? "red" : "black"; // highlight selected text
    ctx.lineWidth = 4;
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);
  });
}

// Update filters live
["blur","contrast","saturate","brightness"].forEach(id=>{
  document.getElementById(id).addEventListener("input", e=>{
    filters[id] = e.target.value;
    draw();
  });
});

// Add text at default position with selected font
document.getElementById("addTextBtn").addEventListener("click", () => {
  let txt = document.getElementById("captionInput").value.trim();
  let font = document.getElementById("fontSelect").value;
  if (!txt) return;
  texts.push({text: txt, x: 50, y: 50 + texts.length * 50, font: font});
  document.getElementById("captionInput").value = "";
  draw();
});

// Download image
document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement('a');
  link.download = 'comic.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// -------- SELECTING CAPTIONS WITH CLICK -------- //
canvas.addEventListener("click", e => {
  const mousePos = getMousePos(e);
  selectedTextIndex = getTextIndexAtPos(mousePos);
  if (selectedTextIndex !== null) {
    // update inputs with current coords
    document.getElementById("caption-x").value = Math.round(texts[selectedTextIndex].x);
    document.getElementById("caption-y").value = Math.round(texts[selectedTextIndex].y);
  }
  draw();
});

// -------- MANUAL X/Y INPUT TO MOVE TEXT -------- //
document.getElementById("caption-x").addEventListener("input", e => {
  if (selectedTextIndex !== null) {
    texts[selectedTextIndex].x = parseInt(e.target.value) || 0;
    draw();
  }
});
document.getElementById("caption-y").addEventListener("input", e => {
  if (selectedTextIndex !== null) {
    texts[selectedTextIndex].y = parseInt(e.target.value) || 0;
    draw();
  }
});

// Get mouse position relative to canvas
function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left),
    y: (evt.clientY - rect.top)
  };
}

// Detect if mouse is on a text (rough bounding box)
function getTextIndexAtPos(pos) {
  for (let i = texts.length - 1; i >= 0; i--) { // topmost text first
    ctx.font = `bold 32px '${texts[i].font}', sans-serif`;
    const width = ctx.measureText(texts[i].text).width;
    const height = 32; // approximate font height
    if (pos.x >= texts[i].x && pos.x <= texts[i].x + width &&
        pos.y <= texts[i].y && pos.y >= texts[i].y - height) {
      return i;
    }
  }
  return null;
}
