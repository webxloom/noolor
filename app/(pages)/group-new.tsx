import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateGroup, getListGroupsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const LANGUAGES = ["Tamil", "English", "Telugu", "Kannada", "Malayalam", "Hindi", "Any"];

export default function GroupNew() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("Tamil");
  const [isPrivate, setIsPrivate] = useState(false);

  const createGroup = useCreateGroup();

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-muted-foreground">
        <p>Please log in to create a group.</p>
        <Link href="/login"><Button className="mt-4">Log in</Button></Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    createGroup.mutate(
      { data: { name, description: description || undefined, language, isPrivate } },
      {
        onSuccess: (group) => {
          queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
          toast({ title: "Group created!" });
          setLocation(`/groups/${group.id}`);
        },
        onError: () => {
          toast({ title: "Failed to create group", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/groups" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to groups
      </Link>

      <h1 className="text-2xl font-serif font-semibold text-foreground mb-6">Create a Group</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            data-testid="input-group-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter group name..."
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="group-description">Description (optional)</Label>
          <Textarea
            id="group-description"
            data-testid="textarea-group-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this group about?"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="group-language">Primary Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="group-language" data-testid="select-group-language" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="group-private"
            data-testid="switch-group-private"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
          />
          <Label htmlFor="group-private">Private group</Label>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            data-testid="button-submit-group"
            disabled={createGroup.isPending || !name.trim()}
          >
            {createGroup.isPending ? "Creating..." : "Create Group"}
          </Button>
          <Link href="/groups">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
