type Position = {
  id: number;
  position: string;
  company: string;
  date: string;
  link: string;
};

export const allPositions: readonly Position[] = [
  {
    id: 1,
    position: "Front-end Developer",
    company: "Playgroundzero",
    date: "09.2022 - present",
    link: "https://www.playgroundzero.com/",
  },
  {
    id: 2,
    position: "Front-end Engineer",
    company: "Upward Next Inc.",
    date: "10.2020 - 05.2022",
    link: "https://www.upwardnext.com/",
  },
  {
    id: 3,
    position: "Blogger",
    company: "shairaambrosio.com",
    date: "02.2023 - present",
    link: "https://shairaambrosio.com",
  },
  {
    id: 4,
    position: "Freelancer",
    company: "None",
    date: "10.2018 - Present",
    link: "",
  },
];
