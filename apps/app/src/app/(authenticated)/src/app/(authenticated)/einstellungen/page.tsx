'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Shield, Database } from 'lucide-react';

export default function EinstellungenPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/export');

      if (!response.ok) {
        alert('Export fehlgeschlagen');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propertyos-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Daten erfolgreich exportiert!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Fehler beim Export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
        <p className="mt-2 text-gray-600">
          Verwalten Sie Ihre Einstellungen und Daten
        </p>
      </div>

      {/* Daten-Export */}
      <Card className="border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Datenexport (DSGVO)
            </h2>
            <p className="text-gray-600 mb-4">
              Exportieren Sie alle Ihre Daten als JSON-Datei.
              Dies beinhaltet alle Objekte, Mieter, Verträge, Sollstellungen,
              Zahlungen, Tickets, Kosten, Zähler, Kredite und Audit-Logs.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              <strong>Hinweis:</strong> Der Export enthält sensible Daten.
              Bewahren Sie die Datei sicher auf.
            </p>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exportiere...' : 'Alle Daten exportieren'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Sicherheit */}
      <Card className="border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sicherheit & Datenschutz
            </h2>
            <p className="text-gray-600 mb-4">
              PropertyOS nutzt moderne Sicherheitsstandards und
              EU-Rechenzentren für maximalen Datenschutz.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li>✅ Ende-zu-Ende-Verschlüsselung (SSL/TLS)</li>
              <li>✅ Automatische tägliche Backups (30 Tage)</li>
              <li>✅ Mandantentrennung (Row-Level Security)</li>
              <li>✅ EU-Rechenzentren (DSGVO-konform)</li>
              <li>✅ Audit-Logs für alle Änderungen</li>
            </ul>
            <a
              href="/sicherheit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Mehr erfahren →
            </a>
          </div>
        </div>
      </Card>

      {/* Backup-Info */}
      <Card className="border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <Database className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Automatische Backups
            </h2>
            <p className="text-gray-600 mb-4">
              Ihre Daten werden automatisch gesichert.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                <strong>Frequenz:</strong> Täglich automatisch
              </li>
              <li>
                <strong>Aufbewahrung:</strong> 30 Tage
              </li>
              <li>
                <strong>Recovery:</strong> Point-in-Time Wiederherstellung möglich
              </li>
              <li>
                <strong>Speicherort:</strong> EU-Rechenzentrum (Frankfurt)
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
