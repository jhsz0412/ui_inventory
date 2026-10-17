import { Provider } from "react-redux";
import type { ReactNode } from "react";
import QueryProvider from "@/app/providers/QueryProvider";
import AuthProvider from "@/features/auth/hooks/AuthProvider";
import { store } from "@/app/store/store";

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </Provider>
  );
}
