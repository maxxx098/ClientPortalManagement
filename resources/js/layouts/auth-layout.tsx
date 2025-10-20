import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-screen w-full rounded-2xl overflow-hidden">
      {/* Left side (Image + Quote) */}
      <div className="hidden md:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1717347424091-08275b73c918?auto=format&fit=crop&q=80&w=735"
          alt="Welcome"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-10 text-white">
          <p className="text-lg font-medium leading-snug max-w-md">
            “Simply all the tools that my team and I need.”
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Karen Yue <br /> Director of Digital Marketing Technology
          </p>
        </div>
      </div>

      {/* Right side (Auth content) */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 sm:px-12 bg-muted/30 p-10 dark:bg-muted/10">
        <AuthLayoutTemplate title={title} description={description}>
          {children}
        </AuthLayoutTemplate>
      </div>
    </div>
  );
}
