import { ReactNode } from "react";
import PageHeader from "./PageHeader";

const PageLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="page-layout">
      <PageHeader />
      <main>{children}</main>
    </div>
  );
};

export default PageLayout;
