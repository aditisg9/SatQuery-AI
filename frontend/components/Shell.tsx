import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
