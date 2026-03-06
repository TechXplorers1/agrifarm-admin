export interface User {
  id: string;
  name: string;
  phone: string;
  role: "Farmer" | "Provider";
  district: string;
  status: "Active" | "Suspended" | "Banned";
  avatar: string;
  createdAt: string;
  email: string;
  assetsCount: number;
  bookingsCount: number;
}

export interface Asset {
  id: string;
  name: string;
  category: "Equipment" | "Transport" | "Service" | "Worker Group";
  subCategory: string;
  owner: string;
  ownerId: string;
  price: number;
  priceUnit: string;
  location: string;
  availability: "Available" | "Booked" | "Maintenance";
  rating: number;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  image: string;
  brand?: string;
  model?: string;
  description: string;
  createdAt: string;
  serviceArea: string;
  operatorAvailable: boolean;
}

export interface Booking {
  id: string;
  farmerId: string;
  farmerName: string;
  providerId: string;
  providerName: string;
  assetType: string;
  assetName: string;
  scheduleTime: string;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled" | "Rejected";
  location: string;
  notes: string;
  createdAt: string;
}

const districts = ["Pune", "Nagpur", "Nashik", "Jaipur", "Ludhiana", "Indore", "Lucknow", "Bhopal", "Coimbatore", "Vijayawada"];
const farmerNames = ["Rajesh Patil", "Sunita Devi", "Arun Kumar", "Priya Sharma", "Mahesh Singh", "Kavita Reddy", "Suresh Yadav", "Anita Kumari", "Vikram Joshi", "Lakshmi Naidu", "Ramesh Gupta", "Meena Kaur"];
const providerNames = ["AgroTech Solutions", "FarmEquip India", "Green Harvest Co", "Rural Transport Hub", "AgriWorkers Union", "Field Masters", "CropCare Services", "TractorHire India"];

export const mockUsers: User[] = [
  ...farmerNames.map((name, i) => ({
    id: `USR-F${String(i + 1).padStart(3, "0")}`,
    name,
    phone: `+91 ${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000).toString().padStart(9, "0")}`,
    role: "Farmer" as const,
    district: districts[i % districts.length],
    status: (["Active", "Active", "Active", "Suspended"] as const)[i % 4],
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2E7D32&textColor=ffffff`,
    createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    email: `${name.toLowerCase().replace(" ", ".")}@mail.com`,
    assetsCount: 0,
    bookingsCount: Math.floor(Math.random() * 15) + 1,
  })),
  ...providerNames.map((name, i) => ({
    id: `USR-P${String(i + 1).padStart(3, "0")}`,
    name,
    phone: `+91 ${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000).toString().padStart(9, "0")}`,
    role: "Provider" as const,
    district: districts[i % districts.length],
    status: (["Active", "Active", "Active", "Active"] as const)[i % 4],
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=8D6E63&textColor=ffffff`,
    createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    email: `info@${name.toLowerCase().replace(/\s+/g, "")}.com`,
    assetsCount: Math.floor(Math.random() * 8) + 2,
    bookingsCount: Math.floor(Math.random() * 30) + 5,
  })),
];

