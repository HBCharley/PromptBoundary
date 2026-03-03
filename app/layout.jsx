import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Prompt Boundary Gateway',
  description: 'Policy-aware AI requests with enforceable scope and predictable cost.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="top-nav">
            <div className="brand">
              <div className="brand-mark">PBG</div>
              <div className="brand-text">
                <div className="brand-title">Prompt Boundary Gateway</div>
                <div className="brand-subtitle">Policy-aware AI requests with enforceable scope</div>
              </div>
            </div>
            <nav className="nav-links">
              <Link href="/prompt-boundary" className="nav-link">Prompt Boundary</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
