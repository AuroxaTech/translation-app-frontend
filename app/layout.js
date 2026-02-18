import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const themeScript = `
(function(){
  var t=localStorage.getItem('theme');
  var d=document.documentElement;
  if(t==='dark'){d.classList.add('dark');}
  else if(t==='light'){d.classList.remove('dark');}
  else{
    try{
      if(window.matchMedia('(prefers-color-scheme:dark)').matches){d.classList.add('dark');}
      else{d.classList.remove('dark');}
    }catch(e){d.classList.remove('dark');}
  }
})();
`;

export const metadata = {
  title: "Live Translation",
  description: "Real-time live voice translation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <svg className="h-4.5 w-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
              LiveTranslate
            </span>
          </div>
          <ThemeSwitcher />
        </header>
        {children}
      </body>
    </html>
  );
}