export const mockAssets: Asset[] = [
  { id: "AST-001", name: "John Deere 5050D Tractor", category: "Equipment", subCategory: "Tractors", owner: "AgroTech Solutions", ownerId: "USR-P001", price: 150000, priceUnit: "per day", location: "Pune", availability: "Available", rating: 4.7, approvalStatus: "Approved", image: "🚜", brand: "John Deere", model: "5050D", description: "50HP tractor suitable for medium-scale farming operations. Includes front loader attachment.", createdAt: "2024-03-15T10:00:00Z", serviceArea: "Western India", operatorAvailable: true },
  { id: "AST-002", name: "Kubota Combine Harvester", category: "Equipment", subCategory: "Harvesters", owner: "FarmEquip India", ownerId: "USR-P002", price: 250000, priceUnit: "per day", location: "Ludhiana", availability: "Available", rating: 4.5, approvalStatus: "Pending", image: "🌾", brand: "Kubota", model: "DC-70", description: "High-efficiency combine harvester for rice and wheat.", createdAt: "2024-06-20T08:00:00Z", serviceArea: "Northern India", operatorAvailable: true },
  { id: "AST-003", name: "Irrigation Pump System", category: "Equipment", subCategory: "Irrigation", owner: "Green Harvest Co", ownerId: "USR-P003", price: 80000, priceUnit: "per day", location: "Nashik", availability: "Booked", rating: 4.2, approvalStatus: "Approved", image: "💧", brand: "Honda", model: "WB30X", description: "3-inch diesel water pump for farm irrigation.", createdAt: "2024-04-10T12:00:00Z", serviceArea: "Western India", operatorAvailable: false },
  { id: "AST-004", name: "10-Ton Farm Truck", category: "Transport", subCategory: "Heavy Trucks", owner: "Rural Transport Hub", ownerId: "USR-P004", price: 200000, priceUnit: "per trip", location: "Jaipur", availability: "Available", rating: 4.8, approvalStatus: "Approved", image: "🚛", brand: "Tata", model: "LPT 1916", description: "10-ton capacity farm produce transport truck.", createdAt: "2024-02-28T09:00:00Z", serviceArea: "Northern India", operatorAvailable: true },
  { id: "AST-005", name: "Pickup Transport", category: "Transport", subCategory: "Light Vehicles", owner: "AgroTech Solutions", ownerId: "USR-P001", price: 100000, priceUnit: "per trip", location: "Pune", availability: "Available", rating: 4.3, approvalStatus: "Pending", image: "🛻", brand: "Mahindra", model: "Bolero Pikup", description: "Mahindra Bolero for farm logistics.", createdAt: "2024-07-01T14:00:00Z", serviceArea: "Western India", operatorAvailable: true },
  { id: "AST-006", name: "Soil Testing Service", category: "Service", subCategory: "Soil Analysis", owner: "CropCare Services", ownerId: "USR-P007", price: 50000, priceUnit: "per test", location: "Indore", availability: "Available", rating: 4.9, approvalStatus: "Approved", image: "🧪", description: "Comprehensive soil analysis and fertilizer recommendation.", createdAt: "2024-05-12T11:00:00Z", serviceArea: "Pan India", operatorAvailable: true },
  { id: "AST-007", name: "Crop Spraying Drone", category: "Equipment", subCategory: "Drones", owner: "Field Masters", ownerId: "USR-P006", price: 120000, priceUnit: "per hectare", location: "Lucknow", availability: "Maintenance", rating: 4.6, approvalStatus: "Rejected", image: "🛸", brand: "DJI", model: "Agras T30", description: "Agricultural drone for precision crop spraying.", createdAt: "2024-08-05T07:00:00Z", serviceArea: "Northern India", operatorAvailable: true },
  { id: "AST-008", name: "Harvest Labor Team (20 workers)", category: "Worker Group", subCategory: "Harvest Workers", owner: "AgriWorkers Union", ownerId: "USR-P005", price: 500000, priceUnit: "per day", location: "Nagpur", availability: "Available", rating: 4.4, approvalStatus: "Approved", image: "👷", description: "Experienced team of 20 farm workers for harvest operations.", createdAt: "2024-01-20T06:00:00Z", serviceArea: "Central India", operatorAvailable: true },
  { id: "AST-009", name: "Planting Team (15 workers)", category: "Worker Group", subCategory: "Planting Workers", owner: "Field Masters", ownerId: "USR-P006", price: 350000, priceUnit: "per day", location: "Coimbatore", availability: "Booked", rating: 4.1, approvalStatus: "Pending", image: "🌱", description: "Skilled planting team for various crop types.", createdAt: "2024-09-10T13:00:00Z", serviceArea: "Southern India", operatorAvailable: true },
  { id: "AST-010", name: "Veterinary Service", category: "Service", subCategory: "Animal Health", owner: "CropCare Services", ownerId: "USR-P007", price: 75000, priceUnit: "per visit", location: "Bhopal", availability: "Available", rating: 4.7, approvalStatus: "Approved", image: "🐄", description: "Livestock veterinary consultation and treatment.", createdAt: "2024-04-22T10:00:00Z", serviceArea: "Central India", operatorAvailable: true },
];

