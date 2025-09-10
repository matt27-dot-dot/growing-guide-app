export const pregnancyMilestones = {
  1: "Your baby is just beginning! A tiny cluster of cells is forming.",
  4: "Your baby's heart begins to form and beat. So exciting! 💗",
  6: "Brain and nervous system development is in full swing.",
  8: "Tiny limb buds are appearing - future arms and legs!",
  10: "Your baby is officially called a fetus now. Major organs are developing.",
  12: "Fingernails are forming and the baby can make a fist!",
  16: "You might feel the first flutters of movement soon!",
  20: "Halfway there! Baby can hear sounds from outside the womb.",
  24: "Baby's sense of hearing is developing rapidly.",
  28: "Baby's eyes can open and close, and they're practicing breathing!",
  32: "Baby's bones are hardening, but the skull remains flexible for birth.",
  36: "Baby is considered full-term and ready for the world!",
  40: "Your due date is here! Baby is ready to meet you! 👶"
};

export const babyEssentialsByCategory = {
  "Feeding": [
    "Baby bottles",
    "Burp cloths",
    "Pacifiers"
  ],
  "Clothing": [
    "Baby clothes (0-3 months)",
    "Onesies",
    "Baby socks/booties",
    "Swaddle blankets",
    "Receiving blankets"
  ],
  "Diaper Care": [
    "Diapers/Nappies",
    "Baby wipes",
    "Changing table/pad"
  ],
  "Sleep & Safety": [
    "Crib/Bassinet",
    "Car seat",
    "Baby monitor"
  ],
  "Bathing & Grooming": [
    "Baby lotion",
    "Baby shampoo",
    "Baby nail clippers"
  ],
  "Health & Safety": [
    "Baby thermometer",
    "First aid kit"
  ],
  "Transportation": [
    "Stroller"
  ]
};

// Legacy export for backward compatibility
export const babyEssentials = Object.values(babyEssentialsByCategory).flat();

export const getPregnancyInfo = (currentWeek: number) => {
  const totalWeeks = 40;
  const weeksRemaining = Math.max(0, totalWeeks - currentWeek);
  
  // Find the closest milestone
  const milestoneWeeks = Object.keys(pregnancyMilestones).map(Number).sort((a, b) => a - b);
  const currentMilestone = milestoneWeeks.reduce((prev, curr) => 
    Math.abs(curr - currentWeek) < Math.abs(prev - currentWeek) ? curr : prev
  );
  
  const milestone = pregnancyMilestones[currentMilestone as keyof typeof pregnancyMilestones];
  
  // Calculate due date (assuming today is the start of current week)
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + (weeksRemaining * 7));
  
  return {
    currentWeek,
    weeksRemaining,
    totalWeeks,
    milestone,
    dueDate,
    progress: (currentWeek / totalWeeks) * 100
  };
};