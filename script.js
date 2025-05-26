// Seleciona o elemento <canvas> da página
const canvas = document.getElementById("canvas");
// Obtém o contexto 2D do canvas para desenhar
const ctx = canvas.getContext("2d");

// Define a forma padrão como retângulo
let formaSelecionada = "retangulo";
// Define a cor padrão como vermelho
let corSelecionada = "red";

// Flags para controle de estado
let desenhando = false;
let modoBorracha = false;
let modoMover = false;

// Coordenadas iniciais do desenho
let x_inicial, y_inicial;
// Guarda a imagem do canvas antes de começar a desenhar
let imagemAntesDoDesenho = null;

// Armazena todas as formas desenhadas
let formas = [];

// Forma atualmente selecionada para movimentação
let formaSelecionadaParaMover = null;
// Deslocamento do mouse em relação à forma ao mover
let offsetX, offsetY;

// Evento para ativar/desativar o modo mover
document.getElementById("mover").addEventListener("click", () => {
  modoMover = !modoMover;
  formaSelecionadaParaMover = null;
  desenhando = false;
  document.getElementById("mover").classList.toggle("ativo");
  document.getElementById("mover").style.display = "none";
  document.getElementById("mover_on").style.display = "";
});

// Evento para desativar o modo mover (botão alternativo)
document.getElementById("mover_on").addEventListener("click", () => {
  modoMover = !modoMover;
  formaSelecionadaParaMover = null;
  desenhando = false;
  document.getElementById("mover").classList.toggle("ativo");
  document.getElementById("mover").style.display = "";
  document.getElementById("mover_on").style.display = "none";
});

// Evento para ativar/desativar a borracha
document.getElementById("borracha").addEventListener("click", () => {
  modoBorracha = !modoBorracha;
  document.getElementById("borracha").classList.toggle("ativo");
  document.getElementById("borracha").style.display = "none";
  document.getElementById("borracha_on").style.display = "";
});

// Evento para desativar a borracha
document.getElementById("borracha_on").addEventListener("click", () => {
  modoBorracha = !modoBorracha;
  document.getElementById("borracha").classList.toggle("ativo");
  document.getElementById("borracha_on").style.display = "none";
  document.getElementById("borracha").style.display = "";
});

// Evento para limpar o canvas
document.getElementById("limpar").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  formas = [];
  desenhando = false;
  formaSelecionadaParaMover = null;
});

// Evento ao pressionar o mouse sobre o canvas
canvas.addEventListener("mousedown", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  if (modoMover) {
    // Verifica se o clique foi sobre alguma forma
    for (let i = formas.length - 1; i >= 0; i--) {
      if (isDentroDaForma(formas[i], x, y)) {
        formaSelecionadaParaMover = formas[i];
        offsetX = x - formaSelecionadaParaMover.x1;
        offsetY = y - formaSelecionadaParaMover.y1;
        return;
      }
    }
  } else if (!modoBorracha) {
    desenhando = true;
    x_inicial = x;
    y_inicial = y;
    imagemAntesDoDesenho = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
});

// Evento ao mover o mouse sobre o canvas
canvas.addEventListener("mousemove", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  if (modoMover && formaSelecionadaParaMover) {
    // Move a forma selecionada
    const largura = formaSelecionadaParaMover.x2 - formaSelecionadaParaMover.x1;
    const altura = formaSelecionadaParaMover.y2 - formaSelecionadaParaMover.y1;

    formaSelecionadaParaMover.x1 = x - offsetX;
    formaSelecionadaParaMover.y1 = y - offsetY;
    formaSelecionadaParaMover.x2 = formaSelecionadaParaMover.x1 + largura;
    formaSelecionadaParaMover.y2 = formaSelecionadaParaMover.y1 + altura;

    redesenharCanvas();
  } else if (desenhando && !modoBorracha) {
    // Desenha forma em preview com tracejado
    ctx.putImageData(imagemAntesDoDesenho, 0, 0);

    corSelecionada = document.getElementById('pegar_cor').value;

    if(corSelecionada == "" || corSelecionada == null){

      corSelecionada = "red";

    }

    ctx.strokeStyle = corSelecionada;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    desenharFormaPreview(x_inicial, y_inicial, x, y);
    ctx.setLineDash([]);
  } else if (modoBorracha) {
    // Apaga área circular (simula borracha)
    apagarForma(x, y);
  }
});

