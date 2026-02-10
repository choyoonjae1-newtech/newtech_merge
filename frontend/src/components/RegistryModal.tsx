interface RegistryModalProps {
  onClose: () => void;
}

export default function RegistryModal({ onClose }: RegistryModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content registry-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>등기부등본 원본</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ padding: 0, flex: 1 }}>
          <iframe
            src="/registry_sample.pdf"
            title="등기부등본"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
