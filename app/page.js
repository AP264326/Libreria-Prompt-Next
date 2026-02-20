// app/page.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* ===================== DATI DI DEFAULT ===================== */
const DEFAULT_PROMPTS = [
  {
    id: 's1',
    title: 'Elenco aziende B2B',
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
      "Analizza l'azienda [NOME_AZIENDA] e crea un identikit approfondito orientato alla consulenza energetica. Raccogli e sintetizza le seguenti informazioni (se disponibili da fonti pubbliche):\n🔹 Profilo generale dell'azienda\n– Ragione sociale, anno di fondazione, struttura societaria\n– Storia e sviluppo aziendale\n– Settore merceologico / categoria ATECO\n– Sedi operative, stabilimenti e presenza territoriale\n🔹 Dimensioni e struttura economica\n– Numero dipendenti\n– Fatturato annuo e trend economico (ultimi 3 anni)\n– Presenza di stabilimenti energivori o grandi superfici\n🔹 Consumo e fabbisogno energetico potenziale\n– Indizi sulla potenza impegnata / consumi elettrici stimati\n– Tipologia di utenze: produttive, logistiche, direzionali, commerciali\n– Presenza di turnazioni h24 o lavorazioni energivore\n🔹 Stato attuale dell'approvvigionamento energetico\n– Indizi su contratti luce/gas\n– Presenza di sistemi di monitoraggio energetico\n– Presenza di impianti di autoproduzione (es. fotovoltaico, cogenerazione)\n– Presenza di colonnine EV o politiche ESG\n🔹 Altri elementi strategici o opportunità commerciali\n– Eventuali criticità energetiche o opportunità di ottimizzazione\n– Progetti recenti di efficienza energetica, sostenibilità o digitalizzazione\n– Collaborazioni con ESCo o consulenti energetici\nFornisci il profilo sotto forma di scheda strutturata (tipo report operativo per consulente). Evidenzia opportunità di intervento commerciale, criticità e punti di forza. Se i dati non sono disponibili, segnala l'informazione come non reperita.",
    tags: ['Perplexity'],
    variables: [
      { name: 'NOME_AZIENDA', label: 'Nome Azienda', placeholder: 'es. Acme Srl', type: 'text' }
    ]
  },
  {
    id: 'pr1',
    title: 'Prospecting – Pacchetto primo contatto',
    category: 'Prospecting',
    description:
      'Email di presentazione, script telefonico, domande e obiezioni per il primo contatto con cliente potenziale.',
    text:
      "Crea un pacchetto completo con i miei dati [TUO_NOME_COGNOME], ruolo [TUO_RUOLO], sede di lavoro [TUA_SEDE] e contatti [TUOI_CONTATTI], per un primo contatto con il potenziale cliente [NOME_CLIENTE], includendo:\n1. Un'email di presentazione efficace che offra gratuitamente un'analisi dettagliata della bolletta elettrica e un check-up energetico personalizzato.\n2. Uno script telefonico strutturato per il follow-up, orientato a coinvolgere il cliente e fissare un appuntamento.\n3. Tre domande chiave da porre durante la telefonata per valutare la qualificazione del cliente rispetto a un'offerta fotovoltaica o a una consulenza sulla bolletta.\n4. Tre obiezioni comuni che il cliente potrebbe sollevare, con relative risposte persuasive e professionali per superarle.",
    variables: [
      { name: 'TUO_NOME_COGNOME', label: 'Il tuo nome e cognome', placeholder: 'es. Mario Rossi', type: 'text' },
      { name: 'TUO_RUOLO', label: 'Il tuo ruolo', placeholder: 'es. Energy Consultant', type: 'text' },
      { name: 'TUA_SEDE', label: 'La tua sede di lavoro', placeholder: 'es. Milano', type: 'text' },
      { name: 'TUOI_CONTATTI', label: 'I tuoi contatti', placeholder: 'es. mario.rossi@email.it, +39 123 456 7890', type: 'text' },
      { name: 'NOME_CLIENTE', label: 'Nome del cliente', placeholder: 'es. Beta Industries', type: 'text' }
    ]
  },
  {
    id: 'pp1',
    title: 'Proposition – Offerta impianto FV',
    category: 'Proposition',
    description:
      'Proposta commerciale fotovoltaico con ROI e confronto bolletta.',
    text:
      'Crea una proposta commerciale per il cliente [NOME_AZIENDA], evidenziando i benefici di un impianto fotovoltaico da [KWP] kWp, ROI stimato in [ANNI_ROI] anni, e confronto con il costo attuale in bolletta.',
    variables: [
      { name: 'NOME_AZIENDA', label: 'Nome Azienda Cliente', placeholder: 'es. Delta Srl', type: 'text' },
      { name: 'KWP', label: 'Potenza impianto (kWp)', placeholder: 'es. 100', type: 'number' },
      { name: 'ANNI_ROI', label: 'Anni ROI stimato', placeholder: 'es. 5', type: 'number' }
    ]
  },
  {
  id: 'co2',
  title: 'Proposition – Simulatore Emissioni CO₂',
  category: 'Proposition',
  description: 'Calcola emissioni CO₂ da consumi luce/gas, simula scenari di riduzione e genera report tecnico-commerciale con KPI, tabelle e grafici descritti.',
  tags: ['ESG'],
  text:
    "🔹 Prompt – Simulatore Emissioni CO₂ (Premium)\n\n🎯 Titolo Prompt\nPrompt – Simulatore Emissioni CO₂ (B2B Premium: fattura, KPI, grafici ottimizzati, benchmark settoriale, export)\n\n🧠 Ruolo dell’AI\nAgisci come consulente ESG per aziende B2B. Calcola le emissioni di CO₂ equivalenti in base ai consumi energetici del cliente, simula scenari di riduzione e genera un output tecnico + commerciale completo, con tabelle, KPI e grafici descritti in modo leggibile e coerente. Non inventare mai dati.\n\n📌 Contesto operativo\nIl consulente allega la fattura del cliente (PDF o immagine).\nLeggi i consumi annui di energia elettrica (kWh) e gas naturale (Smc).\nSe non reperibili, chiedi all’utente di fornirli manualmente.\nSe l’utente non li inserisce → scrivi “Non reperibile” e termina l’analisi.\n\n📥 Input richiesti\n• Consumo annuo elettricità (kWh) → da fattura o input utente\n• Consumo annuo gas (Smc) → da fattura o input utente\n• Fattori di emissione (se non specificati, usa default EU):\n  – 0,233 kg CO₂/kWh elettrico\n  – 2,05 kg CO₂/Smc gas\n• Scenari di riduzione (ordine progressivo):\n  1️⃣ Efficienza (–10 %)\n  2️⃣ Autoproduzione (–30 %)\n  3️⃣ Energia 100 % Green\n• Conversione opzionale: 1 albero ≈ 0,021 ton CO₂/anno\n• Settore del cliente (logistica, alimentare, GDO, manifattura, servizi, ecc.)\n\n📤 Output atteso\n🔸 **KPI sintetici (box)**\n• Emissioni attuali (ton CO₂ eq.)\n• Riduzione potenziale (%)\n• Alberi equivalenti\n\n🔸 **Tabella scenari**\nRighe → Attuale | Scenario 1 (Efficienza) | Scenario 2 (Autoproduzione) | Scenario 3 (100 % Green)\nColonne → Elettricità (ton) | Gas (ton) | Totale (ton) | Riduzione (%)\n\n🔸 **Grafici descritti (testuali)**\n• Grafico a torta → quota % emissioni elettricità vs gas.\n• Grafico a barre → confronto Attuale vs Scenario 1 vs Scenario 2 vs Scenario 3.\n  Specifiche:\n  – Colori fissi → Blu (Attuale), Arancione (Efficienza), Verde (Autoproduzione), Viola (100 % Green)\n  – Barre ampie e distanziate (min 40 px)\n  – Etichette numeriche in grassetto sopra ogni barra\n  – Asse Y con step regolari (0 | 50 | 100 | 150 | 200)\n  – Legenda chiara in alto a destra\n\n🔸 **Benchmark di settore**\nConfronta le emissioni del cliente con la media del settore.\nEsempio: “La tua azienda emette il XX % in più/meno rispetto alla media del settore {{settore}}”.\nSe non disponibile → scrivi “Non reperibile”.\n\n🔸 **Storytelling settoriale personalizzato**\nAdatta il messaggio al settore del cliente (es.: logistica → camion diesel; alimentare → catena del freddo; GDO → immagine green).\n\n🔸 **Export documento (mini-report)**\nStruttura il risultato come bozza di slide o report Word/PDF con sezioni:\n1. Copertina (titolo e logo cliente)\n2. KPI principali\n3. Tabella scenari e descrizione grafici\n4. Benchmark di settore\n5. Pitch finale commerciale (max 3 righe, linguaggio semplice, orientato al cliente)\n\n⚙️ Regole\n• Non inventare dati o valori stimati.\n• Se i consumi non sono reperibili e non vengono forniti → scrivi “Non reperibile” e termina.\n• Specifica sempre i fattori di emissione utilizzati.\n• Usa stile chiaro, professionale, orientato alla consulenza e alla presentazione commerciale."
  },
  {
  id: 'prop_benchmark1',
  title: 'Proposition – Benchmark Competitor Energetico (PUN GME)',
  category: 'Proposition',
  description: 'Confronta un’offerta competitor con le nostre offerte interne utilizzando il PUN ufficiale GME e genera una tabella comparativa completa.',
  tags: ['Benchmark'],
  text:
    "🔹 Prompt 1 – Benchmark Competitor Energetico (Ottimizzato con PUN GME)\n\n🎯 Titolo Prompt\nPrompt – Benchmark Competitor Energetico (B2B, con PUN GME)\n\n🧠 Ruolo dell’AI\nAgisci come analista commerciale B2B specializzato in offerte energetiche. Devi confrontare l’offerta del competitor allegata con le nostre offerte a portafoglio ed evidenziare differenze chiave, utilizzando il PUN ufficiale GME come riferimento.\n\n📌 Contesto operativo\nIl consulente riceve un’offerta concorrente in PDF o immagine.\nTu devi:\n• Estrarre dall’offerta competitor le condizioni economiche principali (PCV, spread, durata, servizi inclusi).\n• Confrontarle con le nostre offerte interne disponibili in Excel.\n• Considerare il prezzo PUN valido per il mese di riferimento (dal sito ufficiale GME, oppure dal file Excel allegato se non disponibile online).\n\n📥 Input richiesti\n• Offerta competitor (PDF/immagine)\n• Excel con offerte interne (inclusa tabella con PUN mensile)\n• Dati cliente: consumo annuo (kWh e/o Smc), tensione (BT/MT), tipologia cliente, mese di riferimento\n\n📤 Output atteso\n• Tabella comparativa con colonne: Fornitore | Prezzo energia (PUN+spread) | PCV mensile | Durata contratto | Servizi inclusi | Note\n• Riepilogo PUN usato: valore, mese, fonte (GME o Excel)\n• Commento finale (max 6 righe) con:\n  – Punti di forza competitor\n  – Punti di forza nostra offerta\n  – Raccomandazione dell’offerta più adatta al cliente\n\n⚙️ Regole\n• Usa il PUN medio mensile ufficiale dal sito GME; se non reperibile, utilizza quello presente nell’Excel allegato.\n• Non inventare dati: se un valore non è leggibile scrivi “Non reperibile”.\n• Confronta solo parametri omogenei (PCV vs PCV, spread vs spread).\n• Stile tecnico ma chiaro, pensato per un consulente commerciale."
  },

  /* ===== Simulatore Elettrico (Prompt 1–4 aggiornati) ===== */
  {
    id: 'se1',
    title: 'Simulatore Elettrico – Estrazione Fattura (PDF)',
    category: 'Simulatore Elettrico',
    description: 'Estrai in modo accurato i dati principali da una fattura elettrica per la simulazione comparativa.',
    text:
      "Simulatore Elettrico\n\n🔹 Prompt 1 – Estrazione Fattura Cliente (PDF)\n🎯 Obiettivo\nEstrarre in modo accurato i dati principali da una fattura elettrica per usarli nella simulazione comparativa.\n📥 Input richiesto\n• File PDF della fattura del cliente.\n🧰 Attività richieste\nLeggi il PDF ed estrai:\n• Periodo di competenza (dal/al) e mese/i di riferimento\n• POD, tensione di fornitura (BT/MT), potenza impegnata\n• Consumi kWh totali e per fasce (F1, F2, F3 se disponibili)\n• Prezzi €/kWh applicati (per fascia o medi)\n• PCV mensile o altri canoni fissi/abbonamenti\n• Offerta attiva (nome, tipologia, durata, date inizio/fine)\n• Penali, clausole di rinnovo, vincoli\n• Altre componenti di materia energia presenti in fattura: dispacciamento, sbilanciamento, perdite, reattiva, ASOS, ARIM, perequazioni\n• Eventuali note utili (es. multisito, turnazioni, orari di produzione)\n📤 Output atteso\n• Tabella: Voce | Valore | Note\n• Blocco “Altri dati rilevanti”: periodo, consumi totali e per fascia, prezzo medio €/kWh, tensione BT/MT, PCV, offerta attiva, penali/vincoli, dispacciamento e sbilanciamento da fattura, altre componenti\n⚠️ Se un dato non è disponibile → “Non reperito / Da verificare”\n🚫 Non generare codice o script di programmazione\n🔚 Al termine, scrivi sempre:\n✅ Output completato – in attesa del Prompt 2",
    tags: ['P1']
  },
  {
    id: 'se2',
    title: 'Simulatore Elettrico – Analizzatore Offerte (Excel)',
    category: 'Simulatore Elettrico',
    description: 'Pulizia e standardizzazione offerte da Excel (Riepilogo CTE) per l’analisi comparativa.',
    text:
      "🔹 Prompt 2 – Analisi Offerte da Excel (Riepilogo CTE)\n🎯 Obiettivo\nPulire, standardizzare e preparare le offerte commerciali dal file Excel per l’analisi comparativa.\n📥 Input richiesto\n• File Excel Riepilogo CTE (struttura costante)\n🧰 Attività richieste\n1. Pre-elaborazione file:\n  o Rimuovi merge e intestazioni multiple\n  o Assegna a ogni colonna un nome chiaro e univoco\n2. Standardizza le colonne principali:\n  o Nome_Offerta\n  o Tipo_Prezzo (TReND, FIX, MIX, ABB+PUN, PUN)\n  o PCV_mensile\n  o Durata_mesi\n  o Validità_DAL, Validità_AL\n  o Prezzi Lordo Perdite (F1, F2, F3)\n  o Note/Vincoli\n3. Formula_Tariffaria (compatta):\n  o TReND/PUN = PCV + (PUN + Prezzo_Lordo_Perdite) × kWh\n  o FIX = PCV + Prezzo fisso × kWh\n  o MIX = Quota Fissa % × Prezzo fisso + Quota Variabile % × (PUN+α)\n  o ABB+PUN = Abbonamento + PUN × kWh\n  o Se PCV=0 → offerta senza quota fissa\n4. Flag diagnostici:\n  o Valutabile\n  o Motivo_Non_Valutabile\n  o PCV_zero\n  o Richiede_PUN\n  o Formula_validata\n📤 Output atteso\n• Tabella con offerte strutturate e flag\n• Salva file come “Riepilogo CTE standard.xlsx”\n• Conferma in chat quante offerte sono valutabili\n🚫 Non generare codice o script di programmazione\n🔚 Al termine, scrivi sempre:\n✅ Output completato – in attesa del Prompt 3",
    tags: ['P2']
  },
  {
    id: 'se3',
    title: 'Simulatore Elettrico – Confronto & Risparmio',
    category: 'Simulatore Elettrico',
    description: 'Confronta fornitura attuale vs offerte e calcola risparmio stimato.',
    text:
      "🔹 Prompt 3 – Confronto & Simulazione Risparmio\n🎯 Obiettivo\nConfrontare la fornitura attuale con le offerte a portafoglio e calcolare il risparmio stimato.\n📥 Input richiesto\n• Dati estratti dalla fattura (Prompt 1)\n• File Excel Riepilogo CTE standard.xlsx (Prompt 2)\n🧰 Attività richieste\n1. Recupero PUN GME:\n  o Usa il valore €/kWh del mese (o media ponderata se più mesi)\n  o Recupera dal sito GME\n  o Se non reperibile → chiedi all’utente\n2. Calcolo spesa attuale:\n  o Σ [kWh_fascia × prezzo_fascia da bolletta] + PCV\n  o ➕ Dispacciamento + Sbilanciamento presi direttamente dalla fattura\n3. Calcolo spesa offerte alternative:\n  o Applica Formula_Tariffaria del Prompt 2\n  o Usa Prezzi Lordo Perdite dal CTE (già inclusivi delle perdite)\n  o Includi sempre: PCV, quota energia, quota fissa/variabile\n4. Comparazione e ranking:\n  o Calcola spesa mensile e annua\n  o Determina risparmio mensile e annuo\n  o Ordina offerte per risparmio annuo decrescente\n  o Escludi offerte non valutabili, spiegando il motivo\n📤 Output atteso\n• Tabella in chat con colonne: Nome Offerta | Tipo Prezzo | Spesa Attuale Mensile/Annua | Spesa Offerta Mensile/Annua | Risparmio Mensile/Annuale | Durata | Note\n• File Excel “Confronto_offerte_risparmio.xlsx” con le stesse colonne\n• Sintesi finale in 5 righe: offerta consigliata, risparmio stimato, motivi principali, vincoli, prossimo step\n🚫 Non generare codice o script di programmazione\n🔚 Al termine, scrivi sempre:\n✅ Output completato – in attesa del Prompt 4",
    tags: ['P3']
  },
  {
    id: 'se4',
    title: 'Simulatore Elettrico – Report Consulenziale',
    category: 'Simulatore Elettrico',
    description: 'Genera un report chiaro e professionale per il cliente sulla base del confronto eseguito.',
    text:
      "🔹 Prompt 4 – Report Consulenziale\n\n🎯 Obiettivo\nGenerare un report chiaro e professionale per il cliente sulla base del confronto eseguito.\n\n📥 Input richiesto\n• Tabella comparativa dal Prompt 3\n\n🧰 Attività richieste\n• Identifica offerta più conveniente\n• Indica risparmio stimato (mensile e annuo)\n• Elenca miglioramenti contrattuali\n• Evidenzia rischi o vincoli\n• Suggerisci azioni successive\n\n📤 Output atteso\n• Report in 3–4 paragrafi, tono professionale e leggibile per decisori non tecnici, con:\n  • Offerta consigliata e risparmio stimato\n  • Vantaggi contrattuali\n  • Rischi/vincoli\n  • Next step operativo (e scadenze)\n• Tabella riepilogativa: Nome Offerta | Spesa Annua | Risparmio | Vantaggi | Vincoli | Raccomandazione\n\n🚫 Non generare codice o script di programmazione\n\n🔚 Al termine, scrivi sempre:\n✅ Output completato – simulazione completata",
    tags: ['P4']
  },

  {
    id: 'fv1',
    title: 'Simulatore Preventivatore FV – Pre-preventivo',
    category: 'Preventivatore Simulatore FV',
    description: 'Calcola pre-preventivo fotovoltaico con scenari e ROI.',
    text:
      'Genera un pre-preventivo fotovoltaico per [azienda B2B]. L\'utente fornirà: consumi annui per fasce, superficie, località, tipologia pannello, costi unitari, ecc. Il sistema deve calcolare costi, produzione, autoconsumo, risparmio, ROI, incentivi 2025, grafico scenari (base, accumulo, accumulo+colonnina), numero pannelli, report PDF scaricabile, salvataggio dati.'
  },
  {
  id: 'fv2',
  title: 'Pre-Preventivatore FV + Storage (B2B)',
  category: 'Preventivatore Simulatore FV',
  description: 'Stima economica e ambientale di un impianto FV con e senza storage: risparmi, payback, CO₂ evitata, alberi equivalenti.',
  text:
    "🔹 Prompt – Pre-Preventivatore FV + Storage (B2B)\n\n🎯 Ruolo\nAgisci come consulente energetico B2B. Fornisci una stima rapida e affidabile della convenienza economica e ambientale di un impianto fotovoltaico con e senza storage, basandoti sui dati della fattura del cliente e, se necessario, su parametri standard di mercato.\nTono: semplice, professionale, orientato al cliente.\n\n📥 Input prioritari (da fattura)\n• Consumo annuo elettrico (kWh)\n• Prezzo energia attuale (€/kWh)\n• Spesa annua totale (€)\n• Zona geografica: Nord | Centro | Sud\n\nSe un dato manca:\n– Chiedilo all’utente\n– Se non disponibile, usa valori standard\n\n📊 Parametri standard (se non forniti)\n• Produzione media FV → Nord: 1.100 kWh/kWp | Centro: 1.300 | Sud: 1.500\n• Costo impianto FV → 1.100 €/kWp\n• Costo storage → 500 €/kWh\n• CO₂ evitata → 0,233 kg/kWh\n• Alberi equivalenti → 20 kg CO₂/albero/anno\n• Autoconsumo FV → 65%\n• Autoconsumo FV+Storage → 80%\n• Target copertura fabbisogno → 70%\n• Dimensionamento storage → 0,8 kWh per ogni kWp FV\n\n🧮 Calcoli richiesti\n1️⃣ Dimensionamento FV (kWp) = (Consumo annuo × 70%) ÷ rendimento zona\n2️⃣ Produzione FV stimata (kWh) = kWp × rendimento zona\n3️⃣ Autoconsumo → FV = 65% | FV+Storage = 80%\n4️⃣ Spesa attuale = Consumo annuo × Prezzo energia\n5️⃣ Risparmio annuo:\n   • FV = Autoconsumo × Prezzo energia\n   • FV+Storage = Autoconsumo × Prezzo energia\n6️⃣ Investimento:\n   • FV = kWp × 1.100 €\n   • FV+Storage = FV + (kWp × 0,8 × 500 €)\n7️⃣ Payback = Investimento ÷ Risparmio annuo\n8️⃣ CO₂ evitata (ton) = Autoconsumo × 0,233 ÷ 1.000\n9️⃣ Alberi equivalenti = CO₂_kg ÷ 20\n\n📋 Output richiesto\n1️⃣ **KPI sintetici**\n\n| KPI | FV | FV+Storage |\n| --- | --- | --- |\n| Investimento iniziale (€) | XXXX | XXXX |\n| Risparmio annuo (€) | XXXX | XXXX |\n| Payback (anni) | X.X | X.X |\n| CO₂ evitata (ton) | X.X | X.X |\n| Alberi equivalenti | XXX | XXX |\n\n2️⃣ **Tabella comparativa**\n\n| Scenario | Produzione FV (kWh) | Spesa attuale (€) | Spesa con FV (€) | Risparmio (€) | Payback (anni) |\n| --- | --- | --- | --- | --- | --- |\n| Attuale | – | €XXX | – | – | – |\n| FV | YYY | €XXX | €ZZZ | €… | X.X |\n| FV+Storage | YYY | €XXX | €ZZZ | €… | X.X |\n\n3️⃣ **Pitch commerciale (max 2 frasi)**\n“Con il FV puoi ridurre la bolletta del X% e abbattere le emissioni di Y ton CO₂ (pari a Z alberi/anno).”\n“L’investimento si ripaga in W anni: da lì in poi il risparmio è netto.”\n\n4️⃣ **Nota Assunzioni**\nIndica:\n• Zona geografica\n• Rendimento FV usato\n• Target copertura fabbisogno\n• Autoconsumo FV e FV+Storage\n• Costi standard impianto e storage\n• Fattore CO₂ evitata\n• Conversione alberi equivalenti\n\n✅ Regole di presentazione\n• Stile semplice, numeri chiave in evidenza\n• Arrotondamenti:\n  – kWp → 1 decimale\n  – kWh → intero\n  – € → intero\n  – Payback → 1 decimale\n• Se un dato manca → “Non reperibile”\n• Se risparmio ≤ 0 → “Payback non calcolabile”"
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
  },

  /* ===== Nuovo: Generatore di Immagini ===== */
  {
    id: 'gi1',
    title: 'Generatore di Immagini',
    category: 'Generatore di Immagini',
    description:
      'Crea prompt ottimizzati per immagini: soggetto, scenario, stile, dettagli chiave e suggerimenti.',
    text:
      "Voglio che tu diventi il mio generatore di prompt per immagini.\n\nChiedimi prima che immagine desidero ottenere.\n\nPoi, riscrivila in un prompt breve e chiaro con:\n\n• soggetto principale\n\n• ambiente/scenario\n\n• stile visivo (realistico, cartoon, pittura, 3D, futuristico, ecc.)\n\n• dettagli chiave (colori, atmosfera, texture, prospettiva)\n\nRispondi con:\n\n• Prompt finale ottimizzato (max 2 frasi, pronto da incollare).\n\n• 1–2 suggerimenti extra per renderlo più efficace."
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

  // 🆕 NUOVI useState PER SISTEMA VARIABILI
  const [variablesModalOpen, setVariablesModalOpen] = useState(false);
  const [currentPromptForVars, setCurrentPromptForVars] = useState(null);
  const [variableValues, setVariableValues] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState('');

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
    
    // 🆕 Se il prompt ha variabili, apri il form invece di copiare direttamente
    if (p.variables && p.variables.length > 0) {
      setCurrentPromptForVars(p);
      setVariableValues({});  // resetta i valori
      setVariablesModalOpen(true);
      return;
    }
    
    // Se non ha variabili, copia normalmente
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

  // 🆕 NUOVE FUNZIONI PER GESTIRE LE VARIABILI
  const replaceVariables = (text, values) => {
    let result = text;
    Object.keys(values).forEach(key => {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      result = result.replace(regex, values[key] || `[${key}]`);
    });
    return result;
  };

  const copyWithVariables = async () => {
    if (!currentPromptForVars) return;
    
    // Verifica che tutti i campi obbligatori siano compilati
    const missingFields = currentPromptForVars.variables.filter(
      v => !variableValues[v.name] || variableValues[v.name].trim() === ''
    );
    
    if (missingFields.length > 0) {
      showToast(`⚠️ Compila tutti i campi per copiare la versione personalizzata: ${missingFields.map(v => v.label).join(', ')}`);
      return;
    }
    
    // Sostituisci le variabili nel testo
    const finalText = replaceVariables(currentPromptForVars.text, variableValues);
    
    // Copia negli appunti
    try {
      await navigator.clipboard.writeText(finalText);
      showToast('✅ Prompt personalizzato copiato negli appunti!');
      setVariablesModalOpen(false);
      setCurrentPromptForVars(null);
      setVariableValues({});
      setShowPreview(false);
      setPreviewText('');
    } catch {
      showToast('❌ Errore durante la copia.');
    }
  };

  // 🆕 Funzione per copiare il prompt ORIGINALE (con placeholder)
  const copyOriginalPrompt = async () => {
    if (!currentPromptForVars) return;
    
    try {
      await navigator.clipboard.writeText(currentPromptForVars.text);
      showToast('✅ Prompt originale copiato! Modifica i placeholder nell\'AI.');
      setVariablesModalOpen(false);
      setCurrentPromptForVars(null);
      setVariableValues({});
      setShowPreview(false);
      setPreviewText('');
    } catch {
      showToast('❌ Errore durante la copia.');
    }
  };

  // 🆕 Funzione per mostrare l'anteprima (ora SENZA controllo obbligatorio)
  const showPromptPreview = () => {
    if (!currentPromptForVars) return;
    
    // Genera il testo con le variabili sostituite (o con placeholder se vuoti)
    const finalText = replaceVariables(currentPromptForVars.text, variableValues);
    setPreviewText(finalText);
    setShowPreview(true);
  };

  // 🆕 Funzione per copiare dall'anteprima
  const copyFromPreview = async () => {
    try {
      await navigator.clipboard.writeText(previewText);
      showToast('✅ Prompt copiato negli appunti!');
      setVariablesModalOpen(false);
      setCurrentPromptForVars(null);
      setVariableValues({});
      setShowPreview(false);
      setPreviewText('');
    } catch {
      showToast('❌ Errore durante la copia.');
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
                <option value="Preventivatore Simulatore FV">Preventivatore Simulatore FV</option>
                <option value="Lettura Consumi Next">Lettura Consumi Next</option>
                <option value="Negoziazione/Follow-up">Negoziazione/Follow-up</option>
                <option value="Gestione Customer Base">Gestione Customer Base</option>
                <option value="Analisi di Mercato">Analisi di Mercato</option>
                <option value="Generatore di Prompt">Generatore di Prompt</option>
                <option value="Generatore di Immagini">Generatore di Immagini</option>
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
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', justifyContent:'space-between', width: '100%' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', flex: '1 1 auto', minWidth: 0 }}>
                      <span className="prompt-card__category">{p.category}</span>
                      {(p.tags || []).map((t, idx) => (
                        <span key={idx} style={tagStyle}>
                          {t}
                        </span>
                      ))}
                    </div>
                    {/* 🆕 Indicatore variabili */}
                    {p.variables && p.variables.length > 0 && (
                      <span 
                        style={{ 
                          background: '#10b981', 
                          color: 'white', 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          cursor: 'help',
                          flexShrink: 0,
                          marginLeft: 'auto'
                        }}
                        title={`📝 Prompt personalizzabile - Clicca "Copia" per compilare ${p.variables.length} ${p.variables.length === 1 ? 'campo' : 'campi'} su misura`}
                      >
                        📝 {p.variables.length}
                      </span>
                    )}
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

      {/* 🆕 Modale Variabili */}
      {variablesModalOpen && currentPromptForVars && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target.classList.contains('modal-backdrop')) setVariablesModalOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Personalizza variabili"
        >
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">📝 Personalizza il prompt</h3>
              <button className="modal__close" onClick={() => setVariablesModalOpen(false)} aria-label="Chiudi">✕</button>
            </div>

            <div className="modal__body" style={{ paddingTop: 16 }}>
              {!showPreview ? (
                // 📝 VISTA FORM - Compilazione campi
                <>
                  {/* Messaggio informativo principale */}
                  <div style={{ 
                    marginBottom: 20, 
                    padding: 14, 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    borderRadius: 8,
                    border: '2px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <p style={{ fontSize: 14, color: '#10b981', margin: 0, fontWeight: '600', marginBottom: 6 }}>
                      ℹ️ Prompt con campi personalizzabili
                    </p>
                    <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                      Questo prompt ha {currentPromptForVars.variables.length} {currentPromptForVars.variables.length === 1 ? 'campo' : 'campi'} personalizzabili. 
                      Puoi <strong>compilarli per personalizzarlo</strong>, oppure <strong>copiare l'originale</strong> e modificarlo nell'AI.
                    </p>
                  </div>
                  
                  {currentPromptForVars.variables.map(variable => (
                    <div key={variable.name} style={{ marginBottom: 16 }}>
                      <label className="form-label" htmlFor={`var-${variable.name}`}>
                        {variable.label} <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'normal' }}>(facoltativo)</span>
                      </label>
                      <input
                        id={`var-${variable.name}`}
                        type={variable.type || 'text'}
                        className="form-control"
                        value={variableValues[variable.name] || ''}
                        onChange={(e) => setVariableValues({
                          ...variableValues,
                          [variable.name]: e.target.value
                        })}
                        placeholder={variable.placeholder}
                      />
                    </div>
                  ))}
                  
                  <div style={{ 
                    marginTop: 20, 
                    padding: 12, 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    borderRadius: 6,
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <p style={{ fontSize: 13, color: '#93c5fd', margin: 0 }}>
                      💡 <strong>3 opzioni:</strong> Copia l'originale (con placeholder), copia la versione personalizzata, o vedi l'anteprima per modificarlo.
                    </p>
                  </div>
                </>
              ) : (
                // 👁️ VISTA ANTEPRIMA - Modifica testo
                <>
                  <div style={{ 
                    marginBottom: 16, 
                    padding: 14, 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    borderRadius: 8,
                    border: '2px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <p style={{ fontSize: 14, color: '#3b82f6', margin: 0, fontWeight: '600', marginBottom: 6 }}>
                      👁️ Anteprima prompt personalizzato
                    </p>
                    <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                      Qui sotto vedi il prompt con i tuoi dati. <strong>Puoi modificarlo</strong> se necessario, poi copia negli appunti.
                    </p>
                  </div>

                  <label className="form-label" htmlFor="preview-textarea">
                    Prompt personalizzato (modificabile)
                  </label>
                  <textarea
                    id="preview-textarea"
                    className="form-control"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    rows={12}
                    style={{ 
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      resize: 'vertical'
                    }}
                  />

                  <div style={{ 
                    marginTop: 16, 
                    padding: 10, 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    borderRadius: 6,
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <p style={{ fontSize: 12, color: '#10b981', margin: 0 }}>
                      ✏️ <strong>Puoi modificare il testo sopra</strong> prima di copiarlo negli appunti!
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="modal__actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
              {!showPreview ? (
                // Bottoni quando è in modalità FORM - TRE OPZIONI
                <>
                  <button 
                    className="btn-blue btn-ghost" 
                    onClick={copyOriginalPrompt}
                    style={{ flex: '1 1 100%', minWidth: '200px' }}
                  >
                    📄 Copia originale
                  </button>
                  <button 
                    className="btn-blue" 
                    onClick={copyWithVariables}
                    style={{ flex: '1 1 calc(50% - 4px)', minWidth: '150px' }}
                  >
                    📋 Copia personalizzato
                  </button>
                  <button 
                    className="btn-blue" 
                    onClick={showPromptPreview} 
                    style={{ flex: '1 1 calc(50% - 4px)', minWidth: '150px', background: '#3b82f6' }}
                  >
                    👁️ Anteprima
                  </button>
                </>
              ) : (
                // Bottoni quando è in modalità ANTEPRIMA
                <>
                  <button className="btn-blue btn-ghost" onClick={() => setShowPreview(false)}>
                    ← Modifica campi
                  </button>
                  <button className="btn-blue" onClick={copyFromPreview} style={{ background: '#10b981' }}>
                    📋 Copia prompt
                  </button>
                  <button className="btn-blue btn-ghost" onClick={() => {
                    setVariablesModalOpen(false);
                    setShowPreview(false);
                    setPreviewText('');
                  }}>
                    Annulla
                  </button>
                </>
              )}
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
