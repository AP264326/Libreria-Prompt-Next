// app/page.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const PROMPTS_DATA = [
  // === Copiato dal tuo app.js ===
  // (incolla qui l'array completo come nel file originale)
  // Ho lasciato invariati id, title, category, description, text.
  {
    "id": "s1",
    "title": "Scouting – Elenco aziende B2B",
    "category": "Scouting",
    "description": "Genera un elenco dettagliato di aziende B2B nel settore scelto e nella provincia indicata, con filtri su dipendenti e output in Excel.",
    "text": "Genera un elenco dettagliato di aziende B2B nel settore [settore/categoria] situate nella provincia di [nome provincia] con un consumo energetico annuo superiore a [kWh]. Per ogni azienda, includi le seguenti informazioni:\n• Nome azienda\n• Settore specifico\n• Numero di dipendenti \n• Indirizzo completo\n• Sito web\n• Indirizzo e-mail\n• Numero di telefono\n• Ruolo delle persone chiave (es. responsabile vendite, marketing, acquisti)\n• Profili LinkedIn delle persone chiave (CEO o Energy Manager)\n• Valutazione del potenziale interesse per soluzioni di risparmio energetico\nRequisiti:\n1. Filtro: aziende con almeno [n. dipendenti], localizzate nella provincia di [nome provincia].\n2. Presenta i risultati in formato tabellare, con una colonna per ogni campo richiesto.\n3. Al termine, crea un file Excel contenente tutti i dati raccolti e fornisci un link per scaricarlo."
  },
  // ...incolla il resto dell'array da app.js...
];

function escapeHtml(text = '') {
  return String(text).replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])
  );
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

  // Carica preferiti da sessionStorage (come nel tuo app.js)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('promptFavorites');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // Mostra toast 3s
  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // Salva preferiti
  const persistFavorites = (next) => {
    setFavorites(next);
    try {
      sessionStorage.setItem('promptFavorites', JSON.stringify([...next]));
    } catch {}
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
      // fallback classico
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
        showToast('Errore durante la copia. Riprova.');
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

  // Import .docx con mammoth (browser)
  const handleDocx = async (file) => {
    try {
      showToast('Caricamento file in corso...');
      const arrayBuffer = await file.arrayBuffer();
      // window.mammoth viene dallo Script in layout.js
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      const newPrompts = parseDocxContent(result.value);
      if (newPrompts.length === 0) {
        showToast('Nessun prompt valido trovato nel file.');
        return;
      }
      // Sostituisco i dati in memoria locale solo per questa sessione
      // (Qui semplice: ricarico la pagina con i nuovi dati in memoria)
      // In un’app reale potresti usare uno stato globale o persistere.
      PROMPTS_DATA.length = 0;
      newPrompts.forEach((np) => PROMPTS_DATA.push(np));
      // Reset UI
      persistFavorites(new Set());
      setShowOnlyFav(false);
      setSearch('');
      setCategory('');
      showToast(`${newPrompts.length} prompt caricati dal file!`);
    } catch (e) {
      console.error(e);
      showToast('Errore durante il caricamento del file.');
    }
  };

  // Parser identico alla tua versione
  function parseDocxContent(text) {
    const prompts = [];
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    let current = null;
    let buf = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length < 100 && !line.includes('\t') && !line.startsWith('-') && !line.startsWith('•')) {
        if (current && current.title) {
          current.text = buf.join('\n').trim();
          if (current.text && current.category) prompts.push(current);
        }
        current = {
          id: `imported_${Date.now()}_${prompts.length}`,
          title: line,
          category: '',
          description: '',
          text: ''
        };
        buf = [];
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const nl = lines[j];
          if (nl.length < 50 && !nl.includes('.') && !nl.includes(':')) {
            current.category = nl;
            i = j;
            break;
          }
        }
        if (!current.category) current.category = 'Importato';
      } else {
        buf.push(line);
        if (current && !current.description && buf.length === 1) {
          current.description = line.substring(0, 150) + (line.length > 150 ? '...' : '');
        }
      }
    }
    if (current && current.title) {
      current.text = buf.join('\n').trim();
      if (current.text && current.category) prompts.push(current);
    }
    return prompts;
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="header-title">📚 Prompt Library</h1>
            <div className="header-actions">
              <button
                id="favorites-toggle"
                className={`btn-blue ${showOnlyFav ? 'active' : ''}`}
                onClick={() => setShowOnlyFav(s => !s)}
                aria-label="Mostra solo preferiti"
              >
                {showOnlyFav ? '⭐ Tutti i prompt' : '⭐ I miei preferiti'}
              </button>
              <button
                id="import-docx"
                className="btn-blue"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Importa file Word"
              >
                📄 Importa .docx
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                style={{ display: 'none' }}
                aria-label="Seleziona file Word"
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
                id="search-input"
                className="form-control search-input"
                placeholder="Cerca prompt..."
                aria-label="Campo di ricerca"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-container">
              <select
                id="category-filter"
                className="form-control"
                aria-label="Filtra per categoria"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Tutte le categorie</option>
                <option value="Scouting">Scouting</option>
                <option value="Profilazione Cliente B2B (Identikit)">Profilazione Cliente B2B</option>
                <option value="Prospecting">Prospecting</option>
                <option value="Proposition">Proposition</option>
                <option value="Simulatore Elettrico">Simulatore Elettrico</option>
                <option value="Preventivatore Simulatore FV">Preventivatore FV</option>
                <option value="Lettura Consumi Next">Lettura Consumi Next</option>
                <option value="Negoziazione/Follow-up">Negoziazione/Follow-up</option>
                <option value="Gestione Customer Base">Gestione Customer Base</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div id="prompts-grid" className="prompts-grid">
            {filtered.length === 0 ? null : filtered.map((p) => (
              <div className="prompt-card" key={p.id}>
                <div className="prompt-card__header">
                  <h3 className="prompt-card__title" dangerouslySetInnerHTML={{ __html: escapeHtml(p.title) }} />
                  <span className="prompt-card__category">{p.category}</span>
                </div>
                <div className="prompt-card__description">{p.description}</div>
                <div className="prompt-card__actions">
                  <button className="btn-blue" onClick={() => copyPrompt(p.id)} aria-label="Copia prompt">📋 Copia</button>
                  <button
                    className={`btn-blue favorite-btn ${favorites.has(p.id) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(p.id)}
                    aria-label={favorites.has(p.id) ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                  >
                    {favorites.has(p.id) ? '⭐' : '☆'}
                  </button>
                  <div className="export-dropdown">
                    <button className="btn-blue export-btn" onClick={() => { /* gestione UI semplice via React */}} aria-label="Esporta prompt">
                      📤 Export
                    </button>
                    {/* Sostituisco il vecchio dropdown "apri/chiudi" con due bottoni diretti: */}
                    <div className="prompt-card__actions" style={{ marginTop: 8 }}>
                      <button className="btn-blue btn--sm" onClick={() => exportPrompt(p.id, 'txt')}>.txt</button>
                      <button className="btn-blue btn--sm" onClick={() => exportPrompt(p.id, 'md')}>.md</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div id="no-results" className="no-results">
              <p>Nessun prompt trovato per i criteri di ricerca selezionati.</p>
            </div>
          )}
        </div>
      </main>

      <div
        id="toast"
        className={`toast ${toastVisible ? 'show' : ''}`}
        role="alert"
        aria-live="polite"
      >
        <span id="toast-message">{toastMsg}</span>
      </div>
    </>
  );
}
