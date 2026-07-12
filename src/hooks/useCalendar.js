import { useState } from "react";

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("Month");
  const [events, setEvents] = useState([]); // ✅ store all events in array

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );

  const goToToday = () => setCurrentDate(new Date());

  const addEvent = (event) => {
    setEvents((prev) => [...prev, event]);
  };

  // ✅ Get events for a given day (multi-day aware)
  const getEventsForDay = (dayObj) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (dayObj.monthOffset || 0),
      dayObj.day
    );

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate || event.startDate);
      return eventStart <= endOfDay && eventEnd >= startOfDay;
    });
  };

  return {
    currentDate,
    view,
    setView,
    nextMonth,
    prevMonth,
    goToToday,
    addEvent,
    getEventsForDay,
  };
}
