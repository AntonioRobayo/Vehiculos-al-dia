export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm flex-1 flex flex-col justify-center">
        {children}
      </div>
      <p className="text-xs text-muted-foreground text-center pb-4">
        Powered by{" "}
        <span className="font-medium">Developing Assets Consulting Firm SAS</span>
      </p>
    </div>
  );
}
