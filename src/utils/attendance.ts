export const calculateConsecutiveAttendance = (
  attendanceDates: (Date | string)[],
): number => {
  if (attendanceDates.length === 0) return 0;

  const dates = attendanceDates
    .map((date) => new Date(date))
    .sort((a, b) => Number(b) - Number(a));

  let consecutiveCount = 0;
  let today = new Date();

  for (let date of dates) {
    const formattedDate = date.toISOString().split('T')[0];
    const todayFormatted = today.toISOString().split('T')[0];

    if (formattedDate === todayFormatted) consecutiveCount++;
    else {
      today.setDate(today.getDate() - 1);
      if (formattedDate === today.toISOString().split('T')[0])
        consecutiveCount++;
      else break;
    }
  }

  return consecutiveCount;
};
