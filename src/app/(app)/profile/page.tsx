import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PushManager } from "@/components/shared/PushManager";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user!.id)
    .single();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user!.email?.[0].toUpperCase() ?? "U";

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Mi Perfil</h1>

      {/* Avatar + email */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{profile?.full_name ?? "Sin nombre"}</p>
          <p className="text-sm text-muted-foreground">{user!.email}</p>
        </div>
      </div>

      <Separator />

      {/* Edit form */}
      <div className="space-y-2">
        <h2 className="font-semibold text-sm">Editar información</h2>
        <ProfileEditor fullName={profile?.full_name ?? null} />
      </div>

      <Separator />

      {/* Push notifications */}
      <PushManager />

      <Separator />

      {/* Danger zone */}
      <div className="space-y-2">
        <h2 className="font-semibold text-sm text-destructive">Sesión</h2>
        <LogoutButton />
      </div>
    </div>
  );
}
