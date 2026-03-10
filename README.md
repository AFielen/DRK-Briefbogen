# 📄 DRK Briefbogen-Generator

**Professionelle Briefbögen für DRK-Kreisverbände, Ortsvereine und deren Gesellschaften.**

Open Source · Kostenlos · DSGVO-konform

---

## Was ist das?

Der DRK Briefbogen-Generator ist eine mandantenfähige Web-Anwendung, mit der DRK-Organisationen professionelle Briefbögen im DRK-Design als .docx-Datei erstellen können. Jeder Kreisverband oder Ortsverein verwaltet seine eigenen Gesellschaften und Briefkopf-Daten. Mitarbeiter füllen einen 4-Schritte-Assistenten aus und laden den fertigen Brief herunter.

## Features

### Web-App
- Magic-Link-Anmeldung (kein Passwort nötig)
- Multi-Tenant: Mehrere Organisationen in einer Instanz
- 4-Schritte-Wizard: Setup, Empfänger, Brief, Vorschau
- .docx-Export (client-seitig, kein Server-Upload)
- Admin-Bereich: Gesellschaften und Mitglieder verwalten
- Lokale Datenspeicherung für persönliche MA-Daten
- Responsive Design (Mobile First)
- Zweisprachig (DE/EN)

### REST-API
- Auth: Magic Link / 6-stelliger Code
- Tenants: CRUD + Beitrittssystem
- Units: CRUD für Gesellschaften/Abteilungen
- Members: Rollenverwaltung (Admin/Mitglied)

## Installation

### Docker (empfohlen)

```bash
git clone https://github.com/AFielen/DRK-Briefbogen.git
cd DRK-Briefbogen
cp .env.example .env
# .env mit echten Werten füllen
docker compose up -d
```

### Lokal (Entwicklung)

```bash
git clone https://github.com/AFielen/DRK-Briefbogen.git
cd DRK-Briefbogen
npm install
# PostgreSQL + .env konfigurieren
npm run dev
```

## Tech-Stack

- [Next.js 16](https://nextjs.org/) (App Router, standalone)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) (strict)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [PostgreSQL 16](https://www.postgresql.org/) (Self-Hosted)
- [Mailjet](https://www.mailjet.com/) (EU, E-Mail-Versand)
- [Caddy](https://caddyserver.com/) (Reverse Proxy, Auto-HTTPS)

## Projektstruktur

```
app/
  layout.tsx                  # DRK-Header + Footer
  page.tsx                    # Login-Seite
  auth/magic/page.tsx         # Magic-Link-Verifizierung
  dashboard/page.tsx          # Org-Auswahl nach Login
  onboarding/page.tsx         # Neue Org / Beitreten
  [slug]/page.tsx             # Briefbogen-Wizard
  [slug]/admin/page.tsx       # Admin: Units + Mitglieder
  api/auth/...                # Auth-Endpoints
  api/tenants/...             # Tenant-Endpoints
  impressum/datenschutz/hilfe/spenden/  # Pflichtseiten
lib/
  db.ts                       # PostgreSQL-Pool
  auth.ts                     # JWT + Session
  email.ts                    # Mailjet-Wrapper
  types.ts                    # TypeScript-Interfaces
  docx-export.ts              # Client-seitige DOCX-Generierung
  storage.ts                  # localStorage-Wrapper
db/
  init.sql                    # Datenbankschema
```

## Datenschutz & Sicherheit

- Hosting: Hetzner Cloud, Deutschland
- E-Mail: Mailjet (EU/Frankreich)
- Kein Tracking, keine Analytics
- Keine externen Schriftarten oder CDNs
- MA-Daten nur im localStorage des Browsers
- Session-Cookie: httpOnly, SameSite=Lax
- Auth-Tokens: einmalig, zeitlich begrenzt (15 Min.)
- Open Source: Quellcode vollständig einsehbar

## Beitragen

1. Fork erstellen
2. Feature-Branch anlegen (`feat/mein-feature`)
3. Commit erstellen (`feat: Beschreibung`)
4. Pull Request öffnen

## Lizenz

MIT — Frei verwendbar für alle DRK-Gliederungen und darüber hinaus.

## Über

Ein Projekt des [DRK Kreisverband StädteRegion Aachen e.V.](https://www.drk-aachen.de/)

---

*Gebaut mit ❤️ für das Deutsche Rote Kreuz*
