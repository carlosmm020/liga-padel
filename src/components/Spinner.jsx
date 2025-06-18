const Spinner = () => (
  <div style={{ display: "inline-block", verticalAlign: "middle" }}>
    <div className="spinner" />
    <style>{`
      .spinner {
        width: 22px;
        height: 22px;
        border: 3px solid #e57373;
        border-top: 3px solid #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);
export default Spinner;
