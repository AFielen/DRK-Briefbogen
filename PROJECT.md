# PROJECT.md – Interne Projektdokumentation

## App-Name

DRK Briefbogen-Generator

## Domain

https://drk-briefbogen.de

## Zweck

Mandantenfähige SaaS-Web-Anwendung zur Erstellung professioneller DRK-Briefbögen als .docx-Datei. Jeder DRK-Kreisverband oder Ortsverein kann seine eigenen Gesellschaften und Briefkopf-Daten verwalten. Mitarbeiter erstellen Briefe über einen 4-Schritte-Wizard und laden das fertige Dokument herunter – ohne Installation, direkt im Browser.

## Status

🟡 In Entwicklung (v1.0.0)

## Zielgruppe

- Alle DRK-Kreisverbände bundesweit (~20 KV)
- DRK-Ortsvereine (~100 OV)
- Tochtergesellschaften (Rettungsdienst GmbH, Pflege GmbH etc.)
- Deren Mitarbeiter, die im Alltag Briefe schreiben

## Deployment

- **Variante:** Server (Variante B – standalone)
- **Hosting:** Hetzner Cloud (Deutschland)
- **Stack:** Docker Compose (App + PostgreSQL 16 + Caddy 2)
- **HTTPS:** Automatisch via Caddy / Let's Encrypt
- **Domain:** drk-briefbogen.de
- **E-Mail:** Mailjet (EU/Frankreich), Absender: noreply@drk-briefbogen.de

## Architektur-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| **Standalone-Server** | Next.js mit API-Routes, SSR, Middleware für Auth-Check |
| **PostgreSQL** | Multi-Tenant-Datenbank für Organisationen, Units, Mitglieder |
| **localStorage** | Persönliche MA-Daten und Brief-Entwürfe bleiben im Browser (DSGVO: keine unnötige serverseitige Speicherung personenbezogener Daten) |
| **Mailjet** | E-Mail-Versand für Magic-Link-Auth (EU-Server, DSGVO-konform) |
| **Magic Link + 6-stelliger Code** | Kein Passwort-Management nötig, einfache Anmeldung |
| **Client-seitiger DOCX-Export** | Dokumente werden nie an den Server gesendet – maximaler Datenschutz |
| **JSONB für Unit-Config** | Flexible Briefkopf-Konfiguration ohne starre Spaltenstruktur |
| **JWT-Session (30 Tage)** | httpOnly-Cookie, kein Session-Store auf Server nötig |

## Datenmodell

```
tenants (id, slug, name, parent_id, created_at)
├── tenant_units (id, tenant_id, name, config [JSONB], sort_order, created_at)
│   └── config enthält: Briefkopf, Adresse, Kontakt, Vorstand, Bank, Register
├── tenant_members (id, user_id, tenant_id, role [admin|member], created_at)
└── users (id, email, created_at)

auth_tokens (id, email, code [gehashed], token [UUID], expires_at, used_at, created_at)
```

**Beziehungen:**
- Ein Tenant hat viele Units und viele Members
- Ein User kann mehreren Tenants angehören (mit unterschiedlichen Rollen)
- Tenants können hierarchisch sein (parent_id → anderer Tenant)

## API-Übersicht

| Endpunkt | Methode | Zweck | Auth |
|---|---|---|---|
| `/api/auth/send` | POST | Login-Code + Magic Link senden | Öffentlich |
| `/api/auth/verify` | POST | Code prüfen → JWT setzen | Öffentlich |
| `/api/auth/magic` | GET | Magic Link prüfen → JWT setzen | Öffentlich |
| `/api/auth/me` | GET | Aktueller User + Tenant-Liste | JWT |
| `/api/auth/logout` | POST | Session beenden | JWT |
| `/api/tenants` | POST | Neue Organisation anlegen | JWT |
| `/api/tenants/[slug]` | GET | Organisation + Units abrufen | Öffentlich |
| `/api/tenants/[slug]/units` | GET/POST | Units auflisten / anlegen | JWT (Admin für POST) |
| `/api/tenants/[slug]/units/[id]` | PUT/DELETE | Unit bearbeiten / löschen | JWT + Admin |
| `/api/tenants/[slug]/members` | GET/POST | Mitglieder auflisten / einladen | JWT + Admin |
| `/api/tenants/[slug]/join` | POST | Organisation beitreten | JWT |

## Benutzerfluss

```
Login (E-Mail) → Code/Magic Link → Dashboard (Org-Auswahl)
                                        ↓
                                   [slug] Wizard
                                   1. Setup (Unit + MA-Daten)
                                   2. Empfänger (Adresse)
                                   3. Brief (Betreff, Text)
                                   4. Vorschau → .docx Download
```

**Erstanmeldung:** Login → Onboarding (Org erstellen oder beitreten) → Dashboard

**Admin-Zugang:** Dashboard → [slug]/admin → Units verwalten + Mitglieder einladen

## Client-seitige Datenhaltung

| localStorage-Key | Inhalt |
|---|---|
| `drk-brief:ma-data` | Mitarbeiter-Stammdaten (Name, Funktion, Abteilung, Durchwahl) |
| `drk-brief:draft:{slug}:{unitId}` | Brief-Entwurf pro Organisation und Gesellschaft |

**Wichtig:** Diese Daten verlassen nie den Browser. Kein Sync, kein Backup auf dem Server.

## Offene Punkte

- [ ] Übergeordnete Organisation (parent_id) im Onboarding nutzbar machen
- [ ] Admin-Approval für Beitrittsanfragen (Phase 2)
- [ ] Invite-System per E-Mail (Einladungslink)
- [ ] QR-Code auf Spendenseite
- [ ] Logo-Upload pro Organisation (Briefkopf-Individualisierung)
- [ ] PDF-Export als Alternative zu DOCX

## Changelog

Siehe [CHANGELOG.md](CHANGELOG.md)
