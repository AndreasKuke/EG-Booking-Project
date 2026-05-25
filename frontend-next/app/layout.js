import { BookingProvider } from '../context/BookingContext';
import Header from '../components/Header';
import './globals.css';

export const metadata = {
  title: 'E.G. Julemarked',
  description: 'Standbooking til E.G. julemarked',
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body>
        <BookingProvider>
          <div className="App">
            <Header />
            <main className="app-main">
              {children}
            </main>
          </div>
        </BookingProvider>
      </body>
    </html>
  );
}
