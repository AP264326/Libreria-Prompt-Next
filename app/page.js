// app/page.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* ===========================
   DATI PROMPT LIBRERIA
=========================== */
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

/* ===========================
   HELPERS
=========================== */
function escapeHtml(t=''){return String(t).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
function escapeRegExp(s=''){return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function highlight(txt='',q=''){if(!q.trim())return escapeHtml(txt);const re=new RegExp(`(${q.split(/\s+/).map(escapeRegExp).join("|")})`,"gi");return escapeHtml(txt).replace(re,"<mark>$1</mark>")}

/* ===========================
   COMPONENT
=========================== */
export default function Page() {
  const [search,setSearch]=useState('');
  const [category,setCategory]=useState('');
  const [favorites,setFavorites]=useState(new Set());
  const [showOnlyFav,setShowOnlyFav]=useState(false);
  const [toast,setToast]=useState('');
  const [modalOpen,setModalOpen]=useState(false);
  const [activePrompt,setActivePrompt]=useState(null);
  const [theme,setTheme]=useState('light');

  // Carica preferiti
  useEffect(()=>{try{const saved=sessionStorage.getItem('promptFavorites');if(saved)setFavorites(new Set(JSON.parse(saved)));}catch{}},[]);

  // ESC chiude modale
  useEffect(()=>{const onKey=e=>{if(e.key==='Escape')setModalOpen(false)};if(modalOpen)window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[modalOpen]);

  // Cambia tema
  useEffect(()=>{document.documentElement.setAttribute('data-color-scheme',theme)},[theme]);

  const filtered = useMemo(()=>PROMPTS_DATA.filter(p=>{
    const term=search.toLowerCase();
    const matchSearch=!term||p.title.toLowerCase().includes(term)||p.description.toLowerCase().includes(term)||p.category.toLowerCase().includes(term);
    const matchCat=!category||p.category===category;
    const matchFav=!showOnlyFav||favorites.has(p.id);
    return matchSearch&&matchCat&&matchFav;
  }),[search,category,showOnlyFav,favorites]);

  const copyPrompt=id=>{
    const p=PROMPTS_DATA.find(x=>x.id===id); if(!p) return;
    navigator.clipboard.writeText(p.text).then(()=>setToast("📋 Prompt copiato!")).catch(()=>setToast("Errore copia"));
    setTimeout(()=>setToast(''),2000);
  };

  const toggleFavorite=id=>{
    const next=new Set(favorites);
    next.has(id)?next.delete(id):next.add(id);
    setFavorites(next);
    sessionStorage.setItem('promptFavorites',JSON.stringify([...next]));
  };

  return (
    <>
      <header className="header">
        <div className="container header-content">
          <h1 className="header-title">📚 Prompt Library B2B</h1>
          <div className="header-actions">
            <button className="btn-blue" onClick={()=>setShowOnlyFav(s=>!s)}>
              {showOnlyFav?"⭐ Tutti":"⭐ Preferiti"}
            </button>
            <button className="btn--outline" onClick={()=>setTheme(theme==='light'?'dark':'light')}>
              {theme==='light'?'🌙 Dark':'☀️ Light'}
            </button>
          </div>
        </div>
        <div className="container header-controls">
          <div className="search-container">
            <input className="form-control search-input" placeholder="Cerca prompt..."
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="filter-container">
            <select className="form-control" value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="">Tutte le categorie</option>
              <option>Scouting</option>
              <option>Profilazione Cliente B2B (Identikit)</option>
              <option>Prospecting</option>
              <option>Proposition</option>
              <option>Simulatore Elettrico</option>
              <option>Preventivatore Simulatore FV</option>
              <option>Lettura Consumi Next</option>
              <option>Negoziazione/Follow-up</option>
              <option>Gestione Customer Base</option>
            </select>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container prompts-grid">
          {filtered.map(p=>(
            <div key={p.id} className="prompt-card">
              <div className="prompt-card__header">
                <h3 className="prompt-card__title" dangerouslySetInnerHTML={{__html:highlight(p.title,search)}} />
                <span className="prompt-card__category">{p.category}</span>
              </div>
              <div className="prompt-card__description clamp-2" dangerouslySetInnerHTML={{__html:highlight(p.description,search)}}/>
              <div className="prompt-card__meta">
                <button className="link-btn" onClick={()=>{setActivePrompt(p);setModalOpen(true)}}>Dettagli ⤵︎</button>
              </div>
              <div className="prompt-card__actions">
                <button className="btn-blue" onClick={()=>copyPrompt(p.id)}>📋 Copia</button>
                <button className={`favorite-btn ${favorites.has(p.id)?'active':''}`} onClick={()=>toggleFavorite(p.id)}>
                  {favorites.has(p.id)?'⭐':'☆'}
                </button>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="no-results"><p>Nessun prompt trovato.</p></div>}
        </div>
      </main>

      {modalOpen&&activePrompt&&(
        <div className="modal-backdrop" onClick={e=>{if(e.target.classList.contains("modal-backdrop"))setModalOpen(false)}}>
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">{activePrompt.title}</h3>
              <button className="modal__close" onClick={()=>setModalOpen(false)}>✕</button>
            </div>
            <div className="modal__category">{activePrompt.category}</div>
            <p className="modal__desc">{activePrompt.description}</p>
            <div className="modal__body"><pre className="modal__code">{activePrompt.text}</pre></div>
            <div className="modal__actions">
              <button className="btn-blue" onClick={()=>copyPrompt(activePrompt.id)}>📋 Copia</button>
              <button className={`favorite-btn ${favorites.has(activePrompt.id)?'active':''}`} onClick={()=>toggleFavorite(activePrompt.id)}>
                {favorites.has(activePrompt.id)?'⭐ Rimuovi':'☆ Aggiungi'}
              </button>
              <button className="btn-ghost" onClick={()=>setModalOpen(false)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="container">
          <p>Realizzato con ❤️ da <strong>Alfredo Palermi</strong></p>
        </div>
      </footer>

      {toast&&<div className="toast show">{toast}</div>}
    </>
  );
}
