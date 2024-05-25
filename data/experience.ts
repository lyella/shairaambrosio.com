type Position = {
  id: number;
  position: string;
  company: string;
  date: string;
  link: string;
};

export const allPositions: readonly Position[] = [
  {
    id: 5,
    position: "Front-end Developer",
    company: "ZZ",
    date: "04.2023 - present",
    link: " ",
  },
  {
    id: 4,
    position: "Front-end Developer",
    company: "Playgroundzero",
    date: "09.2022 - 01.2023",
    link: "https://www.playgroundzero.com/",
  },
  {
    id: 3,
    position: "Front-end Engineer",
    company: "Upward Next Inc.",
    date: "10.2020 - 05.2022",
    link: "https://www.upwardnext.com/",
  },
  {
    id: 2,
    position: "Blogger",
    company: "shairaambrosio.com",
    date: "02.2023 - present",
    link: "https://shairaambrosio.com",
  },
  {
    id: 1,
    position: "Freelancer",
    company: "None",
    date: "10.2018 - Present",
    link: "",
  },
];
