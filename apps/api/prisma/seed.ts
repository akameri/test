/**
 * Seed: NIS-2-Maßnahmenkatalog (Art. 21 Abs. 2 lit. a–j, Art. 23 Meldepflichten)
 * und Härtung des Audit-Logs (INSERT-only per DB-Trigger).
 *
 * Idempotent: bestehende Bewertungen (Status, Notizen) bleiben erhalten.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedControl = {
  code: string;
  title: string;
  description: string;
  guidance: string;
  weight: number;
};

type SeedArea = {
  key: string;
  name: string;
  description: string;
  controls: SeedControl[];
};

const catalog: SeedArea[] = [
  {
    key: 'art21-a',
    name: 'Risikoanalyse & Sicherheitskonzepte',
    description:
      'Konzepte für die Risikoanalyse und Sicherheit von Informationssystemen (Art. 21 Abs. 2 lit. a).',
    controls: [
      {
        code: 'A-01',
        title: 'Informationssicherheits-Leitlinie verabschiedet',
        description:
          'Eine von der Geschäftsführung freigegebene Leitlinie zur Informationssicherheit existiert und wird jährlich überprüft.',
        guidance:
          'Leitlinie erstellen, durch die Geschäftsführung freigeben lassen und einen jährlichen Review-Termin festlegen.',
        weight: 5,
      },
      {
        code: 'A-02',
        title: 'Regelmäßige Risikoanalyse durchgeführt',
        description:
          'Risiken für kritische Geschäftsprozesse und IT-Systeme werden mindestens jährlich systematisch identifiziert und bewertet.',
        guidance:
          'Kritische Assets inventarisieren und je Asset Eintrittswahrscheinlichkeit × Auswirkung bewerten (im Modul „Risiken“).',
        weight: 5,
      },
      {
        code: 'A-03',
        title: 'Geltungsbereich & Verantwortlichkeiten definiert',
        description:
          'Rollen und Verantwortlichkeiten für Informationssicherheit (z. B. CISO, Risk Owner) sind schriftlich festgelegt.',
        guidance: 'RACI-Matrix für Sicherheitsaufgaben erstellen und kommunizieren.',
        weight: 3,
      },
    ],
  },
  {
    key: 'art21-b',
    name: 'Bewältigung von Sicherheitsvorfällen',
    description: 'Prozesse zur Erkennung, Meldung und Bewältigung von Vorfällen (Art. 21 Abs. 2 lit. b).',
    controls: [
      {
        code: 'B-01',
        title: 'Incident-Response-Plan vorhanden',
        description:
          'Ein dokumentierter Plan regelt Rollen, Eskalationswege und Sofortmaßnahmen bei Sicherheitsvorfällen.',
        guidance: 'IR-Plan erstellen (Erkennen, Eindämmen, Beheben, Nachbereiten) und jährlich üben.',
        weight: 5,
      },
      {
        code: 'B-02',
        title: 'Vorfälle werden zentral erfasst',
        description: 'Sicherheitsvorfälle werden in einem zentralen System mit Zeitstempel dokumentiert.',
        guidance: 'Ticket-Kategorie „Security Incident“ einführen; Meldeweg intern kommunizieren.',
        weight: 4,
      },
      {
        code: 'B-03',
        title: 'Übungen / Tabletop-Tests durchgeführt',
        description: 'Der Incident-Response-Prozess wird mindestens jährlich getestet.',
        guidance: 'Tabletop-Übung mit Geschäftsführung und IT durchspielen, Ergebnisse dokumentieren.',
        weight: 3,
      },
    ],
  },
  {
    key: 'art21-c',
    name: 'Business Continuity & Backup',
    description:
      'Backup-Management, Wiederherstellung, Notfall- und Krisenmanagement (Art. 21 Abs. 2 lit. c).',
    controls: [
      {
        code: 'C-01',
        title: 'Backup-Konzept umgesetzt (3-2-1-Regel)',
        description:
          'Regelmäßige Backups kritischer Daten existieren, mindestens eine Kopie offline/offsite.',
        guidance: '3-2-1-Regel umsetzen: 3 Kopien, 2 Medien, 1 extern; Verschlüsselung aktivieren.',
        weight: 5,
      },
      {
        code: 'C-02',
        title: 'Wiederherstellung getestet',
        description: 'Restore-Tests werden regelmäßig durchgeführt und protokolliert.',
        guidance: 'Quartalsweise Restore-Test eines kritischen Systems inkl. Protokoll.',
        weight: 4,
      },
      {
        code: 'C-03',
        title: 'Notfall-/Krisenmanagementplan vorhanden',
        description: 'Ein Business-Continuity-Plan mit RTO/RPO-Zielen für kritische Prozesse existiert.',
        guidance: 'Kritische Prozesse priorisieren, RTO/RPO festlegen, Krisenstab benennen.',
        weight: 4,
      },
    ],
  },
  {
    key: 'art21-d',
    name: 'Sicherheit der Lieferkette',
    description: 'Sicherheit in den Beziehungen zu Lieferanten und Dienstleistern (Art. 21 Abs. 2 lit. d).',
    controls: [
      {
        code: 'D-01',
        title: 'Kritische Lieferanten identifiziert',
        description: 'Ein Verzeichnis der Dienstleister mit Zugriff auf Systeme oder Daten existiert.',
        guidance: 'Lieferantenliste erstellen und nach Kritikalität (Zugriff, Datenarten) klassifizieren.',
        weight: 4,
      },
      {
        code: 'D-02',
        title: 'Sicherheitsanforderungen vertraglich geregelt',
        description:
          'Verträge mit kritischen Lieferanten enthalten Sicherheits- und Meldepflichten (z. B. AVV, SLAs).',
        guidance: 'Standard-Sicherheitsanhang für Lieferantenverträge einführen; Bestandsverträge nachziehen.',
        weight: 4,
      },
      {
        code: 'D-03',
        title: 'Lieferanten werden regelmäßig überprüft',
        description: 'Kritische Lieferanten werden periodisch bewertet (Fragebogen, Zertifikate, Audits).',
        guidance: 'Jährlichen Lieferanten-Review mit Fragebogen oder Nachweis (ISO 27001, SOC 2) etablieren.',
        weight: 3,
      },
    ],
  },
  {
    key: 'art21-e',
    name: 'Sichere Entwicklung & Schwachstellenmanagement',
    description:
      'Sicherheit bei Erwerb, Entwicklung und Wartung inkl. Schwachstellenmanagement (Art. 21 Abs. 2 lit. e).',
    controls: [
      {
        code: 'E-01',
        title: 'Patch-Management etabliert',
        description: 'Sicherheitsupdates werden nach definierten Fristen eingespielt (kritisch < 72 h).',
        guidance: 'Patch-Richtlinie mit Fristen je Kritikalität definieren; Umsetzung monatlich prüfen.',
        weight: 5,
      },
      {
        code: 'E-02',
        title: 'Schwachstellen-Scans durchgeführt',
        description: 'Interne und externe Systeme werden regelmäßig auf Schwachstellen gescannt.',
        guidance: 'Monatlichen automatisierten Scan einrichten; Findings ins Risikomodul übernehmen.',
        weight: 4,
      },
      {
        code: 'E-03',
        title: 'Prozess für Schwachstellenmeldungen (CVD)',
        description: 'Es gibt einen definierten Weg, wie externe Schwachstellenmeldungen entgegengenommen werden.',
        guidance: 'security.txt veröffentlichen und internen Bearbeitungsprozess festlegen.',
        weight: 2,
      },
    ],
  },
  {
    key: 'art21-f',
    name: 'Wirksamkeitsbewertung',
    description:
      'Konzepte zur Bewertung der Wirksamkeit von Risikomanagementmaßnahmen (Art. 21 Abs. 2 lit. f).',
    controls: [
      {
        code: 'F-01',
        title: 'Kennzahlen / KPIs definiert',
        description: 'Die Wirksamkeit zentraler Maßnahmen wird über Kennzahlen gemessen (z. B. Patch-Quote).',
        guidance: '3–5 KPIs definieren (Patch-Quote, Schulungsquote, offene Risiken) und quartalsweise berichten.',
        weight: 3,
      },
      {
        code: 'F-02',
        title: 'Interne Audits / Reviews durchgeführt',
        description: 'Die Umsetzung der Sicherheitsmaßnahmen wird regelmäßig intern überprüft.',
        guidance: 'Jährlichen internen Review-Termin ansetzen; Ergebnisse der Geschäftsführung vorlegen.',
        weight: 4,
      },
    ],
  },
  {
    key: 'art21-g',
    name: 'Cyberhygiene & Schulungen',
    description: 'Grundlegende Cyberhygiene-Praktiken und Sicherheitsschulungen (Art. 21 Abs. 2 lit. g).',
    controls: [
      {
        code: 'G-01',
        title: 'Security-Awareness-Schulungen für alle Mitarbeitenden',
        description: 'Alle Mitarbeitenden absolvieren mindestens jährlich eine Sicherheitsschulung.',
        guidance: 'Schulungsprogramm (inkl. Phishing-Simulation) einführen; Teilnahme dokumentieren.',
        weight: 4,
      },
      {
        code: 'G-02',
        title: 'Schulung der Leitungsorgane (NIS-2-Pflicht)',
        description:
          'Die Geschäftsführung hat eine Schulung zu Cybersicherheitsrisiken absolviert (Art. 20 Abs. 2).',
        guidance: 'NIS-2-Management-Schulung buchen und Teilnahmenachweis ablegen – persönliche Haftung!',
        weight: 5,
      },
      {
        code: 'G-03',
        title: 'Grundlegende Härtung der Arbeitsplätze',
        description: 'Endgeräte sind gehärtet (Festplattenverschlüsselung, Bildschirmsperre, EDR/AV).',
        guidance: 'Baseline-Konfiguration per MDM/Gruppenrichtlinie ausrollen.',
        weight: 3,
      },
    ],
  },
  {
    key: 'art21-h',
    name: 'Kryptografie & Verschlüsselung',
    description: 'Konzepte für den Einsatz von Kryptografie und Verschlüsselung (Art. 21 Abs. 2 lit. h).',
    controls: [
      {
        code: 'H-01',
        title: 'Daten bei Übertragung verschlüsselt',
        description: 'Sämtliche externe Kommunikation nutzt TLS 1.2+ / moderne Protokolle.',
        guidance: 'TLS-Konfiguration aller öffentlichen Dienste prüfen (z. B. SSL-Labs-Scan).',
        weight: 4,
      },
      {
        code: 'H-02',
        title: 'Daten im Ruhezustand verschlüsselt',
        description: 'Kritische Datenbestände und mobile Geräte sind verschlüsselt (at rest).',
        guidance: 'Festplatten- und Datenbankverschlüsselung aktivieren; Schlüsselverwaltung dokumentieren.',
        weight: 4,
      },
    ],
  },
  {
    key: 'art21-i',
    name: 'Personal, Zugriffskontrolle & Assets',
    description:
      'Sicherheit des Personals, Konzepte für Zugriffskontrolle und Asset-Management (Art. 21 Abs. 2 lit. i).',
    controls: [
      {
        code: 'I-01',
        title: 'Asset-Inventar gepflegt',
        description: 'Hardware, Software und Datenbestände sind inventarisiert und Ownern zugeordnet.',
        guidance: 'Automatisiertes Inventar einführen; Owner je Asset festlegen.',
        weight: 4,
      },
      {
        code: 'I-02',
        title: 'Least-Privilege & Rollenkonzept',
        description: 'Zugriffsrechte folgen dem Minimalprinzip und werden regelmäßig rezertifiziert.',
        guidance: 'Halbjährliche Rechte-Rezertifizierung einführen; Admin-Rechte getrennt vergeben.',
        weight: 4,
      },
      {
        code: 'I-03',
        title: 'On-/Offboarding-Prozess mit Sicherheitsbezug',
        description: 'Beim Ein- und Austritt werden Konten, Rechte und Geräte nachweisbar behandelt.',
        guidance: 'Checkliste für On-/Offboarding einführen (Konten, Token, Hardware-Rückgabe).',
        weight: 3,
      },
    ],
  },
  {
    key: 'art21-j',
    name: 'MFA & sichere Kommunikation',
    description:
      'Multi-Faktor-Authentifizierung, gesicherte Sprach-, Video- und Textkommunikation sowie Notfallkommunikation (Art. 21 Abs. 2 lit. j).',
    controls: [
      {
        code: 'J-01',
        title: 'MFA für alle externen Zugänge',
        description: 'VPN, E-Mail, Cloud-Dienste und Admin-Zugänge erfordern Multi-Faktor-Authentifizierung.',
        guidance: 'MFA verpflichtend aktivieren, beginnend mit Admin- und Remote-Zugängen.',
        weight: 5,
      },
      {
        code: 'J-02',
        title: 'Gesicherte Kommunikationskanäle',
        description: 'Für vertrauliche Kommunikation stehen verschlüsselte Kanäle zur Verfügung.',
        guidance: 'Verschlüsselte Messenger/E-Mail-Verschlüsselung für vertrauliche Inhalte bereitstellen.',
        weight: 2,
      },
      {
        code: 'J-03',
        title: 'Notfallkommunikation definiert',
        description: 'Ein Kommunikationsweg für den Fall kompromittierter Standard-Kanäle ist definiert.',
        guidance: 'Out-of-Band-Kanal (z. B. Signal-Gruppe, Telefonkette) festlegen und Kontaktliste offline vorhalten.',
        weight: 3,
      },
    ],
  },
  {
    key: 'art23-melde',
    name: 'Meldepflichten (Art. 23)',
    description:
      'Meldung erheblicher Sicherheitsvorfälle an die Behörde: Frühwarnung 24 h, Meldung 72 h, Abschlussbericht 1 Monat.',
    controls: [
      {
        code: 'M-01',
        title: 'Meldeprozess 24h/72h/1 Monat definiert',
        description:
          'Der Prozess zur fristgerechten Meldung erheblicher Vorfälle an das zuständige CSIRT/die Behörde ist definiert.',
        guidance:
          'Meldeprozess mit Fristen (24 h Frühwarnung, 72 h Meldung, 1 Monat Abschlussbericht) dokumentieren und in den IR-Plan integrieren.',
        weight: 5,
      },
      {
        code: 'M-02',
        title: 'Registrierung bei der zuständigen Behörde',
        description: 'Das Unternehmen ist bei der zuständigen nationalen Behörde registriert.',
        guidance: 'Registrierung prüfen und durchführen (in Österreich: BMI/zuständige NIS-Behörde).',
        weight: 4,
      },
      {
        code: 'M-03',
        title: 'Erheblichkeits-Kriterien für Vorfälle definiert',
        description: 'Es ist definiert, wann ein Vorfall „erheblich“ und damit meldepflichtig ist.',
        guidance: 'Kriterienkatalog (Betroffene, Ausfallzeit, finanzieller Schaden) im IR-Plan verankern.',
        weight: 3,
      },
    ],
  },
];

async function hardenAuditLog() {
  // Unveränderbarkeit auf Datenbank-Ebene: UPDATE/DELETE/TRUNCATE werden geblockt.
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION prevent_audit_mutation() RETURNS trigger AS $$
    BEGIN
      RAISE EXCEPTION 'AuditLog ist unveränderbar (append-only): % nicht erlaubt', TG_OP;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await prisma.$executeRawUnsafe(
    `DROP TRIGGER IF EXISTS audit_log_immutable ON "AuditLog";`,
  );
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER audit_log_immutable
    BEFORE UPDATE OR DELETE ON "AuditLog"
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
  `);
  await prisma.$executeRawUnsafe(
    `DROP TRIGGER IF EXISTS audit_log_no_truncate ON "AuditLog";`,
  );
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER audit_log_no_truncate
    BEFORE TRUNCATE ON "AuditLog"
    FOR EACH STATEMENT EXECUTE FUNCTION prevent_audit_mutation();
  `);
}

async function main() {
  for (const [i, area] of catalog.entries()) {
    const dbArea = await prisma.measureArea.upsert({
      where: { key: area.key },
      update: { name: area.name, description: area.description, sortOrder: i },
      create: {
        key: area.key,
        name: area.name,
        description: area.description,
        sortOrder: i,
      },
    });
    for (const control of area.controls) {
      await prisma.control.upsert({
        where: { code: control.code },
        // Status/Notizen des Kunden niemals überschreiben:
        update: {
          title: control.title,
          description: control.description,
          guidance: control.guidance,
          weight: control.weight,
          areaId: dbArea.id,
        },
        create: { ...control, areaId: dbArea.id },
      });
    }
  }

  await hardenAuditLog();
  console.log(
    `Seed abgeschlossen: ${catalog.length} Bereiche, ${catalog.reduce((n, a) => n + a.controls.length, 0)} Maßnahmen. Audit-Log gehärtet (append-only).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
