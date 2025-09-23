import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGenerate837P,
  useClaimStatus,
  useEligibilityCheck,
} from "@/hooks/api";
import { toast } from "sonner";

export function Billing() {
  const [encounterId, setEncounterId] = useState("");
  const [claimId, setClaimId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [payerName, setPayerName] = useState("");
  const [serviceType, setServiceType] = useState(
    "health_benefit_plan_coverage",
  );
  const [recentClaims, setRecentClaims] = useState<
    Array<{
      id: string;
      status?: string;
      trackingId?: string;
      createdAt: string;
    }>
  >([]);

  const gen837p = useGenerate837P();
  const claim = useClaimStatus(claimId);
  const eligibility = useEligibilityCheck();
  const claimStatus =
    (claim as any)?.data?.status || (claim as any)?.data?.data?.status;

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("billing:recentClaims");
      if (saved) setRecentClaims(JSON.parse(saved));
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        "billing:recentClaims",
        JSON.stringify(recentClaims.slice(0, 20)),
      );
    } catch {}
  }, [recentClaims]);

  const upsertRecent = (entry: {
    id: string;
    status?: string;
    trackingId?: string;
    createdAt?: string;
  }) => {
    setRecentClaims((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === entry.id);
      const updated = {
        id: entry.id,
        status: entry.status,
        trackingId: entry.trackingId,
        createdAt: entry.createdAt || new Date().toISOString(),
      };
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], ...updated };
        return copy;
      }
      return [updated, ...prev].slice(0, 20);
    });
  };

  const generateClaim = async () => {
    const payload: any = {};
    if (encounterId) payload.encounterId = encounterId;
    try {
      const res = await gen837p.mutateAsync(payload);
      const id = (res as any)?.data?.claimId;
      const status = (res as any)?.data?.status;
      const trackingId = (res as any)?.data?.trackingId;
      if (id) setClaimId(id);
      if (id) upsertRecent({ id, status, trackingId });
      toast.success("837P generated");
    } catch (e) {
      toast.error("Failed to generate 837P");
    }
  };

  const checkEligibility = async () => {
    try {
      await eligibility.mutateAsync({
        member: { id: memberId },
        payer: { name: payerName },
        serviceType,
      });
      toast.success("Eligibility checked");
    } catch (e) {
      toast.error("Eligibility check failed");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate 837P Claim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="enc">Encounter ID (optional)</Label>
            <Input
              id="enc"
              value={encounterId}
              onChange={(e) => setEncounterId(e.target.value)}
              placeholder="enc_..."
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={generateClaim} disabled={gen837p.isPending}>
              Generate 837P
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                if (!claimId) return;
                // Optimistic: set to checking
                upsertRecent({ id: claimId, status: "checking" });
                const res = await (claim as any).refetch?.();
                const newStatus =
                  res?.data?.status || (res as any)?.data?.data?.status;
                if (newStatus) upsertRecent({ id: claimId, status: newStatus });
              }}
              disabled={!claimId}
            >
              Poll Status
            </Button>
          </div>
          {claimId && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Claim:</span>
              <span className="font-mono">{claimId}</span>
              {claimStatus && (
                <Badge
                  variant={claimStatus === "accepted" ? "secondary" : "outline"}
                >
                  {claimStatus}
                </Badge>
              )}
            </div>
          )}
          {(gen837p.error || claim.error) && (
            <div className="text-red-600 text-sm">Action failed</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eligibility 270/271</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="member">Member ID</Label>
              <Input
                id="member"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="M123"
              />
            </div>
            <div>
              <Label htmlFor="payer">Payer Name</Label>
              <Input
                id="payer"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="Demo Payer"
              />
            </div>
            <div>
              <Label htmlFor="stype">Service Type</Label>
              <Input
                id="stype"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={checkEligibility} disabled={eligibility.isPending}>
              Check Eligibility
            </Button>
          </div>
          {(eligibility.data as any) && (
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {JSON.stringify(eligibility.data as any, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentClaims.length === 0 && (
            <div className="text-xs text-muted-foreground">
              No recent claims.
            </div>
          )}
          {recentClaims.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border rounded p-2"
            >
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{c.id}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    c.status === "accepted"
                      ? "secondary"
                      : c.status === "checking"
                        ? "outline"
                        : "outline"
                  }
                >
                  {c.status || "unknown"}
                </Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    setClaimId(c.id);
                    upsertRecent({ id: c.id, status: "checking" });
                    const res = await (claim as any).refetch?.();
                    const s =
                      res?.data?.status || (res as any)?.data?.data?.status;
                    if (s) upsertRecent({ id: c.id, status: s });
                  }}
                >
                  Poll
                </Button>
                <Button size="sm" onClick={() => setClaimId(c.id)}>
                  Select
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default Billing;
