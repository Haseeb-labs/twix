import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen max-w-[1265px] mx-auto">
      <Sidebar />
      <main className="flex-1 border-x border-gray-800 min-h-screen" style={{ maxWidth: 600 }}>
        {children}
      </main>
    </div>
  );
}
