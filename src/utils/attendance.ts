const calculateConsecutiveAttendance = (attendanceDates) => {
    if (attendanceDates.length === 0) return 0;

    const dates = attendanceDates.map(date => new Date(date)).sort((a, b) => b - a);
    let consecutiveCount = 0;
    let today = new Date();

    for (let date of dates) {
        const formattedDate = date.toISOString().split('T')[0];

        if (formattedDate === today.toISOString().split('T')[0]) {
            consecutiveCount++;
        } else {
            today.setDate(today.getDate() - 1);
            if (formattedDate === today.toISOString().split('T')[0]) {
                consecutiveCount++;
            } else {
                break;
            }
        }
    }

    return consecutiveCount;
};

module.exports = { calculateConsecutiveAttendance };
