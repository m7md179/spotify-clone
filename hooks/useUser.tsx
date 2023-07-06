import { User } from "@supabase/auth-helpers-nextjs";
import {
  useSessionContext,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from "react";

import { Subscription, UserDetails } from "@/types";
import { subscribe } from "diagnostics_channel";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDestails: UserDetails | null;
  isLoading: boolean;
  Subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDestails, setUserDestails] = useState<UserDetails | null>(null);
  const [Subscription, setSubscription] = useState<Subscription | null>(null);

  const getUserDetails = () => supabase.from("users").select("*").single();
  const getSubscription = () =>
    supabase
      .from("subscription")
      .select("*,prices(*,products(*))")
      .in("status", ["trialing", "active"])
      .single();

  useEffect(() => {
    if (user && !isLoadingData && !userDestails && !Subscription) {
      setIsLoadingData(true);

      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];

          if (userDetailsPromise.status === "fulfilled") {
            setUserDestails(userDetailsPromise.value.data as UserDetails);
          }
          if (subscriptionPromise.status === "fulfilled") {
            setSubscription(subscriptionPromise.value.data as Subscription);
          }
          setIsLoadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDestails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);

  const value = {
    accessToken,
    user,
    userDestails,
    isLoading: isLoadingData || isLoadingUser,
    Subscription,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
