// app/page.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// === dati prompt (li ho lasciati uguali a prima, tagliati per brevità ===
const PROMPTS_DATA = [
  {
    id: "s1",
    title: "Scouting – Elenco aziende B2B",
    category: "Scouting",
    description: "Genera un elenco dettagliato di aziende B2B nel settore scelto e nella provincia indicata, con filtri su dipendenti e output in Excel.",
    text: "Genera un elenco dettagliato di aziende B2B nel settore [settore/categoria] situate nella provincia di [nome provincia] con un consumo energetico annuo superiore a [kWh]. Per ogni azienda, includi: Nome, Settore, Dipendenti, Indirizzo, Sito web, Email, Telefono, Persone chiave con ruolo e LinkedIn, Fonte dei dati, Valutazione potenziale (1-5), Note aggiuntive.\n\nRequisiti: aziende con almeno [n. dipendenti], sede in [provincia].\nOutput: tabella ordinata per interesse (5→1), più file Excel scaricabile."
  },
  {
    id: "p1",
    title: "Profilazione Cliente B2B (Identikit)",
    category: "Profilazione Cliente B2B (Identikit)",
    description: "Analizza un'azienda target e redigi un identikit energetico completo con opportunità commerciali.",
    text: "Analizza l'azienda [NOME AZIENDA] e crea un identikit orientato alla consulenza energetica: profilo generale, dimensioni e struttura, consumi stimati, approvvigionamento energetico attuale, impianti presenti, iniziative ESG, opportunità e criticità. Restituisci in formato scheda professionale."
  },
  {
    id: "pr1",
    title: "Prospecting – Pacchetto primo contatto",
    category: "Prospecting",
    description: "Email di presentazione, script telefonico, domande e obiezioni per il primo contatto con cliente potenziale.",
    text: "Crea un pacchetto con i miei dati [nome, ruolo, contatti] per il potenziale cliente [nome cliente]. Include: (1) email di presentazione con proposta check-up bolletta, (2) script telefonico per fissare appuntamento, (3) 3 domande chiave, (4) 3 obiezioni comuni con risposte professionali."
  },
  {
    id: "pp1",
    title: "Proposition – Offerta impianto FV",
    category: "Proposition",
    description: "Proposta commerciale fotovoltaico con ROI e confronto bolletta.",
    text: "Crea una proposta commerciale per [azienda] con impianto FV da [kWp], ROI stimato [X] anni, confronto bolletta attuale vs post-installazione, benefici economici ed ESG."
  },
  {
    id: "se1",
    title: "Simulatore Elettrico – Estrazione fattura",
    category: "Simulatore Elettrico",
    description: "Estrai e riassumi dati di consumo da fattura PDF.",
    text: "Ruolo: estrattore dati fattura.\nInput: file PDF.\nAttività: estrai consumi (kWh per fasce), servizi, quantità, prezzi, condizioni contrattuali. Output: tabella riassuntiva con note su dati mancanti."
  },
  {
    id: "se2",
    title: "Simulatore Elettrico – Analizzatore offerte",
    category: "Simulatore Elettrico",
    description: "Analizza offerte da file Excel e prepara tabella confronto.",
    text: "Input: Excel offerte energia. Attività: leggi formule prezzo (PUN, MIX, FIX, ABB+PUN), gestisci PCV=0, struttura tabella completa. Output: tabella pulita pronta al confronto."
  },
  {
    id: "se3",
    title: "Simulatore Elettrico – Confronto offerte",
    category: "Simulatore Elettrico",
    description: "Confronta offerte e identifica la migliore opzione.",
    text: "Input: dati fattura + tabella offerte.\nAttività: calcola costo stimato per ogni offerta, confronta condizioni contrattuali, ordina per convenienza, evidenzia vincoli. Output: tabella confronto + sintesi raccomandazioni."
  },
  {
    id: "se4",
    title: "Simulatore Elettrico – Report finale",
    category: "Simulatore Elettrico",
    description: "Genera report finale con raccomandazioni.",
    text: "Input: tabella confronto offerte.\nAttività: crea report testuale chiaro con offerta consigliata, risparmio, vantaggi contrattuali, vincoli, azioni successive."
  },
  {
    id: "fv1",
    title: "Preventivatore FV – Pre-preventivo",
    category: "Preventivatore Simulatore FV",
    description: "Calcola pre-preventivo fotovoltaico con scenari e ROI.",
    text: "Input: consumi annui, superficie, località, tecnologia FV, costi unitari.\nAttività: calcola costi, produzione, autoconsumo, risparmio, ROI, incentivi 2025. Genera grafico scenari (base, accumulo, accumulo+colonnina) e report PDF scaricabile."
  },
  {
    id: "lc1",
    title: "Lettura Consumi Next – Analisi fasce",
    category: "Lettura Consumi Next",
    description: "Calcola consumi annui per fasce orarie e genera grafico.",
    text: "Input: dati Next.\nAttività: calcola consumi annui per F1/F2/F3 e totale, genera tabella Excel scaricabile e grafico a linee mensile. Output: analisi tecnica + visual."
  },
  {
    id: "nf1",
    title: "Negoziazione – Follow-up cliente",
    category: "Negoziazione/Follow-up",
    description: "Email e script telefonico per follow-up dopo proposta inviata.",
    text: "Crea pacchetto follow-up per cliente [nome]. Include: email di richiamo, script telefonico, 3 domande chiave, 3 obiezioni con risposte."
  },
  {
    id: "cb1",
    title: "Gestione Customer Base – Email post installazione",
    category: "Gestione Customer Base",
    description: "Email di ringraziamento, assistenza e richiesta feedback post installazione.",
    text: "Scrivi email post-installazione: ringraziamento, assistenza, richiesta feedback. Tono professionale e cordiale."
  }
];

