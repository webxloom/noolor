import type { Blog } from "@/app/components/shared/blog-card";
import type { Book } from "@/app/components/shared/book-card";

export type Publication = {
  id: string;
  name: string;
  location?: string;
  description?: string;
  languages: string[];
  bookCount: number;
  books: Book[];
  blogs: Blog[];
};

export const samplePublications: Publication[] = [
  {
    id: "1",
    name: "Vanathi Pathippagam",
    location: "Chennai",
    description:
      "A long-standing Tamil publisher known for historical fiction, literary reprints, and accessible editions for general readers.",
    languages: ["Tamil"],
    bookCount: 24,
    books: [
      {
        id: "1",
        title: "Ponniyin Selvan",
        authorName: "Kalki Krishnamurthy",
        coverUrl: "",
        isFree: false,
        language: "Tamil",
        genre: "Historical Fiction",
        rating: 4.8,
        reviewCount: 234,
        price: 299,
      },
      {
        id: "5",
        title: "Kamba Ramayanam",
        authorName: "Kambar",
        coverUrl: "",
        isFree: false,
        language: "Tamil",
        genre: "Epic",
        rating: 4.8,
        reviewCount: 201,
        price: 399,
      },
    ],
    blogs: [
      {
        id: "2",
        title: "Kalki Krishnamurthy: A Literary Icon",
        authorName: "Suresh Ramanujam",
        authorAvatar: "",
        coverUrl: "",
        publishedAt: "2024-04-22",
        excerpt:
          "A closer look at Kalki's literary legacy, journalism, and lasting influence on Tamil readers.",
        language: "Tamil",
      },
    ],
  },
  {
    id: "2",
    name: "Classical Tamil Library",
    location: "Madurai",
    description:
      "Focused on preserving and reintroducing foundational Tamil texts through annotated, reader-friendly editions.",
    languages: ["Tamil", "English"],
    bookCount: 18,
    books: [
      {
        id: "2",
        title: "Silappatikaram",
        authorName: "Ilango Adigal",
        coverUrl: "",
        isFree: true,
        language: "Tamil",
        genre: "Epic",
        rating: 4.9,
        reviewCount: 156,
      },
      {
        id: "3",
        title: "Manimekalai",
        authorName: "Chithalai Chathanar",
        coverUrl: "",
        isFree: true,
        language: "Tamil",
        genre: "Epic",
        rating: 4.7,
        reviewCount: 89,
      },
      {
        id: "4",
        title: "Tirukkural",
        authorName: "Thiruvalluvar",
        coverUrl: "",
        isFree: true,
        language: "Tamil",
        genre: "Philosophy",
        rating: 4.9,
        reviewCount: 512,
      },
    ],
    blogs: [
      {
        id: "1",
        title: "The Enduring Legacy of Tamil Epics",
        authorName: "Dr. Ananya Iyer",
        authorAvatar: "",
        coverUrl: "",
        publishedAt: "2024-05-10",
        excerpt:
          "How classical Tamil epics continue to shape modern literary conversation and cultural memory.",
        language: "Tamil",
      },
      {
        id: "3",
        title: "The Philosophy of Thirukkural",
        authorName: "Dr. Meena Subramanian",
        authorAvatar: "",
        coverUrl: "",
        publishedAt: "2024-03-15",
        excerpt:
          "A study of the ethical architecture of Tirukkural and why it still resonates today.",
        language: "Tamil",
      },
    ],
  },
  {
    id: "3",
    name: "Scribner",
    location: "New York",
    description:
      "An established English-language publisher associated with classic and modern literary fiction.",
    languages: ["English"],
    bookCount: 12,
    books: [
      {
        id: "6",
        title: "The Great Gatsby",
        authorName: "F. Scott Fitzgerald",
        coverUrl: "",
        isFree: false,
        language: "English",
        genre: "Fiction",
        rating: 4.5,
        reviewCount: 1200,
        price: 199,
      },
    ],
    blogs: [],
  },
  {
    id: "4",
    name: "Poetry Commons",
    location: "London",
    description:
      "An independent literary house focused on poetry, essays, and curated public-domain editions.",
    languages: ["English", "Tamil"],
    bookCount: 9,
    books: [
      {
        id: "7",
        title: "Leaves of Grass",
        authorName: "Walt Whitman",
        coverUrl: "",
        isFree: true,
        language: "English",
        genre: "Poetry",
        rating: 4.3,
        reviewCount: 423,
      },
    ],
    blogs: [],
  },
  {
    id: "5",
    name: "Bantam Books",
    location: "Cambridge",
    description:
      "Publishes accessible nonfiction, science writing, and enduring trade titles for general readers.",
    languages: ["English"],
    bookCount: 14,
    books: [
      {
        id: "8",
        title: "A Brief History of Time",
        authorName: "Stephen Hawking",
        coverUrl: "",
        isFree: false,
        language: "English",
        genre: "History",
        rating: 4.6,
        reviewCount: 980,
        price: 249,
      },
    ],
    blogs: [],
  },
];
