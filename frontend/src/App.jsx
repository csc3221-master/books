// frontend/src/App.jsx
import { useEffect, useState } from "react";

const emptyForm = {
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

export default function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function loadBooks() {
    setStatus({ type: "loading", message: "Loading books..." });
    try {
      const res = await fetch("/api/books");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to load books");

      setBooks(body?.data || []);
      setStatus({ type: "ok", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function createBook(e) {
    e.preventDefault();
    setStatus({ type: "loading", message: "Creating book..." });

    const payload = {
      name: form.name.trim(),
      authors: toCsvArray(form.authors),
      isbn: form.isbn.trim(),
      year: form.year ? Number(form.year) : undefined,
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
        // show useful info from API
        const msg =
          body?.error === "ValidationError"
            ? (body?.details || []).map((d) => `${d.path}: ${d.message}`).join("; ")
            : body?.error || "Create failed";
        throw new Error(msg);
      }

      setForm(emptyForm);
      await loadBooks();
      setStatus({ type: "ok", message: "Book created." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function deleteBook(id) {
    if (!confirm("Delete this book?")) return;

    setStatus({ type: "loading", message: "Deleting book..." });
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Delete failed");

      await loadBooks();
      setStatus({ type: "ok", message: "Book deleted." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Books</h1>
      <div style={{ color: "#555", marginBottom: "1.5rem" }}>
        Frontend: Vite+React (Docker). API proxied via <code>/api</code>.
      </div>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Add Book</h2>

        <form onSubmit={createBook} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Name*<br />
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ width: "100%" }}
            />
          </label>

          <label>
            ISBN*<br />
            <input
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              required
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Authors (comma-separated)<br />
            <input
              value={form.authors}
              onChange={(e) => setForm({ ...form, authors: e.target.value })}
              placeholder="e.g., J.R.R. Tolkien, Someone Else"
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Tags (comma-separated)<br />
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g., fantasy, classic"
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Year<br />
            <input
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              inputMode="numeric"
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Language<br />
            <input
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              placeholder="e.g., en"
              style={{ width: "100%" }}
            />
          </label>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "center" }}>
            <button type="submit">Create</button>
            <button type="button" onClick={() => setForm(emptyForm)}>Clear</button>
            <button type="button" onClick={loadBooks}>Refresh</button>
          </div>
        </form>

        {status.type !== "idle" && status.message && (
          <div style={{ marginTop: 12 }}>
            <strong>{status.type.toUpperCase()}:</strong> {status.message}
          </div>
        )}
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>All Books</h2>

        {books.length === 0 ? (
          <div>No books yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>Name</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>ISBN</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>Authors</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>Year</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>Language</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 4px" }}>Tags</th>
                <th style={{ borderBottom: "1px solid #ddd", padding: "8px 4px" }} />
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b._id}>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>{b.name}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>{b.isbn}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>{(b.authors || []).join(", ")}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>{b.year ?? ""}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>{b.language ?? ""}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}>{(b.tags || []).join(", ")}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                    <button onClick={() => deleteBook(b._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}