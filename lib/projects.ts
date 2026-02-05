/**
 * Project showcase data — replace with your own projects.
 */

export interface Project {
  id: string;
  title: string;
  role: string;
  period?: string;
  description?: string;
  stack: string[];
  /** Project thumbnail image URL */
  image: string;
  /** Optional link to case study or live project */
  href?: string;
  /** Featured on homepage */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "SalesMind Platform",
    role: "Software Engineer",
    period: "May 2024 - Oct 2025",
    description:
      "Redesigned Inbox feature for lead generation and automated messaging, improving front-end performance across the platform",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    href: "#demo",
    featured: true,
  },
  {
    id: "2",
    title: "Adaptive Micro-site",
    role: "Front-End Developer",
    period: "2024",
    description:
      "SEO-friendly micro-site with Firebase, OAuth, and n8n workflow automation deployed on GCP",
    stack: ["Next.js", "Tailwind CSS", "Firebase", "GCP"],
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
    href: "#demo",
    featured: true,
  },
  {
    id: "3",
    title: "Emotion Classifier",
    role: "Mobile & Backend Developer",
    period: "Nov 2023 – Mar 2024",
    description:
      "Real-time emotion classification application using computer vision and machine learning",
    stack: ["Kotlin", "Firebase", "Go", "TensorFlow"],
    image:
      "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80",
    href: "#demo",
    featured: true,
  },
  {
    id: "4",
    title: "Hotel Reservation Prediction",
    role: "Machine Learning Engineer",
    period: "Nov 2023",
    description:
      "Predictive analytics system for hotel booking patterns using machine learning algorithms",
    stack: ["Python", "TensorFlow", "OpenCV", "Pandas"],
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    href: "#demo",
    featured: true,
  },
  {
    id: "5",
    title: "Game Hub",
    role: "Mobile Developer",
    period: "Jul 2023 – Oct 2023",
    description:
      "Cross-platform gaming platform with real-time multiplayer capabilities",
    stack: ["Flutter", "Firebase", "Dart"],
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    href: "#demo",
  },
  {
    id: "6",
    title: "Coursyclopedia",
    role: "Data Science Developer",
    period: "Jul 2023 – Oct 2023",
    description:
      "Course recommendation system using machine learning for personalized learning paths",
    stack: ["Python", "Scikit-learn", "Pandas"],
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    href: "#demo",
  },
];
