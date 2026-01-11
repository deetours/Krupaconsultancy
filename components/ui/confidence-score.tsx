interface ConfidenceScoreProps {
  value: number
}

export function ConfidenceScore({ value }: ConfidenceScoreProps) {
  const percentage = value * 100
  const getColor = () => {
    if (value < 0.8) return "bg-black/40"
    if (value < 0.95) return "bg-black/60"
    return "bg-black"
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${getColor()} transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-500 w-12">{percentage.toFixed(0)}%</span>
    </div>
  )
}
