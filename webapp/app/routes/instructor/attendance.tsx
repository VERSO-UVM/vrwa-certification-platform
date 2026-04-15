import { useParams, Link } from "react-router";
import { useTRPC } from "~/utils/trpc";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AttendancePage() {
  const { courseEventId } = useParams();
  const trpc = useTRPC();
  const { data: roster, isLoading } = useQuery(trpc.instructor.getEventRoster.queryOptions({ 
    courseEventId: courseEventId || "" 
  }, {
    enabled: !!courseEventId
  }));

  if (isLoading) return <div className="p-10 text-center">Loading roster...</div>;
  if (!roster) return <div className="p-10 text-center text-red-500">Could not find course event.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" asChild>
          <Link to="/instructor">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print Sheet
        </Button>
      </div>

      <div className="border border-black bg-white text-black p-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold uppercase underline">Course Attendance Sheet</h1>
          <p className="mt-2 text-sm">VRWA Training Course</p>
        </header>

        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left">Name</th>
              <th className="border border-black p-2 text-left">System/Organization</th>
              <th className="border border-black p-2 text-left">Address</th>
              <th className="border border-black p-2 text-left">Phone</th>
              <th className="border border-black p-2 text-left">Email</th>
              <th className="border border-black p-2 text-center w-20">Sign In</th>
              <th className="border border-black p-2 text-center w-20">Break 1</th>
              <th className="border border-black p-2 text-center w-20">Break 2</th>
            </tr>
          </thead>
          <tbody>
            {roster.map(({ profile: p, userEmail }, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2 font-medium">
                  {p.firstName} {p.lastName}
                </td>
                <td className="border border-black p-2">
                  {/* Organization name not available on profile table in this version? 
                      In seedData it's missing from profile directly. */}
                  {p.isMember ? "VRWA Member" : "Non-Member"}
                </td>
                <td className="border border-black p-2">
                  {p.address}, {p.city}, {p.state} {p.postalCode}
                </td>
                <td className="border border-black p-2 whitespace-nowrap">{p.phoneNumber}</td>
                <td className="border border-black p-2">
                  {userEmail}
                </td>
                <td className="border border-black p-2 h-12"></td>
                <td className="border border-black p-2 h-12"></td>
                <td className="border border-black p-2 h-12"></td>
              </tr>
            ))}
            {/* Add extra empty rows if needed */}
            {Array.from({ length: Math.max(0, 15 - roster.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-black p-2 h-12"></td>
                <td className="border border-black p-2 h-12"></td>
                <td className="border border-black p-2 h-12"></td>
                <td className="border border-black p-2 h-12"></td>
                <td className="border border-black p-2 h-12"></td>
                <td className="border border-black p-2 h-12"></td>
                <td className="border border-black p-2 h-12"></td>
                <td className="border border-black p-2 h-12"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { padding: 0 !important; margin: 0 !important; }
          .p-6 { padding: 0 !important; }
        }
      `}} />
    </div>
  );
}
