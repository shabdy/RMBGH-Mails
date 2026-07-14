// Official Philippine holidays — Proclamation No. 1006 (2026), signed by
// President Marcos on Sept. 3, 2025. Source: PNA / Malacañang release.
// Eidul Fitr and Eidul Adha are excluded because their dates are only
// proclaimed once the Islamic (Hijra) calendar dates are confirmed — add
// them here once announced.
export const PH_HOLIDAYS_2026 = [
  { date: "2026-01-01", name: "New Year's Day", type: "regular" },
  { date: "2026-02-17", name: "Chinese New Year", type: "special" },
  { date: "2026-02-25", name: "EDSA People Power Anniversary (40th)", type: "working" },
  { date: "2026-04-02", name: "Maundy Thursday", type: "regular" },
  { date: "2026-04-03", name: "Good Friday", type: "regular" },
  { date: "2026-04-04", name: "Black Saturday", type: "special" },
  { date: "2026-04-09", name: "Araw ng Kagitingan", type: "regular" },
  { date: "2026-05-01", name: "Labor Day", type: "regular" },
  { date: "2026-06-12", name: "Independence Day", type: "regular" },
  { date: "2026-08-21", name: "Ninoy Aquino Day", type: "special" },
  { date: "2026-08-31", name: "National Heroes Day", type: "regular" },
  { date: "2026-11-01", name: "All Saints' Day", type: "special" },
  { date: "2026-11-02", name: "All Souls' Day", type: "special" },
  { date: "2026-11-30", name: "Bonifacio Day", type: "regular" },
  { date: "2026-12-08", name: "Feast of the Immaculate Conception of Mary", type: "special" },
  { date: "2026-12-24", name: "Christmas Eve", type: "special" },
  { date: "2026-12-25", name: "Christmas Day", type: "regular" },
  { date: "2026-12-30", name: "Rizal Day", type: "regular" },
  { date: "2026-12-31", name: "Last Day of the Year", type: "special" },
];

export const HOLIDAY_TYPE_LABEL = {
  regular: "Regular Holiday",
  special: "Special Non-Working Day",
  working: "Special Working Day",
};

// Fast lookup: "yyyy-mm-dd" -> holiday object
export const PH_HOLIDAYS_BY_DATE = PH_HOLIDAYS_2026.reduce((acc, h) => {
  acc[h.date] = h;
  return acc;
}, {});
