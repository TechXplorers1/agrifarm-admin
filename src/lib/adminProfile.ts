export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl: string;
}

const DEFAULT_PROFILE: AdminProfile = {
  name: "Super Admin",
  email: "admin@agrifarms.in",
  phone: "8309940885",
  role: "Super Admin",
  avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Super%20Admin&backgroundColor=2E7D32&textColor=ffffff"
};

export const getAdminProfile = (): AdminProfile => {
  try {
    const saved = localStorage.getItem("agrifarms_admin_profile");
    if (saved) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load admin profile", e);
  }
  return DEFAULT_PROFILE;
};

export const saveAdminProfile = (profile: AdminProfile): void => {
  try {
    localStorage.setItem("agrifarms_admin_profile", JSON.stringify(profile));
    window.dispatchEvent(new Event("admin-profile-updated"));
  } catch (e) {
    console.error("Failed to save admin profile", e);
  }
};
