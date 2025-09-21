import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type Charge = { code: string; description: string; amount: number };

export function RCMChargeCapture({ encounterId, onSave }: { encounterId: string; onSave?: (charges: Charge[]) => void }) {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);

  const add = () => {
    if (!code) return;
    setCharges([...charges, { code, description: desc, amount }]);
    setCode("");
    setDesc("");
    setAmount(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charge Capture — Encounter {encounterId}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-3"><Input placeholder="CPT/HCPCS" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div className="col-span-6"><Input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div className="col-span-2"><Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value || "0"))} /></div>
          <div className="col-span-1"><Button onClick={add}>Add</Button></div>
        </div>
        <div className="mt-4">
          {charges.map((c, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <div>{c.code}</div>
              <div className="flex-1 ml-2">{c.description}</div>
              <div>${c.amount.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => onSave?.(charges)}>Save Charges</Button>
        </div>
      </CardContent>
    </Card>
  );
}


