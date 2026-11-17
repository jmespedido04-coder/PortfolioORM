export default function ImageSlot({ src, alt, ratio = '16 / 10', label, hint }) {
  if (src) {
    return (
      <div className="slot slot--filled" style={{ '--ratio': ratio }}>
        <img src={src} alt={alt} />
      </div>
    )
  }
  return (
    <div className="slot" style={{ '--ratio': ratio }} role="img" aria-label={label}>
      <div className="slot-label">
        {label}
        {hint && <small>{hint}</small>}
      </div>
    </div>
  )
}
