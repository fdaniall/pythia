const COLORS = ["#CCFF00", "#fff", "#CCFF00", "#333", "#fff"]

export function fireBrutalistConfetti() {
  const container = document.createElement("div")
  container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden"
  document.body.appendChild(container)

  const count = 60
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div")
    const size = 4 + Math.random() * 8
    const x = Math.random() * 100
    const rotation = Math.random() * 360
    const delay = Math.random() * 0.3
    const duration = 0.8 + Math.random() * 0.6

    piece.style.cssText = `
      position:absolute;
      left:${x}%;
      top:-10px;
      width:${size}px;
      height:${size}px;
      background:${COLORS[i % COLORS.length]};
      opacity:0.9;
      transform:rotate(${rotation}deg);
      animation:brutalist-fall ${duration}s ease-in ${delay}s forwards;
    `
    container.appendChild(piece)
  }

  // Inject keyframes if not already present
  if (!document.getElementById("brutalist-confetti-style")) {
    const style = document.createElement("style")
    style.id = "brutalist-confetti-style"
    style.textContent = `
      @keyframes brutalist-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  // Cleanup
  setTimeout(() => container.remove(), 2000)
}
