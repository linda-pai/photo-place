import React, { useEffect, createContext, useContext } from "react";
import { useSession } from "next-auth/react";

// Define the shape of the roles object
interface Roles {
  admin: any[];
  photographer: any[];
}

// Create a context for the roles
export const RolesContext = createContext<Roles | undefined>(undefined);

// Custom hook to access the roles context
export function useRoles(): Roles {
  const roles = useContext(RolesContext);
  if (!roles) {
    throw new Error("useRoles must be used within a RolesProvider");
  }
  return roles;
}

// RolesProvider component
export function RolesProvider(props: any) {
  const { data: session }: any = useSession();

  const [roles, setRoles] = React.useState<Roles>({
    admin: [],
    photographer: [],
  });
  const { children } = props;
  // Replace the default values with your own logic to determine the roles
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const fetchRoles = async () => {
    const res = await fetch(`${domain}/api/roles/rolesList`, {
      headers: {
        Authorization: "Bearer " + session.accessToken,
      },
    });
    const data = await res.json();
    setRoles(data);
  };

  //useMemo
  const memoizedValue = React.useMemo(() => roles, [roles]);

  useEffect(() => {
    if (session) fetchRoles();
  }, [session]);

  return (
    <RolesContext.Provider value={memoizedValue}>
      {children}
    </RolesContext.Provider>
  );
}
