import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export function SchedulingFlowBoard() {
  const [items, setItems] = useState<any[]>([]);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  useEffect(() => {
    fetch(`/api/scheduling-advanced/flowboard?date=${date}`)
      .then((r) => r.json())
      .then((res) => setItems(res.data?.items || []))
      .catch(() => setItems([]));
  }, [date]);

  const statuses = ["arrived", "roomed", "with_provider", "complete"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Flow Board</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {statuses.map((status) => (
            <div key={status} className="flex-1">
              <div className="font-semibold mb-2 capitalize">
                {status.replace("_", " ")}
              </div>
              <div className="space-y-2">
                {items
                  .filter((i) => i.status === status)
                  .map((i) => (
                    <div key={i.id} className="p-2 rounded border text-sm">
                      <div>
                        {i.time} • {i.patient}
                      </div>
                      <div className="text-muted-foreground">
                        {i.provider} • Room {i.room}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
