interface StatusCard {
  label: string
  value: number
  color: string
  textColor?: string
}

interface StatusCardsProps {
  cards: StatusCard[]
  cols?: 3 | 6
}

export function StatusCards({ cards, cols = 6 }: StatusCardsProps) {
  const gridClass = cols === 3 ? 'grid-cols-3' : 'grid-cols-3'

  // Always display in two rows of 3
  const row1 = cards.slice(0, 3)
  const row2 = cards.slice(3, 6)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {row1.map((card) => (
          <div
            key={card.label}
            className="flex flex-col items-center justify-center py-4 rounded"
            style={{ backgroundColor: card.color }}
          >
            <span className="text-white text-sm font-medium">{card.label}</span>
            <span className="text-white text-2xl font-bold mt-1">{card.value}</span>
          </div>
        ))}
      </div>
      {row2.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {row2.map((card) => (
            <div
              key={card.label}
              className="flex flex-col items-center justify-center py-4 rounded"
              style={{ backgroundColor: card.color }}
            >
              <span className="text-white text-sm font-medium">{card.label}</span>
              <span className="text-white text-2xl font-bold mt-1">{card.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
