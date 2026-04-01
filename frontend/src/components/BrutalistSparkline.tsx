import { useState } from "react"

export function BrutalistSparkline({ data, height = 100 }: { data: number[]; height?: number }) {
  const [hoverData, setHoverData] = useState<{ x: number, y: number, value: number, index: number } | null>(null)

  if (!data || data.length === 0) return null

  // Normalize data points
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  // Calculate points for the SVG drawing
  // x goes from 0 to 100 inside a 100-width viewBox
  // y goes from 0 to height
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = height - ((value - min) / range) * (height - 20) - 10 // padded 10px
    return `${x},${y}`
  }).join(" L")

  return (
    <div className="relative w-full border-t-[2px] border-b-[2px] border-[#333] bg-[#0A0A0A] py-4" style={{ height: height + 32 }}>
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      
      {/* Absolute text elements for tech feel */}
      <div className="absolute top-2 left-2 font-technical text-[10px] uppercase text-[#CCFF00]/50 tracking-widest pointer-events-none">
        VOLATILITY ENGINE ACTIVE
      </div>
      <div className="absolute bottom-2 right-2 font-technical text-[10px] uppercase text-[#CCFF00]/50 tracking-widest pointer-events-none">
        ON-CHAIN RESOLUTION TREND
      </div>
      
      {/* Render SVG Sparkline Container */}
      <div className="relative z-10 w-full h-full">
        <svg 
          className="absolute inset-0 w-full h-full overflow-visible" 
          viewBox={`0 0 100 ${height}`} 
          preserveAspectRatio="none"
        >
          {/* Glow behind the line to make it neo-brutalist */}
          <path
            d={`M0,${height} L${points} L100,${height}`}
            fill="none"
            stroke="#CCFF00"
            strokeWidth="6"
            className="opacity-20 blur-sm mix-blend-screen"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* The sharp pixelated line */}
          <path
            d={`M${points.split(' L')[0]} L${points}`}
            fill="none"
            stroke="#CCFF00"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            className="drop-shadow-[2px_2px_0px_#000]"
          />
        </svg>

        {/* Data points/nodes as absolute HTML elements to prevent aspect ratio stretching */}
        {data.map((value, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = height - ((value - min) / range) * (height - 20) - 10
          if (i === 0 || i === data.length - 1 || i % 3 === 0) {
            return (
              <div
                key={i}
                className="absolute size-2.5 bg-black border-[2px] border-[#CCFF00] z-20 cursor-crosshair transition-all hover:scale-150 hover:bg-[#CCFF00]"
                style={{
                  left: `${x}%`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseEnter={() => setHoverData({ x, y, value, index: i })}
                onMouseLeave={() => setHoverData(null)}
              />
            )
          }
          return null
        })}

        {/* BRUTALIST TOOLTIP */}
        {hoverData && (
          <div
            className="absolute z-[100] border-2 border-[#CCFF00] bg-black p-2 pointer-events-none shadow-[4px_4px_0_0_#CCFF00] transition-all duration-75"
            style={{
              left: `calc(${hoverData.x}% + 10px)`,
              top: `${hoverData.y - 30}px`,
              transform: hoverData.x > 80 ? 'translateX(-110%)' : 'none', // flip if near right edge
            }}
          >
            <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#888]">
              T: +{hoverData.index}
            </p>
            <p className="font-sans text-sm font-black text-[#CCFF00]">
              VOLATILITY {hoverData.value}%
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
