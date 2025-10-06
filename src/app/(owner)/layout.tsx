import OwnerShell from './OwnerShellClient';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <OwnerShell>{children}</OwnerShell>;
}

