const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let formaSelecionada = "retangulo";
let corSelecionada = "red";
let desenhando = false;
let modoBorracha = false;
let x_inicial, y_inicial;
let imagemAntesDoDesenho = null;

document.getElementById("forma").addEventListener("change", (e) => {
  formaSelecionada = e.target.value;
});

document.querySelectorAll(".cor").forEach(btn => {
  btn.addEventListener("click", () => {
    corSelecionada = btn.dataset.cor;
    modoBorracha = false;
    document.getElementById("borracha").classList.remove("ativo");
  });
});

document.getElementById("borracha").addEventListener("click", () => {
  modoBorracha = !modoBorracha;
  document.getElementById("borracha").classList.toggle("ativo");
  document.getElementById("borracha").style.display = "none";
  document.getElementById("borracha_on").style.display = "";

});

document.getElementById("borracha_on").addEventListener("click", () => {
  modoBorracha = !modoBorracha;
  document.getElementById("borracha").classList.toggle("ativo");
  document.getElementById("borracha_on").style.display = "none";
  document.getElementById("borracha").style.display = "";

});

document.getElementById("limpar").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});


canvas.addEventListener("mousedown", (e) => {
  desenhando = true;
  x_inicial = e.offsetX;
  y_inicial = e.offsetY;

  if (!modoBorracha) {
    imagemAntesDoDesenho = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } else {
    apagarForma(e.offsetX, e.offsetY);
  }
});


canvas.addEventListener("mousemove", (e) => {
  if (!desenhando) return;

  const x_final = e.offsetX;
  const y_final = e.offsetY;

  if (modoBorracha) {
    apagarForma(x_final, y_final);
  } else {

    ctx.putImageData(imagemAntesDoDesenho, 0, 0);
    ctx.strokeStyle = corSelecionada;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    desenharFormaPreview(x_inicial, y_inicial, x_final, y_final);
    ctx.setLineDash([]);

  }
});


canvas.addEventListener("mouseup", (e) => {
  if (!desenhando) return;
  desenhando = false;

  if (modoBorracha) return;

  const x_final = e.offsetX;
  const y_final = e.offsetY;

  ctx.putImageData(imagemAntesDoDesenho, 0, 0);
  ctx.fillStyle = corSelecionada;
  desenharFormaFinal(x_inicial, y_inicial, x_final, y_final);
});


function desenharFormaPreview(x1, y1, x2, y2) {
  ctx.beginPath();
  if (formaSelecionada === "retangulo") {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (formaSelecionada === "circulo") {
    const raioX = (x2 - x1) / 2;
    const raioY = (y2 - y1) / 2;
    const centroX = x1 + raioX;
    const centroY = y1 + raioY;
    ctx.ellipse(centroX, centroY, Math.abs(raioX), Math.abs(raioY), 0, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (formaSelecionada === "triangulo") {
    ctx.moveTo((x1 + x2) / 2, y1);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
  }
}


function desenharFormaFinal(x1, y1, x2, y2) {
  ctx.beginPath();
  if (formaSelecionada === "retangulo") {
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  } else if (formaSelecionada === "circulo") {
    const raioX = (x2 - x1) / 2;
    const raioY = (y2 - y1) / 2;
    const centroX = x1 + raioX;
    const centroY = y1 + raioY;
    ctx.ellipse(centroX, centroY, Math.abs(raioX), Math.abs(raioY), 0, 0, 2 * Math.PI);
    ctx.fill();
  } else if (formaSelecionada === "triangulo") {
    ctx.moveTo((x1 + x2) / 2, y1);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
  }
}


function apagarForma(x, y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2 * Math.PI);
  ctx.fill();
}
