# NIS-2 GRC – Compliance-Check für die Geschäftsführung

**Single Point of Truth für Compliance und Sicherheit.** Zeigt in 5 Minuten:
*„Hier stehen wir, das sind die Lücken, das sind die nächsten Schritte.“*

Bewusst kein „großes ERP-System für NIS-2“, sondern der fokussierte
Compliance-Check – gebaut auf einem Enterprise-ready-Stack.

## Features

- **Dashboard** – gewichteter Compliance-Score (Gauge), Umsetzungsgrad je
  NIS-2-Bereich (Art. 21 Abs. 2 lit. a–j + Art. 23 Meldepflichten), Top-Lücken
  mit konkretem nächsten Schritt, größte offene Risiken.
- **Maßnahmen-Check** – vorbefüllter NIS-2-Katalog (31 Maßnahmen in
  11 Bereichen), Status je Maßnahme: Offen / In Umsetzung / Umgesetzt /
  Nicht anwendbar.
- **Risikoregister** – Risiken mit Eintrittswahrscheinlichkeit × Auswirkung
  (1–5), automatischer Stufe (Niedrig/Mittel/Hoch/Kritisch) und Risk Owner.
- **Immutable Audit Log** – jede Änderung wird mit Zeitstempel, Benutzer-ID
  und Vorher-/Nachher-Wert protokolliert. Die Tabelle ist auf
  Datenbank-Ebene append-only (PostgreSQL-Trigger blockt UPDATE/DELETE/
  TRUNCATE), zusätzlich sichert eine **SHA-256-Hash-Kette** jeden Eintrag
  gegen nachträgliche Manipulation. Integritätsprüfung per Knopfdruck.
- **Audit-Nachweis per Knopfdruck** – Compliance-Bericht (Druck/PDF, JSON)
  und Audit-Log-Export (CSV, Excel-kompatibel) für Auditor oder Behörde.

## Stack

| Schicht | Technologie | Warum |
| --- | --- | --- |
| Frontend | **Next.js 14** (React, App Router), **Tailwind CSS** (shadcn-Stil), **Recharts** | Industriestandard, Enterprise-Look, Dashboard-Charts |
| Backend | **NestJS** (TypeScript, Node.js) | Saubere Modul-Architektur, wartbar bei wachsendem Team |
| Datenbank | **PostgreSQL** + **Prisma** | ACID-Konformität, unveränderbare Audit-Logs |
| Auth | **Keycloak** (OIDC/JWT) | MFA & SSO nicht selbst bauen; Demo-Modus für lokale Entwicklung |
| Infrastruktur | **Docker Compose** | Isolierte, reproduzierbare Umgebung; EU-Hosting (Hetzner, AWS Frankfurt) möglich |

## Schnellstart (Demo-Modus, ohne Login)

Voraussetzungen: Node.js ≥ 20, Docker.

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. PostgreSQL starten
docker compose up -d db

# 3. Umgebungsvariablen setzen
cp .env.example apps/api/.env

# 4. Schema anwenden, NIS-2-Katalog seeden, Audit-Log härten
npm run db:setup

# 5. API starten (Port 4000)
npm run dev:api

# 6. In zweitem Terminal: Frontend starten (Port 3000)
npm run dev:web
```

Dann <http://localhost:3000> öffnen.

### Alles in Docker

```bash
docker compose up --build          # db + api + web
docker compose --profile auth up   # zusätzlich Keycloak auf Port 8080
```

## Produktion mit Keycloak (MFA/SSO)

1. Keycloak starten (`docker compose --profile auth up -d keycloak`) – der
   Realm `nis2` wird aus `infra/keycloak/nis2-realm.json` importiert
   (Rollen: `admin`, `ciso`, `auditor`).
2. In `apps/api/.env`: `AUTH_MODE=oidc`, `KEYCLOAK_ISSUER=…/realms/nis2`.
3. Für das Web-Frontend `NEXTAUTH_SECRET`, `KEYCLOAK_CLIENT_ID/SECRET`
   setzen (siehe `.env.example`).
4. Client-Secret und Passwörter vor dem Go-Live ändern; TLS terminieren
   (Reverse Proxy) und EU-Region wählen.

## Architektur

```
apps/
  api/          NestJS-Backend (Port 4000)
    prisma/     Datenmodell + Seed (NIS-2-Katalog, Audit-Härtung)
    src/
      auth/       Keycloak-JWT-Validierung / Demo-Modus
      controls/   Maßnahmen (Art. 21 + 23) inkl. Audit-Protokollierung
      risks/      Risikoregister
      audit/      Immutable Audit Log + Hash-Ketten-Verifikation
      dashboard/  Compliance-Score-Berechnung
      reports/    Bericht (JSON) + Audit-Export (CSV)
  web/          Next.js-Frontend (Port 3000)
    src/app/    Dashboard, Maßnahmen, Risiken, Audit-Log, Bericht
infra/
  keycloak/     Realm-Import (Rollen, Demo-User)
```

### Wichtige API-Endpunkte

| Endpunkt | Beschreibung |
| --- | --- |
| `GET /dashboard/summary` | Score, Bereichs-Scores, Top-Lücken, offene Risiken |
| `GET /controls` · `PATCH /controls/:id` | Maßnahmen lesen / bewerten (auditiert) |
| `GET /risks` · `POST /risks` · `PATCH /risks/:id` | Risikoregister (auditiert) |
| `GET /audit` · `GET /audit/verify` | Audit-Log lesen · Hash-Kette prüfen |
| `GET /reports/compliance` | Kompletter Compliance-Bericht (JSON) |
| `GET /reports/audit-export?format=csv\|json` | Export für Auditor/Behörde |

### Compliance-Score

Gewichteter Umsetzungsgrad über alle anwendbaren Maßnahmen
(Gewicht 1–5 je Maßnahme): `Umgesetzt` = 100 %, `In Umsetzung` = 50 %,
`Offen` = 0 %, `Nicht anwendbar` fließt nicht ein.

### Warum das Audit-Log revisionssicher ist

1. **Append-only auf DB-Ebene:** PostgreSQL-Trigger werfen bei `UPDATE`,
   `DELETE` und `TRUNCATE` eine Exception – auch ein Admin mit
   App-Zugangsdaten kann Einträge nicht ändern.
2. **Hash-Kette:** Jeder Eintrag speichert `hash = SHA-256(prevHash | payload)`.
   Wird ein Eintrag manipuliert oder entfernt, bricht die Kette –
   `GET /audit/verify` weist das nach.

## Roadmap-Ideen

- Mandantenfähigkeit (mehrere Unternehmen pro Instanz)
- Aufgaben/Fristen je Maßnahme mit E-Mail-Erinnerung
- Vorfalls-Modul mit 24h/72h-Meldefristen-Timer (Art. 23)
- Nachweis-Uploads (Policies, Zertifikate) je Maßnahme
- PDF-Berichte serverseitig, digital signiert
