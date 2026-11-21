const PRE_BG = '#2b2b2b';
const LIGHT = '#d4d4d4';
const DARK_LIMIT = 0.35;   // brightness 0-1; text darker than this gets lightened

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.listingblock.runnable').forEach(block => {
    const code = block.querySelector('code');
    if (!code) return;

    const cell = document.createElement('x-ocaml');
    cell.setAttribute('run-on', 'click');   // unverified: stops auto-run if the name is right
    cell.textContent = code.textContent.trim();

    block.replaceWith(cell);
  });
});

// lighten only dark text inside <pre>, keep every other colour
function fixPreColors(root) {
  root.querySelectorAll('pre, pre *').forEach(el => {
    const m = getComputedStyle(el).color.match(/[\d.]+/g);
    if (!m) return;
    const [r, g, b] = m.map(Number);
    if ((0.299 * r + 0.587 * g + 0.114 * b) / 255 < DARK_LIMIT) {
      el.style.setProperty('color', LIGHT, 'important');
    }
  });
}

function watch(root) {
  fixPreColors(root);
  new MutationObserver(() => fixPreColors(root))
    .observe(root, { childList: true, subtree: true });
}

window.addEventListener('load', () => {
  const STYLE_CSS = `
pre {
  background:${PRE_BG} !important;
  padding:12px 16px;
  border-radius:6px;
  overflow-x:auto;
}
pre code { background:none !important; padding:0; }
.cm-gutters { background:${PRE_BG} !important; border:none !important; }
.cm-lineNumbers .cm-gutterElement { color:#858585 !important; }
`;

  // normal page
  const pageStyle = document.createElement('style');
  pageStyle.textContent = STYLE_CSS;
  document.head.appendChild(pageStyle);
  watch(document);

  // inside open shadow roots (retries for ~4s while editors build)
  document.querySelectorAll('x-ocaml').forEach(cell => {
    (function inject(tries = 0) {
      if (cell.shadowRoot) {
        const s = document.createElement('style');
        s.textContent = STYLE_CSS;
        cell.shadowRoot.appendChild(s);
        watch(cell.shadowRoot);
      } else if (tries < 40) {
        setTimeout(() => inject(tries + 1), 100);
      }
    })();
  });
});
