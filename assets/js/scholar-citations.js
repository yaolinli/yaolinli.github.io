(() => {
  const badge = document.getElementById("scholar-citations");
  if (!badge) return;
  const count = badge.querySelector(".citation-count");
  let displayedTimestamp = -Infinity;

  const display = (data) => {
    const timestamp = Date.parse(data.updated_at);
    if (data.scholar_id !== "rZJRGlQAAAAJ" || !Number.isSafeInteger(data.citations) || data.citations < 0 || !Number.isFinite(timestamp) || timestamp <= displayedTimestamp) return;
    displayedTimestamp = timestamp;
    count.textContent = data.citations.toLocaleString("en-US");
    const checked = new Date(timestamp).toISOString().slice(0, 10);
    badge.title = `Google Scholar · ${data.citations.toLocaleString("en-US")} citations · checked ${checked} (UTC). Updated daily when available.`;
    badge.setAttribute("aria-label", badge.title);
    badge.dataset.updatedAt = data.updated_at;
  };

  const load = async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: "no-cache", credentials: "omit" });
      if (response.ok) display(await response.json());
    } catch (_) {
      // Retain the last successful snapshot and its real date, never a fake zero.
    } finally {
      clearTimeout(timer);
    }
  };

  load("./assets/data/scholar-citations.json");
  load("https://raw.githubusercontent.com/yaolinli/yaolinli.github.io/google-scholar-stats/scholar-citations.json");
})();
