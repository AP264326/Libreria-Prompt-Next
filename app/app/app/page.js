// app/page.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// === Copia qui dentro il tuo array completo da app.js ===
const PROMPTS_DATA = [
  {
    "id": "s1",
    "title": "Scouting – Elenco aziende B2B",
    "category": "Scouting",
    "description": "Genera un elenco dettagliato di aziende B2B nel settore scelto...",
    "text": "Genera un elenco dettagliato di aziende B2B nel settore [settore/categoria]..."
  }
  // ... incolla il resto dal tuo app.js ...
];

// Funzioni di utilità
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9\s\-_]/gi, '_').toLowerCase();
}

export default function Page() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [showOnlyFav, setShowOnlyFav] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const fileInputRef = useRef(null);

  // Recupera preferiti da sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('promptFavorites');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // Toast
  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const persistFavorites = (next) => {
    setFavorites(next);
    try {
      sessionStorage.setItem('promptFavorites', JSON.stringify([...next]));
    } catch {};
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return PROMPTS_DATA.filter((p) => {
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term);
      const matchesCategory = !category || p.category === category;
      const matchesFav = !showOnlyFav || favorites.has(p.id);
      return matchesSearch && matchesCategory && matchesFav;
    });
  }, [search, category, showOnlyFav, favorites]);

  const copyPrompt = async (id) => {
    const p = PROMPTS_DATA.find((x) => x.id === id);
    if (!p) return;
    try {
      await navigator.clipboard.writeText(p.text);
      showToast('Prompt copiato negli appunti!');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = p.text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Prompt copiato negli appunti!');
      } catch {
        showToast('Errore durante la copia.');
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const toggleFavorite = (id) => {
    const next = new Set(favorites);
    next.has(id) ? next.delete(id) : next.add(id);
    persistFavorites(next);
  };

  const exportPrompt = (id, format) => {
    const p = PROMPTS_DATA.find((x) => x.id === id);
    if (!p) return;
    let content = '';
    let filename = '';
    let mime = '';
    if (format === 'txt') {
      content = `${p.title}\n${'='.repeat(p.title.length)}\n\nCategoria: ${p.category}\n\nDescrizione: ${p.description}\n\nPrompt:\n${p.text}`;
      filename = `${sanitizeFilename(p.title)}.txt`;
      mime = 'text/plain';
    } else {
      content = `# ${p.title}\n\n**Categoria:** ${p.category}\n\n**Descrizione:** ${p.description}\n\n## Prompt\n\n${p.text}`;
      filename = `${sanitizeFilename(p.title)}.md`;
      mime = 'text/markdown';
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`File ${format.toUpperCase()} scaricato!`);
  };

  // Funzione import .docx
  const handleDocx = async (file) => {
    try {
      showToast('Caricamento file in corso...');
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      console.log(result.value);
      showToast('File importato!');
    } catch (e) {
      console.error(e);
      showToast('Errore durante il caricamento del file.');
    }
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="header-title">📚 Prompt Library</h1>
            <div className="header-actions">
              <button
                className={`btn-blue ${showOnlyFav ? 'active' : ''}`}
                onClick={() => setShowOnlyFav(s => !s)}
              >
                {showOnlyFav ? '⭐ Tutti i prompt' : '⭐ I miei preferiti'}
              </button>
              <button
                className="btn-blue"
                onClick={() => fileInputRef.current?.click()}
              >
                📄 Importa .docx
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDocx(file);
                  e.currentTarget.value = '';
                }}
              />
            </div>
          </div>

          <div className="header-controls">
            <div className="search-container">
              <input
                className="form-control search-input"
                placeholder="Cerca prompt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-container">
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Tutte le categorie</option>
                <option value="Scouting">Scouting</option>
                <option value="Prospecting">Prospecting</option>
                <option value="Proposition">Proposition</option>
                <option value="Simulatore Elettrico">Simulatore Elettrico</option>
                <option value="Gestione Customer Base">Gestione Customer Base</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="prompts-grid">
            {filtered.length === 0
              ? <p>Nessun prompt trovato.</p>
              : filtered.map((p) => (
                <div className="prompt-card" key={p.id}>
                  <h3 className="prompt-card__title">{p.title}</h3>
                  <span className="prompt-card__category">{p.category}</span>
                  <p className="prompt-card__description">{p.description}</p>
                  <div className="prompt-card__actions">
                    <button className="btn-blue" onClick={() => copyPrompt(p.id)}>📋 Copia</button>
                    <button
                      className={`btn-blue favorite-btn ${favorites.has(p.id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(p.id)}
                    >
                      {favorites.has(p.id) ? '⭐' : '☆'}
                    </button>
                    <button className="btn-blue" onClick={() => exportPrompt(p.id, 'txt')}>Export .txt</button>
                    <button className="btn-blue" onClick={() => exportPrompt(p.id, 'md')}>Export .md</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>

      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        <span>{toastMsg}</span>
      </div>
    </>
  );
}
