// frontend/src/App.jsx
import { useEffect, useMemo, useState } from "react";

const emptyCreateForm = {
  name: "",
  authors: "",
  isbn: "",
  year: "",
  language: "",
  tags: "",
};

function toCsvArray(str) {
  return String(str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function asNumberOrUndef(x) {
  const s = String(x ?? "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function buildQuery(params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (!s) continue;
    qs.set(k, s);
  }
  return qs.toString();
}

export default function App() {
  // list state
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  // query controls
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [author, setAuthor] = useState("");
  const [language, setLanguage] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [limit, setLimit] = useState("20");
  const [page, setPage] = useState(1);

  // create form
  const [form, setForm] = useState(emptyCreateForm);

  // edit state (inline)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [status, setStatus] = useState({ type: "idle", message: "" });

  const queryString = useMemo(() => {
    return buildQuery({
      q,
      tag,
      author,
      language,
      year,
      sort,
      limit,
      page,
    });
  }, [q, tag, author, language, year, sort, limit, page]);

  async function loadBooks() {
    setStatus({ type: "loading", message: "Loading..." });
    try {
      const res = await fetch(`/api/books?${queryString}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to load books");

      setBooks(body?.data || []);
      setMeta(body?.meta || { page: 1, limit: 20, total: 0, pages: 1 });
      setStatus({ type: "ok", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  function resetToFirstPageAndReload() {
    setPage(1);
    // loadBooks will be triggered by queryString change
  }

  async function createBook(e) {
    e.preventDefault();
    setStatus({ type: "loading", message: "Creating..." });

    const payload = {
      name: form.name.trim(),
      authors: toCsvArray(form.authors),
      isbn: form.isbn.trim(),
      year: asNumberOrUndef(form.year),
      language: form.language.trim(),
      tags: toCsvArray(form.tags),
    };

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (!res.ok) {
        const msg =
          body?.error === "ValidationError"
            ? (body?.details || []).map((d) => `${d.path}: ${d.message}`).join("; ")
            : body?.error || "Create failed";
        throw new Error(msg);
      }

      setForm(emptyCreateForm);
      resetToFirstPageAndReload();
      setStatus({ type: "ok", message: "Created." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function deleteBook(id) {
    if (!confirm("Delete this book?")) return;
    setStatus({ type: "loading", message: "Deleting..." });

    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Delete failed");

      // If we deleted the last item on a page, go back one page if needed
      if (books.length === 1 && page > 1) setPage(page - 1);
      else loadBooks();

      setStatus({ type: "ok", message: "Deleted." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  function startEdit(book) {
    setEditingId(book._id);
    setEditForm({
      name: book.name ?? "",
      isbn: book.isbn ?? "",
      authors: (book.authors || []).join(", "),
      year: book.year ?? "",
      language: book.language ?? "",
      tags: (book.tags || []).join(", "),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function saveEdit(id) {
    setStatus({ type: "loading", message: "Saving..." });

    const payload = {
      name: String(editForm.name || "").trim(),
      isbn: String(editForm.isbn || "").trim(),
      authors: toCsvArray(editForm.authors),
      year: asNumberOrUndef(editForm.year),
      language: String(editForm.language || "").trim(),
      tags: toCsvArray(editForm.tags),
    };

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (!res.ok) {
        const msg =
          body?.error === "ValidationError"
            ? (body?.details || []).map((d) => `${d.path}: ${d.message}`).join("; ")
            : body?.error || "Update failed";
        throw new Error(msg);
      }

      cancelEdit();
      loadBooks();
      setStatus({ type: "ok", message: "Saved." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  function StatusBar() {
    if (status.type === "idle") return null;
    if (status.type === "ok" && !status.message) return null;
    return (
      <div style={{ margin: "12px 0", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 10 }}>
        <strong>{status.type.toUpperCase()}:</strong> {status.message}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ marginBottom: 4 }}>Books</h1>
      <div style={{ color: "#555", marginBottom: 18 }}>
        Vite+React frontend (Docker) • API proxied via <code>/api</code>
      </div>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>Search / Filter</h2>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10, alignItems: "end" }}>
          <label>
            Search (q)<br />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} style={{ width: "100%" }} />
          </label>

          <label>
            Tag<br />
            <input value={tag} onChange={(e) => { setTag(e.target.value); setPage(1); }} style={{ width: "100%" }} />
          </label>

          <label>
            Author<br />
            <input value={author} onChange={(e) => { setAuthor(e.target.value); setPage(1); }} style={{ width: "100%" }} />
          </label>

          <label>
            Language<br />
            <input value={language} onChange={(e) => { setLanguage(e.target.value); setPage(1); }} placeholder="en" style={{ width: "100%" }} />
          </label>

          <label>
            Year<br />
            <input value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }} inputMode="numeric" style={{ width: "100%" }} />
          </label>

          <label>
            Sort<br />
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: "100%" }}>
              <option value="createdAt:desc">Newest</option>
              <option value="createdAt:asc">Oldest</option>
              <option value="name:asc">Name (A→Z)</option>
              <option value="name:desc">Name (Z→A)</option>
              <option value="year:asc">Year (Asc)</option>
              <option value="year:desc">Year (Desc)</option>
            </select>
          </label>

          <label>
            Page size<br />
            <select value={limit} onChange={(e) => { setLimit(e.target.value); setPage(1); }} style={{ width: "100%" }}>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => { setQ(""); setTag(""); setAuthor(""); setLanguage(""); setYear(""); setSort("createdAt:desc"); setLimit("20"); setPage(1); }}>
              Clear
            </button>
            <button type="button" onClick={loadBooks}>Refresh</button>
          </div>

          <div style={{ gridColumn: "1 / -1", color: "#555" }}>
            Results: <strong>{meta.total ?? 0}</strong> • Page <strong>{meta.page ?? page}</strong> / <strong>{meta.pages ?? 1}</strong>
          </div>
        </div>

        <StatusBar />
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>Add Book</h2>

        <form onSubmit={createBook} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr 2fr", gap: 10 }}>
          <label>
            Name*<br />
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: "100%" }} />
          </label>

          <label>
            ISBN*<br />
            <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required style={{ width: "100%" }} />
          </label>

          <label>
            Authors (comma-separated)<br />
            <input value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} style={{ width: "100%" }} />
          </label>

          <label>
            Tags (comma-separated)<br />
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} style={{ width: "100%" }} />
          </label>

          <label>
            Year<br />
            <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} inputMode="numeric" style={{ width: "100%" }} />
          </label>

          <label>
            Language<br />
            <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="en" style={{ width: "100%" }} />
          </label>

          <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
            <button type="submit">Create</button>
            <button type="button" onClick={() => setForm(emptyCreateForm)}>Clear</button>
          </div>
        </form>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ marginTop: 0 }}>Books</h2>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <span>
              Page <strong>{meta.page ?? page}</strong> / <strong>{meta.pages ?? 1}</strong>
            </span>
            <button type="button" disabled={page >= (meta.pages ?? 1)} onClick={() => setPage((p) => Math.min(meta.pages ?? p, p + 1))}>Next</button>
          </div>
        </div>

        {books.length === 0 ? (
          <div>No books.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>Name</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>ISBN</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>Authors</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>Year</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>Lang</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>Tags</th>
                <th style={{ borderBottom: "1px solid #ddd", padding: "8px 4px" }} />
              </tr>
            </thead>
            <tbody>
              {books.map((b) => {
                const isEditing = editingId === b._id;

                return (
                  <tr key={b._id}>
                    <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>
                      {isEditing ? (
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ width: "100%" }} />
                      ) : (
                        b.name
                      )}
                    </td>

                    <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>
                      {isEditing ? (
                        <input value={editForm.isbn} onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })} style={{ width: "100%" }} />
                      ) : (
                        b.isbn
                      )}
                    </td>

                    <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>
                      {isEditing ? (
                        <input value={editForm.authors} onChange={(e) => setEditForm({ ...editForm, authors: e.target.value })} style={{ width: "100%" }} />
                      ) : (
                        (b.authors || []).join(", ")
                      )}
                    </td>

                    <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>
                      {isEditing ? (
                        <input value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} inputMode="numeric" style={{ width: 90 }} />
                      ) : (
                        b.year ?? ""
                      )}
                    </td>

                    <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>
                      {isEditing ? (
                        <input value={editForm.language} onChange={(e) => setEditForm({ ...editForm, language: e.target.value })} style={{ width: 70 }} />
                      ) : (
                        b.language ?? ""
                      )}
                    </td>

                    <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>
                      {isEditing ? (
                        <input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} style={{ width: "100%" }} />
                      ) : (
                        (b.tags || []).join(", ")
                      )}
                    </td>

                    <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0", textAlign: "right", whiteSpace: "nowrap" }}>
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(b._id)}>Save</button>{" "}
                          <button onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(b)}>Edit</button>{" "}
                          <button onClick={() => deleteBook(b._id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}