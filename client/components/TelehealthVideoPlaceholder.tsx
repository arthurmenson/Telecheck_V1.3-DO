import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export function TelehealthVideoPlaceholder({ roomId }: { roomId: string }) {
  const [token, setToken] = useState<string>("");
  const [status, setStatus] = useState<string>("disconnected");

  const getToken = async () => {
    const res = await fetch("/api/telehealth-advanced/video/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    });
    const json = await res.json();
    setToken(json?.data?.token || "");
  };

  useEffect(() => {
    setStatus(token ? "connected" : "disconnected");
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telehealth Video (Placeholder)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div>Status: <span className={status === "connected" ? "text-green-600" : "text-red-600"}>{status}</span></div>
          <Button onClick={getToken}>Get Token</Button>
        </div>
        {token && (
          <div className="mt-4 text-sm break-all">
            Token: {token}
          </div>
        )}
        <div className="mt-4 h-48 bg-muted flex items-center justify-center rounded">
          Video SDK integration point
        </div>
      </CardContent>
    </Card>
  );
}


