import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { apiGet, apiPost } from "./api.js";
import Register from "./components/Register/Register.jsx";

function Navbar({ user, onLogout }) {
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="Car Dealership Capstone home">
          <img src="/static/project-logo.svg" alt="" width="42" height="42" />
          <span>Roadside</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Dealers</Link>
          <Link to="/cars">Makes &amp; Models</Link>
          <a href="/static/About.html">About Us</a>
          <a href="/static/Contact.html">Contact Us</a>
        </div>
        <div className="account-links">
          {user ? (
            <>
              <span className="signed-in" aria-label={"Signed in as " + user.username}>{user.username}</span>
              <button className="button button-small button-quiet" onClick={onLogout} type="button">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link className="button button-small button-outline" to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function Notice({ children, kind = "info" }) {
  return <p className={"notice notice-" + kind} role={kind === "error" ? "alert" : "status"}>{children}</p>;
}

function DealerCard({ dealer, user }) {
  return (
    <article className="dealer-card">
      <div className="dealer-card-top">
        <span className="dealer-kicker">{dealer.city || dealer.state}</span>
        <span className="source-tag">OpenStreetMap</span>
      </div>
      <h2><Link to={"/dealers/" + dealer.id}>{dealer.name}</Link></h2>
      <p className="muted">{[dealer.address, dealer.city, dealer.state].filter(Boolean).join(", ")}</p>
      {dealer.phone && <p><a href={"tel:" + dealer.phone}>{dealer.phone}</a></p>}
      <div className="card-actions">
        <Link className="text-link" to={"/dealers/" + dealer.id}>Details and reviews <span aria-hidden="true">→</span></Link>
        {user ? (
          <Link className="button button-primary button-small" to={"/dealers/" + dealer.id + "/review"}>Review Dealer</Link>
        ) : (
          <Link className="button button-outline button-small" to="/login">Sign in to review</Link>
        )}
      </div>
    </article>
  );
}

function HomePage({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState(searchParams.get("state") || "");
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDealers(filter = "") {
    setLoading(true);
    setError("");
    try {
      const query = filter ? "?state=" + encodeURIComponent(filter) : "";
      setDealers(await apiGet("get_dealers" + query));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const filter = searchParams.get("state") || "";
    setState(filter);
    loadDealers(filter);
  }, [searchParams]);

  function applyFilter(event) {
    event.preventDefault();
    const value = state.trim();
    setSearchParams(value ? { state: value } : {});
  }

  const apiEndpoint = "/djangoapp/get_dealers" + (state.trim() ? "?state=" + encodeURIComponent(state.trim()) : "");

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Find your next stop</p>
          <h1>Local dealers.<br /><em>Real experiences.</em></h1>
          <p className="hero-lede">Browse dealership details, explore customer reviews, and discover vehicle makes and models.</p>
          <a className="button button-light" href="#dealer-list">Explore dealers <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun-orbit" />
          <img src="/static/project-logo.svg" alt="" />
          <span className="art-label">Kansas &amp; beyond</span>
        </div>
      </section>
      <section className="section-wrap" id="dealer-list">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Directory</p>
            <h2>Dealerships</h2>
          </div>
          <form className="filter-form" onSubmit={applyFilter}>
            <label htmlFor="state-filter">Filter by state</label>
            <div className="filter-row">
              <input id="state-filter" value={state} onChange={(event) => setState(event.target.value)} placeholder="e.g. Kansas or KS" />
              <button className="button button-primary" type="submit">Filter</button>
              {state && <button className="button button-quiet" type="button" onClick={() => { setState(""); setSearchParams({}); }}>Clear</button>}
            </div>
            <a className="endpoint-link" href={apiEndpoint}>Open this API endpoint</a>
          </form>
        </div>
        {loading && <Notice>Loading dealership records…</Notice>}
        {error && <Notice kind="error">{error}</Notice>}
        {!loading && !error && dealers.length === 0 && (
          <div className="empty-state">
            <h3>No dealership records loaded yet</h3>
            <p>Records come from OpenStreetMap. From the backend folder, run <code>python manage.py sync_dealers --state Kansas</code> to import current Kansas car-dealer listings.</p>
          </div>
        )}
        {!loading && !error && dealers.length > 0 && (
          <>
            <p className="result-count">{dealers.length} {dealers.length === 1 ? "dealer" : "dealers"}{state ? " in " + state : ""}</p>
            <div className="dealer-grid">{dealers.map((dealer) => <DealerCard key={dealer.id} dealer={dealer} user={user} />)}</div>
          </>
        )}
      </section>
    </main>
  );
}

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await onLogin(form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="form-card">
      <p className="eyebrow">Welcome back</p>
      <h1>Log in</h1>
      <form onSubmit={submit}>
        <label>Username<input autoComplete="username" name="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></label>
        <label>Password<input autoComplete="current-password" type="password" name="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
        {error && <p className="form-message error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Log in</button>
      </form>
      <p className="muted">New here? <Link to="/register">Create an account</Link>.</p>
    </section>
  );
}

function DealerPage({ user }) {
  const { dealerId } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([apiGet("get_dealers/" + dealerId), apiGet("get_reviews?dealerId=" + dealerId)])
      .then(([dealerData, reviewData]) => {
        if (active) {
          setDealer(dealerData);
          setReviews(reviewData);
        }
      })
      .catch((requestError) => active && setError(requestError.message));
    return () => { active = false; };
  }, [dealerId]);

  if (error) return <main className="section-wrap"><Notice kind="error">{error}</Notice><Link to="/">Back to dealers</Link></main>;
  if (!dealer) return <main className="section-wrap"><Notice>Loading dealer details…</Notice></main>;

  return (
    <main className="section-wrap detail-layout">
      <Link className="back-link" to="/">← All dealers</Link>
      <section className="detail-card">
        <p className="eyebrow">{dealer.city ? dealer.city + ", " + dealer.state : dealer.state}</p>
        <h1>{dealer.name}</h1>
        {dealer.address && <p>{dealer.address}{dealer.city ? ", " + dealer.city : ""}, {dealer.state}</p>}
        {dealer.phone && <p>Phone: <a href={"tel:" + dealer.phone}>{dealer.phone}</a></p>}
        {dealer.website && <p>Website: <a href={dealer.website} target="_blank" rel="noreferrer">{dealer.website}</a></p>}
        <p className="source-note">Listing source: <a href={dealer.source_url} target="_blank" rel="noreferrer">OpenStreetMap</a></p>
        <a className="endpoint-link" href={"/djangoapp/get_dealers/" + dealer.id}>Open dealer API endpoint</a>
        {user ? (
          <Link className="button button-primary" to={"/dealers/" + dealer.id + "/review"}>Review Dealer</Link>
        ) : (
          <Link className="button button-outline" to="/login">Log in to review</Link>
        )}
      </section>
      <section className="reviews-section">
        <div className="section-heading">
          <div><p className="eyebrow">Customer voices</p><h2>Reviews</h2></div>
          <a className="endpoint-link" href={"/djangoapp/get_reviews?dealerId=" + dealer.id}>Open reviews API endpoint</a>
        </div>
        {reviews.length === 0 ? <div className="empty-state"><p>No reviews have been posted for this dealer yet.</p></div> : (
          <div className="review-list">
            {reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <p className="review-quote">“{review.text}”</p>
                <p className="review-byline">{review.author} · {new Date(review.created_at).toLocaleDateString()}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ReviewPage({ user }) {
  const { dealerId } = useParams();
  const [text, setText] = useState("");
  const [dealer, setDealer] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiGet("get_dealers/" + dealerId).then(setDealer).catch((requestError) => setError(requestError.message));
  }, [dealerId]);

  if (!user) return <Navigate to="/login" replace />;
  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiPost("add_review", { dealer_id: Number(dealerId), text });
      navigate("/dealers/" + dealerId);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-card review-form-card">
      <p className="eyebrow">Share your experience</p>
      <h1>Review Dealer</h1>
      <p className="muted">{dealer ? "Your review for " + dealer.name + " will be public." : "Loading dealership…"}</p>
      <form onSubmit={submit}>
        <label htmlFor="review-text">Your review</label>
        <textarea id="review-text" value={text} onChange={(event) => setText(event.target.value)} required minLength={5} maxLength={2000} rows={7} />
        <span className="field-hint">5–2,000 characters. Please keep the review respectful and based on your experience.</span>
        {error && <p className="form-message error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit" disabled={saving || !dealer}>{saving ? "Submitting…" : "Submit review"}</button>
      </form>
    </section>
  );
}

function CarsPage() {
  const [catalog, setCatalog] = useState(null);
  const [models, setModels] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("get_cars").then(setCatalog).catch((requestError) => setError(requestError.message));
  }, []);

  async function loadModels(make) {
    try {
      const data = await apiGet("get_cars?makeId=" + make.MakeId);
      setModels((current) => ({ ...current, [make.MakeId]: data.models || [] }));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="section-wrap">
      <p className="eyebrow">NHTSA vPIC catalogue</p>
      <h1>Car makes and models</h1>
      <p className="muted">Manufacturer-submitted U.S. vehicle data from NHTSA. Select a make to load its models.</p>
      {error && <Notice kind="error">{error}</Notice>}
      {!catalog && !error && <Notice>Loading the live vehicle catalogue…</Notice>}
      {catalog && (
        <div className="make-grid">
          {catalog.makes.map((make) => (
            <article className="make-card" key={make.MakeId}>
              <button type="button" className="make-button" onClick={() => loadModels(make)} aria-expanded={Boolean(models[make.MakeId])}>
                <span>{make.MakeName}</span><span aria-hidden="true">+</span>
              </button>
              {models[make.MakeId] && <ul>{models[make.MakeId].map((model) => <li key={model.Model_ID}>{model.Model_Name}</li>)}</ul>}
            </article>
          ))}
        </div>
      )}
      {catalog && <a className="endpoint-link" href="/djangoapp/get_cars">Open all makes API endpoint</a>}
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    apiGet("session")
      .then((data) => setUser(data.user))
      .catch((requestError) => setSessionError(requestError.message))
      .finally(() => setSessionLoaded(true));
  }, []);

  async function handleLogin(credentials) {
    const data = await apiPost("login", credentials);
    setUser(data.user);
  }

  async function handleLogout() {
    try {
      await apiPost("logout");
      setUser(null);
    } catch (requestError) {
      setSessionError(requestError.message);
    }
  }

  if (!sessionLoaded) return <div className="loading-screen">Loading the dealership directory…</div>;

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      {sessionError && <div className="session-alert"><Notice kind="error">{sessionError}</Notice></div>}
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/register" element={<Register onRegistered={() => {}} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/dealers/:dealerId" element={<DealerPage user={user} />} />
        <Route path="/dealers/:dealerId/review" element={<ReviewPage user={user} />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="*" element={<main className="section-wrap"><h1>Page not found</h1><Link to="/">Return home</Link></main>} />
      </Routes>
      <footer className="site-footer">
        <p>Car Dealership Capstone</p>
        <span>Dealership listings from OpenStreetMap · Vehicle data from NHTSA vPIC</span>
        <a href="https://github.com/nguyenbao140506-debug/car-dealership-capstone">Project repository</a>
      </footer>
    </>
  );
}
