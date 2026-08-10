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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className={showSidebar ? 'grid gap-6 lg:grid-cols-[1fr_280px] lg:gap-8' : ''}>
          <main className="min-w-0">{children}</main>
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
