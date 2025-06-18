// src/components/ConfirmModal.jsx
import React from "react";

const modalBackdropStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modalBoxStyle = {
  background: "#fff",
  borderRadius: "14px",
  boxShadow: "0 4px 20px #0002",
  padding: "2rem 1.5rem 1.3rem 1.5rem",
  minWidth: 280,
  maxWidth: 340,
  textAlign: "center",
  animation: "fadeInModal .18s"
};

const buttonRow = {
  display: "flex",
  justifyContent: "center",
  gap: 18,
  marginTop: 22,
};

const buttonStyle = {
  border: "none",
  borderRadius: "8px",
  padding: "9px 22px",
  fontWeight: 700,
  fontSize: "1em",
  cursor: "pointer",
  boxShadow: "0 2px 7px #0001",
  transition: "background .13s"
};

const ConfirmModal = ({
  open,
  title = "Confirmar acción",
  message = "¿Estás seguro?",
  confirmText = "Sí",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  loading
}) => {
  if (!open) return null;
  return (
    <div style={modalBackdropStyle}>
      <div style={modalBoxStyle}>
        <div style={{ fontWeight: 600, fontSize: "1.16em", marginBottom: 12 }}>
          {title}
        </div>
        <div style={{ color: "#333", marginBottom: 10 }}>
          {typeof message === "string"
            ? message.split('\n').map((line, idx, arr) =>
                <span key={idx}>
                  {line}
                  {idx < arr.length - 1 && <br />}
                </span>
              )
            : message}
        </div>
        <div style={buttonRow}>
          <button
            style={{
              ...buttonStyle,
              background: "#e53935",
              color: "#fff",
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Borrando..." : confirmText}
          </button>
          <button
            style={{
              ...buttonStyle,
              background: "#f1f1f1",
              color: "#444",
              border: "1.2px solid #bbb"
            }}
            disabled={loading}
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
      {/* Animación */}
      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
