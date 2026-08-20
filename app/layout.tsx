  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const mode = localStorage.getItem("themeMode");
                const root = document.documentElement;
                if (mode === "contrast") {
                  root.classList.add("high-contrast", "dark");
                } else if (mode === "dark") {
                  root.classList.add("dark");
                } else if (mode === "light") {
                  root.classList.remove("dark", "high-contrast");
                } else {
                  // system
                  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    root.classList.add("dark");
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        <SessionProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <main className="min-h-screen bg-slate-50 pt-[4.5rem]">{children}</main>
            <Footer />
            <ToastProvider />
            <InactivityMonitor />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
