import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const ScheduleCalendar = ({ selectedDate, onDateChange, availability = [] }) => {
  // Check if date is in doctor's availability lists
  const tileDisabled = ({ date, view }) => {
    // Enable selection for view !== 'month'
    if (view !== 'month') return false;

    // Don't allow past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // If doctor has explicit dates listed under availability
    if (availability.length > 0) {
      const isAvailable = availability.some((availDate) => {
        const d = new Date(availDate);
        return (
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        );
      });
      return !isAvailable;
    }

    // Default: Allow all future dates
    return false;
  };

  return (
    <div className="w-full">
      <Calendar
        onChange={onDateChange}
        value={selectedDate}
        tileDisabled={tileDisabled}
        className="mx-auto"
      />
    </div>
  );
};

export default ScheduleCalendar;
