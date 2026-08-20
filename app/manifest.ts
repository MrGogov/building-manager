import type {MetadataRoute} from "next";

export default function manifest():MetadataRoute.Manifest{
  return {
    name:"Building Manager",
    short_name:"Building Manager",
    description:"Building management for managers and residents.",
    id:"/",
    start_url:"/",
    scope:"/",
    display:"standalone",
    background_color:"#f7f8f6",
    theme_color:"#78b77b",
    orientation:"portrait",
    categories:["productivity","business"],
    icons:[
      {
        src:"/icon-192.png",
        sizes:"192x192",
        type:"image/png"
      },
      {
        src:"/icon.png",
        sizes:"512x512",
        type:"image/png"
      },
      {
        src:"/icon-maskable.png",
        sizes:"512x512",
        type:"image/png",
        purpose:"maskable"
      }
    ]
  };
}