export const mockBookings: Booking[] = [
  { id: "BK-001", farmerId: "USR-F001", farmerName: "Rajesh Patil", providerId: "USR-P001", providerName: "AgroTech Solutions", assetType: "Equipment", assetName: "John Deere 5050D Tractor", scheduleTime: "2025-02-28T08:00:00Z", totalAmount: 450000, status: "Confirmed", location: "Pune, Plot 45", notes: "3-day rental for land preparation", createdAt: "2025-02-25T10:00:00Z" },
  { id: "BK-002", farmerId: "USR-F002", farmerName: "Sunita Devi", providerId: "USR-P004", providerName: "Rural Transport Hub", assetType: "Transport", assetName: "10-Ton Farm Truck", scheduleTime: "2025-02-27T06:00:00Z", totalAmount: 200000, status: "Completed", location: "Jaipur to Delhi", notes: "Wheat transport 8 tons", createdAt: "2025-02-24T14:00:00Z" },
  { id: "BK-003", farmerId: "USR-F003", farmerName: "Arun Kumar", providerId: "USR-P007", providerName: "CropCare Services", assetType: "Service", assetName: "Soil Testing Service", scheduleTime: "2025-03-01T09:00:00Z", totalAmount: 50000, status: "Pending", location: "Indore, Block C", notes: "Test for soybean plantation soil", createdAt: "2025-02-26T08:00:00Z" },
  { id: "BK-004", farmerId: "USR-F004", farmerName: "Priya Sharma", providerId: "USR-P005", providerName: "AgriWorkers Union", assetType: "Worker Group", assetName: "Harvest Labor Team", scheduleTime: "2025-03-05T07:00:00Z", totalAmount: 1500000, status: "Confirmed", location: "Nagpur, Farm Estate", notes: "3-day groundnut harvest", createdAt: "2025-02-27T11:00:00Z" },
  { id: "BK-005", farmerId: "USR-F005", farmerName: "Mahesh Singh", providerId: "USR-P002", providerName: "FarmEquip India", assetType: "Equipment", assetName: "Kubota Combine Harvester", scheduleTime: "2025-03-10T08:00:00Z", totalAmount: 750000, status: "Pending", location: "Ludhiana, Rice Fields", notes: "Rice harvest 15 hectares", createdAt: "2025-02-28T09:00:00Z" },
  { id: "BK-006", farmerId: "USR-F006", farmerName: "Kavita Reddy", providerId: "USR-P001", providerName: "AgroTech Solutions", assetType: "Transport", assetName: "Pickup Transport", scheduleTime: "2025-02-20T10:00:00Z", totalAmount: 100000, status: "Cancelled", location: "Pune to Nashik", notes: "Cancelled due to weather", createdAt: "2025-02-18T16:00:00Z" },
  { id: "BK-007", farmerId: "USR-F007", farmerName: "Suresh Yadav", providerId: "USR-P007", providerName: "CropCare Services", assetType: "Service", assetName: "Veterinary Service", scheduleTime: "2025-02-22T14:00:00Z", totalAmount: 75000, status: "Completed", location: "Bhopal, Cattle Ranch", notes: "Routine cattle checkup", createdAt: "2025-02-20T12:00:00Z" },
  { id: "BK-008", farmerId: "USR-F008", farmerName: "Anita Kumari", providerId: "USR-P006", providerName: "Field Masters", assetType: "Worker Group", assetName: "Planting Team", scheduleTime: "2025-03-15T06:00:00Z", totalAmount: 700000, status: "Confirmed", location: "Coimbatore, Tea Estate", notes: "Tea seedling planting 2 days", createdAt: "2025-02-27T15:00:00Z" },
  { id: "BK-009", farmerId: "USR-F009", farmerName: "Vikram Joshi", providerId: "USR-P003", providerName: "Green Harvest Co", assetType: "Equipment", assetName: "Irrigation Pump System", scheduleTime: "2025-02-15T07:00:00Z", totalAmount: 160000, status: "Rejected", location: "Nashik, Sugarcane Farm", notes: "Rejected - pump under maintenance", createdAt: "2025-02-12T10:00:00Z" },
  { id: "BK-010", farmerId: "USR-F010", farmerName: "Lakshmi Naidu", providerId: "USR-P004", providerName: "Rural Transport Hub", assetType: "Transport", assetName: "10-Ton Farm Truck", scheduleTime: "2025-03-02T05:00:00Z", totalAmount: 400000, status: "Pending", location: "Vijayawada to Hyderabad", notes: "Rice transport 9.5 tons", createdAt: "2025-02-28T07:00:00Z" },
];

export const bookingsChartData = [
  { month: "Sep", bookings: 42 },
  { month: "Oct", bookings: 58 },
  { month: "Nov", bookings: 65 },
  { month: "Dec", bookings: 51 },
  { month: "Jan", bookings: 78 },
  { month: "Feb", bookings: 92 },
];

export const assetDistributionData = [
  { name: "Equipment", value: 38, fill: "hsl(122, 46%, 33%)" },
  { name: "Transport", value: 24, fill: "hsl(16, 18%, 47%)" },
  { name: "Services", value: 22, fill: "hsl(43, 95%, 56%)" },
  { name: "Workers", value: 16, fill: "hsl(142, 71%, 45%)" },
];

export const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;
