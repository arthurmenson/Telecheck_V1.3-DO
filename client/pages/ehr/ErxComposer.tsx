import React, { useMemo, useState } from "react";
import {
  useCreatePrescription,
  useVerifyEpcs,
  useMedicationHistory,
  useSearchMedications,
  useCancelPrescription,
  useRefillPrescription,
  usePrescription,
  useOptimisticUpdate,
  queryKeys,
} from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { toast } from "sonner";

export function ErxComposer() {
  const [patientId, setPatientId] = useState("");
  const [medicationText, setMedicationText] = useState("");
  const [dosage, setDosage] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedMedication, setSelectedMedication] = useState<{
    code?: string;
    display?: string;
  } | null>(null);
  const [currentRxId, setCurrentRxId] = useState("");

  const searchQuery = useMemo(() => medicationText.trim(), [medicationText]);
  const search = useSearchMedications(searchQuery);

  const createRx = useCreatePrescription();
  const verify = useVerifyEpcs();
  const { data: history } = useMedicationHistory(patientId || "");
  const cancelRx = useCancelPrescription();
  const refillRx = useRefillPrescription();
  const rx = usePrescription(currentRxId || "");
  const { refetchQueries, updateCache } = useOptimisticUpdate();

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("erx:lastRxId");
      if (saved) setCurrentRxId(saved);
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      if (currentRxId) localStorage.setItem("erx:lastRxId", currentRxId);
      else localStorage.removeItem("erx:lastRxId");
    } catch {}
  }, [currentRxId]);

  const handleCreate = async () => {
    const schema = z.object({
      patientId: z.string().min(1, "patientId required"),
      medicationText: z.string().min(1, "medication required"),
      otp: z.string().optional(),
    });
    const resCheck = schema.safeParse({ patientId, medicationText, otp });
    if (!resCheck.success) {
      toast.error(resCheck.error.issues[0]?.message || "Invalid form");
      return;
    }
    const payload = {
      patientId,
      medication: selectedMedication?.code
        ? {
            coding: [
              {
                system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                code: selectedMedication.code,
                display: selectedMedication.display || medicationText,
              },
            ],
            text: selectedMedication.display || medicationText,
          }
        : { text: medicationText },
      dosageInstruction: dosage ? { text: dosage } : undefined,
    } as any;
    try {
      const res = await createRx.mutateAsync(payload);
      const newId = (res as any)?.data?.id;
      if (newId) setCurrentRxId(newId);
      toast.success("Prescription created");
    } catch (error) {
      console.error("Prescription creation failed:", error);
      toast.error("Failed to create prescription. Please try again.");
    }
  };

  const handleVerify = async () => {
    if (!otp) return;
    await verify.mutateAsync({ otp });
    toast.success("EPCS verified");
  };

  React.useEffect(() => {
    if (!currentRxId) return;
    const id = setInterval(() => {
      refetchQueries(queryKeys.erx.prescription(currentRxId));
    }, 5000);
    return () => clearInterval(id);
  }, [currentRxId, refetchQueries]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>eRx Composer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Patient/123"
              />
            </div>
            <div>
              <Label htmlFor="otp">EPCS OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <div>
                <Label htmlFor="medication">Medication</Label>
                <Input
                  id="medication"
                  value={medicationText}
                  onChange={(e) => {
                    setMedicationText(e.target.value);
                    if (selectedMedication) setSelectedMedication(null);
                  }}
                  placeholder="Type to search (min 3 chars)"
                />
              </div>
              {searchQuery.length > 2 && (
                <div className="border rounded p-2 max-h-48 overflow-auto bg-background">
                  {search.isLoading && (
                    <div className="text-xs text-muted-foreground">
                      Searching…
                    </div>
                  )}
                  {!search.isLoading &&
                    (search.data?.length ? (
                      <ul className="space-y-1">
                        {search.data.map((m: any) => (
                          <li key={m.id}>
                            <button
                              type="button"
                              className="text-left w-full px-2 py-1 rounded hover:bg-muted"
                              onClick={() => {
                                const display =
                                  m.name || m.text || m.generic || String(m.id);
                                const code = m.rxnormCode || m.id || m.code;
                                setMedicationText(display);
                                setSelectedMedication({
                                  code: String(code),
                                  display,
                                });
                              }}
                            >
                              <div className="text-sm font-medium">
                                {m.name || m.text || m.id}
                              </div>
                              {m.generic && (
                                <div className="text-xs text-muted-foreground">
                                  {m.generic}
                                </div>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No results
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="dosage">Dosage Instructions</Label>
              <Textarea
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="1 capsule PO TID for 7 days"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={createRx.isPending}>
              Create Prescription
            </Button>
            <Button
              variant="secondary"
              onClick={handleVerify}
              disabled={verify.isPending}
            >
              Verify EPCS
            </Button>
          </div>
          {createRx.error && (
            <div className="text-red-600 text-sm">
              Failed: {(createRx.error as any)?.message || "Error"}
            </div>
          )}
          {verify.error && (
            <div className="text-red-600 text-sm">
              EPCS Failed: {(verify.error as any)?.message || "Error"}
            </div>
          )}
          {createRx.data?.data && (
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {JSON.stringify(createRx.data.data, null, 2)}
            </pre>
          )}
          {currentRxId && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Created Rx ID:</span>
              <span className="font-mono">{currentRxId}</span>
              {(rx as any)?.data?.status && (
                <Badge
                  variant={
                    (rx as any)?.data?.status === "stopped"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {(rx as any)?.data?.status}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medication History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!patientId && (
            <div className="text-sm text-muted-foreground">
              Enter a Patient ID to load history.
            </div>
          )}
          {patientId && (
            <>
              <div className="space-y-2">
                {(history as any)?.map?.((h: any) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between border rounded p-2"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">
                        {h.medicationCodeableConcept?.text || h.id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(h.authoredOn || Date.now()).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          h.status === "completed" ? "secondary" : "outline"
                        }
                      >
                        {h.status || "unknown"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setCurrentRxId(h.id)}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
                {!(history as any)?.length && (
                  <div className="text-xs text-muted-foreground">
                    No history entries.
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Raw</div>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                  {JSON.stringify((history as any) ?? [], null, 2)}
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Status & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="rxid">Prescription ID</Label>
              <Input
                id="rxid"
                value={currentRxId}
                onChange={(e) => setCurrentRxId(e.target.value)}
                placeholder="rx_..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  currentRxId &&
                  refetchQueries(queryKeys.erx.prescription(currentRxId))
                }
                disabled={!currentRxId}
              >
                Poll Now
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (!currentRxId) return;
                  // Optimistic: update history and current Rx status immediately
                  if (patientId) {
                    updateCache<any[]>(
                      queryKeys.erx.history(patientId),
                      (old = []) =>
                        old.map((item: any) =>
                          item.id === currentRxId
                            ? { ...item, status: "stopped" }
                            : item,
                        ),
                    );
                  }
                  updateCache<any>(
                    queryKeys.erx.prescription(currentRxId),
                    (old: any = {}) => ({ ...old, status: "stopped" }),
                  );
                  await cancelRx.mutateAsync(currentRxId);
                  refetchQueries(queryKeys.erx.prescription(currentRxId));
                  toast.success("Prescription canceled");
                }}
                disabled={!currentRxId || cancelRx.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!currentRxId) return;
                  // Optimistic: flag refill requested
                  if (patientId) {
                    updateCache<any[]>(
                      queryKeys.erx.history(patientId),
                      (old = []) =>
                        old.map((item: any) =>
                          item.id === currentRxId
                            ? {
                                ...item,
                                status: item.status || "active",
                                refillRequested: true,
                              }
                            : item,
                        ),
                    );
                  }
                  updateCache<any>(
                    queryKeys.erx.prescription(currentRxId),
                    (old: any = {}) => ({ ...old, refillRequested: true }),
                  );
                  await refillRx.mutateAsync(currentRxId);
                  refetchQueries(queryKeys.erx.prescription(currentRxId));
                  toast.success("Refill requested");
                }}
                disabled={!currentRxId || refillRx.isPending}
              >
                Refill
              </Button>
            </div>
          </div>

          {currentRxId && (
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {JSON.stringify((rx as any)?.data ?? {}, null, 2)}
            </pre>
          )}

          {(cancelRx.error || refillRx.error) && (
            <div className="text-red-600 text-sm">Action failed</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ErxComposer;
