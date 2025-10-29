import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Share,
  Users,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HcwService } from "@/services/api.service";

/**
 * HCW@Home Embedded Televisit Component
 *
 * Integrates with HCW@Home open-source teleconsultation platform
 * - WebRTC video/audio via Mediasoup (NOT Jitsi/Twilio)
 * - HIPAA-compliant secure consultations
 * - No external SDK dependencies
 *
 * HCW@Home Features:
 * - Secure chat with file attachments
 * - HL7 FHIR integration
 * - OpenID/SAML authentication
 * - ClamAV antivirus scanning
 *
 * Architecture:
 * Telecheck → HCW Backend API → Mediasoup WebRTC Server
 */

export function Televisit() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [hcwConsultationUrl, setHcwConsultationUrl] = useState<string | null>(
    null,
  );
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch HCW@Home consultation URL from Telecheck API
  useEffect(() => {
    let mounted = true;

    const loadConsultation = async () => {
      if (!appointmentId) {
        setError("Invalid appointment reference.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response =
          await HcwService.createConsultationSession(appointmentId);

        if (!mounted) {
          return;
        }

        const data = response.data ?? (response as any);

        if (!data?.hcwUrl) {
          throw new Error("Consultation link unavailable");
        }

        setConsultationId(
          data.hcwConsultationId ?? data.consultationId ?? null,
        );
        setHcwConsultationUrl(data.hcwUrl);
      } catch (err) {
        if (!mounted) {
          return;
        }
        console.error("Failed to initialize HCW consultation:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load consultation",
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadConsultation();

    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  const handleEndConsultation = async () => {
    if (!appointmentId || !consultationId) {
      return;
    }

    try {
      await HcwService.endConsultation(appointmentId, consultationId);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Failed to end consultation:", err);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Video className="w-12 h-12 mx-auto animate-pulse text-cyan-600" />
              <div>
                <h3 className="text-lg font-semibold">
                  Initializing Consultation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connecting to HCW@Home secure video platform...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Consultation Error:</strong> {error}
            <br />
            <span className="text-sm">
              Please contact support if this issue persists.
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render HCW@Home consultation
  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <div className="bg-background border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-cyan-600" />
          <div>
            <h1 className="text-lg font-semibold">Secure Televisit</h1>
            <p className="text-xs text-muted-foreground">
              Powered by HCW@Home • HIPAA Compliant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {consultationId && (
            <Badge variant="secondary" className="text-xs">
              ID: {consultationId}
            </Badge>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndConsultation}
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Consultation
          </Button>
        </div>
      </div>

      {/* HCW@Home Embedded Consultation */}
      <div className="flex-1 bg-black">
        {hcwConsultationUrl ? (
          <iframe
            src={hcwConsultationUrl}
            title="HCW@Home Consultation"
            className="w-full h-full border-0"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Consultation URL not available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Televisit;
