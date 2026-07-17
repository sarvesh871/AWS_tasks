import '../styles/ItemSelector.css'

const ITEMS = [
  { name: 'Rice', icon: '🍚' },
  { name: 'Sugar', icon: '🧂' },
  { name: 'Salt', icon: '🧊' },
  { name: 'Oil', icon: '🛢️' },
  { name: 'Milk', icon: '🥛' },
  { name: 'Bread', icon: '🍞' },
  { name: 'Eggs', icon: '🥚' },
  { name: 'Other', icon: '➕' },
]

export default function ItemSelector({ selected, onSelect }) {
  return (
    <div className="item-selector" role="radiogroup" aria-label="Select item">
      {ITEMS.map((item) => {
        const isActive = selected === item.name
        return (
          <button
            key={item.name}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`item-card ${isActive ? 'item-card-active' : ''}`}
            onClick={() => onSelect(item.name)}
          >
            <span className="item-card-icon" aria-hidden="true">{item.icon}</span>
            <span className="item-card-name">{item.name}</span>
          </button>
        )
      })}
    </div>
  )
}
