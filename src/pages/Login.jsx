
import { useState } from "react";
import AuthService from "../services/AuthService";
import "../styles/Login.css";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    
try {
  if (isSignup) {
    const data = await AuthService.signUp(email, password);

    if (data.session) {
      setMessage("Account created successfully. You can now continue.");
    } else {
      setMessage(
        "Account created. Please check your email to confirm your account."
      );
    }
  } else {
    await AuthService.signIn(email, password);

    setMessage("Login successful! Authentication is working.");
  }
} catch (err) {
  setError(err.message || "Something went wrong. Please try again.");
} finally {
  setLoading(false);
}

  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand">
          <div className="brand-icon">N</div>
          <span>Nest Pay</span>
        </div>

        <div className="welcome">
          <h1>{isSignup ? "Create your account." : "Welcome home."}</h1>
          <p>
            {isSignup
              ? "Start managing your properties and rent in one place."
              : "Manage your properties and keep track of your rent, all in one place."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />

          {error && (
            <p className="form-message error-message" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="form-message success-message" role="status">
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="signup-text">
          {isSignup ? "Already have an account? " : "New to Nest Pay? "}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
              setError("");
            }}
          >
            {isSignup ? "Sign in" : "Create an account"}
          </button>
        </p>

        <p className="footer-text">
          Property management, made simpler.
        </p>
      </section>
    </main>
  );
}

export default Login;
