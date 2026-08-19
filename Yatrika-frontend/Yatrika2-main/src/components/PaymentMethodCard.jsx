export default function PaymentMethodCard({ option, selected, onSelect }) {
  const isSelected = selected === option.value;

  return (
    <button
      type="button"
      className={`payment-method-card${isSelected ? ' active' : ''}`}
      onClick={() => onSelect(option.value)}
    >
      <span className="payment-method-icon" aria-hidden="true">{option.icon}</span>
      <span className="payment-method-text">
        <strong>{option.label}</strong>
        <span>{option.description}</span>
      </span>
    </button>
  );
}
