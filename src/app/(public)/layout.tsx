import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ReminderChecker } from "@/components/reminder-checker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex-1">{children}</main>
      <Footer />
      <ReminderChecker />
    </>
  );
}
