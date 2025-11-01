import { useState } from "react";
import "./styles.css";

export default function App() {
  const API_URL = "https://habit-tracker-1sl8.onrender.com";

  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [mode, setMode] = useState("login");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // ---- UI TAP SOUND ----
  const audioCtx =
    typeof window !== "undefined"
      ? new (window.AudioContext || window.webkitAudioContext)()
      : null;

  let tapBuffer = null;
  async function buildTapBuffer() {
    if (!audioCtx || tapBuffer) return tapBuffer;
    const duration = 0.06;
    const sr = audioCtx.sampleRate;
    const frames = Math.floor(duration * sr);
    const buffer = audioCtx.createBuffer(1, frames, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frames; i++) {
      const t = i / sr;
      const freq = 1400 - 900 * t;
      const env = Math.exp(-t * 40);
      data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.5;
    }
    tapBuffer = buffer;
    return buffer;
  }

  async function playTap() {
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") await audioCtx.resume();
    const buffer = await buildTapBuffer();
    const src = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    gain.gain.value = 0.22;
    src.buffer = buffer;
    src.connect(gain).connect(audioCtx.destination);
    src.start();
    if (navigator.vibrate) navigator.vibrate(8);
  }

  // ---- AUTH ----
  const login = async () => {
    const form = new FormData();
    form.append("username", username);
    form.append("password", password);

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setToken(data.access_token);
  };

  const register = async () => {
    if (!username.trim() || !password.trim()) return alert("Username and password cannot be empty.");

    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      alert("Account created. Now login.");
      setMode("login");
    } else {
      const data = await res.json();
      alert(data.detail || "Registration failed.");
    }
  };

  // ---- HABITS ----
  const fetchHabits = async () => {
    const res = await fetch(`${API_URL}/habits/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setHabits(await res.json());
  };

  const createHabit = async () => {
    if (!newHabit.trim()) return alert("Habit name cannot be empty.");

    await fetch(`${API_URL}/habits/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newHabit }),
    });

    setNewHabit("");
    fetchHabits();
  };

  const completeHabit = async (id) => {
    const res = await fetch(`${API_URL}/habits/${id}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) playTap();

    fetchHabits().then(() => {
      const el = document.querySelector(`.streak[data-id="${id}"]`);
      if (el) {
        el.classList.remove("streak-animate");
        void el.offsetWidth;
        el.classList.add("streak-animate");
      }
    });
  };

  const updateHabit = async (id) => {
    if (!editName.trim()) return alert("Habit name cannot be empty.");

    await fetch(`${API_URL}/habits/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName }),
    });

    setEditingId(null);
    setEditName("");
    fetchHabits();
  };

  const deleteHabit = async (id) => {
    if (!confirm("Delete this habit?")) return;

    await fetch(`${API_URL}/habits/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchHabits();
  };

  const logout = () => {
    setToken("");
    setHabits([]);
  };

  // ---- UI ----
  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Habit Tracker</h1>

        {!token && (
          <div className="screen show">
            <h2 className="subtitle">{mode === "login" ? "Login" : "Register"}</h2>

            <input className="input" placeholder="Username" value={username}
              onChange={(e) => setUsername(e.target.value)} />

            <input className="input" placeholder="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} />

            <button className="btn primary" onClick={mode === "login" ? login : register}>
              {mode === "login" ? "Login" : "Create Account"}
            </button>

            <p className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
            </p>
          </div>
        )}

        {token && (
          <div className="screen show">
            <div className="logout-row">
              <span>Logged in as <b>{username}</b></span>
              <button className="btn danger small" onClick={logout}>Logout</button>
            </div>

            <h2 className="subtitle">Create Habit</h2>
            <input className="input" placeholder="New Habit" value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)} />
            <button className="btn primary" onClick={createHabit}>Add</button>

            <h2 className="subtitle">Your Habits</h2>
            <button className="btn outline" onClick={fetchHabits}>Refresh</button>

            {habits.map((h, index) => (
              <div key={h.id} className="habit-row" style={{ animationDelay: `${index * 0.08}s` }}>
                {editingId === h.id ? (
                  <>
                    <input className="input small" value={editName}
                      onChange={(e) => setEditName(e.target.value)} />
                    <button className="btn primary small" onClick={() => updateHabit(h.id)}>Save</button>
                    <button className="btn danger small" onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="habit-text">
                      <strong>{h.name}</strong>
                      <span>streak <span className="streak" data-id={h.id}>{h.streak_count}</span> • best {h.best_streak}</span>
                    </div>

                    <button className="btn primary small" onClick={() => completeHabit(h.id)}>✅</button>
                    <button className="btn edit small" onClick={() => { setEditingId(h.id); setEditName(h.name); }}>✏</button>
                    <button className="btn danger small" onClick={() => deleteHabit(h.id)}>🗑</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
