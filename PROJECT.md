# PROJECT.md – Interne Projektdokumentation

## App-Name
DRK Briefbogen-Generator

## Zweck
Mandantenfähige Web-Anwendung zur Erstellung professioneller DRK-Briefbögen als .docx-Datei. Jeder DRK-Kreisverband oder Ortsverein kann seine eigenen Gesellschaften und Briefkopf-Daten verwalten.

## Status
🟡 In Entwicklung

## Zielgruppe
- Alle DRK-Kreisverbände bundesweit (~20 KV)
- DRK-Ortsvereine (~100 OV)
- Tochtergesellschaften (Rettungsdienst GmbH, Pflege GmbH etc.)

## Architektur-Entscheidungen
- **Standalone-Server** – Next.js mit API-Routes, Docker-Deployment
- **PostgreSQL** – Multi-Tenant-Datenbank für Org-Daten
- **localStorage** – Persönliche MA-Daten und Brief-Entwürfe (DSGVO: keine unnötige serverseitige Speicherung)
- **Mailjet** – E-Mail-Versand für Magic-Link-Auth (EU, DSGVO-konform)
- **Magic Link / Code** – Kein Passwort-Management, einfache Anmeldung
- **Client-seitiger DOCX-Export** – Keine Dokumente auf Server

## Offene Punkte
- [ ] Übergeordnete Organisation (parent_id) im Onboarding
- [ ] Admin-Approval für Beitrittsanfragen (Phase 2)
- [ ] Invite-System per E-Mail
- [ ] QR-Code auf Spendenseite

## Changelog
Siehe CHANGELOG.md
