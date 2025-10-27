import { RequestHandler } from "express";
import prisma from "../config/prisma";
import { startOfDay, endOfDay, addDays, format, parseISO } from "date-fns";

// Helper function to generate time slots
function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number,
): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    );
    currentMinutes += intervalMinutes;
  }

  return slots;
}

// Helper function to check if a time slot is booked
function isSlotBooked(
  slot: string,
  appointments: Array<{ scheduledTime: Date; duration?: number }>,
  date: Date,
): boolean {
  const [hours, minutes] = slot.split(":").map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hours, minutes, 0, 0);

  // Default appointment duration: 30 minutes
  const slotDurationMinutes = 30;
  const bufferMinutes = 15;

  for (const appointment of appointments) {
    const appointmentStart = new Date(appointment.scheduledTime);
    const appointmentDuration = appointment.duration || 30;
    const appointmentEnd = new Date(
      appointmentStart.getTime() + appointmentDuration * 60000,
    );

    // Check if slot overlaps with appointment (including buffer)
    const slotStart = slotDate.getTime() - bufferMinutes * 60000;
    const slotEnd =
      slotDate.getTime() + (slotDurationMinutes + bufferMinutes) * 60000;

    if (
      (slotStart >= appointmentStart.getTime() &&
        slotStart < appointmentEnd.getTime()) ||
      (slotEnd > appointmentStart.getTime() &&
        slotEnd <= appointmentEnd.getTime()) ||
      (slotStart <= appointmentStart.getTime() &&
        slotEnd >= appointmentEnd.getTime())
    ) {
      return true;
    }
  }

  return false;
}

// Calculate availability for a doctor
async function calculateAvailability(
  doctorId: string,
  days: number = 7,
): Promise<Array<{ date: string; slots: string[] }>> {
  const availability = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = addDays(now, i);

    // Skip weekends (optional - uncomment to enable)
    // if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Get existing appointments for this doctor on this date
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledTime: {
          gte: startOfDay(date),
          lt: endOfDay(date),
        },
        status: { in: ["pending", "confirmed", "active"] },
      },
      select: {
        scheduledTime: true,
      },
    });

    // Generate all possible 30-min slots from 9am-5pm
    const allSlots = generateTimeSlots("09:00", "17:00", 30);

    // Filter out booked slots (with 15-min buffer)
    const availableSlots = allSlots.filter(
      (slot) => !isSlotBooked(slot, appointments, date),
    );

    availability.push({
      date: format(date, "yyyy-MM-dd"),
      slots: availableSlots,
    });
  }

  return availability;
}

// Get telemedicine providers
export const getTelemedicineProviders: RequestHandler = async (req, res) => {
  try {
    const { specialty, videoEnabled, available } = req.query;

    // Build where clause for filtering
    const where: any = {
      role: "DOCTOR",
      doctorProfile: {},
    };

    // Filter by specialty if provided
    if (specialty) {
      where.doctorProfile.specialty = {
        contains: specialty as string,
        mode: "insensitive",
      };
    }

    // Filter by video capability if provided
    if (videoEnabled !== undefined) {
      where.doctorProfile.videoEnabled = videoEnabled === "true";
    }

    // Query doctors with their profiles
    const doctors = await prisma.user.findMany({
      where,
      include: {
        doctorProfile: true,
      },
      orderBy: [{ doctorProfile: { rating: "desc" } }, { firstName: "asc" }],
    });

    // Transform and enrich doctor data
    const providers = await Promise.all(
      doctors
        .filter((doctor) => doctor.doctorProfile) // Only include doctors with profiles
        .map(async (doctor) => {
          const profile = doctor.doctorProfile!;

          // Calculate availability for next 7 days
          const availability = await calculateAvailability(doctor.id, 7);

          // Find next available slot
          let nextAvailable: string | null = null;
          for (const day of availability) {
            if (day.slots.length > 0) {
              nextAvailable = `${day.date} ${day.slots[0]}`;
              break;
            }
          }

          // If filtering by specific date availability
          if (available) {
            try {
              const targetDate = parseISO(available as string);
              const targetDateStr = format(targetDate, "yyyy-MM-dd");
              const dayAvailability = availability.find(
                (a) => a.date === targetDateStr,
              );

              // Skip if doctor not available on requested date
              if (!dayAvailability || dayAvailability.slots.length === 0) {
                return null;
              }
            } catch (error) {
              console.error("Invalid date format:", available);
            }
          }

          return {
            id: doctor.id,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            specialty: profile.specialty,
            credentials: profile.credentials,
            bio: profile.bio || "",
            experience: profile.experience,
            rating: profile.rating,
            reviewCount: profile.reviewCount,
            languages: profile.languages,
            videoEnabled: profile.videoEnabled,
            phoneEnabled: profile.phoneEnabled,
            inPersonEnabled: profile.inPersonEnabled,
            location: profile.location || "",
            education: profile.education || "",
            nextAvailable,
            availability,
          };
        }),
    );

    // Filter out null entries (doctors filtered by availability)
    const filteredProviders = providers.filter((p) => p !== null);

    res.json({
      success: true,
      providers: filteredProviders,
    });
  } catch (error) {
    console.error("Get telemedicine providers error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch telemedicine providers",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
