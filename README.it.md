# 📚 Bookshelf App
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![tRPC](https://img.shields.io/badge/tRPC-v11-398CCB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![CI](https://github.com/RodrigoDutraF88/bookshelf-app/actions/workflows/ci.yml/badge.svg)

**[🔗 Demo Live](https://bookshelf-app-pearl-theta.vercel.app)** &nbsp;·&nbsp; **[🐳 Esegui con Docker](#esegui-con-docker)**

[🇬🇧 English](README.md) &nbsp;·&nbsp; [🇧🇷 Português](README.pt-BR.md) &nbsp;·&nbsp; 🇮🇹 Italiano

---

## Panoramica

Bookshelf App ti permette di costruire una libreria digitale personale, monitorare l'avanzamento delle letture e visualizzare le tue abitudini di lettura nel tempo, cercare tra milioni di titoli tramite Google Books, scansionare un codice a barre per aggiungere un libro tramite ISBN, e ricevere consigli di lettura personalizzati generati dall'IA con Gemini.

Costruito sul **T3 Stack** con type safety end-to-end dal database alla UI: una modifica allo schema Prisma si manifesta come errore di compilazione in un componente React, senza alcun passaggio manuale di sincronizzazione dei tipi o generazione di codice nel mezzo.

## Screenshot


<p align="center">
     <img width="1440" height="777" alt="Screenshot 2026-07-20 at 18 55 08" src="https://github.com/user-attachments/assets/5877c17b-cfc1-4e33-a103-2a23e9f481f6" />
     <img width="1440" height="779" alt="Screenshot 2026-07-20 at 18 55 23" src="https://github.com/user-attachments/assets/9de223a0-3461-4c8e-adfb-cee514d35629" /> 
     <img width="1440" height="778" alt="Screenshot 2026-07-20 at 18 55 50" src="https://github.com/user-attachments/assets/eed9e7cf-cb90-404b-a5ec-2f36e2e9b694" />

<img width="1428" height="777" alt="Screenshot 2026-07-20 at 19 02 10" src="https://github.com/user-attachments/assets/ea12c9ba-51ed-4155-a747-cb9f358f8642" />
     <img width="328" height="607" alt="Screenshot 2026-07-20 at 18 59 17" src="https://github.com/user-attachments/assets/19d8e6ab-c736-416b-bfb7-35a90fdd0bcb" />
<img width="328" height="606" alt="Screenshot 2026-07-20 at 19 00 42" src="https://github.com/user-attachments/assets/02a6318e-9f1e-43e1-a9d5-15d854b47bc8" />
<img width="328" height="604" alt="Screenshot 2026-07-20 at 18 59 41" src="https://github.com/user-attachments/assets/1ad90599-bf54-4563-b64a-a068aab4c6ab" />


</p>


## Teck Stack 

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguaggio | TypeScript (strict, end-to-end) |
| UI | React 19, Tailwind CSS v4 |
| API | tRPC v11, SuperJSON |
| Database | PostgreSQL (Supabase), Prisma ORM |
| Auth | Auth.js (NextAuth v5 Beta), Prisma Adapter, sessioni JWT |
| Validazione | Zod |
| Data Fetching | TanStack React Query |
| IA | Google Gemini 2.5 Flash-Lite |
| API Esterne | Google Books API |
| Test | Vitest, con Prisma e sessioni mockati |
| CI/CD | GitHub Actions → Vercel |
| Containerizzazione | Docker, Docker Compose |
| Validazione Env | @t3-oss/env-nextjs |

## Funzionalità

- **Libreria Personale** : aggiungi, modifica e rimuovi libri con metadati completi (titolo, autore, copertina, generi, ISBN, anno di pubblicazione)
- **Stato di Lettura** : Da Leggere · In Lettura · Completato · Abbandonato, con una vista a scaffale organizzata per categoria o tutta insieme
- **Avanzamento Lettura** : pagina corrente, percentuale di completamento, date di inizio e fine
- **Recensioni e Valutazioni** : valutazioni a 5 stelle, note personali, diario di lettura privato
- **Dashboard Statistiche** : totale libri, pagine lette, valutazione media, serie di giorni di lettura consecutivi, attività nel tempo, distribuzione per genere
- **Esplora e Scopri** : cerca tra milioni di libri tramite Google Books API, visualizza i dettagli, aggiungi direttamente allo scaffale
- **Consigli IA** : suggerimenti personalizzati basati su Gemini a partire dai libri completati, a un clic dal trovare il titolo reale su Google Books
- **Scansione Codice a Barre** : aggiungi libri istantaneamente scansionando un codice ISBN con la fotocamera (`@zxing/browser`)
- **Autenticazione OAuth** : accedi con Discord o Google, con collegamento automatico dell'account tramite email verificata
- **UI Responsive e Mobile-First** : barra di navigazione inferiore dedicata su mobile, barra superiore su desktop, e layout completamente adattato a ogni dimensione di schermo


## Pratiche di Ingegneria

Questo progetto è stato costruito con pratiche di livello professionale, non solo per "farlo funzionare":

- **Type safety end-to-end** : tRPC deduce l'intero contratto dell'API dal codice del server; un contratto rotto fallisce con `tsc`, non a runtime
- **Pipeline di CI** : ogni push esegue typecheck → lint → test → build → Docker smoke test tramite GitHub Actions ([workflow](.github/workflows/ci.yml))
- **Test automatizzati** : test unitari con Vitest per i router tRPC, con Prisma e contesto di sessione mockati
- **Ambiente di sviluppo containerizzato** : chiunque può clonare ed eseguire l'intera stack (app + Postgres) con un solo comando, senza bisogno di Postgres locale o di un account Supabase — vedi [Esegui con Docker](#esegui-con-docker)
- **Separazione runtime edge/Node per l'auth** : il middleware esegue una config di Auth.js sicura per l'edge (senza Prisma), mentre le route API usano la config completa in Node, con sessioni JWT che collegano le due in modo coerente
- **Conventional commits** : prefissi `feat/`, `fix/`, `chore/`, branch per feature con merge `--no-ff` per preservare la cronologia
- **Documentazione integrata nel repository** : decisioni di architettura, modello dati e flusso di autenticazione documentati in [`/docs`](docs), non solo nei commenti del codice

## Cose Ho Imparato

Questo progetto è stato anche un corso intensivo pratico sul T3 Stack, ho tenuto una lista di "cose imparate" mentre costruivo.
**Database & Prisma**
- `String` di Prisma mappa su `VARCHAR(191)` di default : token OAuth/JWT possono superarlo. `@db.Text` evita troncamenti silenziosi.
- Prisma traduce oggetti TS in SQL, gestisce le query, garantisce type safety e si occupa delle migration.
- `upsert` = `where` (trovarlo) + `create` (se manca) + `update` (se esiste).
**tRPC & validazione**
- Zod valida l'input *prima* che la procedure venga eseguita: `.input(schema).mutation(...)`.
- `.mutation` = scrittura, `.query` = sola lettura; `ctx` contiene `{ db, session }`.
- `...(input?.status && { status: input.status })` — chiave condizionale nell'oggetto, niente pile di `if`.
- `.refine()` impone regole tra campi che Zod da solo non esprime (es: "almeno uno tra rating e body deve esserci").
**Architettura & runtime**
- Come l'App Router risolve davvero layout/page e il confine tra componenti server e client.
- Edge Runtime = leggero, basato su V8, API standard web, bassa latenza, rinuncia alla piena compatibilità con Node.
- Per questo Prisma richiede una config solo-Node, separata dal middleware edge-safe.
**Metterlo online**
- Prima vera pipeline CI: typecheck → lint → test → build con GitHub Actions.
- Deploy su Vercel — variabili d'ambiente, config di build, differenze tra locale e serverless.
- Istinti più affinati con React su confini server/client e data fetching.
**API esterne**
- Prima volta a trattare i rate limit come vincolo di design, ha modellato debounce e lunghezza minima query nella ricerca Google Books.

## Documentazione

| Doc | Descrizione |
|---|---|
| [Architecture](docs/architecture.md) | Panoramica del sistema, flusso delle richieste e log delle decisioni |
| [Data Model](docs/data-model.md) | Schema del database e relazioni tra entità |
| [Authentication](docs/authentication.md) | Setup di Auth.js + tRPC + Prisma Adapter |
| [Project Overview](docs/project-overview.md) | Riepilogo completo di funzionalità e stack |
| [Development Order](docs/development-order.md) | Fasi di sviluppo e cronologia dei branch |

## Design

La UI è stata progettata da zero in Figma prima dell'implementazione, mobile-first, con una palette color pergamena e un linguaggio visivo personalizzato a "scaffale" (dorsi dei libri in 3D, mensole con texture in legno) invece del solito aspetto generico da libreria di componenti.

<p align="center">
  <img width="331" height="195" alt="Screenshot 2026-07-20 at 19 34 15" src="https://github.com/user-attachments/assets/2a3226ab-4a2d-4e24-91a3-ec0cdd6b6572" />

</p>

## Per Iniziare

### Prerequisiti

- Node.js 22+ (gestione consigliata tramite [nvm](https://github.com/nvm-sh/nvm))
- Un database PostgreSQL (locale, Docker, o [Supabase](https://supabase.com))
- Credenziali app OAuth di Discord e/o Google ([Discord Developer Portal](https://discord.com/developers/applications), [Google Cloud Console](https://console.cloud.google.com))

### Setup locale

```bash
git clone https://github.com/RodrigoDutraF88/bookshelf-app.git
cd bookshelf-app
npm install
cp .env.example .env   # inserisci DATABASE_URL, AUTH_SECRET, credenziali OAuth, ecc.
npx prisma migrate deploy
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

### Esegui con Docker

Il modo più rapido per provare l'app completa, senza bisogno di Postgres locale o di un account Supabase:

```bash
cp .env.docker.example .env.docker   # inserisci le tue credenziali OAuth/API
docker compose up --build
```

Questo avvia un container Postgres locale insieme all'app Next.js, eseguendo automaticamente le migration di Prisma al primo avvio. Apri [http://localhost:3000](http://localhost:3000).

> I provider OAuth richiedono `http://localhost:3000/api/auth/callback/{provider}` registrato come redirect URI autorizzato nelle impostazioni della tua app Discord/Google.

## Script

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia il server di sviluppo (Turbopack) |
| `npm run build` | Build di produzione |
| `npm run typecheck` | Esegue i controlli del compilatore TypeScript |
| `npm run test` | Esegue i test unitari con Vitest |
| `npx prisma studio` | Naviga nel database visivamente |
| `docker compose up --build` | Esegue l'intera stack nei container |

## Licenza

MIT