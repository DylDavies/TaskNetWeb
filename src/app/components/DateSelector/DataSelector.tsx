"use client";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import "./DateSelector.css";

const DateSelector: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  return (
    <section className="bg-gray-800 p-4 rounded-lg shadow-md text-gray-300 max-w-md">
      <label className="block mb-2 text-sm font-medium text-gray-400">
        Select a Date
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          if (date) {
            setSelectedDate(date);
          }
        }}
        dateFormat="yyyy/MM/dd"
        className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-600"
        calendarClassName="custom-calendar"
      />

      {selectedDate && (
        <section className="mt-4 text-sm flex flex-col gap-2">
          <p className="text-gray-400">
            Selected Date:{" "}
            <em className="text-orange-400 font-semibold">
              {format(selectedDate, "yyyy/MM/dd")}
            </em>
          </p>
          <section className="flex gap-4">
            <em
              onMouseEnter={() => setHoveredPart("year")}
              onMouseLeave={() => setHoveredPart(null)}
              className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                hoveredPart === "year"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              Year: {format(selectedDate, "yyyy")}
            </em>
            <em
              onMouseEnter={() => setHoveredPart("month")}
              onMouseLeave={() => setHoveredPart(null)}
              className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                hoveredPart === "month"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              Month: {format(selectedDate, "MM")}
            </em>
            <em
              onMouseEnter={() => setHoveredPart("day")}
              onMouseLeave={() => setHoveredPart(null)}
              className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                hoveredPart === "day"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              Day: {format(selectedDate, "dd")}
            </em>
          </section>
        </section>
      )}
    </section>
  );
};

export default DateSelector;
