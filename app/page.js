// app/page.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* ===================== DATI ===================== */
const PROMPTS_DATA = [
  // === I TUOI PROMPT (invariati) ===
  {
    id: 's1',
    title: 'Scouting – Elenco aziende B2B',
    category: 'Scouting',
    description:
      'Genera un elenco dettagliato di aziende B2B nel settore scelto e nella provincia indicata, con filtri su dipendenti e output in Excel.',
    text:
      "Genera un elenco dettagliato di aziende B2B nel settore [settore/categoria] situate nella provincia di [nome provincia] con un consumo energetico annuo superiore a [kWh]. Per ogni azienda, includi le seguenti informazioni:\n• Nome azienda\n• Settore specifico\n• Numero di dipendenti \n• Indirizzo completo\n• Sito web\n• Indirizzo e-mail\n• Numero di telefono\n• Ruolo delle persone chiave (es. responsabile vendite, marketing, acquisti)\n• Profili LinkedIn delle persone chiave (CEO o Energy Manager)\n• Valutazione del potenziale interesse per soluzioni di risparmio energetico\nRequisiti:\n1. Filtro: aziende con almeno [n. dipendenti], localizzate nella provincia di [nome provincia].\n2. Presenta i risultati in formato tabellare, con una colonna per ogni campo richiesto.\n3. Al termine, crea un file Excel contenente tutti i dati raccolti e fornisci un link per scaricarlo."
  },
  {
    id: 'p1',
    title: 'Profilazione Cliente B2B (Identikit)',
    category: 'Profilazione Cliente B2B (Identikit)',
    description:
      "Analizza un'azienda target e redigi un identikit energetico completo con opportunità commerciali.",
    text:
      "Analizza l'azienda [NOME AZIENDA] e crea un identikit approfondito orientato alla consulenza energetica. Raccogli e sintetizza le seguenti informazioni (se disponibili da fonti pubbliche):\n🔹 Profilo generale dell'azienda\n– Ragione sociale, anno di fondazione, struttura societaria\n– Storia e sviluppo aziendale\n– Settore merceologico / categoria ATECO\n– Sedi operative, stabilimenti e presenza territoriale\n🔹 Dimensioni e struttura economica\n– Numero dipendenti\n– Fatturato annuo e trend economico (ultimi 3 anni)\n– Presenza di stabilimenti energivori o grandi superfici\n🔹 Consumo e fabbisogno energetico potenziale\n– Indizi sulla potenza impegnata / consumi elettrici stimati\n– Tipologia di utenze: produttive, logistiche, direzionali, commerciali\n– Presenza di turnazioni h24 o lavorazioni energivore\n🔹 Stato attuale dell'approvvigionamento energetico\n– Indizi su contratti luce/gas\n– Presenza di sistemi di monitoraggio energetico\n– Presenza di impianti di autoproduzione (es. fotovoltaico, cogenerazione)\n– Presenza di colonnine EV o politiche ESG\n🔹 Altri elementi strategici o opportunità commerciali\n– Eventuali criticità energetiche o opportunità di ottimizzazione\n– Progetti recenti di efficienza energetica, sostenibilità o digitalizzazione\n– Collaborazioni con ESCo o consulenti energetici\nFornisci il profilo sotto forma di scheda strutturata (tipo report operativo per consulente). Evidenzia opportunità di intervento commerciale, criticità e punti di forza. Se i dati non sono disponibili, segnala l'informazione come non reperita."
  },
  {
    id: 'pr1',
    title: 'Prospecting – Pacchetto primo contatto',
    category: 'Prospecting',
    description:
      'Email di presentazione, script telefonico, domande e obiezioni per il primo contatto con cliente potenziale.',
    text:
      "Crea un pacchetto completo con i miei dati [nome e cognome, ruolo, sede di lavoro e contatti], per un primo contatto con il potenziale cliente [nome cliente], includendo:\n1. Un'email di presentazione efficace che offra gratuitamente un'analisi dettagliata della bolletta elettrica e un check-up energetico personalizzato.\n2. Uno script telefonico strutturato per il follow-up, orientato a coinvolgere il cliente e fissare un appuntamento.\n3. Tre domande chiave da porre durante la telefonata per valutare la qualificazione del cliente rispetto a un'offerta fotovoltaica o a una consulenza sulla bolletta.\n4. Tre obiezioni comuni che il cliente potrebbe sollevare, con relative risposte persuasive e professionali per superarle."
  },
  {
    id: 'pp1',
    title: 'Proposition – Offerta impianto FV',
    category: 'Proposition',
    description:
      'Proposta commerciale fotovoltaico con ROI e confronto bolletta.',
    text:
      'Crea una proposta commerciale per il cliente [nome azienda], evidenziando i benefici di un impianto fotovoltaico da [kWp], ROI stimato in [X] anni, e confronto con il costo attuale in bolletta.'
  },
  {
    id: 'se1',
    title: 'Simulatore Elettrico – Estrazione fattura',
    category: 'Simulatore Elettrico',
    description: 'Estrai e riassumi dati di consumo da fattura PDF.',
    text:
      'Ruolo: Estrattore dati da fattura cliente.\nInput: file PDF contenente la fattura.\nAttività:\n- Estrai i seguenti dati dalla fattura:\n  • Consumi (kWh) suddivisi per fascia oraria, se disponibili (F1, F2, F3).\n  • Tipologie di prodotti/servizi utilizzati.\n  • Quantità di ciascun prodotto/servizio.\n  • Prezzi attuali applicati.\n  • Condizioni contrattuali rilevabili (durata contratto, penali, ecc.).\nOutput:\n- Restituisci un riepilogo strutturato in formato tabellare con i dati sopra elencati.\n- Evidenzia eventuali dati mancanti o ambigui da verificare.\nNota: presta attenzione alle unità di misura e ai dettagli contrattuali.'
  },
  {
    id: 'se2',
    title: 'Simulatore Elettrico – Analizzatore offerte',
    category: 'Simulatore Elettrico',
    description:
      'Analizza offerte da file Excel e prepara tabella confronto.',
    text:
      'Ruolo: Analizzatore offerte da file Excel.\nInput: file Excel contenente le offerte prodotti per fornitura elettrica, con colonne dettagliate.\nAttività:\n- Leggi e struttura i dati del file Excel.\n- Per ogni offerta, interpreta correttamente le formule di prezzo: PUN, MIX, ABB+PUN, FIX.\n- Evidenzia offerte con PCV pari a zero e come trattarle.\n- Fornisci una tabella strutturata con tutte le informazioni pronte per il confronto.\nOutput:\n- Tabella con tutte le offerte pronte per analisi.\n- Eventuali note su vincoli o particolarità delle offerte.'
  },
  {
    id: 'se3',
    title: 'Simulatore Elettrico – Confronto offerte',
    category: 'Simulatore Elettrico',
    description:
      'Confronta offerte e identifica la migliore opzione.',
    text:
      'Ruolo: Simulatore per confronto offerte e identificazione della migliore opzione.\nInput:\n- Dati estratti dalla fattura cliente (Prompt 1).\n- Tabella offerte strutturata (Prompt 2).\nAttività:\n- Confronta i prodotti/servizi attualmente usati dal cliente con le offerte presenti.\n- Valuta prezzo unitario, condizioni contrattuali e durata contratto.\n- Calcola il costo stimato per ogni offerta basandoti sui consumi reali.\n- Genera una lista ordinata delle offerte alternative potenzialmente migliori.\n- Evidenzia vincoli o particolarità rilevanti.\nOutput: Tabella riepilogativa e sintesi raccomandazioni.'
  },
  {
    id: 'se4',
    title: 'Simulatore Elettrico – Report finale',
    category: 'Simulatore Elettrico',
    description: 'Genera report finale con raccomandazioni.',
    text:
      'Ruolo: Generatore di report finale e raccomandazioni.\nInput: tabella riepilogativa delle offerte.\nAttività: analizza e redigi sintesi chiara con offerta consigliata, risparmio, miglioramenti contrattuali, vincoli.\nSuggerisci azioni successive.\nOutput: report testuale; possibili grafici o tabelle.'
  },
  {
    id: 'fv1',
    title: 'Preventivatore FV – Pre-preventivo',
    category: 'Preventivatore Simulatore FV',
    description: 'Calcola pre-preventivo fotovoltaico con scenari e ROI.',
    text:
      'Genera un pre-preventivo fotovoltaico per [azienda B2B]. L\'utente fornirà: consumi annui per fasce, superficie, località, tipologia pannello, costi unitari, ecc. Il sistema deve calcolare costi, produzione, autoconsumo, risparmio, ROI, incentivi 2025, grafico scenari (base, accumulo, accumulo+colonnina), numero pannelli, report PDF scaricabile, salvataggio dati.'
  },
  {
    id: 'lc1',
    title: 'Lettura Consumi Next – Analisi fasce',
    category: 'Lettura Consumi Next',
    description: 'Calcola consumi annui per fasce orarie e genera grafico.',
    text:
      '1. Calcola il consumo annuo per ciascuna delle tre fasce orarie (F1, F2, F3) e il consumo totale annuo, espressi in MWh, utilizzando le letture di Next che ti fornisco in allegato.\n2. Crea una tabella Excel scaricabile con colonne: Consumo fascia F1, Consumo fascia F2, Consumo fascia F3, Consumo totale annuo.\n3. Genera un grafico a linee dei consumi mensili in kWh suddivisi per fascia oraria e totale e fornisci analisi dettagliata.'
  },
  {
    id: 'nf1',
    title: 'Negoziazione – Follow-up cliente',
    category: 'Negoziazione/Follow-up',
    description:
      'Email e script telefonico per follow-up dopo proposta inviata.',
    text:
      'Crea un pacchetto completo con i miei dati, per [nome cliente] che ha ricevuto la proposta tre giorni fa:\n1. E-mail di follow-up professionale.\n2. Script telefonico per follow-up.\n3. Tre domande chiave per la telefonata.\n4. Tre obiezioni comuni con risposte.'
  },
  {
    id: 'cb1',
    title: 'Gestione Customer Base – Email post installazione',
    category: 'Gestione Customer Base',
    description:
      'Email di ringraziamento, assistenza e richiesta feedback post installazione.',
    text:
      'Crea una e-mail post installazione per ringraziare il cliente, offrire assistenza e richiedere feedback.'
  }
];

