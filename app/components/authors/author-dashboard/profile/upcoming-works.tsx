"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { useAuthorProfileContext } from "../../../../contexts/profile-context";

export default function AuthorUpcomingWorks() {
  const { addUpcomingWork, form, removeUpcomingWork, updateUpcomingWork } =
    useAuthorProfileContext();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="font-serif text-2xl">Upcoming works</CardTitle>
        </div>
        <Button type="button" variant="outline" onClick={addUpcomingWork}>
          <Plus className="h-4 w-4" />
          Add work
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {form.upcomingWorks.map((work, index) => (
          <div
            key={`work-${index}`}
            className="space-y-4 rounded-2xl border p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`work-title-${index}`}>Title</Label>
                <Input
                  id={`work-title-${index}`}
                  value={work.title}
                  onChange={(event) =>
                    updateUpcomingWork(index, "title", event.target.value)
                  }
                  placeholder="Upcoming title"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeUpcomingWork(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`work-description-${index}`}>Description</Label>
                <Textarea
                  id={`work-description-${index}`}
                  value={work.description}
                  onChange={(event) =>
                    updateUpcomingWork(index, "description", event.target.value)
                  }
                  rows={4}
                  placeholder="What is this work about?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`work-quote-${index}`}>Quote</Label>
                <Textarea
                  id={`work-quote-${index}`}
                  value={work.quote}
                  onChange={(event) =>
                    updateUpcomingWork(index, "quote", event.target.value)
                  }
                  rows={4}
                  placeholder="Optional excerpt or quote"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
