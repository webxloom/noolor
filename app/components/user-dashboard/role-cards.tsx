import { BadgeCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const readerFeatures = [
  { text: "Discover & Read free books", included: true },
  { text: "Like, Review & Bookmark books", included: true },
  { text: "Reading lists", included: true },
  { text: "Publish Blogs (For Premium users)", included: false },
];

const authorFeatures = [
  { text: "Create author profile", included: true },
  { text: "Upload books", included: true },
  { text: "Receive order requests", included: true },
  { text: "Publish Blogs & Events (1/month)", included: true },
];

function Card({
  title,
  subtitle,
  badgeEnabled,
  btnLabel,
  borderColor = "border-gray-200",
  clickHandler,
  children,
}: any) {
  return (
    <div
      className={`group relative block rounded-lg border-2 ${borderColor} bg-background/80 p-6 transition hover:shadow-lg`}
    >
      <div>
        <h3 className="text-base font-semibold flex items-center">
          {badgeEnabled && (
            <BadgeCheckIcon className="w-5 h-5 text-green-500 inline-block mr-2" />
          )}
          {title}
        </h3>

        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {children && (
        <div className="mt-4 text-sm text-muted-foreground">{children}</div>
      )}

      <button
        onClick={clickHandler}
        className="w-full mt-3 px-4 py-2 cursor-pointer rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {btnLabel}
      </button>
    </div>
  );
}

export default function UserDashboardRoleCards({
  isAuthor,
  isPublication,
  handleRoleClick,
}: {
  isAuthor: boolean;
  isPublication: boolean;
  handleRoleClick: (role: string, redirect: boolean) => void;
}) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Reader - default role */}
      <Card
        clickHandler={() => {
          router.push("/dashboard/reader");
        }}
        title="Reader Profile"
        subtitle="Manage your reader settings & preferences"
        badgeEnabled
        btnLabel="View Reader Profile"
        borderColor="border-blue-400"
      >
        <ul className="mt-2 space-y-1 text-base">
          {readerFeatures.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              {feature.included ? (
                <span className="text-green-500">✔</span>
              ) : (
                <span className="text-red-500">✖</span>
              )}
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Author Role */}
      <Card
        clickHandler={() => handleRoleClick("author", isAuthor)}
        title={isAuthor ? "Author Profile" : "Become an Author"}
        subtitle={
          isAuthor
            ? "Manage your author dashboard"
            : "Share your stories and publish content"
        }
        badgeEnabled={isAuthor}
        btnLabel={isAuthor ? "View Author Profile" : "Become an Author"}
        borderColor="border-green-400"
      >
        <ul className="mt-2 space-y-1 text-base">
          {authorFeatures.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              {feature.included ? (
                <span className="text-green-500">✔</span>
              ) : (
                <span className="text-red-500">✖</span>
              )}
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Publication Role */}
      <Card
        clickHandler={() => handleRoleClick("publication", isPublication)}
        title={isPublication ? "Publication Profile" : "Become a Publication"}
        subtitle={
          isPublication
            ? "Manage your publication dashboard"
            : "Manage publications and teams"
        }
        badgeEnabled={isPublication}
        btnLabel={
          isPublication ? "View Publication Profile" : "Become a Publication"
        }
        borderColor="border-purple-400"
      >
        <ul className="mt-2 space-y-1 text-base">
          {authorFeatures.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              {feature.included ? (
                <span className="text-green-500">✔</span>
              ) : (
                <span className="text-red-500">✖</span>
              )}
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
