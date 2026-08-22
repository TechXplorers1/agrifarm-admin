import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { Booking } from "@/data/mockData";
import { format, isWithinInterval, startOfDay, endOfDay, subMonths, subYears } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface ReportDownloaderProps {
  bookings: Booking[];
}

export function ReportDownloader({ bookings }: ReportDownloaderProps) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    let filteredBookings = bookings;
    const now = new Date();
    
    if (reportType === "month") {
      const startDate = subMonths(now, 1);
      filteredBookings = bookings.filter(b => isWithinInterval(new Date(b.createdAt), { start: startOfDay(startDate), end: endOfDay(now) }));
    } else if (reportType === "year") {
      const startDate = subYears(now, 1);
      filteredBookings = bookings.filter(b => isWithinInterval(new Date(b.createdAt), { start: startOfDay(startDate), end: endOfDay(now) }));
    } else if (reportType === "custom" && dateRange?.from) {
      filteredBookings = bookings.filter(b => isWithinInterval(new Date(b.createdAt), { 
        start: startOfDay(dateRange.from!), 
        end: endOfDay(dateRange.to || dateRange.from!) 
      }));
    } else if (reportType === "all") {
      // no filter
    }

    if (filteredBookings.length === 0) {
      toast({
        title: "No Data",
        description: "There are no bookings in the selected time range.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Booking ID", "Date", "Farmer", "Provider", "Asset Type", "Asset Name", "Amount", "Status", "Location"];
    const dataRows = filteredBookings.map(b => [
      b.id,
      format(new Date(b.createdAt), "yyyy-MM-dd HH:mm"),
      b.farmerName,
      b.providerName,
      b.assetType,
      b.assetName,
      b.totalAmount,
      b.status,
      b.location
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    
    // Style column widths for better readability
    worksheet["!cols"] = [
      { wch: 36 }, // Booking ID
      { wch: 18 }, // Date
      { wch: 20 }, // Farmer
      { wch: 20 }, // Provider
      { wch: 15 }, // Asset Type
      { wch: 25 }, // Asset Name
      { wch: 10 }, // Amount
      { wch: 12 }, // Status
      { wch: 30 }  // Location
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings Report");
    
    // Download standard Excel file
    XLSX.writeFile(workbook, `agrifarms_bookings_report_${format(now, "yyyyMMdd")}.xlsx`);

    setOpen(false);
    toast({
      title: "Download Complete",
      description: `Exported ${filteredBookings.length} bookings to Excel (.xlsx).`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Download Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Bookings Report</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Select Time Range</p>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Last 30 Days (Month to Month)</SelectItem>
                <SelectItem value="year">Last 12 Months (Year to Year)</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportType === "custom" && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Select Dates</p>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                  <div className="flex justify-end border-t p-3">
                    <Button size="sm" onClick={() => setIsCalendarOpen(false)}>
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDownload}>Export Excel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
