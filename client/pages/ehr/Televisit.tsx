import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Mic, MicOff, VideoOff, PhoneOff, Share, Users } from "lucide-react";
import { useCreateTelehealthRoom, useJoinTelehealthRoom, useEndTelehealthSession } from "@/hooks/api";

// Open-source integration using Jitsi IFrame API
// No external SDK dependency; we embed the meeting via iframe with room name

export function Televisit() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const createRoom = useCreateTelehealthRoom();
  const joinRoom = useJoinTelehealthRoom();
  const endSession = useEndTelehealthSession();

  // Derive a Jitsi room name from roomId; fallback to appointmentId
  const jitsiRoom = useMemo(() => roomId || appointmentId || "telecheck-demo-room", [roomId, appointmentId]);
  const jitsiSrc = useMemo(() => {
    // Public Jitsi instance for demo; replace with self-hosted for production
    const base = "https://meet.jit.si";
    const params = new URLSearchParams({
      // Start with muted/video off flags reflected in UI only
    });
    return `${base}/${encodeURIComponent(jitsiRoom)}#config.prejoinPageEnabled=true&${params.toString()}`;
  }, [jitsiRoom]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const created = await createRoom.mutateAsync({ appointmentId: appointmentId || `appt_${Date.now()}` });
        if (!mounted) return;
        const rid = (created as any)?.data?.roomId || (created as any)?.roomId;
        setRoomId(rid);
        const joined = await joinRoom.mutateAsync({ roomId: rid });
        if (!mounted) return;
        const url = (joined as any)?.data?.joinUrl || (joined as any)?.joinUrl;
        setMeetingUrl(url);
      } catch (e) {
        console.error("Televisit init failed", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  const handleEnd = async () => {
    if (!roomId) return;
    try {
      await endSession.mutateAsync({ roomId });
      // Optionally navigate away
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Televisit</h1>
          <p className="text-sm text-muted-foreground">Secure video consultation</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {jitsiRoom}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-md overflow-hidden border">
            <iframe
              ref={iframeRef}
              title="Televisit"
              src={jitsiSrc}
              allow="camera; microphone; fullscreen; display-capture"
              style={{ width: "100%", height: "100%", border: 0 }}
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <Button variant={muted ? "destructive" : "outline"} onClick={() => setMuted((m) => !m)}>
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button variant={videoOff ? "destructive" : "outline"} onClick={() => setVideoOff((v) => !v)}>
              {videoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>
            <Button variant="outline">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="destructive" onClick={handleEnd}>
              <PhoneOff className="w-4 h-4" /> End
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Televisit;




