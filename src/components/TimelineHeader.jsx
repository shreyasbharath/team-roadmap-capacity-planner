/**
 * Renders the main timeline header with quarters
 */
export const TimelineHeader = ({ quarters }) => (
  <div className="flex border-b-2 border-gray-300">
    <div className="w-48 bg-blue-600 text-white font-bold p-2 border-r-2 border-gray-300">
      Who
    </div>
    <div className="flex">
      {quarters.map(quarter => (
        <div
          key={quarter.name}
          className="bg-blue-500 text-white text-center font-semibold p-2 border-r border-gray-300"
          style={{ width: `${quarter.months.length * 4 * 4}rem` }}
        >
          {quarter.name}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Renders the month headers
 */
export const MonthHeaders = ({ quarters }) => (
  <div className="flex border-b border-gray-300">
    <div className="w-48 bg-blue-400 text-white font-medium p-2 border-r border-gray-300" />
    <div className="flex">
      {quarters.map(quarter =>
        quarter.months.map(month => (
          <div
            key={month}
            className="bg-blue-400 text-white text-center font-medium p-2 border-r border-gray-200"
            style={{ width: '16rem' }}
          >
            {month}
          </div>
        ))
      )}
    </div>
  </div>
);

/**
 * Renders individual week header cell
 */
export const WeekCell = ({ week, index, currentWeekIndex, children }) => {
  const isCurrentWeek = index === currentWeekIndex;
  const bgColor = isCurrentWeek ? 'bg-green-100' : 'bg-gray-50';

  return (
    <div className={`${bgColor} text-center text-sm p-1 border-r border-gray-200 w-16 relative`}>
      {week}

      {isCurrentWeek && (
        <>
          <div className="absolute top-0 left-0 right-0 bottom-0 border-l-2 border-dotted border-green-500 pointer-events-none" />
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-1 py-0.5 rounded shadow-sm z-20">
            Today
          </div>
        </>
      )}

      {children}
    </div>
  );
};

/**
 * Renders the complete week headers row
 */
export const WeekHeaders = ({ weeks, currentWeekIndex }) => (
  <div className="flex border-b border-gray-300 relative">
    <div className="w-48 bg-gray-100 p-2 border-r border-gray-300" />
    <div className="flex">
      {weeks.map((week, index) => (
        <WeekCell
          key={week}
          week={week}
          index={index}
          currentWeekIndex={currentWeekIndex}
        />
      ))}
    </div>
  </div>
);

/**
 * Renders individual day header cell
 */
export const DayCell = ({ day, isToday, children }) => {
  const bgColor = isToday ? 'bg-green-100' : 'bg-gray-50';

  return (
    <div className={`${bgColor} text-center text-xs p-1 border-r border-gray-200 w-16 relative`}>
      <div className="font-medium">{day.dayOfWeek}</div>
      <div className="text-gray-600">{day.dayOfMonth}</div>

      {isToday && (
        <>
          <div className="absolute top-0 left-0 right-0 bottom-0 border-l-2 border-dotted border-green-500 pointer-events-none" />
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-1 py-0.5 rounded shadow-sm z-20">
            Today
          </div>
        </>
      )}

      {children}
    </div>
  );
};

/**
 * Renders the complete day headers row for daily view
 */
export const DayHeaders = ({ days }) => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  return (
    <div className="flex border-b border-gray-300 relative">
      <div className="w-48 bg-gray-100 p-2 border-r border-gray-300" />
      <div className="flex">
        {days.map((day, index) => {
          const dayString = day.date.toISOString().split('T')[0];
          const isToday = dayString === todayString;

          return (
            <DayCell
              key={`${day.date.getTime()}-${index}`}
              day={day}
              index={index}
              isToday={isToday}
            />
          );
        })}
      </div>
    </div>
  );
};
