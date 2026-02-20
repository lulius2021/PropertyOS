import { Card } from '@/components/ui/card';
import { Shield, Lock, Database, MapPin, Clock, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default function SicherheitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="text-xl font-bold text-gray-900">PropGate</span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Zum Login →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sicherheit & Datenschutz
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            PropGate setzt auf moderne Sicherheitsstandards und
            EU-Rechenzentren für maximalen Datenschutz Ihrer Immobiliendaten.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* SSL/TLS */}
          <Card className="border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Ende-zu-Ende-Verschlüsselung
                </h2>
                <p className="text-gray-600 mb-3">
                  Alle Datenübertragungen sind durch SSL/TLS-Verschlüsselung
                  (256-bit) geschützt. Ihre Daten sind während der Übertragung
                  vollständig verschlüsselt.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ TLS 1.3 (modernster Standard)</li>
                  <li>✓ HTTPS für alle Verbindungen</li>
                  <li>✓ HSTS (HTTP Strict Transport Security)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Backups */}
          <Card className="border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Automatische Backups
                </h2>
                <p className="text-gray-600 mb-3">
                  Ihre Daten werden täglich automatisch gesichert und sind bis
                  zu 30 Tage lang wiederherstellbar.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Tägliche automatische Backups</li>
                  <li>✓ 30 Tage Aufbewahrung</li>
                  <li>✓ Point-in-Time Recovery</li>
                  <li>✓ Redundante Speicherung</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Multi-Tenancy */}
          <Card className="border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Mandantentrennung
                </h2>
                <p className="text-gray-600 mb-3">
                  Strikte Datentrennung durch Row-Level Security (RLS) auf
                  Datenbankebene. Ihre Daten sind vollständig isoliert.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Row-Level Security (PostgreSQL)</li>
                  <li>✓ Automatische Tenant-Filterung</li>
                  <li>✓ Kein Cross-Tenant-Zugriff</li>
                  <li>✓ Audit-Logs für alle Zugriffe</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* EU-Rechenzentren */}
          <Card className="border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  EU-Rechenzentren
                </h2>
                <p className="text-gray-600 mb-3">
                  Alle Daten werden ausschließlich in EU-Rechenzentren
                  (Frankfurt, Deutschland) gespeichert. Volle DSGVO-Konformität.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Hosting in Frankfurt, Deutschland</li>
                  <li>✓ Keine Drittland-Übermittlung</li>
                  <li>✓ DSGVO-konform</li>
                  <li>✓ Auftragsverarbeitungsvertrag (AVV)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Uptime */}
          <Card className="border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Hohe Verfügbarkeit
                </h2>
                <p className="text-gray-600 mb-3">
                  PropGate läuft auf Vercel Edge Network mit globaler
                  Redundanz und automatischem Failover.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ 99.9% Uptime SLA</li>
                  <li>✓ Globales CDN (Edge Network)</li>
                  <li>✓ Automatisches Failover</li>
                  <li>✓ Echtzeit-Monitoring</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* DSGVO */}
          <Card className="border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-50 rounded-lg">
                <FileCheck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  DSGVO-Compliance
                </h2>
                <p className="text-gray-600 mb-3">
                  PropGate erfüllt alle Anforderungen der DSGVO. Sie haben
                  jederzeit volle Kontrolle über Ihre Daten.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Datenexport (JSON)</li>
                  <li>✓ Recht auf Löschung</li>
                  <li>✓ Transparente Datenverarbeitung</li>
                  <li>✓ Audit-Logs aller Änderungen</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Details Section */}
        <Card className="border border-gray-200 shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Technische Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Infrastruktur
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Hosting: Vercel (Frankfurt, Deutschland)</li>
                <li>• Datenbank: PostgreSQL (Vercel Postgres)</li>
                <li>• File-Storage: CloudFlare R2 (EU)</li>
                <li>• CDN: Vercel Edge Network</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sicherheit</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Authentifizierung: NextAuth.js v5</li>
                <li>• Session: HttpOnly Cookies (7 Tage)</li>
                <li>• Passwörter: bcrypt (Salted Hash)</li>
                <li>• Rate Limiting: Upstash Redis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Compliance</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• DSGVO Art. 15 (Auskunftsrecht)</li>
                <li>• DSGVO Art. 17 (Recht auf Löschung)</li>
                <li>• DSGVO Art. 20 (Datenportabilität)</li>
                <li>• DSGVO Art. 32 (Datensicherheit)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Monitoring</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Audit-Logs für alle Änderungen</li>
                <li>• Echtzeit-Error-Tracking</li>
                <li>• Performance-Monitoring</li>
                <li>• Automatische Alerts</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Häufig gestellte Fragen
          </h2>
          <div className="space-y-4">
            <Card className="border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Wo werden meine Daten gespeichert?
              </h3>
              <p className="text-gray-600 text-sm">
                Alle Daten werden ausschließlich in EU-Rechenzentren
                (Frankfurt, Deutschland) gespeichert. Es erfolgt keine
                Übermittlung in Drittländer.
              </p>
            </Card>

            <Card className="border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Kann ich meine Daten exportieren?
              </h3>
              <p className="text-gray-600 text-sm">
                Ja, Sie können jederzeit alle Ihre Daten als JSON-Datei
                exportieren (DSGVO Art. 20). Der Export ist in den
                Einstellungen verfügbar.
              </p>
            </Card>

            <Card className="border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Wie werden Backups erstellt?
              </h3>
              <p className="text-gray-600 text-sm">
                Backups werden täglich automatisch erstellt und 30 Tage lang
                aufbewahrt. Bei Datenverlust können wir Ihre Daten zu jedem
                beliebigen Zeitpunkt innerhalb der letzten 30 Tage
                wiederherstellen.
              </p>
            </Card>

            <Card className="border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Wer hat Zugriff auf meine Daten?
              </h3>
              <p className="text-gray-600 text-sm">
                Nur Sie und die Nutzer Ihres Mandanten haben Zugriff auf Ihre
                Daten. PropGate-Mitarbeiter haben keinen Zugriff auf
                Mandantendaten. Strikte Mandantentrennung auf Datenbankebene
                verhindert Cross-Tenant-Zugriffe.
              </p>
            </Card>

            <Card className="border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Ist PropGate DSGVO-konform?
              </h3>
              <p className="text-gray-600 text-sm">
                Ja, PropGate erfüllt alle Anforderungen der DSGVO. Wir bieten
                Datenexport, Löschung, Audit-Logs und einen
                Auftragsverarbeitungsvertrag (AVV) an. Alle Daten verbleiben in
                der EU.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="border border-gray-200 shadow-sm p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Noch Fragen zur Sicherheit?
            </h2>
            <p className="text-gray-600 mb-6">
              Kontaktieren Sie uns für weitere Informationen oder einen AVV.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
              >
                Zum Login
              </Link>
              <a
                href="mailto:security@propertyos.de"
                className="inline-flex items-center px-6 py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md"
              >
                Kontakt aufnehmen
              </a>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              © 2026 PropGate. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/impressum"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Impressum
              </Link>
              <Link
                href="/datenschutz"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Datenschutz
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
