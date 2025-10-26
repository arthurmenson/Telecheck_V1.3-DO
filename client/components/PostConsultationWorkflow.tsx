/**
 * Post-Consultation Workflow Component
 *
 * Comprehensive interface for doctors to complete post-consultation documentation
 * including notes, prescriptions, diagnosis codes, and patient summaries.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Send,
  FileText,
  Pill,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  X,
  Plus,
  Loader,
} from "lucide-react";

interface DiagnosisCode {
  code: string;
  description: string;
  type?: string;
}

interface ConsultationNoteData {
  chiefComplaint?: string;
  historyOfPresent?: string;
  assessment?: string;
  clinicalNotes?: string;
  diagnosisCodes?: DiagnosisCode[];
  treatmentPlan?: string;
  followUpInstructions?: string;
  prescriptionIds?: string[];
  followUpDate?: string;
  followUpType?: string;
  isDraft?: boolean;
}

interface Template {
  id: string;
  name: string;
  category: string;
  chiefComplaintTemplate?: string;
  historyTemplate?: string;
  assessmentTemplate?: string;
  treatmentPlanTemplate?: string;
  followUpTemplate?: string;
  commonDiagnosisCodes?: DiagnosisCode[];
}

interface PostConsultationWorkflowProps {
  appointmentId: string;
  patientName: string;
  consultationDate: Date;
  onComplete?: () => void;
  onClose?: () => void;
}

const PostConsultationWorkflow: React.FC<PostConsultationWorkflowProps> = ({
  appointmentId,
  patientName,
  consultationDate,
  onComplete,
  onClose,
}) => {
  // State management
  const [noteData, setNoteData] = useState<ConsultationNoteData>({
    isDraft: true,
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDiagnosisSearch, setShowDiagnosisSearch] = useState(false);
  const [diagnosisSearchTerm, setDiagnosisSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "notes" | "diagnosis" | "treatment" | "prescriptions" | "followup"
  >("notes");

  // Common ICD-10 codes for quick selection
  const commonICD10Codes: DiagnosisCode[] = [
    { code: "J00", description: "Acute nasopharyngitis (common cold)" },
    { code: "J02.9", description: "Acute pharyngitis, unspecified" },
    { code: "J06.9", description: "Acute upper respiratory infection" },
    { code: "I10", description: "Essential (primary) hypertension" },
    {
      code: "E11.9",
      description: "Type 2 diabetes mellitus without complications",
    },
    { code: "M79.1", description: "Myalgia" },
    { code: "R51", description: "Headache" },
    { code: "R05", description: "Cough" },
    { code: "K21.9", description: "Gastro-esophageal reflux disease" },
    { code: "L30.9", description: "Dermatitis, unspecified" },
  ];

  // Load existing note on mount
  useEffect(() => {
    loadExistingNote();
    loadTemplates();
  }, [appointmentId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!isSigned && hasContent(noteData)) {
        autoSave();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [noteData, isSigned]);

  const loadExistingNote = async () => {
    try {
      const response = await fetch(`/api/consultation-notes/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setNoteData(result.data);
          setIsSigned(!result.data.isDraft);
        }
      }
    } catch (error) {
      console.error("Failed to load existing note:", error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/consultation-notes/templates", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTemplates(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const hasContent = (data: ConsultationNoteData): boolean => {
    return !!(
      data.chiefComplaint ||
      data.historyOfPresent ||
      data.assessment ||
      data.clinicalNotes ||
      data.treatmentPlan ||
      data.followUpInstructions ||
      (data.diagnosisCodes && data.diagnosisCodes.length > 0)
    );
  };

  const autoSave = async () => {
    try {
      const response = await fetch(
        `/api/consultation-notes/${appointmentId}/auto-save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(noteData),
        },
      );

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  const saveNote = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/consultation-notes/${appointmentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        setLastSaved(new Date());
        alert("Note saved successfully");
      } else {
        alert("Failed to save note");
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const signNote = async () => {
    if (
      !window.confirm(
        "Are you sure you want to sign this note? Once signed, it cannot be edited.",
      )
    ) {
      return;
    }

    // First save the note
    await saveNote();

    try {
      // Get the note ID first
      const noteResponse = await fetch(
        `/api/consultation-notes/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (noteResponse.ok) {
        const noteResult = await noteResponse.json();
        const noteId = noteResult.data.id;

        // Sign the note
        const response = await fetch(`/api/consultation-notes/${noteId}/sign`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          setIsSigned(true);
          alert("Note signed successfully");
        } else {
          alert("Failed to sign note");
        }
      }
    } catch (error) {
      console.error("Failed to sign note:", error);
      alert("Failed to sign note");
    }
  };

  const sendSummary = async () => {
    if (!isSigned) {
      alert("Please sign the note before sending the summary to the patient.");
      return;
    }

    if (
      !window.confirm(
        `Send consultation summary to ${patientName}? This will be sent via email and available in their patient portal.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/consultation-notes/${appointmentId}/summary`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        alert("Summary sent to patient successfully");
        if (onComplete) onComplete();
      } else {
        alert("Failed to send summary");
      }
    } catch (error) {
      console.error("Failed to send summary:", error);
      alert("Failed to send summary");
    }
  };

  const applyTemplate = (template: Template) => {
    setNoteData({
      ...noteData,
      chiefComplaint:
        template.chiefComplaintTemplate || noteData.chiefComplaint,
      historyOfPresent: template.historyTemplate || noteData.historyOfPresent,
      assessment: template.assessmentTemplate || noteData.assessment,
      treatmentPlan: template.treatmentPlanTemplate || noteData.treatmentPlan,
      followUpInstructions:
        template.followUpTemplate || noteData.followUpInstructions,
      diagnosisCodes: template.commonDiagnosisCodes || noteData.diagnosisCodes,
    });
    setSelectedTemplate(template);
    setShowTemplates(false);

    // Track template usage
    fetch(`/api/consultation-notes/templates/${template.id}/use`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  const addDiagnosisCode = (code: DiagnosisCode) => {
    const currentCodes = noteData.diagnosisCodes || [];
    if (!currentCodes.find((c) => c.code === code.code)) {
      setNoteData({
        ...noteData,
        diagnosisCodes: [...currentCodes, code],
      });
    }
    setShowDiagnosisSearch(false);
    setDiagnosisSearchTerm("");
  };

  const removeDiagnosisCode = (code: string) => {
    setNoteData({
      ...noteData,
      diagnosisCodes: (noteData.diagnosisCodes || []).filter(
        (c) => c.code !== code,
      ),
    });
  };

  const filteredDiagnosisCodes = diagnosisSearchTerm
    ? commonICD10Codes.filter(
        (code) =>
          code.code.toLowerCase().includes(diagnosisSearchTerm.toLowerCase()) ||
          code.description
            .toLowerCase()
            .includes(diagnosisSearchTerm.toLowerCase()),
      )
    : commonICD10Codes;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              Post-Consultation Documentation
            </h2>
            <p className="text-blue-100 mt-1">
              Patient: {patientName} | {consultationDate.toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastSaved && (
              <div className="flex items-center text-sm text-blue-100">
                <Clock className="w-4 h-4 mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
            {isSigned && (
              <div className="flex items-center bg-green-500 px-3 py-1 rounded">
                <CheckCircle className="w-4 h-4 mr-1" />
                Signed
              </div>
            )}
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-3 border-b flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
            disabled={isSigned}
          >
            <FileText className="w-4 h-4" />
            Use Template
          </button>
          <button
            onClick={saveNote}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSaving || isSigned}
          >
            {isSaving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </button>
          <button
            onClick={signNote}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={isSigned || !hasContent(noteData)}
          >
            <CheckCircle className="w-4 h-4" />
            Sign Note
          </button>
          <button
            onClick={sendSummary}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 ml-auto"
            disabled={!isSigned}
          >
            <Send className="w-4 h-4" />
            Send Summary to Patient
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white">
          {[
            { id: "notes", label: "Clinical Notes", icon: FileText },
            { id: "diagnosis", label: "Diagnosis", icon: FileText },
            { id: "treatment", label: "Treatment Plan", icon: Pill },
            { id: "prescriptions", label: "Prescriptions", icon: Pill },
            { id: "followup", label: "Follow-up", icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chief Complaint / Reason for Visit
                </label>
                <textarea
                  value={noteData.chiefComplaint || ""}
                  onChange={(e) =>
                    setNoteData({ ...noteData, chiefComplaint: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Patient's primary concern..."
                  disabled={isSigned}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  History of Present Illness
                </label>
                <textarea
                  value={noteData.historyOfPresent || ""}
                  onChange={(e) =>
                    setNoteData({
                      ...noteData,
                      historyOfPresent: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Detailed history of the presenting complaint..."
                  disabled={isSigned}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment & Findings
                </label>
                <textarea
                  value={noteData.assessment || ""}
                  onChange={(e) =>
                    setNoteData({ ...noteData, assessment: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Clinical assessment and examination findings..."
                  disabled={isSigned}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Clinical Notes
                </label>
                <textarea
                  value={noteData.clinicalNotes || ""}
                  onChange={(e) =>
                    setNoteData({ ...noteData, clinicalNotes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Any additional observations or notes..."
                  disabled={isSigned}
                />
              </div>
            </div>
          )}

          {activeTab === "diagnosis" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Diagnosis Codes</h3>
                {!isSigned && (
                  <button
                    onClick={() => setShowDiagnosisSearch(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Diagnosis
                  </button>
                )}
              </div>

              {noteData.diagnosisCodes && noteData.diagnosisCodes.length > 0 ? (
                <div className="space-y-2">
                  {noteData.diagnosisCodes.map((code) => (
                    <div
                      key={code.code}
                      className="flex items-center justify-between bg-blue-50 border-l-4 border-blue-600 p-4 rounded"
                    >
                      <div>
                        <div className="font-mono font-semibold text-blue-900">
                          {code.code}
                        </div>
                        <div className="text-gray-700">{code.description}</div>
                      </div>
                      {!isSigned && (
                        <button
                          onClick={() => removeDiagnosisCode(code.code)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No diagnosis codes added yet</p>
                </div>
              )}

              {/* Diagnosis Search Modal */}
              {showDiagnosisSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                    <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                      <h3 className="text-xl font-semibold">
                        Search ICD-10 Codes
                      </h3>
                      <button
                        onClick={() => setShowDiagnosisSearch(false)}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={diagnosisSearchTerm}
                          onChange={(e) =>
                            setDiagnosisSearchTerm(e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Search by code or description..."
                          autoFocus
                        />
                      </div>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {filteredDiagnosisCodes.map((code) => (
                          <button
                            key={code.code}
                            onClick={() => addDiagnosisCode(code)}
                            className="w-full text-left p-3 hover:bg-gray-50 border border-gray-200 rounded transition-colors"
                          >
                            <div className="font-mono font-semibold text-blue-900">
                              {code.code}
                            </div>
                            <div className="text-sm text-gray-700">
                              {code.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "treatment" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment Plan
                </label>
                <textarea
                  value={noteData.treatmentPlan || ""}
                  onChange={(e) =>
                    setNoteData({ ...noteData, treatmentPlan: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                  placeholder="Detailed treatment plan including medications, lifestyle modifications, and other interventions..."
                  disabled={isSigned}
                />
              </div>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-start">
                  <Pill className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-semibold text-green-900">
                      Electronic Prescriptions
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Prescriptions are managed through the eRx integration.
                      Click below to send a new prescription.
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={isSigned}
              >
                <Plus className="w-4 h-4" />
                Send New Prescription
              </button>
            </div>
          )}

          {activeTab === "followup" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Instructions
                </label>
                <textarea
                  value={noteData.followUpInstructions || ""}
                  onChange={(e) =>
                    setNoteData({
                      ...noteData,
                      followUpInstructions: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Instructions for patient follow-up care, warning signs to watch for, when to seek emergency care, etc..."
                  disabled={isSigned}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Appointment Date
                  </label>
                  <input
                    type="datetime-local"
                    value={noteData.followUpDate || ""}
                    onChange={(e) =>
                      setNoteData({ ...noteData, followUpDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSigned}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type
                  </label>
                  <select
                    value={noteData.followUpType || ""}
                    onChange={(e) =>
                      setNoteData({ ...noteData, followUpType: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSigned}
                  >
                    <option value="">Select type...</option>
                    <option value="video">Video Consultation</option>
                    <option value="in_person">In-Person Visit</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Template Selection Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Select Medical Template
                </h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 max-h-[calc(80vh-80px)] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.category}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostConsultationWorkflow;
