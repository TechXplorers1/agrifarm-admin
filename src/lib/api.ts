import { User, Asset, Booking } from "../data/mockData";

const API_BASE_URL = "http://localhost:8083/api";

const getAvatarUrl = (name: string, role: string) => {
  const bgColor = role.toLowerCase() === "farmer" ? "2E7D32" : "8D6E63";
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "User")}&backgroundColor=${bgColor}&textColor=ffffff`;
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/all`);
    if (!response.ok) throw new Error("Failed to fetch users");
    const data = await response.json();
    
    return data.map((dto: any): User => {
      const roleStr = (dto.role || "FARMER").toUpperCase();
      const role = roleStr === "PROVIDER" ? "Provider" : "Farmer";
      const name = dto.fullName || "Unknown";
      
      return {
        id: dto.userId,
        name: name,
        phone: dto.phoneNumber || "N/A",
        role: role as "Farmer" | "Provider",
        district: dto.district || dto.village || "Unknown",
        status: "Active", // Defaulting to Active
        avatar: dto.profileImageUrl || getAvatarUrl(name, role),
        createdAt: new Date().toISOString(), // Backend doesn't provide createdAt
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@mail.com`,
        assetsCount: 0, // Will be computed in components if needed
        bookingsCount: 0,
      };
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const fetchBookings = async (): Promise<Booking[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/all`);
    if (!response.ok) throw new Error("Failed to fetch bookings");
    const data = await response.json();
    
    return data.map((dto: any): Booking => ({
      id: dto.bookingId,
      farmerId: dto.farmerId,
      farmerName: "Farmer", // Backend DTO lacks farmerName, UI will fetch or fallback
      providerId: dto.providerId || "Unknown",
      providerName: "Provider", // Backend DTO lacks providerName
      assetType: dto.assetType || "Unknown",
      assetName: dto.assetId || "Unknown Asset", // Backend DTO lacks assetName
      scheduleTime: dto.scheduledStartTime || dto.bookingDate || new Date().toISOString(),
      totalAmount: dto.totalAmount || 0,
      status: (dto.status || "Pending") as any,
      location: dto.addressText || "Unknown Location",
      notes: dto.notes || "",
      createdAt: dto.bookingDate || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
};

export const fetchAssets = async (): Promise<Asset[]> => {
  try {
    const [equipRes, transRes, servRes, workRes] = await Promise.all([
      fetch(`${API_BASE_URL}/inventory/equipment`).catch(() => ({ ok: false, json: () => [] })),
      fetch(`${API_BASE_URL}/inventory/vehicles`).catch(() => ({ ok: false, json: () => [] })),
      fetch(`${API_BASE_URL}/inventory/services`).catch(() => ({ ok: false, json: () => [] })),
      fetch(`${API_BASE_URL}/inventory/worker-groups`).catch(() => ({ ok: false, json: () => [] })),
    ]);

    const equipData = equipRes.ok ? await equipRes.json() : [];
    const transData = transRes.ok ? await transRes.json() : [];
    const servData = servRes.ok ? await servRes.json() : [];
    const workData = workRes.ok ? await workRes.json() : [];

    const assets: Asset[] = [];

    equipData.forEach((dto: any) => {
      assets.push({
        id: dto.equipmentId,
        name: dto.brandModel || "Equipment",
        category: "Equipment",
        subCategory: dto.category || "General",
        owner: dto.ownerName || "Unknown Owner",
        ownerId: dto.ownerId,
        price: dto.pricePerHour || 0,
        priceUnit: "per hour",
        location: dto.location || "Unknown",
        availability: dto.isAvailable === false ? "Booked" : "Available",
        rating: dto.rating || 4.0,
        approvalStatus: (dto.approvalStatus || "Pending") as any,
        image: dto.imageUrl || "🚜",
        brand: dto.brandModel,
        description: `Condition: ${dto.conditionStatus || "Good"}`,
        createdAt: new Date().toISOString(),
        serviceArea: dto.location || "Unknown",
        operatorAvailable: dto.operatorAvailable || false,
      });
    });

    transData.forEach((dto: any) => {
      assets.push({
        id: dto.vehicleId,
        name: dto.vehicleType || "Vehicle",
        category: "Transport",
        subCategory: "General",
        owner: dto.ownerName || "Unknown Owner",
        ownerId: dto.ownerId,
        price: dto.pricePerKmOrTrip || 0,
        priceUnit: "per trip",
        location: dto.location || "Unknown",
        availability: dto.isAvailable === false ? "Booked" : "Available",
        rating: dto.rating || 4.0,
        approvalStatus: (dto.approvalStatus || "Pending") as any,
        image: dto.imageUrl || "🚛",
        brand: dto.vehicleNumber,
        description: `Capacity: ${dto.loadCapacity || "Standard"}`,
        createdAt: new Date().toISOString(),
        serviceArea: dto.serviceArea || "Unknown",
        operatorAvailable: dto.driverIncluded || false,
      });
    });

    servData.forEach((dto: any) => {
      assets.push({
        id: dto.serviceId,
        name: dto.serviceType || "Service",
        category: "Service",
        subCategory: dto.businessName || "General",
        owner: dto.ownerName || "Unknown Owner",
        ownerId: dto.ownerId,
        price: dto.priceRate || 0,
        priceUnit: "per service",
        location: dto.location || "Unknown",
        availability: dto.isAvailable === false ? "Booked" : "Available",
        rating: dto.rating || 4.0,
        approvalStatus: (dto.approvalStatus || "Pending") as any,
        image: dto.imageUrl || "🧪",
        description: dto.description || "Farm Service",
        createdAt: new Date().toISOString(),
        serviceArea: dto.location || "Unknown",
        operatorAvailable: dto.operatorIncluded || false,
      });
    });

    workData.forEach((dto: any) => {
      assets.push({
        id: dto.groupId,
        name: dto.groupName || "Worker Group",
        category: "Worker Group",
        subCategory: "Labour",
        owner: dto.ownerName || "Unknown Owner", // Assuming ownerName is added or we fallback
        ownerId: dto.ownerId,
        price: dto.pricePerMale || dto.pricePerFemale || 0, // Simplification
        priceUnit: "per worker",
        location: dto.location || "Unknown",
        availability: dto.isAvailable === false ? "Booked" : "Available",
        rating: dto.rating || 4.0,
        approvalStatus: (dto.approvalStatus || "Pending") as any,
        image: dto.imageUrl || "👷",
        description: `Skills: ${dto.skills || "General Labor"}`,
        createdAt: new Date().toISOString(),
        serviceArea: dto.location || "Unknown",
        operatorAvailable: true,
      });
    });

    return assets;
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
};
