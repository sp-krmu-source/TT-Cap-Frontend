export default function LoginModal({
  show,
  loginEmail,
  setLoginEmail,
  otp,
  setOtp,
  otpSent,
  handleSendOtp,
  handleVerifyOtp,
  onClose,
}) {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: "#1a2635",
          padding: "24px",
          borderRadius: "16px",
          width: "380px",
          color: "white",
        }}
      >
        <h3>Faculty Login</h3>

        <input
          type="email"
          placeholder="Enter official email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "12px",
            borderRadius: "8px",
          }}
        />

        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            style={{ marginTop: "12px", width: "100%" }}
          >
            Send OTP
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "12px",
                borderRadius: "8px",
              }}
            />

            <button
              onClick={handleVerifyOtp}
              style={{ marginTop: "12px", width: "100%" }}
            >
              Verify OTP
            </button>
          </>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: "12px",
            width: "100%",
            background: "#444",
            color: "white",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}