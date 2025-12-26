import { useEffect, useMemo, useState } from "react";
import {
  createGreeting,
  deleteGreeting,
  listGreetings,
  updateGreeting,
  type GreetingCreate,
  type GreetingRead,
} from "../api/greetings";
import { ApiError, VITE_API_BASE_URL } from "../api/http";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

type FormState = GreetingCreate;
const EMPTY_FORM: FormState = { sender: "", recipient: "", message: "" };

export function GreetingsPage() {
  const [items, setItems] = useState<GreetingRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const apiLabel = useMemo(() => {
    return VITE_API_BASE_URL ? VITE_API_BASE_URL : "(same-origin)";
  }, []);

  async function refresh() {
    const ac = new AbortController();
    setLoading(true);
    setErr(null);
    try {
      const data = await listGreetings(ac.signal);
      setItems(data);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setErr(renderError(e));
    } finally {
      setLoading(false);
    }
    return () => ac.abort();
  }

  useEffect(() => {
    void refresh();
  }, []);

  function renderError(e: unknown) {
    if (e instanceof ApiError) {
      return `${e.message}${e.payload ? ` | detail: ${JSON.stringify(e.payload)}` : ""}`;
    }
    if (e instanceof Error) return e.message;
    return String(e);
  }

  async function onCreate() {
    setCreating(true);
    setErr(null);
    try {
      const created = await createGreeting(form);
      setItems((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
    } catch (e) {
      setErr(renderError(e));
    } finally {
      setCreating(false);
    }
  }

  function startEdit(g: GreetingRead) {
    setEditingId(g.id);
    setEditDraft({ sender: g.sender, recipient: g.recipient, message: g.message });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(EMPTY_FORM);
  }

  async function onSaveEdit(id: string) {
    setSaving(true);
    setErr(null);
    try {
      const updated = await updateGreeting(id, {
        sender: editDraft.sender,
        recipient: editDraft.recipient,
        message: editDraft.message,
      });
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      cancelEdit();
    } catch (e) {
      setErr(renderError(e));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm("Delete this greeting?");
    if (!ok) return;

    setErr(null);
    try {
      await deleteGreeting(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setErr(renderError(e));
    }
  }

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Greetings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            API Endpoint: <code className="bg-muted px-1 py-0.5 rounded">{apiLabel}</code>
          </p>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh List"}
        </Button>
      </div>

      {err && (
        <div className="mb-6 p-4 rounded-md bg-destructive/15 text-destructive border border-destructive/20">
          {err}
        </div>
      )}

      {/* Create Form Card */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Create New Greeting</CardTitle>
          <CardDescription>Send a message to someone special.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Sender
              </label>
              <Input
                placeholder="e.g. Alice"
                value={form.sender}
                onChange={(e) => setForm((p) => ({ ...p, sender: e.target.value }))}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Recipient
              </label>
              <Input
                placeholder="e.g. Bob"
                value={form.recipient}
                onChange={(e) => setForm((p) => ({ ...p, recipient: e.target.value }))}
                maxLength={50}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Message
              </label>
              <Textarea
                placeholder="Type your message here..."
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                maxLength={280}
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={() => void onCreate()} disabled={creating || !form.sender || !form.recipient || !form.message}>
              {creating ? "Creating..." : "Create Greeting"}
            </Button>
            <Button variant="ghost" onClick={() => setForm(EMPTY_FORM)} disabled={creating}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Sender</TableHead>
              <TableHead className="w-[150px]">Recipient</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-[180px]">Created</TableHead>
              <TableHead className="text-right w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No greetings found. Create one above!
                </TableCell>
              </TableRow>
            )}
            {items.map((g) => {
              const isEditing = editingId === g.id;
              return (
                <TableRow key={g.id}>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editDraft.sender}
                        onChange={(e) => setEditDraft((p) => ({ ...p, sender: e.target.value }))}
                        className="h-8"
                      />
                    ) : (
                      <span className="font-medium">{g.sender}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editDraft.recipient}
                        onChange={(e) => setEditDraft((p) => ({ ...p, recipient: e.target.value }))}
                        className="h-8"
                      />
                    ) : (
                      g.recipient
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Textarea
                        value={editDraft.message}
                        onChange={(e) => setEditDraft((p) => ({ ...p, message: e.target.value }))}
                        className="min-h-[60px]"
                      />
                    ) : (
                      g.message
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(g.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => void onSaveEdit(g.id)} disabled={saving}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={saving}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(g)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => void onDelete(g.id)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
