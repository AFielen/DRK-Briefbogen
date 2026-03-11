# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

---

## [Unreleased]

### Added
- README: Badges (MIT, Docker, Next.js, DSGVO)
- README: „Erster Start"-Anleitung mit Onboarding-Ablauf und Slug-Erklärung
- README: Vollständige lokale Entwicklungsanleitung (PostgreSQL via Docker, init.sql, .env.local)
- README: Fehlende Umgebungsvariablen MAILJET_FROM_EMAIL und MAILJET_FROM_NAME dokumentiert
- README: Hetzner-Hosting-Empfehlung (CX21)
- README: Links zu PROJECT.md und CHANGELOG.md
- .env.example: MAILJET_FROM_EMAIL ergänzt
- Mandantenfähiges SaaS: Multi-Tenant-Architektur für DRK-Kreisverbände und Ortsvereine
- Magic-Link / 6-stelliger Code Authentifizierung (kein Passwort)
- PostgreSQL-Datenbankschema: tenants, tenant_units, users, tenant_members, auth_tokens
- API-Routen: Auth (send, verify, magic, me, logout), Tenants CRUD, Units CRUD, Members
- E-Mail-Versand via Mailjet (EU/Frankreich)
- Dashboard: Organisation auswählen oder neue anlegen
- Onboarding: Neue Organisation erstellen oder bestehender beitreten
- 4-Schritte Briefbogen-Wizard: Setup, Empfänger, Brief, Vorschau
- Admin-Bereich: Gesellschaften (Units) und Mitglieder verwalten
- DOCX-Export: Client-seitige .docx-Generierung mit eingebettetem Word-Template
- localStorage: MA-Daten und Brief-Entwürfe (persönlich, nicht auf Server)
- Middleware: Authentifizierungs-Check für geschützte Routen
- Docker Compose: App + PostgreSQL + Caddy Reverse Proxy
- Dockerfile: Multi-Stage Build (standalone)
- Caddyfile: Automatisches HTTPS via Let's Encrypt

### Changed
- next.config.ts: output von 'export' auf 'standalone' umgestellt
- app/page.tsx: Von Template-Platzhalter zu Login-Seite
- Datenschutz: Erweitert um Session-Cookie, E-Mail-Speicherung, Mailjet, Hetzner-Hosting
- Hilfe-Seite: FAQ für Briefbogen-Generator aktualisiert
- Layout: App-Titel und Untertitel für Briefbogen-Generator angepasst

---

## [1.0.0] – 2026-03-03

### Added
- Initiales DRK App-Template mit Next.js 16, React 19, TypeScript strict, Tailwind CSS 4
- DRK Design-System: CSS-Variablen, Utility-Klassen (`.drk-card`, `.drk-btn-primary` etc.)
- Pflichtseiten: Impressum, Datenschutz, Hilfe, Spenden, 404
- i18n-System (DE/EN) mit shared + app-spezifischen Übersetzungen
- Root-Layout mit DRK-Header (rot) und Footer (hell)
- Animationen: `.drk-fade-in`, `.drk-slide-up`
- Status-Badges: `.drk-badge-success`, `.drk-badge-warning`, `.drk-badge-error`
