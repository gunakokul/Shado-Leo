export default function Lightbox({ item, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="max-w-5xl w-full" onClick={e => e.stopPropagation()}>
        {item.type === 'video' ? (
          <video controls autoPlay src={item.url} className="w-full rounded" />
        ) : (
          <img src={item.url} alt={item.title} className="w-full rounded" />
        )}
      </div>
    </div>
  )
}
