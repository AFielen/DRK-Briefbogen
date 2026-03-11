# 📝 DRK Briefbogen-Generator

**Digitaler Briefbogen-Generator für Kreisverbände, Ortsvereine und ihre Gesellschaften im Deutschen Roten Kreuz.**

Open Source · Kostenlos · DSGVO-konform

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![DSGVO](https://img.shields.io/badge/DSGVO-konform-red)

---

## Was ist das?

DRK-Organisationen brauchen einheitliche Briefbögen – mit korrektem Briefkopf, Kontaktdaten, Bankverbindung und Vereinsregister-Angaben. Bisher werden Word-Vorlagen manuell gepflegt, was bei Änderungen (neuer Vorstand, neue Adresse) zu Inkonsistenzen führt.

Der **DRK Briefbogen-Generator** löst das: Organisationsdaten werden zentral gepflegt, und jeder Mitarbeiter kann in einem 4-Schritte-Wizard professionelle Briefe als `.docx` erzeugen – direkt im Browser, ohne Installation.

## ✨ Features

### Web-App
- **Multi-Tenant SaaS** — Jede Organisation (Kreisverband, Ortsverein) hat einen eigenen Bereich mit eigener URL
- **4-Schritte Briefbogen-Wizard** — Setup → Empfänger → Brief → Vorschau & Download
- **DOCX-Export** — Client-seitige Word-Generierung mit eingebettetem Briefkopf (kein Server-Upload)
- **Passwordless Login** — E-Mail-basiert mit 6-stelligem Code oder Magic Link (kein Passwort nötig)
- **Admin-Panel** — Gesellschaften/Abteilungen verwalten, Mitglieder einladen, Rollen vergeben
- **Organisationsverwaltung** — Unbegrenzt viele Gesellschaften pro Organisation, jeweils mit eigenem Briefkopf
- **Entwürfe speichern** — Brief-Entwürfe und Mitarbeiterdaten im Browser gespeichert (localStorage)
- **Onboarding** — Neue Organisation erstellen oder bestehender per Slug beitreten
- **Zweisprachig** — Deutsch und Englisch (DE/EN)
- **Mobile-optimiert** — Responsive Design, Touch-Ziele mindestens 44px

### REST-API
- **Auth** — Magic Link + Code-Verifikation, JWT-Sessions
- **Tenants** — Organisationen erstellen, abfragen, beitreten
- **Units** — Gesellschaften/Abteilungen CRUD (Admin)
- **Members** — Mitglieder auflisten, einladen, Rollen verwalten (Admin)

## 🚀 Installation

### Docker (empfohlen)

```bash
git clone https://github.com/AFielen/DRK-Briefbogen.git
cd DRK-Briefbogen

# Umgebungsvariablen konfigurieren
cp .env.example .env
# .env bearbeiten: POSTGRES_PASSWORD, JWT_SECRET, MAILJET_API_KEY, MAILJET_SECRET_KEY setzen

docker compose up -d --build
```

Startet drei Services:
- **App** (Next.js): Port 3000 (intern)
- **Datenbank** (PostgreSQL 16): Port 5432 (intern)
- **Reverse Proxy** (Caddy): Port 80/443 mit automatischem HTTPS

### Erster Start

Nach `docker compose up -d`:

1. `https://ihre-domain.de` im Browser öffnen
2. Beliebige E-Mail-Adresse eingeben → 6-stelliger Code kommt per E-Mail
3. Code eingeben → automatisch ins **Onboarding** weitergeleitet
4. Organisationsname + Slug eingeben, z.B. `drk-aachen`
5. Der erste Nutzer wird automatisch **Admin** seiner Organisation
6. Im Admin-Bereich Gesellschaften anlegen und Mitarbeiter einladen

> **Was ist ein Slug?** Jede Organisation bekommt eine eigene URL, z.B.
> `drk-briefbogen.de/drk-aachen`. Der Slug wird beim Onboarding einmalig
> festgelegt und kann danach nicht mehr geändert werden.

### Lokal entwickeln

```bash
git clone https://github.com/AFielen/DRK-Briefbogen.git
cd DRK-Briefbogen
npm install

# PostgreSQL starten (z.B. via Docker)
docker run -d --name drk-db \
  -e POSTGRES_DB=briefbogen -e POSTGRES_USER=drk \
  -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 postgres:16-alpine

# Warten bis PostgreSQL bereit ist, dann Schema einrichten
sleep 3
psql postgres://drk:dev@localhost:5432/briefbogen < db/init.sql

# Umgebungsvariablen konfigurieren
cp .env.example .env.local
# .env.local bearbeiten: DATABASE_URL=postgres://drk:dev@localhost:5432/briefbogen setzen

npm run dev
```

## ⚙️ Umgebungsvariablen

| Variable | Beschreibung | Pflicht |
|---|---|---|
| `POSTGRES_PASSWORD` | PostgreSQL-Passwort | Ja |
| `JWT_SECRET` | Mindestens 64 Zeichen, zufällig | Ja |
| `MAILJET_API_KEY` | Mailjet API Key | Ja |
| `MAILJET_SECRET_KEY` | Mailjet Secret Key | Ja |
| `BASE_URL` | Öffentliche URL (z.B. `https://drk-briefbogen.de`) | Ja |
| `MAILJET_FROM_EMAIL` | Absender-Adresse (z.B. `noreply@drk-briefbogen.de`) | Ja |
| `MAILJET_FROM_NAME` | Absender-Name (z.B. `DRK Briefbogen-Generator`) | Nein |

## 🛠️ Tech-Stack

- [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) (App Router, standalone)
- [TypeScript](https://www.typescriptlang.org/) (strict)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [PostgreSQL 16](https://www.postgresql.org/) (Self-Hosted)
- [Mailjet](https://www.mailjet.com/) (E-Mail, EU/Frankreich)
- [Caddy 2](https://caddyserver.com/) (Reverse Proxy, Auto-HTTPS)
- Docker + Docker Compose (Deployment)

> **Empfohlene Instanz:** Hetzner CX21 (2 vCPU, 4 GB RAM) — ausreichend
> für ~500 gleichzeitige Nutzer, ca. 6 €/Monat.

## 📐 Projektstruktur

```
DRK-Briefbogen/
├── app/
│   ├── layout.tsx               # Root-Layout: DRK-Header + Footer
│   ├── page.tsx                 # Login-Seite
│   ├── globals.css              # DRK CSS-Variablen + Utility-Klassen
│   ├── not-found.tsx            # Custom 404
│   ├── dashboard/page.tsx       # Organisationsauswahl nach Login
│   ├── onboarding/page.tsx      # Organisation erstellen/beitreten
│   ├── [slug]/
│   │   ├── page.tsx             # Briefbogen-Wizard (4 Schritte)
│   │   └── admin/page.tsx       # Gesellschaften + Mitglieder verwalten
│   ├── auth/
│   │   ├── magic/page.tsx       # Magic-Link-Verifikation
│   │   └── verify/page.tsx      # Code-Verifikation
│   ├── api/
│   │   ├── auth/                # send, verify, magic, me, logout
│   │   └── tenants/             # CRUD, units, members, join
│   ├── impressum/page.tsx
│   ├── datenschutz/page.tsx
│   ├── hilfe/page.tsx
│   └── spenden/page.tsx
├── lib/
│   ├── types.ts                 # TypeScript-Typen
│   ├── db.ts                    # PostgreSQL-Pool
│   ├── auth.ts                  # JWT + Code-Generierung
│   ├── email.ts                 # Mailjet (Nodemailer)
│   ├── storage.ts               # localStorage-Helpers
│   ├── docx-export.ts           # Client-seitige DOCX-Generierung
│   ├── i18n.ts                  # Übersetzungen (DE/EN)
│   └── version.ts               # Versionierung
├── db/
│   └── init.sql                 # Datenbankschema
├── public/
│   ├── logo.png / logo.svg      # DRK-Logo
│   └── favicon.svg
├── Dockerfile                   # Multi-Stage Build (Node 22 Alpine)
├── docker-compose.yml           # App + PostgreSQL + Caddy
└── Caddyfile                    # Reverse-Proxy-Konfiguration
```

## 🗄️ Datenbank

| Tabelle | Zweck |
|---|---|
| `tenants` | Organisationen (Slug, Name, Parent-ID für Hierarchien) |
| `tenant_units` | Gesellschaften/Abteilungen mit Briefkopf-Konfiguration (JSONB) |
| `users` | Benutzer (nur E-Mail-Adresse) |
| `tenant_members` | Zuordnung Benutzer ↔ Organisation mit Rolle (admin/member) |
| `auth_tokens` | Login-Codes und Magic-Link-Tokens (gehashed, 15 Min. gültig) |

## 🔒 Datenschutz & Sicherheit

- **Hosting:** Hetzner Cloud (Deutschland) — kein US-Dienst
- **E-Mail:** Mailjet (EU, Frankreich) — DSGVO-konform
- **Session-Cookie:** httpOnly, SameSite=Lax (30 Tage)
- **Auth-Tokens:** Einmalig verwendbar, zeitlich begrenzt (15 Min.)
- **Minimale Daten** — Nur E-Mail-Adresse für Authentifizierung
- **Briefinhalte nur im Browser** — Persönliche MA-Daten und Briefentwürfe ausschließlich in localStorage
- **DOCX-Generierung client-seitig** — Kein Upload von Dokumenten an den Server
- **Keine externen Dienste** — Keine Google Fonts, kein CDN, kein Tracking, keine Analytics
- **Open Source** — Gesamter Quellcode einsehbar und überprüfbar

## 🤝 Beitragen

Pull Requests sind willkommen!

1. Fork erstellen
2. Feature-Branch anlegen (`git checkout -b feature/mein-feature`)
3. Committen (`git commit -m 'feat: Beschreibung'`)
4. Pushen (`git push origin feature/mein-feature`)
5. Pull Request öffnen

## 📄 Lizenz

MIT — Frei verwendbar für alle DRK-Gliederungen und darüber hinaus.

## 🏥 Über

Ein Projekt des [DRK Kreisverband StädteRegion Aachen e.V.](https://www.drk-aachen.de/) zur Digitalisierung der Verwaltungsprozesse im Deutschen Roten Kreuz.

---

Weitere Details: [PROJECT.md](PROJECT.md) · [CHANGELOG.md](CHANGELOG.md)

---

*Gebaut mit ❤️ für das Deutsche Rote Kreuz*
