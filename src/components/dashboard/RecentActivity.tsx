import { mockBookings, formatCurrency } from "@/data/mockData";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function RecentActivity() {
  const recent = mockBookings.slice(0, 5);

  return (
    <div className="rounded-xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="font-heading font-semibold text-card-foreground mb-4">Recent Bookings</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Booking ID</TableHead>
              <TableHead className="text-xs">Farmer</TableHead>
              <TableHead className="text-xs">Asset</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((b) => (
              <TableRow key={b.id} className="cursor-pointer">
                <TableCell className="font-mono text-xs">{b.id}</TableCell>
                <TableCell className="text-sm">{b.farmerName}</TableCell>
                <TableCell className="text-sm">{b.assetName}</TableCell>
                <TableCell className="text-sm font-medium">{formatCurrency(b.totalAmount)}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
