"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { TwoFactorDisable } from "@/components/auth/TwoFactorDisable";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { validatePassword } from "@/lib/password-policy";

function SecurityTab() {
  const utils = trpc.useUtils();
  const { data: securityStatus, isLoading } =
    trpc.authSecurity.getSecurityStatus.useQuery();

  const [showSetup, setShowSetup] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const changePassword = trpc.authSecurity.changePassword.useMutation({
    onSuccess: () => {
      setPwSuccess(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwError(null);
    },
    onError: (err) => {
      setPwError(err.message);
    },
  });

  const handleChangePassword = () => {
    setPwError(null);
    setPwSuccess(false);

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Passwörter stimmen nicht überein");
      return;
    }

    const validation = validatePassword(pwForm.newPassword);
    if (!validation.valid) {
      setPwError(validation.errors[0]);
      return;
    }

    changePassword.mutate({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Laden…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2FA Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Zwei-Faktor-Authentifizierung (2FA)
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Schützen Sie Ihren Account mit einem zusätzlichen Sicherheitscode.
        </p>

        {securityStatus?.twoFactorEnabled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-green-700">
                2FA ist aktiviert
              </span>
            </div>
            <TwoFactorDisable
              onComplete={() => {
                utils.authSecurity.getSecurityStatus.invalidate();
              }}
            />
          </div>
        ) : showSetup ? (
          <TwoFactorSetup
            onComplete={() => {
              setShowSetup(false);
              utils.authSecurity.getSecurityStatus.invalidate();
            }}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">
                2FA ist nicht aktiviert
              </span>
            </div>
            <button
              onClick={() => setShowSetup(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              2FA aktivieren
            </button>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Passwort ändern
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Aktualisieren Sie Ihr Passwort regelmäßig für mehr Sicherheit.
        </p>

        {pwSuccess && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            Passwort wurde erfolgreich geändert.
          </div>
        )}

        {pwError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {pwError}
          </div>
        )}

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aktuelles Passwort
            </label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) =>
                setPwForm((f) => ({ ...f, currentPassword: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Neues Passwort
            </label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) =>
                setPwForm((f) => ({ ...f, newPassword: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <PasswordStrengthMeter password={pwForm.newPassword} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Neues Passwort bestätigen
            </label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) =>
                setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={
              !pwForm.currentPassword ||
              !pwForm.newPassword ||
              !pwForm.confirmPassword ||
              changePassword.isPending
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {changePassword.isPending
              ? "Wird gespeichert…"
              : "Passwort ändern"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EinstellungenPage() {
  const [activeTab, setActiveTab] = useState<
    "parameter" | "benutzer" | "audit" | "sicherheit"
  >("parameter");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
        <p className="mt-2 text-gray-600">
          Systemparameter und Benutzerverwaltung
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab("parameter")}
            className={`border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === "parameter"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Parameter
          </button>
          <button
            onClick={() => setActiveTab("benutzer")}
            className={`border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === "benutzer"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Benutzerverwaltung
          </button>
          <button
            onClick={() => setActiveTab("sicherheit")}
            className={`border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === "sicherheit"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Sicherheit
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Audit-Log
          </button>
        </nav>
      </div>

      {/* Sicherheit Tab */}
      {activeTab === "sicherheit" && <SecurityTab />}

      {/* Parameter Tab */}
      {activeTab === "parameter" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            System-Parameter
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verzugszins-Satz (p.a.)
              </label>
              <input
                type="number"
                step="0.0001"
                defaultValue="0.05"
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="0.05 = 5%"
              />
              <p className="mt-1 text-xs text-gray-500">
                Beispiel: 0.05 = 5% per annum
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fälligkeitstag Warmmiete
              </label>
              <input
                type="number"
                min="1"
                max="28"
                defaultValue="3"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Tag im Monat (1-28)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mahngebühr Erinnerung
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue="0.00"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">In Euro (€)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mahngebühr 1. Mahnung
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue="5.00"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">In Euro (€)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mahngebühr 2. Mahnung
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue="10.00"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">In Euro (€)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mahngebühr 3. Mahnung
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue="15.00"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">In Euro (€)</p>
            </div>

            <div className="pt-4">
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Parameter speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Benutzerverwaltung Tab */}
      {activeTab === "benutzer" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Benutzerverwaltung
            </h2>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              + Benutzer anlegen
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  E-Mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rolle
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Benutzerverwaltung in Entwicklung
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Audit-Log Tab */}
      {activeTab === "audit" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Audit-Log (Änderungshistorie)
          </h2>

          <div className="mb-4 flex gap-4">
            <input
              type="text"
              placeholder="Suche nach Entität..."
              className="flex-1 rounded border px-3 py-2"
            />
            <select className="rounded border border-gray-300 px-3 py-2">
              <option value="">Alle Aktionen</option>
              <option value="CREATE">Erstellt</option>
              <option value="UPDATE">Geändert</option>
              <option value="DELETE">Gelöscht</option>
            </select>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Zeitpunkt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Benutzer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aktion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Entität
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Audit-Log-Ansicht in Entwicklung
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
