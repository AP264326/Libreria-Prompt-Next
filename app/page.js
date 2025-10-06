// app/page.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* ===================== DATI DI DEFAULT ===================== */
const DEFAULT_PROMPTS = [
  {
    id: 's1',
    title: 'Scouting – Elenco aziende B2B',
    category: 'Scouting',
    description:
      'Genera un elenco dettagliato di aziende B2B nel settore scelto e nella provincia indicata, con filtri su dipendenti e output in Excel.',
    text:
      "Agisci come un Business Data Researcher specializzato in lead generation.\nIl tuo compito è raccogliere il maggior numero possibile di aziende secondo i criteri che ti fornirò.\n\nPrima di procedere, chiedimi di specificare:\n\nSettore/categoria delle aziende\n\nProvincia\n\nConsumo energetico annuo minimo (kWh)\n\nNumero minimo di dipendenti\n\nDopo che avrò fornito queste informazioni, genera un elenco dettagliato di aziende B2B che rispettano i criteri.\n\nPer ogni azienda includi:\n\nNome azienda\n\nSettore specifico\n\nNumero di dipendenti\n\nIndirizzo completo\n\nSito web\n\nIndirizzo e-mail\n\nNumero di telefono\n\nRuolo delle persone chiave (es. responsabile vendite, marketing, acquisti)\n\nProfili LinkedIn delle persone chiave (CEO o Energy Manager)\n\nValutazione del potenziale interesse per soluzioni di risparmio energetico\n\nRequisiti di output\n\nPresenta i risultati in formato tabellare (colonne per ogni campo).\n\nSe trovi più di 5 aziende, suddividi i risultati in blocchi da massimo 5 aziende ciascuno finché non hai mostrato tutte le aziende (non fermarti al primo gruppo).\n\nSe alcuni dati (es. ruoli, LinkedIn, email) non sono disponibili, lascia la cella vuota ma non limitare il numero di aziende.\n\nAl termine, genera la stessa lista in formato CSV puro (racchiuso tra ```), in modo che io possa copiarlo e salvarlo come file .csv apribile in Excel.\n\nNon fornire link fittizi: se non puoi creare un file .xlsx scaricabile, limita l’output al formato CSV testuale.",
    tags: ['Perplexity']
  },
  {
    id: 'p1',
    title: 'Profilazione Cliente B2B (Identikit)',
    category: 'Profilazione Cliente B2B (Identikit)',
    description:
      "Analizza un'azienda target e redigi un identikit energetico completo con opportunità commerciali.",
    text:
      "Analizza l'azienda [NOME AZIENDA] e crea un identikit approfondito orientato alla consulenza energetica. Raccogli e sintetizza le seguenti informazioni (se disponibili da fonti pubbliche):\n🔹 Profilo generale dell'azienda\n– Ragione sociale, anno di fondazione, struttura societaria\n– Storia e sviluppo aziendale\n– Settore merceologico / categoria ATECO\n– Sedi operative, stabilimenti e presenza territoriale\n🔹 Dimensioni e struttura economica\n– Numero dipendenti\n– Fatturato annuo e trend economico (ultimi 3 anni)\n– Presenza di stabilimenti energivori o grandi superfici\n🔹 Consumo e fabbisogno energetico potenziale\n– Indizi sulla potenza impegnata / consumi elettrici stimati\n– Tipologia di utenze: produttive, logistiche, direzionali, commerciali\n– Presenza di turnazioni h24 o lavorazioni energivore\n🔹 Stato attuale dell'approvvigionamento energetico\n– Indizi su contratti luce/gas\n– Presenza di sistemi di monitoraggio energetico\n– Presenza di impianti di autoproduzione (es. fotovoltaico, cogenerazione)\n– Presenza di colonnine EV o politiche ESG\n🔹 Altri elementi strategici o opportunità commerciali\n– Eventuali criticità energetiche o opportunità di ottimizzazione\n– Progetti recenti di efficienza energetica, sostenibilità o digitalizzazione\n– Collaborazioni con ESCo o consulenti energetici\nFornisci il profilo sotto forma di scheda strutturata (tipo report operativo per consulente). Evidenzia opportunità di intervento commerciale, criticità e punti di forza. Se i dati non sono disponibili, segnala l'informazione come non reperita.",
    tags: ['Perplexity']
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
      'Ruolo: Estrattore dati da fattura cliente.\nInput: file PDF contenente la fattura.\nAttività:\n- Estrai i seguenti dati dalla fattura:\n  • Consumi (kWh) suddivisi per fascia oraria, se disponibili (F1, F2, F3).\n  • Tipologie di prodotti/servizi utilizzati.\n  • Quantità di ciascun prodotto/servizio.\n  • Prezzi attuali applicati.\n  • Condizioni contrattuali rilevabili (durata contratto, penali, ecc.).\nOutput:\n- Restituisci un riepilogo strutturato in formato tabellare con i dati sopra elencati.\n- Evidenzia eventuali dati mancanti o ambigui da verificare.\nNota: presta attenzione alle unità di misura e ai dettagli contrattuali.',
    tags: ['1']
  },
  {
    id: 'se2',
    title: 'Simulatore Elettrico – Analizzatore offerte',
    category: 'Simulatore Elettrico',
    description:
      'Analizza offerte da file Excel e prepara tabella confronto.',
    text:
      'Ruolo: Analizzatore offerte da file Excel.\nInput: file Excel contenente le offerte prodotti per fornitura elettrica, con colonne dettagliate.\nAttività:\n- Leggi e struttura i dati del file Excel.\n- Per ogni offerta, interpreta correttamente le formule di prezzo: PUN, MIX, ABB+PUN, FIX.\n- Evidenzia offerte con PCV pari a zero e come trattarle.\n- Fornisci una tabella strutturata con tutte le informazioni pronte per il confronto.\nOutput:\n- Tabella con tutte le offerte pronte per analisi.\n- Eventuali note su vincoli o particolarità delle offerte.',
    tags: ['2']
  },
  {
    id: 'se3',
    title: 'Simulatore Elettrico – Confronto offerte',
    category: 'Simulatore Elettrico',
    description:
      'Confronta offerte e identifica la migliore opzione.',
    text:
      'Ruolo: Simulatore per confronto offerte e identificazione della migliore opzione.\nInput:\n- Dati estratti dalla fattura cliente (Prompt 1).\n- Tabella offerte strutturata (Prompt 2).\nAttività:\n- Confronta i prodotti/servizi attualmente usati dal cliente con le offerte presenti.\n- Valuta prezzo unitario, condizioni contrattuali e durata contratto.\n- Calcola il costo stimato per ogni offerta basandoti sui consumi reali.\n- Genera una lista ordinata delle offerte alternative potenzialmente migliori.\n- Evidenzia vincoli o particolarità rilevanti.\nOutput: Tabella riepilogativa e sintesi raccomandazioni.',
    tags: ['3']
  },
  {
    id: 'se4',
    title: 'Simulatore Elettrico – Report finale',
    category: 'Simulatore Elettrico',
    description: 'Genera report finale con raccomandazioni.',
    text:
      'Ruolo: Generatore di report finale e raccomandazioni.\nInput: tabella riepilogativa delle offerte.\nAttività: analizza e redigi sintesi chiara con offerta consigliata, risparmio, miglioramenti contrattuali, vincoli.\nSuggerisci azioni successive.\nOutput: report testuale; possibili grafici o tabelle.',
    tags: ['4']
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
  },

  /* ===== Nuova categoria: Analisi di Mercato ===== */
  {
    id: 'm1',
    title: 'Report Energia B2B – Report Completo',
    category: 'Analisi di Mercato',
    description: 'Report approfondito (mensile/trimestrale) con dati ufficiali, grafici e raccomandazioni.',
    text:
      "Agisci come un analista energetico esperto specializzato nel mercato B2B luce e gas in Italia.\nElabora un report di mercato aggiornato basandoti solo su fonti ufficiali e autorevoli (ARERA, Terna, GME, GSE, Eurostat, IEA, Ministero Ambiente/Energia).\n\nIl report deve includere:\n\n1. Executive summary (max 10 bullet point) con dati chiave, trend e implicazioni per le imprese.\n\n2. Andamento prezzi energia elettrica e gas (ultimi 6–12 mesi) con grafici a linee.\n\n3. Previsioni a breve termine (3–6 mesi) con scenari possibili, citando fonti e limiti.\n\n4. Normative rilevanti (italiane ed europee) che impattano sui costi.\n\n5. Confronto PMI vs grandi aziende (tabella comparativa su consumi, contratti e costi).\n\n6. Trend sostenibilità e rinnovabili nel B2B.\n\n7. Best practice e opportunità di risparmio adottate dalle aziende leader.\n\n8. Nota metodologica: fonti, affidabilità dei dati e limiti previsionali.\n\nUsa tabelle e grafici dove utile.\nConcludi con 3–5 raccomandazioni pratiche per i decisori aziendali.",
    tags: ['Perplexity']
  },
  {
    id: 'm2',
    title: 'Report Energia B2B – Flash Report',
    category: 'Analisi di Mercato',
    description: 'Flash report settimanale/bisettimanale con 5 punti chiave e mini-tabelle.',
    text:
      "Agisci come un analista energetico B2B.\nGenera un flash report settimanale sul mercato energia elettrica e gas in Italia, basandoti su fonti ufficiali e autorevoli (ARERA, Terna, GME, GSE, Eurostat, IEA, Ministero Ambiente/Energia).\n\nIncludi in massimo 5 punti chiave:\n\n1. Andamento prezzi energia elettrica e gas (ultima settimana)\n\n2. Differenze principali rispetto al mese scorso\n\n3. Novità normative rilevanti (se presenti)\n\n4. Opportunità o rischi per imprese B2B (PMI e grandi aziende)\n\n5. Una raccomandazione pratica per i decisori aziendali\n\nPresenta il tutto in modo chiaro, sintetico e con eventuali mini-tabelle comparative.",
    tags: ['Perplexity']
  },
  {
    id: 'm3',
    title: 'Report Energia B2B – Market Alert',
    category: 'Analisi di Mercato',
    description: 'Alert lampo (giornaliero/occasionale) in 3 bullet per WhatsApp/LinkedIn/email.',
    text:
      "Agisci come un analista energetico B2B.\nGenera un market alert sintetico sul mercato energia elettrica e gas in Italia basandoti su fonti ufficiali e autorevoli (ARERA, Terna, GME, GSE, Eurostat, IEA, Ministero Ambiente/Energia).\n\nRiassumi in 3 bullet point massimo:\n• Andamento prezzi luce e gas rispetto alla settimana precedente\n• Novità o eventi critici (mercato, geopolitica, normative) che impattano i costi\n• Raccomandazione pratica immediata per aziende B2B (PMI e grandi imprese)\n\nStile: chiaro, incisivo, pronto per un messaggio breve.",
    tags: ['Perplexity']
  }
];

