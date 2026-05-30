export function Skeleton({ w="100%", h=16, r=4 }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:"linear-gradient(90deg,#ece8df 25%,#ddd8cc 50%,#ece8df 75%)", backgroundSize:"600px 100%", animation:"shimmer 1.4s infinite linear" }} />;
}
