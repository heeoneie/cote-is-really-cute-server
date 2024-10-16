export const calculateConsecutiveAttendance = (attendanceDates: string[]): number => {
    if (attendanceDates.length === 0) return 0;

    const formDate = (date: Date): string => date.toISOString().split('T')[0];
    const dates: Date[] = attendanceDates.map(date => new Date(date)).sort((a, b) => b.getTime() - a.getTime());
    let consecutiveCount = 0;
    let today: Date = new Date();

    for (let date of dates) {
        const formattedDate = formDate(date);

        if (formattedDate === formDate(date)) consecutiveCount++;
         else {
            today.setDate(today.getDate() - 1);
            if (formattedDate === formDate(date)) consecutiveCount++;
            else break;
        }
    }

    return consecutiveCount;
};
