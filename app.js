(() => {
  const records = Array.isArray(window.ARCHIVE_RECORDS) ? window.ARCHIVE_RECORDS : [];
  const grid = document.getElementById("records");
  const search = document.getElementById("search");
  const empty = document.getElementById("empty-state");
  const resultLabel = document.getElementById("result-label");
  const dialog = document.getElementById("record-dialog");
  const dialogContent = document.getElementById("dialog-content");
  let activeFilter = "all";

  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[c]);

  const typeLabel = type => type === "character" ? "인물 기록" : "플롯 기록";
  const counts = {
    all: records.length,
    character: records.filter(r => r.type === "character").length,
    plot: records.filter(r => r.type === "plot").length
  };
  document.getElementById("record-count").textContent = String(records.length).padStart(2, "0");
  document.getElementById("all-count").textContent = String(counts.all).padStart(2, "0");
  document.getElementById("character-count").textContent = String(counts.character).padStart(2, "0");
  document.getElementById("plot-count").textContent = String(counts.plot).padStart(2, "0");

  function render() {
    const query = search.value.trim().toLocaleLowerCase("ko-KR");
    const filtered = records.filter(r => {
      const categoryMatch = activeFilter === "all" || r.type === activeFilter;
      const searchable = [r.id, r.title, r.subtitle, r.summary, r.body, ...(r.tags || [])].join(" ").toLocaleLowerCase("ko-KR");
      return categoryMatch && (!query || searchable.includes(query));
    }).sort((a,b) => String(b.date || "").localeCompare(String(a.date || "")));

    resultLabel.textContent = `검색 결과 ${String(filtered.length).padStart(2, "0")}건`;
    grid.innerHTML = filtered.map(r => `
      <button class="record-card" data-id="${safe(r.id)}" type="button">
        <div class="card-top"><span class="type-tag">${safe(typeLabel(r.type))}</span><span class="record-id">${safe(r.id)}</span></div>
        <h3>${safe(r.title)}</h3>
        <p>${safe(r.summary || r.subtitle || "")}</p>
        <div class="card-bottom">
          ${(r.tags || []).slice(0,3).map(tag => `<span class="tag"># ${safe(tag)}</span>`).join("")}
          <span class="card-arrow" aria-hidden="true">↗</span>
        </div>
      </button>`).join("");
    empty.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
    grid.querySelectorAll("[data-id]").forEach(button => button.addEventListener("click", () => openRecord(button.dataset.id)));
  }

  function openRecord(id) {
    const r = records.find(item => item.id === id);
    if (!r) return;
    dialogContent.innerHTML = `
      <div class="dialog-meta">${safe(typeLabel(r.type).toUpperCase())} / ${safe(r.id)} / ${safe(r.date || "DATE UNKNOWN")}</div>
      <h2>${safe(r.title)}</h2>
      <p class="dialog-summary">${safe(r.subtitle || r.summary || "")}</p>
      <div class="dialog-body">${safe(r.body || r.summary || "아직 등록된 상세 내용이 없습니다.")}</div>
      <div class="dialog-tags">${(r.tags || []).map(tag => `<span class="tag"># ${safe(tag)}</span>`).join("")}</div>
      <p class="dialog-note">END OF RECORD · 이 기록은 창작 아카이브의 일부입니다.</p>`;
    dialog.showModal();
  }

  search.addEventListener("input", render);
  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === button));
      render();
    });
  });
  document.getElementById("close-dialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && dialog.open) dialog.close(); });
  render();
})();
