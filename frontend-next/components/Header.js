'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBooking } from '../context/BookingContext';

export default function Header() {
  const pathname = usePathname();
  const { awaitingCount } = useBooking();

  return (
    <header className="app-header">
      <h1>E.G. Julemarked</h1>
      <div className="header-controls">
        <Link href="/" className={pathname === '/' ? 'active' : ''}>
          Bestil Stand
        </Link>
        <Link href="/responses" className={`responses-btn ${pathname === '/responses' ? 'active' : ''}`}>
          Mine svar
          {awaitingCount > 0 && <span className="header-badge">{awaitingCount}</span>}
        </Link>
        <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>
          Admin
        </Link>
      </div>
    </header>
  );
}
