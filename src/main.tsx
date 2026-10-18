import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/nunito-sans";
import "./styles.css";
import content from "virtual:content";
import { Gallery } from "./components/Gallery";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Gallery content={content} />
  </React.StrictMode>,
);
