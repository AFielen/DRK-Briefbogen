import Link from 'next/link';

export default function Hilfe() {
  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-[calc(100vh-theme(spacing.16))] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="drk-card">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Hilfe & Anleitung</h2>
          <p style={{ color: 'var(--text-light)' }}>
            Hier finden Sie Antworten auf häufige Fragen zum DRK Briefbogen-Generator.
          </p>
        </div>

        <div className="drk-card">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Häufige Fragen</h3>
          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer font-semibold hover:text-[#e30613] transition-colors" style={{ color: 'var(--text)' }}>
                Was ist der DRK Briefbogen-Generator?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Der Briefbogen-Generator erstellt professionelle Briefbögen im DRK-Design als .docx-Datei.
                Jeder DRK-Kreisverband oder Ortsverein kann seine eigenen Gesellschaften und Briefkopf-Daten
                verwalten. Mitarbeiter füllen einen Assistenten aus und laden den fertigen Brief herunter.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold hover:text-[#e30613] transition-colors" style={{ color: 'var(--text)' }}>
                Wie melde ich mich an?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen 6-stelligen Code per E-Mail.
                Alternativ können Sie den Link in der E-Mail anklicken. Ein Passwort wird nicht benötigt.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold hover:text-[#e30613] transition-colors" style={{ color: 'var(--text)' }}>
                Werden meine Daten gespeichert?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Ihre persönlichen Daten (Name, Funktion, Abteilung) und Brief-Entwürfe werden nur
                lokal in Ihrem Browser gespeichert. Auf dem Server werden lediglich Ihre E-Mail-Adresse
                (für die Anmeldung) und die Organisationsdaten gespeichert. Der Server steht in Deutschland
                (Hetzner Cloud).
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold hover:text-[#e30613] transition-colors" style={{ color: 'var(--text)' }}>
                Wie lege ich eine neue Organisation an?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Nach der Anmeldung werden Sie zum Onboarding weitergeleitet, wo Sie eine neue Organisation
                anlegen oder einer bestehenden beitreten können. Der erste Nutzer wird automatisch Administrator.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold hover:text-[#e30613] transition-colors" style={{ color: 'var(--text)' }}>
                Wie füge ich Gesellschaften hinzu?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Als Administrator gelangen Sie über das Benutzer-Menü in den Admin-Bereich.
                Dort können Sie Gesellschaften anlegen, bearbeiten und löschen. Jede Gesellschaft
                hat eigene Briefkopf-Daten (Adresse, Kontakt, Bankverbindung etc.).
              </p>
            </details>
          </div>
        </div>

        <div className="drk-card border-l-4" style={{ borderLeftColor: 'var(--drk)' }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Fragen, Feedback oder Fehler gefunden?</h3>
          <p className="text-sm" style={{ color: 'var(--text-light)' }}>
            Wenden Sie sich an den DRK Kreisverband StädteRegion Aachen e.V.:<br />
            <a href="mailto:digitalisierung@drk-aachen.de" style={{ color: 'var(--drk)' }} className="hover:underline">
              digitalisierung@drk-aachen.de
            </a>
          </p>
        </div>

        <div className="text-center">
          <Link href="/" style={{ color: 'var(--drk)' }} className="hover:underline text-sm font-semibold">
            &larr; Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
