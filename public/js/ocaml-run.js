document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.listingblock.runnable').forEach(block => {
    const code = block.querySelector('code');
    if (!code) return;
    const cell = document.createElement('x-ocaml');
    cell.textContent = code.textContent.trim();
    block.replaceWith(cell);
  });
});
