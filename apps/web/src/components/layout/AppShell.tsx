import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell({
  children,
  activeTab,
  showSidebar = true
}: {
  children: React.ReactNode;
  activeTab: string;
  showSidebar?: boolean;
}) {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className={`grid gap-6 ${showSidebar ? 'lg:grid-cols-[1fr_280px]' : ''}`}>
          <main>{children}</main>
          {showSidebar && (
            <div className="hidden lg:block">
              <Sidebar />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
