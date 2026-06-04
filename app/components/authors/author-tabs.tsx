import { TabsList, TabsTrigger } from "../ui/tabs";

const tabs = [
  { value: "about", label: "Bio" },
  { value: "books", label: "Books" },
  { value: "blogs", label: "Blogs" },
  { value: "social", label: "Social Media & Links" },
  { value: "awards", label: "Awards & Works" },
  { value: "events", label: "Events" },
];

export default function AuthorTabs() {
  return (
    <TabsList className="h-auto w-full justify-start gap-1 sm:gap-2 overflow-x-auto border border-border/70 bg-card p-1.5 sm:p-2 scrollbar-hide flex-nowrap">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="cursor-pointer hover:bg-primary/50 hover:text-primary text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0"
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
