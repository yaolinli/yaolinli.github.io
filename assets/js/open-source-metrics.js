/* Public HF totals. Dated HTML snapshots remain on failure. Stars use Shields image badges. */
(() => {
  "use strict";
  const checkedMonth = () => {
    const now = new Date();
    return `${now.toLocaleDateString("en-US", { month: "short" })}, ${now.getFullYear()}`;
  };
  document.querySelectorAll("[data-hf-repo]").forEach(async (link) => {
    const repo = link.dataset.hfRepo;
    const type = link.dataset.hfType;
    if (!["models", "datasets"].includes(type) || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(
        `https://huggingface.co/api/${type}/${repo}?expand%5B%5D=downloadsAllTime`,
        { signal: controller.signal, credentials: "omit" }
      );
      if (!response.ok) throw new Error("Statistics unavailable");
      const data = await response.json();
      if (data.id !== repo || !Number.isSafeInteger(data.downloadsAllTime) || data.downloadsAllTime < 0) {
        throw new Error("Invalid cumulative download count");
      }
      link.querySelector(".metric-count").textContent = data.downloadsAllTime.toLocaleString("en-US");
      link.querySelector(".metric-status").textContent = `(by ${checkedMonth()})`;
      link.title = "Cumulative downloads reported by Hugging Face; checked on this page load. Click to view the repository.";
    } catch (_) {
      link.title = "Live statistics unavailable. Showing the last verified total with its check date. Click to view the repository.";
    } finally {
      clearTimeout(timeout);
    }
  });
})();
