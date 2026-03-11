# API-Dokumentation – DRK Briefbogen-Generator

## Authentifizierung

Die API nutzt JWT-basierte Authentifizierung via httpOnly Session-Cookie (`drk_session`).

### Auth-Endpunkte

```
POST /api/auth/send     – Anmeldecode per E-Mail senden
POST /api/auth/verify   – 6-stelligen Code verifizieren → JWT-Cookie
GET  /api/auth/magic    – Magic Link einlösen → Redirect + JWT-Cookie
GET  /api/auth/me       – Aktuelle Session + Tenants abfragen
POST /api/auth/logout   – Session beenden
```

## Tenant-Endpunkte

```
POST /api/tenants              – Neue Organisation anlegen (auth required)
GET  /api/tenants/[slug]       – Organisation + Units laden (public)
```

## Unit-Endpunkte

```
GET    /api/tenants/[slug]/units           – Alle Units einer Org (public)
POST   /api/tenants/[slug]/units           – Neue Unit anlegen (admin only)
PUT    /api/tenants/[slug]/units/[unitId]  – Unit bearbeiten (admin only)
DELETE /api/tenants/[slug]/units/[unitId]  – Unit löschen (admin only)
```

## Member-Endpunkte

```
GET    /api/tenants/[slug]/members  – Mitglieder auflisten (admin only)
PUT    /api/tenants/[slug]/members  – Rolle ändern (admin only)
DELETE /api/tenants/[slug]/members  – Mitglied entfernen (admin only)
POST   /api/tenants/[slug]/join     – Organisation beitreten (auth required)
```

## Beispiel

```typescript
// Anmeldung
await fetch('/api/auth/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'nutzer@drk-aachen.de' }),
});

// Code verifizieren
await fetch('/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'nutzer@drk-aachen.de', code: '123456' }),
});

// Tenant-Daten laden
const res = await fetch('/api/tenants/drk-aachen');
const { tenant, units } = await res.json();
```
