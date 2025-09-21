import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ReportingService } from "../services/api.service";

export function AuditReports() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    ReportingService.getAuditReports().then((res) => setData(res.data)).catch(() => setData({ entries: [], summary: { total: 0 } }));
  }, []);
  return (
    <Card>
      <CardHeader><CardTitle>Audit Reports</CardTitle></CardHeader>
      <CardContent>
        <div className="text-sm">Total entries: {data?.summary?.total ?? 0}</div>
        <div className="mt-2 flex gap-2">
          <Button onClick={() => ReportingService.exportData("csv").then(() => {})}>Export CSV</Button>
          <Button onClick={() => ReportingService.exportData("xlsx").then(() => {})}>Export XLSX</Button>
        </div>
      </CardContent>
    </Card>
  );
}


