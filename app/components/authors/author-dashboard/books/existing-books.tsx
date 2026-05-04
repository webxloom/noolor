import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Search, Filter, Pencil, Loader2, Plus, Trash2 } from "lucide-react";

import { useAuthorBooksContext } from "@/app/contexts/books-context";
import { STATUS_FILTERS, getBookStatus, getStatusBadgeVariant } from "./shared";

export default function AuthorExistingBooks() {
  const {
    books,
    filter,
    filteredBooks,
    handleDelete,
    isDeletingId,
    search,
    setFilter,
    setSearch,
    startCreate,
    startEdit,
    statusCounts,
  } = useAuthorBooksContext();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 gap-4 lg:grid-cols-3">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Total books</CardDescription>
              <CardTitle className="font-serif text-3xl">
                {books.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Published or monetized</CardDescription>
              <CardTitle className="font-serif text-3xl">
                {statusCounts.published + statusCounts.free + statusCounts.paid}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Draft or upcoming</CardDescription>
              <CardTitle className="font-serif text-3xl">
                {statusCounts.draft + statusCounts.upcoming}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
        <Button type="button" onClick={startCreate} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add new book
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, language, genre, or description"
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((statusFilter) => (
              <Button
                key={statusFilter.value}
                type="button"
                variant={filter === statusFilter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(statusFilter.value)}
              >
                <Filter className="h-3.5 w-3.5" />
                {statusFilter.label}
                <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] text-foreground">
                  {statusCounts[statusFilter.value]}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
              No books matched the current filters.
            </div>
          ) : (
            filteredBooks.map((book) => {
              const status = getBookStatus(book);

              return (
                <div
                  key={book.id}
                  className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-foreground">
                          {book.title}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(status)}>
                          {status}
                        </Badge>
                        {book.language ? (
                          <Badge variant="secondary">{book.language}</Badge>
                        ) : null}
                        {book.genres?.[0] ? (
                          <Badge variant="secondary">{book.genres[0]}</Badge>
                        ) : null}
                      </div>
                      <p className="max-w-3xl text-sm text-muted-foreground">
                        {book.description || "No description added yet."}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>Pages: {book.page_count ?? "-"}</span>
                        <span>Year: {book.published_year ?? "-"}</span>
                        <span>
                          {book.cover_url ? "Cover uploaded" : "No cover yet"}
                        </span>
                        <span>
                          Pricing:{" "}
                          {book.is_free
                            ? "Free"
                            : book.price
                              ? `INR ${book.price}`
                              : "Not set"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(book)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(book)}
                        disabled={isDeletingId === book.id}
                      >
                        {isDeletingId === book.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
