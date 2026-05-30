export function Spinner({ size=16, color="#fff" }) {
  return <div style={{ width:size, height:size, border:`2px solid ${color}30`, borderTopColor:color, borderRadius:"50%", animation:"spin .65s linear infinite", flexShrink:0 }} />;
}
