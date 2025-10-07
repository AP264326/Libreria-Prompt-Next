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

  /* ===== Simulatore Elettrico (Prompt 1–4 aggiornati) ===== */
  {
    id: 'se1',
    title: 'Simulatore Elettrico – Estrazione Fattura (PDF)',
    category: 'Simulatore Elettrico',
    description: 'Estrai in modo accurato i dati principali da una fattura elettrica per la simulazione comparativa.',
    text:
      "Simulatore Elettrico\n\n🔹 Prompt 1 – Estrazione Fattura Cliente (PDF)\n🎯 Obiettivo\nEstrarre in modo accurato i dati principali da una fattura elettrica per usarli nella simulazione comparativa.\n📥 Input richiesto\n• File PDF della fattura del cliente.\n🧰 Attività richieste\nLeggi il PDF ed estrai:\n• Periodo di competenza (dal/al) e mese/i di riferimento\n• POD, tensione di fornitura (BT/MT), potenza impegnata\n• Consumi kWh totali e per fasce (F1, F2, F3 se disponibili)\n• Prezzi €/kWh applicati (per fascia o medi)\n• PCV mensile o altri canoni fissi/abbonamenti\n• Offerta attiva (nome, tipologia, durata, date inizio/fine)\n• Penali, clausole di rinnovo, vincoli\n• Altre componenti di materia energia presenti in fattura: dispacciamento, sbilanciamento, perdite, reattiva, ASOS, ARIM, perequazioni\n• Eventuali note utili (es. multisito, turnazioni, orari di produzione)\n📤 Output atteso\n• Tabella: Voce | Valore | Note\n• Blocco “Altri dati rilevanti”: periodo, consumi totali e per fascia, prezzo medio €/kWh, tensione BT/MT, PCV, offerta attiva, penali/vincoli, dispacciamento e sbilanciamento da fattura, altre componenti\n⚠️ Se un dato non è disponibile → “Non reperito / Da verificare”\n🚫 Non generare codice o script di programmazione\n🔚 Al termine, scrivi sempre:\n✅ Output completato – in attesa del Prompt 2",
    tags: ['1']
  },
  {
    id: 'se2',
    title: 'Simulatore Elettrico – Analizzatore Offerte (Excel)',
    category: 'Simulatore Elettrico',
    description: 'Pulizia e standardizzazione offerte da Excel (Riepilogo CTE) per l’analisi comparativa.',
    text:
      "🔹 Prompt 2 – Analisi Offerte da Excel (Riepilogo CTE)\n🎯 Obiettivo\nPulire, standardizzare e preparare le offerte commerciali dal file Excel per l’analisi comparativa.\n📥 Input richiesto\n• File Excel Riepilogo CTE (struttura costante)\n🧰 Attività richieste\n1. Pre-elaborazione file:\n  o Rimuovi merge e intestazioni multiple\n  o Assegna a ogni colonna un nome chiaro e univoco\n2. Standardizza le colonne principali:\n  o Nome_Offerta\n  o Tipo_Prezzo (TReND, FIX, MIX, ABB+PUN, PUN)\n  o PCV_mensile\n  o Durata_mesi\n  o Validità_DAL, Validità_AL\n  o Prezzi Lordo Perdite (F1, F2, F3)\n  o Note/Vincoli\n3. Formula_Tariffaria (compatta):\n  o TReND/PUN = PCV + (PUN + Prezzo_Lordo_Perdite) × kWh\n  o FIX = PCV + Prezzo fisso × kWh\n  o MIX = Quota Fissa % × Prezzo fisso + Quota Variabile % × (PUN+α)\n  o ABB+PUN = Abbonamento + PUN × kWh\n  o Se PCV=0 → offerta senza quota fissa\n4. Flag diagnostici:\n  o Valutabile\n  o Motivo_Non_Valutabile\n  o PCV_zero\n  o Richiede_PUN\n  o Formula_validata\n📤 Output atteso\n• Tabella con offerte strutturate e flag\n• Salva file come “Riepilogo CTE standard.xlsx”\n• Conferma in chat quante offerte sono valutabili\n🚫 Non generare codice o script di programmazione\n🔚 Al termine, scrivi sempre:\n✅ Output completato – in attesa del Prompt 3",
    tags: ['2']
  },
  {
    id: 'se3',
    title: 'Simulatore Elettrico – Confronto & Risparmio',
    category: 'Simulatore Elettrico',
    description: 'Confronta fornitura attuale vs offerte e calcola risparmio stimato.',
    text:
      "🔹 Prompt 3 – Confronto & Simulazione Risparmio\n🎯 Obiettivo\nConfrontare la fornitura attuale con le offerte a portafoglio e calcolare il risparmio stimato.\n📥 Input richiesto\n• Dati estratti dalla fattura (Prompt 1)\n• File Excel Riepilogo CTE standard.xlsx (Prompt 2)\n🧰 Attività richieste\n1. Recupero PUN GME:\n  o Usa il valore €/kWh del mese (o media ponderata se più mesi)\n  o Recupera dal sito GME\n  o Se non reperibile → chiedi all’utente\n2. Calcolo spesa attuale:\n  o Σ [kWh_fascia × prezzo_fascia da bolletta] + PCV\n  o ➕ Dispacciamento + Sbilanciamento presi direttamente dalla fattura\n3. Calcolo spesa offerte alternative:\n  o Applica Formula_Tariffaria del Prompt 2\n  o Usa Prezzi Lordo Perdite dal CTE (già inclusivi delle perdite)\n  o Includi sempre: PCV, quota energia, quota fissa/variabile\n4. Comparazione e ranking:\n  o Calcola spesa mensile e annua\n  o Determina risparmio mensile e annuo\n  o Ordina offerte per risparmio annuo decrescente\n  o Escludi offerte non valutabili, spiegando il motivo\n📤 Output atteso\n• Tabella in chat con colonne: Nome Offerta | Tipo Prezzo | Spesa Attuale Mensile/Annua | Spesa Offerta Mensile/Annua | Risparmio Mensile/Annuale | Durata | Note\n• File Excel “Confronto_offerte_risparmio.xlsx” con le stesse colonne\n• Sintesi finale in 5 righe: offerta consigliata, risparmio stimato, motivi principali, vincoli, prossimo step\n🚫 Non generare codice o script di programmazione\n🔚 Al termine, scrivi sempre:\n✅ Output completato – in attesa del Prompt 4",
    tags: ['3']
  },
  {
    id: 'se4',
    title: 'Simulatore Elettrico – Report Consulenziale',
    category: 'Simulatore Elettrico',
    description: 'Genera un report chiaro e professionale per il cliente sulla base del confronto eseguito.',
    text:
      "🔹 Prompt 4 – Report Consulenziale\n\n🎯 Obiettivo\nGenerare un report chiaro e professionale per il cliente sulla base del confronto eseguito.\n\n📥 Input richiesto\n• Tabella comparativa dal Prompt 3\n\n🧰 Attività richieste\n• Identifica offerta più conveniente\n• Indica risparmio stimato (mensile e annuo)\n• Elenca miglioramenti contrattuali\n• Evidenzia rischi o vincoli\n• Suggerisci azioni successive\n\n📤 Output atteso\n• Report in 3–4 paragrafi, tono professionale e leggibile per decisori non tecnici, con:\n  • Offerta consigliata e risparmio stimato\n  • Vantaggi contrattuali\n  • Rischi/vincoli\n  • Next step operativo (e scadenze)\n• Tabella riepilogativa: Nome Offerta | Spesa Annua | Risparmio | Vantaggi | Vincoli | Raccomandazione\n\n🚫 Non generare codice o script di programmazione\n\n🔚 Al termine, scrivi sempre:\n✅ Output completato – simulazione completata",
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

  /* ===== Lettura Consumi Next (aggiornato) ===== */
  {
    id: 'lc1',
    title: 'Lettura Consumi Next – Analisi fasce',
    category: 'Lettura Consumi Next',
    description: 'Estrai e analizza i consumi mensili distinguendo letture progressive vs consumi reali. Tabella + grafici.',
    text:
      "🔹 Analisi Consumi/Letture Next \n\n🎯 Obiettivo\nEstrarre e analizzare i consumi elettrici mensili da file Excel, distinguendo automaticamente tra letture progressive e consumi reali. Restituire tabella riepilogativa + grafici.\n\n📥 Input richiesto\n• File Excel con colonne:\n\nPeriodo (colonna A)\n\nConsumo F1 (kWh) (colonna F)\n\nConsumo F2 (kWh) (colonna G)\n\nConsumo F3 (kWh) (colonna H)\n\nPotenza massima (kW) (colonna AJ)\n\n🧠 Attività da svolgere\n\nPre-processing\n\nConverti eventuali valori testo → numerici.\n\nIgnora righe vuote o con valori anomali.\n\nSe tutti i valori F1/F2/F3 = 0 → escludi il mese.\n\nDistinzione Consumi vs Letture\n\nSe i valori mensili crescono in modo costante senza oscillazioni → considera letture progressive → calcola il consumo del mese = differenza tra mese corrente e precedente.\n\nSe i valori oscillano (in aumento o diminuzione) → considera consumi reali → usa i valori così come sono.\n\nCalcoli richiesti\n\nConsumo mensile per fascia (F1, F2, F3).\n\nConsumo totale mensile = F1+F2+F3.\n\nPotenza massima mensile (riportata dalla colonna AJ).\n\nRiepilogo annuo:\n• Totale F1, F2, F3 e totale complessivo (in kWh e in MWh).\n• % di ciascuna fascia sul totale.\n• Potenza massima annua = valore massimo fra i mesi.\n\n📤 Output atteso\n\nTabella riepilogativa mensile con colonne:\nPeriodo | F1 (kWh) | F2 (kWh) | F3 (kWh) | Totale mensile (kWh) | Potenza max (kW)\n\nuna riga finale di riepilogo con Totale annuo (MWh) e % per fascia.\n\nGrafico:\n\nA linee o barre con consumi mensili suddivisi per fascia + totale.\n\nSintesi testuale chiara:\n\nConsumi annui totali (MWh).\n\nRipartizione % F1, F2, F3.\n\nPotenza massima riscontrata.\n\nEvidenzia se i dati erano letture progressive o consumi reali.\n\n⚠️ Guardrail\n\nNon generare codice o script.\n\nSe un dato non è disponibile, scrivi “Non reperito / Da verificare”.\n\n🔚 Chiusura\n✅ Output completato – analisi terminata."
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

  /* ===== Analisi di Mercato ===== */
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
  },

  /* ===== Nuovo: Generatore di Prompt ===== */
  {
    id: 'gp1',
    title: 'Generatore di Prompt',
    category: 'Generatore di Prompt',
    description:
      'Assistente per creare prompt ottimali con revisione, suggerimenti e domande iterative.',
    text:
      "Voglio che tu diventi il mio Creatore di Prompt personale.\n \nIl tuo obiettivo è aiutarmi a creare il miglior prompt possibile per le mie esigenze. I prompt saranno utilizzati da te, Copilot.\n \nDovrai seguire alla lettera il processo seguente.\n \nLa tua prima risposta sarà chiedermi di cosa dovrebbe trattare il prompt. Fornirò la mia risposta, ma dovremo migliorarla attraverso iterazioni continue passando attraverso i passaggi successivi.\n \nLa tua risposta dovrà quindi essere costituita da 3 sezioni:\n \nA.) Rivedi il prompt (fornisci il tuo prompt riscritto). Dovrebbe essere chiaro, conciso e facilmente compreso da te. \nB.) Suggerimenti (forniscimi dei suggerimenti riguardo quali dettagli includere nei prompt per migliorarli.) \nC.) Domande (fai domande pertinenti relative a quale informazione aggiuntiva migliorerebbe il prompt)"
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

  /* ===== Bootstrap ===== */
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

  // auto-apri disclaimer alla prima visita
  useEffect(() => {
    try {
      const accepted = localStorage.getItem(DISCLAIMER_KEY) === '1';
      if (!accepted) setDisclaimerOpen(true);
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

  /* ===== Import .docx (solo Admin) ===== */
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

  /* ===== Admin ===== */
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

  /* ===== Reset Libreria (solo Admin) ===== */
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

  /* ===== Disclaimer ===== */
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
                <option value="Generatore di Prompt">Generatore di Prompt</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
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

      {/* Modale Dettagli */}
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

      {/* Modale Admin */}
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

      {/* Modale Disclaimer */}
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

      {/* Footer */}
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

      {/* Toast */}
      <div id="toast" className={`toast ${toastVisible ? 'show' : ''}`} role="alert" aria-live="polite">
        <span id="toast-message">{toastMsg}</span>
      </div>
    </>
  );
}