/* ===================== COSTANTI STORAGE ===================== */
const LS_PROMPTS_KEY = 'promptsStore:v1';
const DISCLAIMER_KEY = 'disclaimerAccepted:v1';

/* ===================== HELPERS ===================== */
function escapeHtml(text = '') {
  return String(text).replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])
  );
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
  const [prompts, setPrompts] = useState(DEFAULT_PROMPTS);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [showOnlyFav, setShowOnlyFav] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');

  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const savedFavs = sessionStorage.getItem('promptFavorites');
      if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)));

      const savedPrompts = localStorage.getItem(LS_PROMPTS_KEY);
      if (savedPrompts) {
        const parsed = JSON.parse(savedPrompts);
        if (Array.isArray(parsed) && parsed.length > 0) setPrompts(parsed);
      }
      const a = sessionStorage.getItem('isAdmin') === '1';
      setIsAdmin(a);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(DISCLAIMER_KEY) === '1';
      if (!accepted) setDisclaimerOpen(true);
    } catch {}
  }, []);

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
    return prompts.filter((p) => {
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term);
      const matchesCategory = !category || p.category === category;
      const matchesFav = !showOnlyFav || favorites.has(p.id);
      return matchesSearch && matchesCategory && matchesFav;
    });
  }, [prompts, search, category, showOnlyFav, favorites]);

  const copyPrompt = async (id) => {
    const p = prompts.find((x) => x.id === id);
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

  const handleDocx = async (file) => {
    try {
      showToast('Caricamento file in corso...');
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      const newPrompts = parseDocxContent(result.value);
      if (newPrompts.length === 0) {
        showToast('Nessun prompt valido trovato nel file.');
        return;
      }
      setPrompts(newPrompts);
      try {
        localStorage.setItem(LS_PROMPTS_KEY, JSON.stringify(newPrompts));
      } catch {}
      persistFavorites(new Set());
      setShowOnlyFav(false);
      setSearch('');
      setCategory('');
      showToast(`${newPrompts.length} prompt caricati (salvati localmente)!`);
    } catch (e) {
      console.error(e);
      showToast('Errore durante il caricamento del file.');
    }
  };

  function parseDocxContent(text) {
    const out = [];
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    let current = null;
    let buf = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const looksLikeTitle = line.length < 120 && !line.includes('\t') && !line.startsWith('-') && !line.startsWith('•');
      if (looksLikeTitle) {
        if (current && current.title) {
          current.text = buf.join('\n').trim();
          if (current.text && current.category) out.push(current);
        }
        current = {
          id: `imported_${Date.now()}_${out.length}`,
          title: line,
          category: '',
          description: '',
          text: '',
          tags: []
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
      if (current.text && current.category) out.push(current);
    }
    return out;
  }

  function openAdmin() {
    setAdminPass('');
    setAdminError('');
    setAdminModalOpen(true);
  }
  function confirmAdmin() {
    if (adminPass === 'KAMAI2025') {
      setIsAdmin(true);
      try { sessionStorage.setItem('isAdmin', '1'); } catch {}
      setAdminModalOpen(false);
      showToast('Accesso admin abilitato');
    } else {
      setAdminError('Password errata');
    }
  }

  function resetLibrary() {
    if (!isAdmin) return;
    const ok = window.confirm('Ripristinare la libreria ai prompt di default? I prompt importati localmente verranno rimossi.');
    if (!ok) return;
    setPrompts(DEFAULT_PROMPTS);
    try { localStorage.removeItem(LS_PROMPTS_KEY); } catch {}
    persistFavorites(new Set());
    setShowOnlyFav(false);
    setSearch('');
    setCategory('');
    showToast('Libreria ripristinata ai prompt di default.');
  }

  function openDisclaimer() { setDisclaimerOpen(true); }
  function acceptDisclaimer() {
    try { localStorage.setItem(DISCLAIMER_KEY, '1'); } catch {}
    setDisclaimerOpen(false);
  }

  // stile inline per i tag-chip
  const tagStyle = {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 12,
    borderRadius: 6,
    background: 'var(--color-secondary)',
    border: '1px solid var(--color-card-border)',
    marginLeft: 6
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="header-title">📚 Prompt Library B2B</h1>
            <div className="header-actions">
              <button
                id="favorites-toggle"
                className={`btn-blue ${showOnlyFav ? 'active' : ''}`}
                onClick={() => setShowOnlyFav(s => !s)}
                aria-label="Mostra solo preferiti"
              >
                {showOnlyFav ? '⭐ Tutti i prompt' : '⭐ I miei preferiti'}
              </button>

              {isAdmin ? (
                <>
                  <button
                    id="import-docx"
                    className="btn-blue"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Importa file Word"
                    title="Importa .docx (sostituisce la libreria locale)"
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
                    aria-label="Reset libreria"
                    title="Ripristina i prompt di default"
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
                <option value="Analisi di Mercato">Analisi di Mercato</option>
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
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    <span className="prompt-card__category">{p.category}</span>
                    {(p.tags || []).map((t, idx) => (
                      <span key={idx} style={tagStyle}>
                        {t}
                      </span>
                    ))}
                  </div>
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

      {modalOpen && activePrompt && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target.classList.contains('modal-backdrop')) closeDetails(); }}
          role="dialog"
          aria-modal="true"
          aria-label={`Dettagli prompt: ${activePrompt.title}`}
        >
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">{activePrompt.title}</h3>
              <button className="modal__close" onClick={closeDetails} aria-label="Chiudi">✕</button>
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
              <button className="btn-blue btn-ghost" onClick={closeDetails}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {adminModalOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target.classList.contains('modal-backdrop')) setAdminModalOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Accesso amministratore"
        >
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">Accesso amministratore</h3>
              <button className="modal__close" onClick={() => setAdminModalOpen(false)} aria-label="Chiudi">✕</button>
            </div>

            <div className="modal__body" style={{ paddingTop: 16 }}>
              <label className="form-label" htmlFor="admin-pass">Inserisci password</label>
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

      {disclaimerOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target.classList.contains('modal-backdrop')) setDisclaimerOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Disclaimer"
        >
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">Disclaimer</h3>
              <button className="modal__close" onClick={() => setDisclaimerOpen(false)} aria-label="Chiudi">✕</button>
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

      <footer className="footer">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
          <p style={{ margin: 0 }}>Realizzato con ❤️ da <strong>Alfredo Palermi</strong></p>
          <span aria-hidden="true">•</span>
          <button
            className="link-btn"
            onClick={openDisclaimer}
            aria-label="Apri disclaimer"
            style={{ fontSize: 14, color: '#f59e0b', fontWeight: 600 }}
          >
            ⚠️ Disclaimer
          </button>
        </div>
      </footer>

      <div id="toast" className={`toast ${toastVisible ? 'show' : ''}`} role="alert" aria-live="polite">
        <span id="toast-message">{toastMsg}</span>
      </div>
    </>
  );
}
