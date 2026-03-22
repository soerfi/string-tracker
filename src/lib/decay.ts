/**
 * Decay Formula Logic for String Health
 * T_total = (Base Life * Skill Multiplier) / F_weekly
 */

export function calculateDeadDate(
  stringDate: Date,
  baseLifeHours: number,
  skillMultiplier: number,
  weeklyFrequency: number
): Date {
  if (weeklyFrequency <= 0) {
    // If they never play, standard poly/multi still degrades over ~6-9 months
    const fallback = new Date(stringDate);
    fallback.setMonth(fallback.getMonth() + 6);
    return fallback;
  }

  // Total lifespan in weeks given the usage pattern
  const totalWeeks = (baseLifeHours * Math.max(0.1, skillMultiplier)) / Math.max(0.1, weeklyFrequency);
  
  // Total lifespan in days
  const totalDays = totalWeeks * 7;
  
  const deadDate = new Date(stringDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
  
  return deadDate;
}

export function calculateHealthPercentage(
  stringDate: Date,
  deadDate: Date,
  currentDate: Date = new Date()
): number {
  const totalTime = deadDate.getTime() - stringDate.getTime();
  const elapsedTime = currentDate.getTime() - stringDate.getTime();
  
  if (totalTime <= 0) return 0; // Edge case
  
  let percentage = 100 - (elapsedTime / totalTime) * 100;
  
  // Clamp between 0 and 100
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;
  
  return percentage;
}

export function getHealthStatus(percentage: number): 'Peak' | 'Losing Snapback' | 'Dead' {
  if (percentage >= 60) return 'Peak';
  if (percentage >= 20) return 'Losing Snapback';
  return 'Dead';
}
