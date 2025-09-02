import React, { createContext, useContext, useMemo, useState } from 'react';

type TenantState = {
  tenantCode?: string;
  tableCode?: string;
  setTenant: (t: { tenantCode?: string; tableCode?: string }) => void;
};

const Ctx = createContext<TenantState | null>(null);

export const TenantProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [tenantCode, setTenantCode] = useState<string>();
  const [tableCode, setTableCode] = useState<string>();
  const setTenant = ({ tenantCode, tableCode }: { tenantCode?: string; tableCode?: string }) => {
    setTenantCode(tenantCode);
    setTableCode(tableCode);
  };
  const value = useMemo(() => ({ tenantCode, tableCode, setTenant }), [tenantCode, tableCode]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useTenant = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
};