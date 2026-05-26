// src/app/(customerFacing)/account/profile/_ProfilePage.tsx
import { requireUser } from "@/lib/auth"
import { ProfileForm } from "./_components/ProfileForm"
import { PasswordForm } from "./_components/PasswordForm"

export default async function ProfilePage() {
  const user = await requireUser()

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-text-primary">Profile & Password</h2>

      {/* Profile details */}
      <section className="bg-white border border-border-color rounded-md p-5">
        <h3 className="font-semibold text-text-primary text-sm mb-4 pb-2 border-b border-border-color">
          Personal details
        </h3>
        <ProfileForm user={user} />
      </section>

      {/* Email — read-only */}
      <section className="bg-white border border-border-color rounded-md p-5">
        <h3 className="font-semibold text-text-primary text-sm mb-3">Email address</h3>
        <p className="text-sm text-text-secondary bg-light-grey border border-border-color rounded-sm px-3 py-2 font-mono">
          {user.email}
        </p>
        <p className="text-xs text-text-muted mt-1.5">
          To change your email address, contact us at{" "}
          <a href="mailto:admin@brianbands.co.za" className="text-brand-blue hover:underline">
            admin@brianbands.co.za
          </a>.
        </p>
      </section>

      {/* Change password */}
      <section className="bg-white border border-border-color rounded-md p-5">
        <h3 className="font-semibold text-text-primary text-sm mb-4 pb-2 border-b border-border-color">
          Change password
        </h3>
        <PasswordForm />
      </section>
    </div>
  )
}
