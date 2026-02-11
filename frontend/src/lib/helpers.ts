import { format, addMinutes, parseISO, parse } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const formatSelectedSlot = (
  slot: string | null,
  duration: number,
  timezone: string = "UTC",
  houtType: "12h" | "24h" = "24h",
) => {
  if (!slot) return null;

  const decodeSlot = decodeURIComponent(slot);
  const startTime = parseISO(decodeSlot);
  const zonedStartTime = toZonedTime(startTime, timezone);
  const zonedEndTime = addMinutes(zonedStartTime, duration);

  const formattedDate = format(zonedStartTime, "EEEE, MMMM d, yyyy");

  const timeFormat = houtType === "12h" ? "hh:mm a" : "HH:mm";
  const formattedTime = `${format(zonedStartTime, timeFormat)} - ${format(zonedEndTime, timeFormat)}`;

  return `${formattedDate} at ${formattedTime}`;
};

export const formatSlot = (
  slot: string,
  timezone: string = "UTC",
  houtType: "12h" | "24h" = "24h",
) => {
  const parsedTime = parse(slot, "HH:mm", new Date());
  const zonedTime = toZonedTime(parsedTime, timezone);
  return houtType === "12h"
    ? format(zonedTime, "hh:mm a")
    : format(zonedTime, "HH:mm");
};

export const decodeSlot = (
  encodedSlot: string | null,
  timeZone: string = "UTC",
  houtType: "12h" | "24h" = "24h",
) => {
  if (!encodedSlot) return null;
  const decodedSlot = decodeURIComponent(encodedSlot);
  const parsedTime = parse(decodedSlot, "HH:mm", new Date());
  const zonedTime = toZonedTime(parsedTime, timeZone);
  return houtType === "12h"
    ? format(zonedTime, "hh:mm a")
    : format(zonedTime, "HH:mm");
};
