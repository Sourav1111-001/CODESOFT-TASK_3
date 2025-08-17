const rig = document.querySelector('.rig');
const calc = document.getElementById('calc');
const display = document.getElementById('display');
const keys = document.querySelectorAll('.key');

let expr = "";

/* Helpers */
const sanitize = s =>
  s.replace(/×/g, '*').replace(/÷/g, '/');

const compute = () => {
  if (!expr) return;
  try {
    if (!/^[0-9+\-*/().\s]+$/.test(sanitize(expr))) throw new Error('Bad input');
    const result = Function(`"use strict"; return (${sanitize(expr)})`)();
    expr = String(result);
    display.value = expr;
  } catch {
    display.value = "Error";
    expr = "";
  }
};

const backspace = () => {
  expr = expr.slice(0, -1);
  display.value = expr;
};

const clearAll = () => {
  expr = "";
  display.value = "";
};

const append = (val) => {
  if (/[+\-*/]$/.test(expr) && /[+\-*/]/.test(val)) {
    expr = expr.slice(0, -1) + val;
  } else {
    expr += val;
  }
  display.value = expr;
};

/* Button clicks */
keys.forEach(k => {
  k.addEventListener('click', () => {
    const act = k.dataset.action;
    const val = k.dataset.val;

    if (act === 'clear') return clearAll();
    if (act === 'equals') return compute();
    if (act === 'back') return backspace();

    if (val) append(val);
  });

  k.addEventListener('mousedown', () => k.classList.add('pressing'));
  k.addEventListener('mouseup', () => k.classList.remove('pressing'));
  k.addEventListener('mouseleave', () => k.classList.remove('pressing'));
});

/* Keyboard support */
window.addEventListener('keydown', (e) => {
  const map = { '/': '÷', '*': '×', 'x': '×', 'X': '×' };
  if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    compute();
    return;
  }
  if (e.key === 'Backspace') {
    e.preventDefault();
    backspace();
    return;
  }
  if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) return;
  if (e.key.toLowerCase() === 'c') { clearAll(); return; }

  const allowed = '0123456789.+-*/()';
  if (allowed.includes(e.key) || ['x','X','/','*'].includes(e.key)) {
    append(map[e.key] ?? e.key);
  }
});

/* Subtle parallax tilt */
let rect;
const maxTilt = 8;
const tilt = (x, y) => {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (x - cx) / (rect.width / 2);
  const dy = (y - cy) / (rect.height / 2);
  const rx = (dy * -maxTilt).toFixed(2);
  const ry = (dx *  maxTilt).toFixed(2);
  rig.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
};
window.addEventListener('mousemove', (e) => {
  rect = rect || calc.getBoundingClientRect();
  tilt(e.clientX, e.clientY);
});
window.addEventListener('mouseleave', () => {
  rig.style.transform = `rotateX(0deg) rotateY(0deg)`;
});
window.addEventListener('resize', () => rect = calc.getBoundingClientRect());
