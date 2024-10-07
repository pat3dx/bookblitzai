import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import './globals.css';
import Navbar from '../components/Navbar';
import ClientRedirect from '../components/ClientRedirect';  // Add this import
// Remove or comment out the following line if the component doesn't exist
// import ClientRedirect from '../components/ClientRedirect';

export const metadata = {
  title: 'Ebook Generator',
  description: 'Generate stunning ebooks effortlessly',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="flex flex-col min-h-screen">
          <Navbar userButton={<UserButton />} />
          <main className="flex-grow">
            <SignedOut>
              {children}
            </SignedOut>
            <SignedIn>
              <ClientRedirect />
              {children}
            </SignedIn>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
