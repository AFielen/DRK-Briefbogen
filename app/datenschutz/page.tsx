import Link from 'next/link';

export default function Datenschutz() {
  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-[calc(100vh-theme(spacing.16))] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="drk-card">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Datenschutzerklärung</h2>

          <div className="space-y-6" style={{ color: 'var(--text-light)' }}>
            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>1. Verantwortlicher</h3>
              <p>
                DRK-Kreisverband Städteregion Aachen e.V.<br />
                Henry-Dunant-Platz 1, 52146 Würselen<br />
                Telefon: 02405 6039100<br />
                E-Mail:{' '}
                <a href="mailto:Info@DRK-Aachen.de" style={{ color: 'var(--drk)' }} className="hover:underline">
                  Info@DRK-Aachen.de
                </a>
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>2. Grundsatz</h3>
              <p>
                Diese Anwendung wurde nach dem Prinzip der Datensparsamkeit entwickelt.
                Es werden nur die für den Betrieb notwendigen Daten erhoben und verarbeitet.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>3. Datenverarbeitung</h3>
              <p>
                <strong>Session-Cookie:</strong> Zur Authentifizierung wird ein technisch notwendiges Session-Cookie
                (httpOnly, SameSite=Lax) gesetzt. Dieses Cookie enthält ein verschlüsseltes Token und dient ausschließlich
                der Zuordnung Ihrer Sitzung. Es ist 30 Tage gültig.<br /><br />
                <strong>E-Mail-Adresse:</strong> Für die Anmeldung wird Ihre E-Mail-Adresse gespeichert. Diese wird
                ausschließlich für die Authentifizierung und die Zuordnung zu Organisationen verwendet.<br /><br />
                <strong>Keine Tracking-Dienste:</strong> Es werden keine Analytics- oder Tracking-Tools eingesetzt.<br />
                <strong>Keine externen Dienste:</strong> Es werden keine externen Schriftarten, CDNs oder Dienste geladen.
                Alle Ressourcen werden lokal bereitgestellt.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>4. Lokale Speicherung</h3>
              <p>
                Ihre persönlichen Mitarbeiterdaten (Name, Funktion, Abteilung, Kontaktdaten) sowie Brief-Entwürfe
                werden ausschließlich im lokalen Browser-Speicher (localStorage) Ihres Geräts gespeichert.
                Diese Daten verlassen Ihr Gerät nicht und können jederzeit über die Browser-Einstellungen gelöscht werden.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>5. Serverseitige Speicherung</h3>
              <p>
                Organisationsdaten (Name, Slug, Briefkopf-Konfigurationen) und Mitgliedszuordnungen werden
                in einer PostgreSQL-Datenbank gespeichert. Die Datenbank wird auf einem Server bei
                Hetzner Cloud in Deutschland betrieben.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>6. E-Mail-Versand</h3>
              <p>
                Für den Versand von Anmeldecodes wird Mailjet (Frankreich, EU) verwendet.
                Dabei wird ausschließlich Ihre E-Mail-Adresse und der Anmeldecode übermittelt.
                Mailjet verarbeitet die Daten gemäß der DSGVO.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>7. Hosting</h3>
              <p>
                Diese Anwendung wird auf Hetzner Cloud (Hetzner Online GmbH, Deutschland) betrieben.
                Der Server befindet sich in Deutschland und unterliegt deutschem Datenschutzrecht.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>8. Ihre Rechte</h3>
              <p>
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung
                Ihrer Daten. Zur Ausübung Ihrer Rechte wenden Sie sich an den oben genannten Verantwortlichen.
                Sie haben zudem das Recht, sich bei einer Aufsichtsbehörde zu beschweren.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>9. Open Source</h3>
              <p>
                Der gesamte Quellcode dieser Anwendung ist öffentlich einsehbar und überprüfbar.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>10. Änderungen</h3>
              <p>
                Diese Datenschutzerklärung kann bei Änderungen an der Anwendung angepasst werden.
                Die aktuelle Version ist stets unter /datenschutz abrufbar.
              </p>
            </section>
          </div>

          <div className="mt-8">
            <Link href="/" style={{ color: 'var(--drk)' }} className="hover:underline text-sm font-semibold">
              &larr; Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
