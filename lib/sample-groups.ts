export type GroupMember = {
  userId: number;
  name: string;
  role: "admin" | "member";
  joinedAt: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  creatorName: string;
  isPrivate: boolean;
  language?: string;
  memberCount: number;
  isMember?: boolean;
  members: GroupMember[];
};

export const sampleGroups: Group[] = [
  {
    id: "1",
    name: "Tamil Classics Circle",
    description:
      "A reading group for discussing classical Tamil epics, poetry, and ethical texts with modern context.",
    creatorName: "Kalki Krishnamurthy",
    isPrivate: false,
    language: "Tamil",
    memberCount: 128,
    isMember: true,
    members: [
      {
        userId: 1,
        name: "Kalki Krishnamurthy",
        role: "admin",
        joinedAt: "2024-01-12",
      },
      {
        userId: 2,
        name: "Meena Subramanian",
        role: "member",
        joinedAt: "2024-02-01",
      },
      {
        userId: 3,
        name: "Arun Kumar",
        role: "member",
        joinedAt: "2024-02-14",
      },
    ],
  },
  {
    id: "2",
    name: "Modern Tamil Essays",
    description:
      "Focused on essays, criticism, and contemporary long-form Tamil literary writing.",
    creatorName: "Dr. Ananya Iyer",
    isPrivate: true,
    language: "Tamil",
    memberCount: 46,
    isMember: false,
    members: [
      {
        userId: 4,
        name: "Dr. Ananya Iyer",
        role: "admin",
        joinedAt: "2024-03-02",
      },
      {
        userId: 5,
        name: "Suresh Ramanujam",
        role: "member",
        joinedAt: "2024-03-17",
      },
    ],
  },
  {
    id: "3",
    name: "Poetry Commons",
    description:
      "A multilingual space for reading lyric poetry, translation, and performance traditions across Tamil and English.",
    creatorName: "Subramania Bharati",
    isPrivate: false,
    language: "English",
    memberCount: 73,
    isMember: false,
    members: [
      {
        userId: 6,
        name: "Subramania Bharati",
        role: "admin",
        joinedAt: "2024-01-08",
      },
      {
        userId: 7,
        name: "Walt Whitman",
        role: "member",
        joinedAt: "2024-01-22",
      },
    ],
  },
  {
    id: "4",
    name: "History Readers Guild",
    description:
      "For readers exploring literary history, biographies, and works that connect literature with social change.",
    creatorName: "Stephen Hawking",
    isPrivate: false,
    language: "English",
    memberCount: 39,
    isMember: true,
    members: [
      {
        userId: 8,
        name: "Stephen Hawking",
        role: "admin",
        joinedAt: "2024-04-10",
      },
      {
        userId: 9,
        name: "Divya S",
        role: "member",
        joinedAt: "2024-04-18",
      },
    ],
  },
];
