/**
 * Generate appointment slots
 */
const generateTimeSlots = (startTime, endTime, slotDuration) => {
  const slots = [];

  const [startHour, startMinute] = startTime.split(":").map(Number);

  const [endHour, endMinute] = endTime.split(":").map(Number);

  let current = startHour * 60 + startMinute;

  const end = endHour * 60 + endMinute;

  while (current < end) {
    const hour = Math.floor(current / 60);

    const minute = current % 60;

    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );

    current += slotDuration;
  }

  return slots;
};

module.exports = generateTimeSlots;
