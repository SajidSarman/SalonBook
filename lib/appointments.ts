export type PayableAppointment = {
  serviceName: string
  serviceCategory: string
  serviceImage: string | null
  appointmentDate: string
  timeSlot: string
  servicePrice: number | null
  status: "Pending" | "Confirmed" | "Cancelled"
  paymentStatus: "Unpaid" | "Paid"
  createdAt: string | null
}

export function parseAppointment(value: unknown): PayableAppointment {
  if (typeof value !== "object" || value === null) {
    throw new Error("The appointment service returned an invalid response.")
  }
  const appointment = value as Record<string, unknown>
  if (
    typeof appointment.serviceName !== "string" ||
    (appointment.serviceCategory !== undefined &&
      typeof appointment.serviceCategory !== "string") ||
    (appointment.serviceImage !== undefined &&
      appointment.serviceImage !== null &&
      typeof appointment.serviceImage !== "string") ||
    typeof appointment.appointmentDate !== "string" ||
    typeof appointment.timeSlot !== "string" ||
    (appointment.servicePrice !== undefined &&
      (typeof appointment.servicePrice !== "number" ||
        !Number.isFinite(appointment.servicePrice))) ||
    (appointment.status !== "Pending" &&
      appointment.status !== "Confirmed" &&
      appointment.status !== "Cancelled") ||
    (appointment.paymentStatus !== "Unpaid" &&
      appointment.paymentStatus !== "Paid") ||
    (appointment.createdAt !== undefined &&
      typeof appointment.createdAt !== "string")
  ) {
    throw new Error(
      "The appointment service returned invalid appointment fields."
    )
  }

  return {
    serviceName: appointment.serviceName,
    serviceCategory:
      typeof appointment.serviceCategory === "string"
        ? appointment.serviceCategory
        : "",
    serviceImage:
      typeof appointment.serviceImage === "string"
        ? appointment.serviceImage
        : null,
    appointmentDate: appointment.appointmentDate,
    timeSlot: appointment.timeSlot,
    servicePrice:
      typeof appointment.servicePrice === "number"
        ? appointment.servicePrice
        : null,
    status: appointment.status,
    paymentStatus: appointment.paymentStatus,
    createdAt:
      typeof appointment.createdAt === "string" ? appointment.createdAt : null,
  }
}

export function displayAppointmentTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hours, minutes))
}
