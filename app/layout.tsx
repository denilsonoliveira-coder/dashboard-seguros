import './globals.css';
export const metadata = { title: 'Dashboard Executivo · Voltz' };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
