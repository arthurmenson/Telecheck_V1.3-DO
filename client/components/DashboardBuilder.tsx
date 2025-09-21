import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

type Widget = { id: string; type: string; title: string };

export function DashboardBuilder() {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: "w1", type: "kpi", title: "Total Patients" },
  ]);

  const addWidget = (type: string) => {
    setWidgets([...widgets, { id: `w${Date.now()}`, type, title: type.toUpperCase() }]);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Custom Dashboard Builder</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          <Button onClick={() => addWidget("kpi")}>Add KPI</Button>
          <Button onClick={() => addWidget("chart")}>Add Chart</Button>
          <Button onClick={() => addWidget("table")}>Add Table</Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {widgets.map((w) => (
            <div key={w.id} className="border rounded p-3 text-sm">
              <div className="font-semibold">{w.title}</div>
              <div className="text-muted-foreground">Type: {w.type}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


