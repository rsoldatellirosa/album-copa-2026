import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Álbum Copa 2026 — minha coleção de figurinhas";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #047857 0%, #065f46 60%, #064e3b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 150 }}>⚽</div>
        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 8 }}>
          Álbum Copa 2026
        </div>
        <div style={{ fontSize: 36, color: "#fcd34d", marginTop: 12 }}>
          Minhas figurinhas • o que falta • repetidas pra trocar
        </div>
      </div>
    ),
    { ...size }
  );
}
