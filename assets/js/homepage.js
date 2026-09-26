(() => {
  // Theme and navigation are handled by the original site's scripts.
  // Reveal collapsed publication entries when reached from News or a shared URL.
  const revealTarget = (hash) => {
    if (!hash || hash === "#") return null;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return null; }
    const target = document.getElementById(id);
    if (!target) return null;
    for (let node = target.parentElement; node; node = node.parentElement) {
      if (node.tagName === "DETAILS") node.open = true;
    }
    return target;
  };
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute("href");
    const target = revealTarget(hash);
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", hash);
    target.scrollIntoView({ block: "start" });
  });
  window.addEventListener("hashchange", () => {
    const target = revealTarget(location.hash);
    if (target) target.scrollIntoView({ block: "start" });
  });
  const initialTarget = revealTarget(location.hash);
  if (initialTarget) requestAnimationFrame(() => initialTarget.scrollIntoView({ block: "start" }));
})();
