import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export function RCMDenialDashboard() {
  const denials = [
    { claimId: "clm_1", code: "CO-97", reason: "Procedure not paid separately", count: 3 },
    { claimId: "clm_2", code: "PR-1", reason: "Deductible", count: 5 },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Denial Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 font-semibold text-sm pb-2 border-b">
          <div className="col-span-3">Claim</div>
          <div className="col-span-2">Code</div>
          <div className="col-span-5">Reason</div>
          <div className="col-span-2 text-right">Count</div>
        </div>
        {denials.map((d) => (
          <div key={d.claimId} className="grid grid-cols-12 text-sm py-2 border-b">
            <div className="col-span-3">{d.claimId}</div>
            <div className="col-span-2">{d.code}</div>
            <div className="col-span-5">{d.reason}</div>
            <div className="col-span-2 text-right">{d.count}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


