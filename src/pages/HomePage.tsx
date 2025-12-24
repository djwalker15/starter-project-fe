import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Starter Project</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Minimal CRUD UI against the backend OpenAPI.
      </p>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Modules</h2>
        <ul style={{ marginBottom: 0 }}>
          <li>
            <Link to="/greetings">Greetings</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
