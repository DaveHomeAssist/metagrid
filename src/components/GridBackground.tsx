export default function GridBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          linear-gradient(#1f253333 1px, transparent 1px),
          linear-gradient(90deg, #1f253333 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    />
  );
}