// --- helper ---
function escapeHtml(text = '') {
  return String(text).replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])
  );
}
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9\s\-_]/gi, '_').toLowerCase();
}
function escapeRegExp(str = '') {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function highlight(text = '', query = '') {
  if (!query || !query.trim()) return escapeHtml(text);
  const words = query.trim().split(/\s+/).filter(w => w.length >= 2).map(escapeRegExp);
  if (words.length === 0) return escapeHtml(text);
  const re = new RegExp(`(${words.join('|')})`, 'gi');
  const safe = escapeHtml(text);
  return safe.replace(re, '<mark>$1</mark>');
}

export default function Page() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [showOnlyFav, setShowOnlyFav] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // stato modale
  const [modalOpen, setModalOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState(null);

  // stato tema
  const [theme, setTheme] = useState('light');

  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('promptFavorites');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  useEffect(() => {
    const t = document.documentElement.getAttribute('data-color-scheme');
    if (t) setTheme(t);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-color-scheme', next);
    try { localStorage.setItem('color-scheme', next); } catch {}
    setTheme(next);
  }

  // ESC chiude modale
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeDetails(); };
    if (modalOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

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

  // Modale open/close
  function openDetails(p) {
    setActivePrompt(p);
    setModalOpen(true);
    try { document.body.style.overflow = 'hidden'; } catch {}
  }
  function closeDetails() {
    setModalOpen(false);
    setActivePrompt(null);
    try { document.body.style.overflow = ''; } catch {}
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="header-title">📚 Prompt Library B2B</h1>
            <div className="header-actions">
              {/* Pulsante switch tema */}
              <button
                className="btn btn--outline"
                onClick={toggleTheme}
                aria-label="Cambia tema"
              >
                {theme === 'dark' ? '☀️ Tema chiaro' : '🌙 Tema scuro'}
              </button>

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
                  <h3
                    className="prompt-card__title"
                    dangerouslySetInnerHTML={{ __html: highlight(p.title, search) }}
                  />
                  <span className="prompt-card__category">{p.category}</span>
                </div>

                <div
                  className="prompt-card__description clamp-2"
                  dangerouslySetInnerHTML={{ __html: highlight(p.description, search) }}
                />
                <div className="prompt-card__meta">
                  <button
                    className="link-btn details-btn"
                    onClick={() => openDetails(p)}
                  >
                    Dettagli ⤵︎
                  </button>
                </div>

                <div className="prompt-card__actions">
                  <button
                    className="btn-blue"
                    onClick={() => copyPrompt(p.id)}
                  >
                    📋 Copia
                  </button>
                  <button
                    className={`btn-blue favorite-btn ${favorites.has(p.id) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(p.id)}
                  >
                    {favorites.has(p.id) ? '⭐' : '☆'}
                  </button>
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

      {/* Modale Dettagli */}
      {modalOpen && activePrompt && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">{activePrompt.title}</h3>
              <button className="modal__close" onClick={closeDetails}>✕</button>
            </div>

            <div className="modal__category">{activePrompt.category}</div>
            <p className="modal__desc">{activePrompt.description}</p>

            <div className="modal__body">
              <pre className="modal__code">{activePrompt.text}</pre>
            </div>

            <div className="modal__actions">
              <button className="btn-blue" onClick={() => copyPrompt(activePrompt.id)}>📋 Copia prompt</button>
              <button
                className={`btn-blue favorite-btn ${favorites.has(activePrompt.id) ? 'active' : ''}`}
                onClick={() => toggleFavorite(activePrompt.id)}
              >
                {favorites.has(activePrompt.id) ? '⭐ Rimuovi dai preferiti' : '☆ Aggiungi ai preferiti'}
              </button>
              <button className="btn-ghost" onClick={closeDetails}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>Realizzato con ❤️ da <strong>Alfredo Palermi</strong></p>
        </div>
      </footer>

      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        <span>{toastMsg}</span>
      </div>
    </>
  );
}

