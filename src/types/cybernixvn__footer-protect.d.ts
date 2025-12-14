declare module "@cybernixvn/footer-protect" {
  import type { FC, ComponentType } from "react";
  export const AdminFooter: FC<{ year?: number; className?: string }>;
  export const UserFooter: FC<{ year?: number; className?: string }>;
  export const Footer: FC<{ year?: number; className?: string }>;
  export default Footer;
}
