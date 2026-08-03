import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { EVENT_STATUS_OPTIONS, EVENT_VISIBILITY_OPTIONS } from "../shared";

export default function EventForm({
  form,
  setField,
  coverFileName,
  handleCoverFileChange,
  clearCoverFile,
  isSaving,
}: {
  form: any;
  setField: any;
  coverFileName: string | null;
  handleCoverFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearCoverFile: () => void;
  isSaving: boolean;
}) {
  return (
    <>
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="event-title">Event title</Label>
        <Input
          id="event-title"
          value={form.title}
          onChange={(event) => setField("title", event.target.value)}
          placeholder="Enter event title"
          required
        />
      </div>

      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          value={form.description}
          onChange={(event) => setField("description", event.target.value)}
          placeholder="What is this event about?"
          rows={6}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-title">Event type</Label>
          <Input
            id="event-type"
            value={form.eventType}
            onChange={(event) => setField("eventType", event.target.value)}
            placeholder="Enter event type (e.g., workshop, conference)"
            required
          />
        </div>

        {/* Event Mode */}
        <div className="space-y-2">
          <Label htmlFor="event-mode">Event mode</Label>
          <Select
            value={form.eventMode}
            onValueChange={(value) => setField("eventMode", value)}
          >
            <SelectTrigger id="event-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Start date - end date */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-start-date">Start date</Label>
          <Input
            id="event-start-date"
            type="datetime-local"
            value={form.startDate}
            onChange={(event) => setField("startDate", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-end-date">End date</Label>
          <Input
            id="event-end-date"
            type="datetime-local"
            value={form.endDate}
            onChange={(event) => setField("endDate", event.target.value)}
          />
        </div>
      </div>

      {/* Venue -name, address, city */}
      <div className="space-y-2">
        <Label htmlFor="event-venue-name">Venue name</Label>
        <Input
          id="event-venue-name"
          value={form.venueName}
          onChange={(event) => setField("venueName", event.target.value)}
          placeholder="Enter venue name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-venue-address">Venue address</Label>
        <Input
          id="event-venue-address"
          value={form.venueAddress}
          onChange={(event) => setField("venueAddress", event.target.value)}
          placeholder="Enter venue address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-city">City</Label>
        <Input
          id="event-city"
          value={form.city}
          onChange={(event) => setField("city", event.target.value)}
          placeholder="Enter city"
        />
      </div>

      {/* Meeting Url - if online */}
      <div className="space-y-2">
        <Label htmlFor="event-meeting-url">Meeting URL</Label>
        <Input
          id="event-meeting-url"
          value={form.meetingUrl}
          onChange={(event) => setField("meetingUrl", event.target.value)}
          placeholder="Enter meeting URL (for online events)"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(value) => setField("status", value)}
          >
            <SelectTrigger id="event-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-visibility">Visibility</Label>
          <Select
            value={form.visibility}
            onValueChange={(value) => setField("visibility", value)}
          >
            <SelectTrigger id="event-visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_VISIBILITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cover Image */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="blog-cover-file">Cover image</Label>
          <Input
            id="event-cover-file"
            type="file"
            accept="image/*"
            disabled={isSaving}
            onChange={handleCoverFileChange}
          />
          <div className="rounded-xl border bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
            {coverFileName
              ? `${coverFileName} will upload when you save this blog.`
              : form.coverUrl
                ? "Stored cover image is attached."
                : "No cover image selected yet."}
          </div>
          <div className="flex flex-wrap gap-2">
            {form.coverImage ? (
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href={form.coverImage} target="_blank" rel="noreferrer">
                  <Upload className="h-4 w-4" />
                  Open current image
                </Link>
              </Button>
            ) : null}
            {form.coverImage ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearCoverFile}
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
