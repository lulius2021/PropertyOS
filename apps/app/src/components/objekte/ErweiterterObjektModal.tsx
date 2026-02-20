"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";

interface ErweiterterObjektModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  objektId?: string; // Optional: Wenn vorhanden, Bearbeitungsmodus
}

type Tab = "basis" | "eigentum" | "flaechen" | "technik" | "verwaltung" | "partner" | "versicherung" | "zugang";

export function ErweiterterObjektModal({ isOpen, onClose, onSuccess, objektId }: ErweiterterObjektModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("basis");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isEditMode = !!objektId;

  // Lade Objekt-Daten im Bearbeitungsmodus
  const { data: objektData } = trpc.objekte.getById.useQuery(
    { id: objektId! },
    { enabled: isEditMode && isOpen }
  );

  const [formData, setFormData] = useState({
    // Basis
    bezeichnung: "",
    objektIdIntern: "",
    strasse: "",
    hausnummer: "",
    plz: "",
    ort: "",
    land: "Deutschland",
    bildUrl: "",

    // Eigentum
    eigentuemer: "",
    eigentuemeranteile: "",
    vertretungsberechtigt: false,

    // Objekt-Typ
    objektart: "" as any,
    verwaltungsart: "" as any,
    baujahr: "",
    kernsanierungJahr: "",

    // Grundstück
    flurstueck: "",
    gemarkung: "",
    grundstueckFlaeche: "",

    // Gebäude
    anzahlGebaeude: "",
    anzahlGeschosse: "",
    unterkellerung: false,
    aufzug: false,
    tiefgarage: false,

    // Flächen
    wohnflaeche: "",
    gewerbeflaeche: "",
    nutzflaeche: "",
    gesamtflaeche: "",

    anzahlWohnungen: "",
    anzahlGewerbe: "",
    anzahlStellplaetze: "",

    // Technik
    heizungsart: "",
    warmwasser: "",
    stromAllgemein: false,
    wasserUnterzaehler: false,
    internetVersorgung: "",
    pvAnlage: false,

    // Verwaltung
    verwalterVertragBeginn: "",
    verwalterVertragLaufzeit: "",
    verwalterVerguetung: "",
    objektkontoIban: "",
    ruecklagenkontoIban: "",
    hausgelkontoIban: "",
    nebenkostenUmlagefaehig: false,
    umlageschluessel: "",

    // Schlüssel
    schliessanlage: "",
    schluesselbestand: "",
    zugaenge: "",

    // Sonstiges
    energieausweis: "",
    notizen: "",
  });

  const createMutation = trpc.objekte.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const updateMutation = trpc.objekte.update.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  // Vorausfüllen der Daten im Bearbeitungsmodus
  useEffect(() => {
    if (objektData && isEditMode) {
      setFormData({
        bezeichnung: objektData.bezeichnung || "",
        objektIdIntern: objektData.objektIdIntern || "",
        strasse: objektData.strasse || "",
        hausnummer: objektData.hausnummer || "",
        plz: objektData.plz || "",
        ort: objektData.ort || "",
        land: objektData.land || "Deutschland",
        bildUrl: objektData.bildUrl || "",

        eigentuemer: objektData.eigentuemer || "",
        eigentuemeranteile: objektData.eigentuemeranteile || "",
        vertretungsberechtigt: objektData.vertretungsberechtigt || false,

        objektart: objektData.objektart || "MFH",
        verwaltungsart: objektData.verwaltungsart || "",
        baujahr: objektData.baujahr?.toString() || "",
        kernsanierungJahr: objektData.kernsanierungJahr?.toString() || "",

        flurstueck: objektData.flurstueck || "",
        gemarkung: objektData.gemarkung || "",
        grundstueckFlaeche: objektData.grundstueckFlaeche?.toString() || "",

        anzahlGebaeude: objektData.anzahlGebaeude?.toString() || "",
        anzahlGeschosse: objektData.anzahlGeschosse?.toString() || "",
        unterkellerung: objektData.unterkellerung || false,
        aufzug: objektData.aufzug || false,
        tiefgarage: objektData.tiefgarage || false,

        wohnflaeche: objektData.wohnflaeche?.toString() || "",
        gewerbeflaeche: objektData.gewerbeflaeche?.toString() || "",
        nutzflaeche: objektData.nutzflaeche?.toString() || "",
        gesamtflaeche: objektData.gesamtflaeche?.toString() || "",

        anzahlWohnungen: objektData.anzahlWohnungen?.toString() || "",
        anzahlGewerbe: objektData.anzahlGewerbe?.toString() || "",
        anzahlStellplaetze: objektData.anzahlStellplaetze?.toString() || "",

        heizungsart: objektData.heizungsart || "",
        warmwasser: objektData.warmwasser || "",
        stromAllgemein: objektData.stromAllgemein || false,
        wasserUnterzaehler: objektData.wasserUnterzaehler || false,
        internetVersorgung: objektData.internetVersorgung || "",
        pvAnlage: objektData.pvAnlage || false,

        verwalterVertragBeginn: objektData.verwalterVertragBeginn
          ? new Date(objektData.verwalterVertragBeginn).toISOString().split('T')[0]
          : "",
        verwalterVertragLaufzeit: objektData.verwalterVertragLaufzeit || "",
        verwalterVerguetung: objektData.verwalterVerguetung || "",
        objektkontoIban: objektData.objektkontoIban || "",
        ruecklagenkontoIban: objektData.ruecklagenkontoIban || "",
        hausgelkontoIban: objektData.hausgelkontoIban || "",
        nebenkostenUmlagefaehig: objektData.nebenkostenUmlagefaehig || false,
        umlageschluessel: objektData.umlageschluessel || "",

        schliessanlage: objektData.schliessanlage || "",
        schluesselbestand: objektData.schluesselbestand || "",
        zugaenge: objektData.zugaenge || "",

        energieausweis: objektData.energieausweis || "",
        notizen: objektData.notizen || "",
      });

      if (objektData.bildUrl) {
        setImagePreview(objektData.bildUrl);
      }
    }
  }, [objektData, isEditMode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Bitte wählen Sie eine Bilddatei aus.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Bild ist zu groß. Maximale Größe: 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData({ ...formData, bildUrl: base64String });
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Fehler beim Laden des Bildes");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, bildUrl: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      bezeichnung: formData.bezeichnung,
      objektIdIntern: formData.objektIdIntern || undefined,
      strasse: formData.strasse,
      hausnummer: formData.hausnummer || undefined,
      plz: formData.plz,
      ort: formData.ort,
      land: formData.land || undefined,
      bildUrl: formData.bildUrl || null,

      eigentuemer: formData.eigentuemer || undefined,
      eigentuemeranteile: formData.eigentuemeranteile || undefined,
      vertretungsberechtigt: formData.vertretungsberechtigt || undefined,

      objektart: formData.objektart || undefined,
      verwaltungsart: formData.verwaltungsart || undefined,
      baujahr: formData.baujahr ? parseInt(formData.baujahr) : undefined,
      kernsanierungJahr: formData.kernsanierungJahr ? parseInt(formData.kernsanierungJahr) : undefined,

      flurstueck: formData.flurstueck || undefined,
      gemarkung: formData.gemarkung || undefined,
      grundstueckFlaeche: formData.grundstueckFlaeche ? parseFloat(formData.grundstueckFlaeche) : undefined,

      anzahlGebaeude: formData.anzahlGebaeude ? parseInt(formData.anzahlGebaeude) : undefined,
      anzahlGeschosse: formData.anzahlGeschosse ? parseInt(formData.anzahlGeschosse) : undefined,
      unterkellerung: formData.unterkellerung || undefined,
      aufzug: formData.aufzug || undefined,
      tiefgarage: formData.tiefgarage || undefined,

      wohnflaeche: formData.wohnflaeche ? parseFloat(formData.wohnflaeche) : undefined,
      gewerbeflaeche: formData.gewerbeflaeche ? parseFloat(formData.gewerbeflaeche) : undefined,
      nutzflaeche: formData.nutzflaeche ? parseFloat(formData.nutzflaeche) : undefined,
      gesamtflaeche: formData.gesamtflaeche ? parseFloat(formData.gesamtflaeche) : undefined,

      anzahlWohnungen: formData.anzahlWohnungen ? parseInt(formData.anzahlWohnungen) : undefined,
      anzahlGewerbe: formData.anzahlGewerbe ? parseInt(formData.anzahlGewerbe) : undefined,
      anzahlStellplaetze: formData.anzahlStellplaetze ? parseInt(formData.anzahlStellplaetze) : undefined,

      heizungsart: formData.heizungsart || undefined,
      warmwasser: formData.warmwasser || undefined,
      stromAllgemein: formData.stromAllgemein || undefined,
      wasserUnterzaehler: formData.wasserUnterzaehler || undefined,
      internetVersorgung: formData.internetVersorgung || undefined,
      pvAnlage: formData.pvAnlage || undefined,

      verwalterVertragBeginn: formData.verwalterVertragBeginn ? new Date(formData.verwalterVertragBeginn) : undefined,
      verwalterVertragLaufzeit: formData.verwalterVertragLaufzeit || undefined,
      verwalterVerguetung: formData.verwalterVerguetung || undefined,
      objektkontoIban: formData.objektkontoIban || undefined,
      ruecklagenkontoIban: formData.ruecklagenkontoIban || undefined,
      hausgelkontoIban: formData.hausgelkontoIban || undefined,
      nebenkostenUmlagefaehig: formData.nebenkostenUmlagefaehig || undefined,
      umlageschluessel: formData.umlageschluessel || undefined,

      schliessanlage: formData.schliessanlage || undefined,
      schluesselbestand: formData.schluesselbestand || undefined,
      zugaenge: formData.zugaenge || undefined,

      energieausweis: formData.energieausweis || undefined,
      notizen: formData.notizen || undefined,
    };

    if (isEditMode && objektId) {
      updateMutation.mutate({ id: objektId, ...data } as any);
    } else {
      createMutation.mutate(data as any);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "basis" as Tab, label: "Basis", icon: "🏠", required: true },
    { id: "eigentum" as Tab, label: "Eigentum", icon: "👤" },
    { id: "flaechen" as Tab, label: "Flächen & Einheiten", icon: "📐" },
    { id: "technik" as Tab, label: "Technik", icon: "⚙️" },
    { id: "verwaltung" as Tab, label: "Verwaltung", icon: "📋" },
    { id: "zugang" as Tab, label: "Schlüssel & Zugang", icon: "🔑" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-20 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Objekt bearbeiten" : "Neues Objekt erstellen"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 ring-2 ring-blue-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.required && <span className="text-red-500">*</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {activeTab === "basis" && <BasisTab formData={formData} setFormData={setFormData} imagePreview={imagePreview} handleImageUpload={handleImageUpload} handleRemoveImage={handleRemoveImage} isUploading={isUploading} />}
          {activeTab === "eigentum" && <EigentumTab formData={formData} setFormData={setFormData} />}
          {activeTab === "flaechen" && <FlaechenTab formData={formData} setFormData={setFormData} />}
          {activeTab === "technik" && <TechnikTab formData={formData} setFormData={setFormData} />}
          {activeTab === "verwaltung" && <VerwaltungTab formData={formData} setFormData={setFormData} />}
          {activeTab === "zugang" && <ZugangTab formData={formData} setFormData={setFormData} />}
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          {(createMutation.error || updateMutation.error) && (
            <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm font-medium text-red-800">
                Fehler beim Speichern
              </p>
              <p className="text-sm text-red-700 mt-1">
                Bitte überprüfen Sie Ihre Eingaben. Der Objektname ist erforderlich.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="text-red-500">*</span> = Pflichtfeld
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={handleSubmit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending)
                  ? (isEditMode ? "Speichere..." : "Erstelle...")
                  : (isEditMode ? "Änderungen speichern" : "Objekt erstellen")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function BasisTab({ formData, setFormData, imagePreview, handleImageUpload, handleRemoveImage, isUploading }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Identität & Adresse</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objektname / Bezeichnung <span className="text-red-500">*</span>
            </label>
            <input type="text" required value={formData.bezeichnung} onChange={(e) => setFormData({ ...formData, bezeichnung: e.target.value })} placeholder="z.B. Musterstraße 10" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objekt-ID intern</label>
            <input type="text" value={formData.objektIdIntern} onChange={(e) => setFormData({ ...formData, objektIdIntern: e.target.value })} placeholder="z.B. OBJ-001" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Straße & Hausnummer
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={formData.strasse} onChange={(e) => setFormData({ ...formData, strasse: e.target.value })} placeholder="Straße" className="col-span-2 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input type="text" value={formData.hausnummer} onChange={(e) => setFormData({ ...formData, hausnummer: e.target.value })} placeholder="Nr." className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PLZ
            </label>
            <input type="text" value={formData.plz} onChange={(e) => setFormData({ ...formData, plz: e.target.value })} placeholder="10115" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ort
            </label>
            <input type="text" value={formData.ort} onChange={(e) => setFormData({ ...formData, ort: e.target.value })} placeholder="Berlin" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
            <input type="text" value={formData.land} onChange={(e) => setFormData({ ...formData, land: e.target.value })} placeholder="Deutschland" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Objekt-Typ</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objektart
            </label>
            <select value={formData.objektart} onChange={(e) => setFormData({ ...formData, objektart: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Bitte wählen</option>
              <option value="MFH">MFH - Mehrfamilienhaus</option>
              <option value="WEG">WEG - Wohnungseigentum</option>
              <option value="SONDEREIGENTUM">Sondereigentum</option>
              <option value="WOHNHAUS">Wohnhaus</option>
              <option value="GEWERBE">Gewerbe</option>
              <option value="GEMISCHT">Gemischt</option>
              <option value="ANLAGE">Anlage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verwaltungsart</label>
            <select value={formData.verwaltungsart} onChange={(e) => setFormData({ ...formData, verwaltungsart: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Bitte wählen</option>
              <option value="MIETVERWALTUNG">Mietverwaltung</option>
              <option value="WEG_VERWALTUNG">WEG-Verwaltung</option>
              <option value="SEV">SEV - Sondereigentum</option>
              <option value="GEMISCHT">Gemischt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Baujahr</label>
            <input type="number" value={formData.baujahr} onChange={(e) => setFormData({ ...formData, baujahr: e.target.value })} placeholder="z.B. 1985" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kernsanierung Jahr</label>
            <input type="number" value={formData.kernsanierungJahr} onChange={(e) => setFormData({ ...formData, kernsanierungJahr: e.target.value })} placeholder="z.B. 2010" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Bild</h3>
        {!imagePreview ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="mt-2 text-sm text-gray-500"><span className="font-semibold">Klicken</span> oder Drag & Drop</p>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="relative">
            <img src={imagePreview} alt="Vorschau" className="w-full h-32 rounded-xl object-cover border" />
            <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white shadow-lg hover:bg-red-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EigentumTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Eigentümer-Struktur</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eigentümer (Person/Firma)</label>
            <input type="text" value={formData.eigentuemer} onChange={(e) => setFormData({ ...formData, eigentuemer: e.target.value })} placeholder="z.B. Max Mustermann" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eigentumsanteile</label>
            <textarea value={formData.eigentuemeranteile} onChange={(e) => setFormData({ ...formData, eigentuemeranteile: e.target.value })} rows={3} placeholder="z.B. 50% Max Mustermann, 50% Maria Muster" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="vertretung" checked={formData.vertretungsberechtigt} onChange={(e) => setFormData({ ...formData, vertretungsberechtigt: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="vertretung" className="text-sm text-gray-700">Vertretungsberechtigung vorhanden</label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Grundstücksdaten</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flurstück(e)</label>
            <input type="text" value={formData.flurstueck} onChange={(e) => setFormData({ ...formData, flurstueck: e.target.value })} placeholder="z.B. 123/45" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gemarkung</label>
            <input type="text" value={formData.gemarkung} onChange={(e) => setFormData({ ...formData, gemarkung: e.target.value })} placeholder="z.B. Berlin-Mitte" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Grundstücksfläche (m²)</label>
            <input type="number" step="0.01" value={formData.grundstueckFlaeche} onChange={(e) => setFormData({ ...formData, grundstueckFlaeche: e.target.value })} placeholder="z.B. 850.50" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Gebäudeparameter</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anzahl Gebäude</label>
            <input type="number" value={formData.anzahlGebaeude} onChange={(e) => setFormData({ ...formData, anzahlGebaeude: e.target.value })} placeholder="z.B. 1" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anzahl Geschosse</label>
            <input type="number" value={formData.anzahlGeschosse} onChange={(e) => setFormData({ ...formData, anzahlGeschosse: e.target.value })} placeholder="z.B. 4" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="keller" checked={formData.unterkellerung} onChange={(e) => setFormData({ ...formData, unterkellerung: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="keller" className="text-sm text-gray-700">Unterkellerung</label>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="aufzug" checked={formData.aufzug} onChange={(e) => setFormData({ ...formData, aufzug: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="aufzug" className="text-sm text-gray-700">Aufzug vorhanden</label>
          </div>

          <div className="flex items-center gap-3 sm:col-span-2">
            <input type="checkbox" id="tiefgarage" checked={formData.tiefgarage} onChange={(e) => setFormData({ ...formData, tiefgarage: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="tiefgarage" className="text-sm text-gray-700">Tiefgarage vorhanden</label>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlaechenTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Flächen</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wohnfläche (m²)</label>
            <input type="number" step="0.01" value={formData.wohnflaeche} onChange={(e) => setFormData({ ...formData, wohnflaeche: e.target.value })} placeholder="z.B. 450.50" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gewerbefläche (m²)</label>
            <input type="number" step="0.01" value={formData.gewerbeflaeche} onChange={(e) => setFormData({ ...formData, gewerbeflaeche: e.target.value })} placeholder="z.B. 120.00" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nutz-/Nebenflächen (m²)</label>
            <input type="number" step="0.01" value={formData.nutzflaeche} onChange={(e) => setFormData({ ...formData, nutzflaeche: e.target.value })} placeholder="z.B. 80.00" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gesamtfläche (m²)</label>
            <input type="number" step="0.01" value={formData.gesamtflaeche} onChange={(e) => setFormData({ ...formData, gesamtflaeche: e.target.value })} placeholder="z.B. 650.50" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Einheiten-Anzahl</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wohnungen (#)</label>
            <input type="number" value={formData.anzahlWohnungen} onChange={(e) => setFormData({ ...formData, anzahlWohnungen: e.target.value })} placeholder="z.B. 12" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gewerbe (#)</label>
            <input type="number" value={formData.anzahlGewerbe} onChange={(e) => setFormData({ ...formData, anzahlGewerbe: e.target.value })} placeholder="z.B. 2" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stellplätze (#)</label>
            <input type="number" value={formData.anzahlStellplaetze} onChange={(e) => setFormData({ ...formData, anzahlStellplaetze: e.target.value })} placeholder="z.B. 8" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnikTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Heizung & Wasser</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heizungsart</label>
            <select value={formData.heizungsart} onChange={(e) => setFormData({ ...formData, heizungsart: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Bitte wählen</option>
              <option value="Gas">Gas</option>
              <option value="Fernwärme">Fernwärme</option>
              <option value="Öl">Öl</option>
              <option value="Wärmepumpe">Wärmepumpe</option>
              <option value="Etagenheizung">Etagenheizung</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warmwasser</label>
            <select value={formData.warmwasser} onChange={(e) => setFormData({ ...formData, warmwasser: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Bitte wählen</option>
              <option value="zentral">Zentral</option>
              <option value="dezentral">Dezentral</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Zähler & Mess-Konzept</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="strom" checked={formData.stromAllgemein} onChange={(e) => setFormData({ ...formData, stromAllgemein: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="strom" className="text-sm text-gray-700">Allgemeinstrom vorhanden</label>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="wasser" checked={formData.wasserUnterzaehler} onChange={(e) => setFormData({ ...formData, wasserUnterzaehler: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="wasser" className="text-sm text-gray-700">Wasser-Unterzähler vorhanden</label>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="pv" checked={formData.pvAnlage} onChange={(e) => setFormData({ ...formData, pvAnlage: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="pv" className="text-sm text-gray-700">PV-Anlage vorhanden</label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Sonstige Versorgung</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Internet/TV</label>
          <select value={formData.internetVersorgung} onChange={(e) => setFormData({ ...formData, internetVersorgung: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Bitte wählen</option>
            <option value="Kabel">Kabel</option>
            <option value="Sat">Satellit</option>
            <option value="Glasfaser">Glasfaser</option>
            <option value="DSL">DSL</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function VerwaltungTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Verwaltervertrag</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vertragsbeginn</label>
            <input type="date" value={formData.verwalterVertragBeginn} onChange={(e) => setFormData({ ...formData, verwalterVertragBeginn: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Laufzeit</label>
            <input type="text" value={formData.verwalterVertragLaufzeit} onChange={(e) => setFormData({ ...formData, verwalterVertragLaufzeit: e.target.value })} placeholder="z.B. 3 Jahre" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vergütung</label>
            <input type="text" value={formData.verwalterVerguetung} onChange={(e) => setFormData({ ...formData, verwalterVerguetung: e.target.value })} placeholder="z.B. 25€ pro Einheit/Monat" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Konten</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objektkonto IBAN</label>
            <input type="text" value={formData.objektkontoIban} onChange={(e) => setFormData({ ...formData, objektkontoIban: e.target.value })} placeholder="DE89 3704 0044 0532 0130 00" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rücklagenkonto IBAN</label>
            <input type="text" value={formData.ruecklagenkontoIban} onChange={(e) => setFormData({ ...formData, ruecklagenkontoIban: e.target.value })} placeholder="DE89 3704 0044 0532 0130 00" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hausgeldkonto IBAN</label>
            <input type="text" value={formData.hausgelkontoIban} onChange={(e) => setFormData({ ...formData, hausgelkontoIban: e.target.value })} placeholder="DE89 3704 0044 0532 0130 00" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Abrechnungssystematik</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="nebenkosten" checked={formData.nebenkostenUmlagefaehig} onChange={(e) => setFormData({ ...formData, nebenkostenUmlagefaehig: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="nebenkosten" className="text-sm text-gray-700">Nebenkosten umlagefähig nach BetrKV</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Umlageschlüssel</label>
            <select value={formData.umlageschluessel} onChange={(e) => setFormData({ ...formData, umlageschluessel: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Bitte wählen</option>
              <option value="Wohnfläche">Wohnfläche</option>
              <option value="MEA">Miteigentumsanteil (MEA)</option>
              <option value="Personen">Personenzahl</option>
              <option value="Verbrauch">Verbrauch</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZugangTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Schließanlage</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schließanlage Hersteller/System</label>
            <input type="text" value={formData.schliessanlage} onChange={(e) => setFormData({ ...formData, schliessanlage: e.target.value })} placeholder="z.B. BKS, EVVA, DOM" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schlüsselbestand</label>
            <textarea value={formData.schluesselbestand} onChange={(e) => setFormData({ ...formData, schluesselbestand: e.target.value })} rows={3} placeholder="z.B. 5x Hauptschlüssel, 12x Wohnungsschlüssel, 3x Kellerschlüssel" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zugänge & Räume</label>
            <textarea value={formData.zugaenge} onChange={(e) => setFormData({ ...formData, zugaenge: e.target.value })} rows={4} placeholder="z.B. Heizungskeller, Technikraum, Dach, Waschküche" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Sonstige Informationen</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Energieausweis</label>
          <input type="text" value={formData.energieausweis} onChange={(e) => setFormData({ ...formData, energieausweis: e.target.value })} placeholder="z.B. Bedarfsausweis, ausgestellt 2022" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Notizen</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allgemeine Notizen</label>
          <textarea value={formData.notizen} onChange={(e) => setFormData({ ...formData, notizen: e.target.value })} rows={6} placeholder="Zusätzliche Informationen zum Objekt..." className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>
    </div>
  );
}
