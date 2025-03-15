import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUri } from "../dummy-data";
import { toast } from "sonner";

interface UserType {
  id: number;
  name: string;
  email: string;
  admin: boolean;
  created_at: Date;
}

interface UserContextType {
  users: UserType[];
  setUsers: (users: UserType[]) => void;
  updateStatus: (userId: number) => void;
}

export const UserContext = React.createContext<UserContextType>({
  users: [],
  setUsers: () => {},
  updateStatus: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserType[]>([]);

  async function fetchUsers() {
    try {
      const res = await axios.get(`${apiUri}/user/all`, {
        withCredentials: true,
      });
      if (res.status == 200) {
        setUsers(res.data.users);
      } else {
        toast.info(res.data.message);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error?.response?.data?.message ?? "Error fetching users");
    }
  }
  async function updateStatus(userId: number) {
    try {
      const res = await axios.get(`${apiUri}/user/toggleadmin/?id=${userId}`, {
        withCredentials: true,
      });
      console.log("res", res);

      if (res.status == 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, admin: res.data.user.admin } : user
          )
        );
        toast.success(res.data.message);
      } else {
        toast.info(res.data.message);
      }
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error(
        error?.response?.data?.message ?? "Error updating user status"
      );
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, setUsers, updateStatus }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error(
      "useParticipants must be used within a ParticipantsProvider"
    );
  }
  return context;
}
