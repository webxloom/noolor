import { Loader2, Plus } from "lucide-react";

import { useAuthorBooksContext } from "@/app/contexts/books-context";

// Components
import { Button } from "@/app/components/ui/button";
import { CardTitle } from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import DeleteBook from "./delete-book";
import BookDetails from "./book-details";
import BookAssets from "./book-assets";
import AwardsEditor from "@/app/components/shared/awards-editor";

export default function BooksEditor({
  bookId,
  action,
  onClose,
}: {
  bookId?: string | null;
  action: string;
  onClose: (open: boolean) => void;
}) {
  const {
    editingBookId,
    editorSection,
    form,
    handleSubmit,
    isSaving,
    quoteInput,
    resetEditor,
    setEditorSection,
    setField,
    setQuoteInput,
    addAward,
    removeAward: removeBookAward,
    updateAward: updateBookAward,
    handleAwardFileUpload: handleBookAwardFileUpload,
    clearAwardFile: clearBookAwardFile,
    pendingAwardFileNames,
  } = useAuthorBooksContext();

  if (action === "delete") {
    return (
      <DeleteBook
        editingBookId={bookId ?? editingBookId ?? undefined}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="font-serif text-2xl">
            {bookId ? "Edit book" : "Add new book"}
          </CardTitle>
        </div>
      </div>

      <div className="space-y-5">
        <Tabs
          value={editorSection}
          onValueChange={setEditorSection}
          className="space-y-4"
        >
          <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl border border-border/70 bg-muted/15 p-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="awards">Awards</TabsTrigger>
          </TabsList>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Details */}
            <TabsContent value="details" className="grid gap-5 md:grid-cols-2">
              <BookDetails
                form={form}
                setField={setField}
                quoteInput={quoteInput}
                setQuoteInput={setQuoteInput}
              />
            </TabsContent>

            {/* Assets */}
            <TabsContent value="assets" className="grid gap-5 md:grid-cols-2">
              <BookAssets />
            </TabsContent>

            {/* Awards */}
            <TabsContent value="awards" className="space-y-4">
              <AwardsEditor
                awards={form.awards ?? []}
                addAward={addAward}
                removeAward={(i) => removeBookAward(i)}
                updateAward={(i, f, v) => updateBookAward(i, f as any, v)}
                handleAwardFileUpload={(i, e) =>
                  handleBookAwardFileUpload(i, e as any)
                }
                clearAwardFile={(i) => clearBookAwardFile(i)}
                pendingAwardFileNames={pendingAwardFileNames}
                isSaving={isSaving}
                onDraftChange={(next) => setField("awards" as any, next as any)}
              />
            </TabsContent>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isSaving || !form.title.trim()}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingBookId ? "Save book" : "Create book"}
              </Button>
              <Button type="button" variant="outline" onClick={resetEditor}>
                Reset form
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
