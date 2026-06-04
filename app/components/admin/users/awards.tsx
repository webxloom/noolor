import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

const awardsDetails: any = {
  title: { label: "Title", type: "text" },
  year: { label: "Year", type: "text" },
  fileUrl: { label: "File URL", type: "file" },
};

export default function Awards({
  awards,
  setField,
}: {
  awards: any;
  setField: (field: string, value: any) => void;
}) {
  return (
    <section className="mt-6 border-t bg-card">
      <h3 className="pt-2 font-semibold">Awards</h3>
      {awards.map((award: any, index: number) => (
        <div
          key={`award-${index}`}
          className="space-y-2 rounded-lg border p-4 mt-2 grid grid-cols-2 gap-4"
        >
          {Object.keys(awardsDetails).map((key) => {
            const detail = awardsDetails[key];
            if (!detail) return null;

            // Handle file input separately
            if (key === "fileUrl") {
              const currentUrl = (award as any).fileUrl as string | undefined;
              const currentName = (award as any).fileName
                ? (award as any).fileName
                : currentUrl
                  ? decodeURIComponent(currentUrl.split("/").pop() || "")
                  : "";

              return (
                <div
                  key={key}
                  className="space-y-2 grid grid-cols-2 gap-4 col-span-full"
                >
                  <div className="flex flex-col">
                    <Label
                      htmlFor={`award-${index}-file`}
                      className="text-sm sm:text-base"
                    >
                      {detail.label}
                    </Label>
                    <Input
                      id={`award-file-${index}`}
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        const nextAwards = [...(awards ?? [])];
                        const next = {
                          ...(nextAwards[index] ?? {}),
                          // store object url for preview; backend should handle upload
                          fileUrl: file
                            ? URL.createObjectURL(file)
                            : (nextAwards[index]?.fileUrl ?? null),
                          file: file ?? nextAwards[index]?.file,
                          fileName: file
                            ? file.name
                            : nextAwards[index]?.fileName,
                        };
                        nextAwards[index] = next as any;
                        setField("awards", nextAwards);
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      {currentName ? (
                        <a
                          href={currentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          {currentName}
                        </a>
                      ) : (
                        <span>No file chosen</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={key} className="space-y-2">
                <Label
                  htmlFor={`award-${index}-${key}`}
                  className="text-sm sm:text-base"
                >
                  {detail.label}
                </Label>
                <Input
                  id={`award-${index}-${key}`}
                  type={detail.type}
                  value={award[key] ?? ""}
                  onChange={(event) => {
                    const nextAwards = [...(awards ?? [])];
                    nextAwards[index] = {
                      ...nextAwards[index],
                      [key]: event.target.value,
                    };
                    setField("awards", nextAwards);
                  }}
                  placeholder={detail.label}
                  className="text-sm sm:text-base"
                />
              </div>
            );
          })}
        </div>
      ))}

      {/* Update button */}
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Save
        </button>
      </div>
    </section>
  );
}
