import { TabsList, TabsTrigger } from "../ui/tabs";

const tabs = [
  { value: "about", label: "My Profile" },
  { value: "library", label: "My Library" },
  //   { value: "reviews", label: "My Reviews" },
];

export default function ReaderTabs() {
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