// Evento ao soltar o botão do mouse
canvas.addEventListener("mouseup", (e) => {
  if (modoMover) {
    formaSelecionadaParaMover = null;
  } else if (desenhando) {
    desenhando = false;

    if (modoBorracha) return;

    const x_final = e.offsetX;
    const y_final = e.offsetY;

    ctx.putImageData(imagemAntesDoDesenho, 0, 0);

    corSelecionada = document.getElementById('pegar_cor').value;

    if(corSelecionada == "" || corSelecionada == null){

      corSelecionada = "red";

    }
    
    ctx.fillStyle = corSelecionada;

    formaSelecionada = document.getElementById("forma").value;

    desenharFormaFinal(x_inicial, y_inicial, x_final, y_final, formaSelecionada);
    
    // Armazena a forma desenhada
    formas.push({
      tipo: formaSelecionada,
      x1: x_inicial,
      y1: y_inicial,
      x2: x_final,
      y2: y_final,
      cor: corSelecionada,
    });
  }
});

// Redesenha todas as formas no canvas
function redesenharCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const forma of formas) {
    ctx.fillStyle = forma.cor;
    desenharFormaFinal(forma.x1, forma.y1, forma.x2, forma.y2, forma.tipo);
  }
}

// Desenha o contorno da forma durante o preview
function desenharFormaPreview(x1, y1, x2, y2) {
  ctx.beginPath();

  formaSelecionada = document.getElementById("forma").value;

  if(formaSelecionada == ""){
    formaSelecionada = "retangulo"
  }

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

// Desenha a forma preenchida no canvas
function desenharFormaFinal(x1, y1, x2, y2, tipo = formaSelecionada) {
  ctx.beginPath();
  if (tipo === "retangulo") {
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  } else if (tipo === "circulo") {
    const raioX = (x2 - x1) / 2;
    const raioY = (y2 - y1) / 2;
    const centroX = x1 + raioX;
    const centroY = y1 + raioY;
    ctx.ellipse(centroX, centroY, Math.abs(raioX), Math.abs(raioY), 0, 0, 2 * Math.PI);
    ctx.fill();
  } else if (tipo === "triangulo") {
    ctx.moveTo((x1 + x2) / 2, y1);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
  }
}

// Simula uma borracha desenhando um círculo branco no local
function apagarForma(x, y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2 * Math.PI);
  ctx.fill();
}

// Verifica se uma forma colide com um círculo (não usada diretamente)
function intersectaComCirculo(forma, cx, cy, raio) {
  const minX = Math.min(forma.x1, forma.x2);
  const maxX = Math.max(forma.x1, forma.x2);
  const minY = Math.min(forma.y1, forma.y2);
  const maxY = Math.max(forma.y1, forma.y2);

  const closestX = Math.max(minX, Math.min(cx, maxX));
  const closestY = Math.max(minY, Math.min(cy, maxY));

  const distX = cx - closestX;
  const distY = cy - closestY;

  const distancia = Math.sqrt(distX * distX + distY * distY);

  return distancia < raio;
}

// Verifica se um ponto (x, y) está dentro de uma forma
function isDentroDaForma(forma, x, y) {
  if (forma.tipo === "retangulo" || forma.tipo === "triangulo") {
    return x >= Math.min(forma.x1, forma.x2) &&
           x <= Math.max(forma.x1, forma.x2) &&
           y >= Math.min(forma.y1, forma.y2) &&
           y <= Math.max(forma.y1, forma.y2);
  } else if (forma.tipo === "circulo") {
    const cx = (forma.x1 + forma.x2) / 2;
    const cy = (forma.y1 + forma.y2) / 2;
    const raioX = Math.abs((forma.x2 - forma.x1) / 2);
    const raioY = Math.abs((forma.y2 - forma.y1) / 2);
    return ((x - cx) ** 2) / (raioX ** 2) + ((y - cy) ** 2) / (raioY ** 2) <= 1;
  }
  return false;
}