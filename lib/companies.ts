/**
 * Companies/brands you've worked with
 */

export interface Company {
  name: string;
  role?: string;
  period?: string;
}

export const companies: Company[] = [
  {
    name: "SalesMind AI",
    role: "Product Manager & Software Engineer",
    period: "May 2024 - Present",
  },
  {
    name: "D-Code Research Lab AU",
    role: "Full-Stack Developer",
    period: "Jul 2023 - Present",
  },
  {
    name: "House of Griffin",
    role: "Front-End Developer",
    period: "Nov 2022 - Mar 2023",
  },
  {
    name: "PS Park Apartment",
    role: "Full-Stack Developer",
    period: "Nov 2023 - Mar 2024",
  },
];
