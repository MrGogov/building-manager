import type {Metadata, Viewport} from "next";
import "./globals.css";
import MobileRuntime from "./mobile-runtime";

export const metadata:Metadata={
  title:{
    default:"Building Manager",
    template:"%s • Building Manager"
  },
  description:"Building management for managers and residents.",
  applicationName:"Building Manager",
  manifest:"/manifest.webmanifest",
  appleWebApp:{
    capable:true,
    title:"Building Manager",
    statusBarStyle:"default"
  },
  icons:{
    icon:[
      {url:"/icon.png",type:"image/png",sizes:"512x512"}
    ],
    apple:[
      {url:"/apple-icon.png",sizes:"180x180",type:"image/png"}
    ]
  },
  formatDetection:{
    telephone:false,
    email:false,
    address:false
  }
};

export const viewport:Viewport={
  width:"device-width",
  initialScale:1,
  viewportFit:"cover",
  themeColor:"#f7f8f6"
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en">
    <body><MobileRuntime/>{children}</body>
  </html>;
}
