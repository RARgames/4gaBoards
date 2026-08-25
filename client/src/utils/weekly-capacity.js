const getWeeklyCapacity = (weeklyHours, spentMinutes) => {
  const capacityMinutes = Math.round(weeklyHours * 60);
  const remainingMinutes = Math.max(0, capacityMinutes - spentMinutes);

  return {
    capacityMinutes,
    remainingMinutes,
    isOverCapacity: spentMinutes > capacityMinutes,
  };
};

export default getWeeklyCapacity;
