import { createClient } from "@/lib/supabase/server";

export async function AdsWidget() {
  const supabase = await createClient();
  const { data: ads } = await supabase
    .from("ads")
    .select("id, image_url, link_url, sponsor_name")
    .eq("active", true)
    .limit(5);

  if (!ads?.length) return null;

  // Pick a random ad server-side
  const ad = ads[Math.floor(Math.random() * ads.length)];

  const content = (
    <div className="rounded-xl border bg-card overflow-hidden">
      {ad.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ad.image_url}
          alt={ad.sponsor_name}
          className="w-full h-32 object-cover"
        />
      )}
      <div className="px-4 py-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Patrocinado por</p>
        <p className="text-xs font-semibold">{ad.sponsor_name}</p>
      </div>
    </div>
  );

  if (ad.link_url) {
    return (
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
