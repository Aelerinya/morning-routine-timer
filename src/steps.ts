export const INITIAL_STEPS: Step[] = [
  {
    name: "Test step",
    duration: 0.1,
  },
  {
    name: "Read Mnestic",
    duration: 1,
  },
  {
    name: "Look at RingConn",
    duration: 1,
  },
  {
    name: "Log sleep stats Exist",
    duration: 3,
    url: "https://exist.io/review/",
  },
  { name: "Sunsama init", duration: 4 },
  {
    name: "Look at calendar",
    duration: 1,
    url: "https://calendar.google.com/calendar/u/0/r",
  },
  {
    name: "Look at todo list",
    duration: 2,
    url: "https://app.todoist.com/app/today",
  },
  {
    name: "Review last day on Intend",
    duration: 10,
    url: "https://intend.do/aelerinya/now",
  },
  {
    name: "Do one of the rationality techniques in the deck",
    duration: 5,
  },
  {
    name: "Set intention for the day on Intend",
    duration: 4,
    url: "https://intend.do/aelerinya/today",
  },
  {
    name: "Sunsama finish plan",
    duration: 3,
  },
];

export interface Step {
  name: string;
  duration: number;
  url?: string; // New optional property for the URL
}
