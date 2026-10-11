import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./tailwind.css";
import { StudioProvider } from "@/components/studio-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workspace Studio — monis.rent",
  description:
    "Find your flow in Bali. Design a workspace in 3D, explore real products, and plan your rental setup.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-base text-foreground [&_button]:cursor-pointer [&_button]:transition-colors [&_button]:duration-150 [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-40 [&_:is(button,a)]:touch-manipulation [&_:is(button,a,input,select)]:[-webkit-tap-highlight-color:transparent] [&_:is(button,a,input,select):focus-visible]:outline-2 [&_:is(button,a,input,select):focus-visible]:outline-[#607c3e] [&_:is(button,a,input,select):focus-visible]:outline-offset-4 motion-reduce:[&_*]:transition-none">
        <StudioProvider>{children}</StudioProvider>
      </body>
    </html>
  );
}
