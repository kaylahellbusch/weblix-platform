import { signOutAction } from "@/app/admin/actions";

export function WorkspaceAccount({ email }: { email?: string }) {
  return <div className="workspace-account"><p className="workspace-email text-sm">Signed in as <span>{email}</span></p>
    <form action={signOutAction}><button type="submit" className="secondary">Sign out</button></form>
  </div>;
}
