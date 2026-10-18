import type { AnchorHTMLAttributes } from "react";
export function ExternalLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} target="_blank" rel="noopener noreferrer" />;
}
