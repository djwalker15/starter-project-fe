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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}
console.log(`API BASE URL: ${VITE_API_BASE_URL}`)
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
      return `${e.message}${
        e.payload ? ` | detail: ${JSON.stringify(e.payload)}` : ""
      }`;
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
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Greetings</h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            API: <code>{apiLabel}</code>
          </div>
        </div>

        <button
          onClick={() => void refresh()}
          disabled={loading}
          style={{
            height: 38,
            padding: "0 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "transparent",
            color: "inherit",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {err && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255, 100, 100, 0.35)",
            background: "rgba(255,100,100,0.08)",
            whiteSpace: "pre-wrap",
          }}
        >
          {err}
        </div>
      )}

      <section
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Create</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ opacity: 0.8, fontSize: 13 }}>Sender</span>
            <input
              value={form.sender}
              onChange={(e) => setForm((p) => ({ ...p, sender: e.target.value }))}
              maxLength={50}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ opacity: 0.8, fontSize: 13 }}>Recipient</span>
            <input
              value={form.recipient}
              onChange={(e) => setForm((p) => ({ ...p, recipient: e.target.value }))}
              maxLength={50}
            />
          </label>

          <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
            <span style={{ opacity: 0.8, fontSize: 13 }}>Message</span>
            <textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              maxLength={280}
              rows={3}
            />
          </label>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <button
            onClick={() => void onCreate()}
            disabled={creating || !form.sender || !form.recipient || !form.message}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "inherit",
              cursor:
                creating || !form.sender || !form.recipient || !form.message
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {creating ? "Creating…" : "Create Greeting"}
          </button>

          <button
            onClick={() => setForm(EMPTY_FORM)}
            disabled={creating}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "inherit",
              cursor: creating ? "not-allowed" : "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>List</h2>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
            }}
          >
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={thStyle}>Sender</th>
                <th style={thStyle}>Recipient</th>
                <th style={thStyle}>Message</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && (
                <tr>
                  <td style={tdStyle} colSpan={5}>
                    No greetings found.
                  </td>
                </tr>
              )}

              {items.map((g) => {
                const isEditing = editingId === g.id;

                return (
                  <tr key={g.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={tdStyle}>
                      {isEditing ? (
                        <input
                          value={editDraft.sender}
                          maxLength={50}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, sender: e.target.value }))
                          }
                        />
                      ) : (
                        g.sender
                      )}
                    </td>

                    <td style={tdStyle}>
                      {isEditing ? (
                        <input
                          value={editDraft.recipient}
                          maxLength={50}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, recipient: e.target.value }))
                          }
                        />
                      ) : (
                        g.recipient
                      )}
                    </td>

                    <td style={tdStyle}>
                      {isEditing ? (
                        <textarea
                          value={editDraft.message}
                          maxLength={280}
                          rows={2}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, message: e.target.value }))
                          }
                        />
                      ) : (
                        <span style={{ opacity: 0.95 }}>{g.message}</span>
                      )}
                    </td>

                    <td style={tdStyle}>
                      <span style={{ opacity: 0.75, fontSize: 13 }}>
                        {formatDate(g.created_at)}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            onClick={() => void onSaveEdit(g.id)}
                            disabled={saving}
                            style={miniBtnPrimary}
                          >
                            {saving ? "Saving…" : "Save"}
                          </button>
                          <button onClick={cancelEdit} disabled={saving} style={miniBtn}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button onClick={() => startEdit(g)} style={miniBtnPrimary}>
                            Edit
                          </button>
                          <button onClick={() => void onDelete(g.id)} style={miniBtn}>
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 13,
  opacity: 0.8,
  borderBottom: "1px solid rgba(255,255,255,0.12)",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  verticalAlign: "top",
};

const miniBtn: React.CSSProperties = {
  height: 32,
  padding: "0 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};

const miniBtnPrimary: React.CSSProperties = {
  ...miniBtn,
  background: "rgba(255,255,255,0.06)",
};
