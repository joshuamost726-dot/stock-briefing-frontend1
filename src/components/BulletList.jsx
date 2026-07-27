export default function BulletList({ items, className = "" }) {
  if (!items || items.length === 0) return null;

  if (items.length === 1) {
    return <p className={className}>{items[0]}</p>;
  }

  return (
    <ul className={`bullet-list ${className}`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