// Copia di default per il ripristino (deep copy semplice)
const DEFAULT_PROMPTS = JSON.parse(JSON.stringify(PROMPTS_DATA));

/* ===================== HELPERS ===================== */
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

/* ===================== COMPONENT ===================== */
export default function Page() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [showOnlyFav, setShowOnlyFav] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Modale prompt
  const [modalOpen, setModalOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState(null);

  // Admin & import/reset
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');

  // Disclaimer
  const DISCLAIMER_KEY = 'disclaimerAccepted:v1';
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const fileInputRef = useRef(null);

  // preferiti
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('promptFavorites');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // admin persistito in sessione
  useEffect(() => {
    try {
      const a = sessionStorage.getItem('isAdmin') === '1';
      setIsAdmin(a);
    } catch {}
  }, []);

  // ESC chiude modali
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (modalOpen) setModalOpen(false);
        if (adminModalOpen) setAdminModalOpen(false);
        if (disclaimerOpen) setDisclaimerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, adminModalOpen, disclaimerOpen]);

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

  // Modale Dettagli
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

  // Import .docx con Mammoth (browser) — SOLO ADMIN
  const handleDocx = async (file) => {
    try {
      if (!isAdmin) {
        showToast('Solo admin può importare.');
        return;
      }
      showToast('Caricamento file in corso...');
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      const newPrompts = parseDocxContent(result.value);
      if (newPrompts.length === 0) {
        showToast('Nessun prompt valido trovato nel file.');
        return;
      }

      // 1) Backup della libreria attuale (per reset)
      try {
        localStorage.setItem('promptLibraryBackup', JSON.stringify(PROMPTS_DATA));
      } catch {}

      // 2) Rimpiazza i prompt correnti
      PROMPTS_DATA.length = 0;
      newPrompts.forEach((np) => PROMPTS_DATA.push(np));

      // 3) Reset UI
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

  // Parser .docx semplice
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
            current.category = nl; i = j; break;
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

  /* ===== Admin auth ===== */
  function openAdmin() {
    setAdminPass('');
    setAdminError('');
    setAdminModalOpen(true);
  }
  function confirmAdmin() {
    if (adminPass === 'ALFREDO2025') {
      setIsAdmin(true);
      try { sessionStorage.setItem('isAdmin', '1'); } catch {}
      setAdminModalOpen(false);
      showToast('Accesso admin abilitato');
    } else {
      setAdminError('Password errata');
    }
  }

  /* ===== Reset Libreria (SOLO ADMIN) ===== */
  function resetLibrary() {
    if (!isAdmin) {
      openAdmin();
      return;
    }
    const ok = window.confirm('Ripristinare la libreria? Verranno sovrascritti i prompt correnti.');
    if (!ok) return;

    // 1) prova a usare il backup dell’ultimo import
    let restored = null;
    try {
      const raw = localStorage.getItem('promptLibraryBackup');
      if (raw) restored = JSON.parse(raw);
    } catch {}

    // 2) se non c’è backup, usa i prompt di default inclusi nel codice
    const source = restored && Array.isArray(restored) && restored.length > 0
      ? restored
      : DEFAULT_PROMPTS;

    // 3) ripristina
    PROMPTS_DATA.length = 0;
    source.forEach(p => PROMPTS_DATA.push({ ...p }));

    // 4) reset UI
    persistFavorites(new Set());
    setShowOnlyFav(false);
    setSearch('');
    setCategory('');
    showToast('Libreria ripristinata');
  }

  /* ===== Disclaimer ===== */
  function openDisclaimer() {
    setDisclaimerOpen(true);
  }
  function acceptDisclaimer() {
    try { localStorage.setItem(DISCLAIMER_KEY, '1'); } catch {}
    setDisclaimerOpen(false);
  }

  /* ===================== RENDER ===================== */
  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="header-title">📚 Prompt Library B2B</h1>
            <div className="header-actions">
              <button
                id="favorites-toggle"
                className={`btn-blue ${showOnlyFav ? 'active' : ''}`}
                onClick={() => setShowOnlyFav((s) => !s)}
                aria-label="Mostra solo preferiti"
              >
                {showOnlyFav ? '⭐ Tutti i prompt' : '⭐ I miei preferiti'}
              </button>

              {/* Admin / Import / Reset */}
              {isAdmin ? (
                <>
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
                  <button
                    className="btn-blue"
                    onClick={resetLibrary}
                    aria-label="Ripristina libreria"
                    title="Ripristina libreria"
                  >
                    ♻️ Reset libreria
                  </button>
                </>
              ) : (
                <button
                  className="btn-blue"
                  onClick={openAdmin}
                  aria-label="Accedi amministratore"
                  title="Area riservata"
                >
                  🔒 Admin
                </button>
              )}
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

      {/* Main */}
      <main className="main">
        <div className="container">
          <div id="prompts-grid" className="prompts-grid">
            {filtered.length === 0
              ? null
              : filtered.map((p) => (
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
                        aria-label={`Apri dettagli del prompt ${p.title}`}
                      >
                        Dettagli ⤵︎
                      </button>
                    </div>

                    <div className="prompt-card__actions">
                      <button
                        className="btn-blue"
                        onClick={() => copyPrompt(p.id)}
                        aria-label="Copia prompt"
                      >
                        📋 Copia
                      </button>
                      <button
                        className={`btn-blue favorite-btn ${favorites.has(p.id) ? 'active' : ''}`}
                        onClick={() => toggleFavorite(p.id)}
                        aria-label={favorites.has(p.id) ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
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

      {/* Modale Dettagli Prompt */}
      {modalOpen && activePrompt && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop')) closeDetails();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Dettagli prompt: ${activePrompt.title}`}
        >
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">{activePrompt.title}</h3>
              <button className="modal__close" onClick={closeDetails} aria-label="Chiudi">
                ✕
              </button>
            </div>

            <div className="modal__category">{activePrompt.category}</div>
            <p className="modal__desc">{activePrompt.description}</p>

            <div className="modal__body">
              <pre className="modal__code">{activePrompt.text}</pre>
            </div>

            <div className="modal__actions">
              <button className="btn-blue" onClick={() => copyPrompt(activePrompt.id)}>
                📋 Copia prompt
              </button>
              <button
                className={`btn-blue favorite-btn ${favorites.has(activePrompt.id) ? 'active' : ''}`}
                onClick={() => toggleFavorite(activePrompt.id)}
              >
                {favorites.has(activePrompt.id) ? '⭐ Rimuovi dai preferiti' : '☆ Aggiungi ai preferiti'}
              </button>
              <button className="btn-blue btn-ghost" onClick={closeDetails}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Admin */}
      {adminModalOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop')) setAdminModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Accesso amministratore"
        >
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">Accesso amministratore</h3>
              <button className="modal__close" onClick={() => setAdminModalOpen(false)} aria-label="Chiudi">
                ✕
              </button>
            </div>

            <div className="modal__body" style={{ paddingTop: 16 }}>
              <label className="form-label" htmlFor="admin-pass">
                Inserisci password
              </label>
              <input
                id="admin-pass"
                type="password"
                className="form-control"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Password"
              />
              {adminError && <p style={{ color: '#fca5a5', marginTop: 8 }}>{adminError}</p>}
            </div>

            <div className="modal__actions">
              <button className="btn-blue" onClick={confirmAdmin}>Conferma</button>
              <button className="btn-blue btn-ghost" onClick={() => setAdminModalOpen(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Disclaimer */}
      {disclaimerOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop')) setDisclaimerOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Disclaimer"
        >
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">Disclaimer</h3>
              <button className="modal__close" onClick={() => setDisclaimerOpen(false)} aria-label="Chiudi">
                ✕
              </button>
            </div>

            <div className="modal__body" style={{ paddingTop: 16 }}>
              <p className="modal__desc">
                I contenuti e i prompt presenti nella libreria hanno scopo informativo/operativo.
                Verifica sempre i risultati prima dell’uso in contesti reali. Nessuna responsabilità
                per errori, omissioni o usi impropri delle informazioni generate.
              </p>
            </div>

            <div className="modal__actions">
              <button className="btn-blue" onClick={acceptDisclaimer}>Ho letto e capisco</button>
              <button className="btn-blue btn-ghost" onClick={() => setDisclaimerOpen(false)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer con link Disclaimer */}
      <footer className="footer">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
          <p style={{ margin: 0 }}>Realizzato con ❤️ da <strong>Alfredo Palermi</strong></p>
          <span aria-hidden="true">•</span>
          <button
            className="link-btn"
            onClick={openDisclaimer}
            aria-label="Apri disclaimer"
            style={{ fontSize: 14 }}
          >
            ⚠️ Disclaimer
          </button>
        </div>
      </footer>

      {/* Toast */}
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
