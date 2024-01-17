import { createContext, useState } from "react";

interface Props {
  children: React.ReactNode;
}

interface User {
  uid: string;
  email: string | null;
  displayName: string;
  profileImage?: string;
}

interface UserContextValue {
  user: User | null;
  updateUser: (newUser: User | null) => void;
}

export const UserContext = createContext<UserContextValue>({
  user: null,
  updateUser: () => {},
});

export const UserProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = (newUser: User | null) => {
    console.log("Updating user with context: ", newUser);
    setUser((prevUser) => (newUser ? { ...prevUser, ...newUser } : null));
  };

  console.log("User in context: ", user);

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
