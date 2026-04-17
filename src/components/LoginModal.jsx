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
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.65)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}>
      <div style={{
        background: "#111d2b",
        border: "1.5px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "28px 24px 24px",
        width: "480px",
        color: "#c8d8e8",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "rgba(232,180,74,0.14)",
            border: "1.5px solid rgba(232,180,74,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#e8b44a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600, color: "#e8d8b4" }}>
            Faculty Login
          </h3>
        </div>

        <p style={{
          margin: "0 0 20px", paddingLeft: "46px",
          fontSize: "12px", color: "rgba(200,216,232,0.45)",
        }}>
          Verify your identity to request adjustment
        </p>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "20px" }} />

        {/* Email field */}
        <label style={{
          display: "block", fontSize: "11px", fontWeight: 600,
          letterSpacing: "0.6px", textTransform: "uppercase",
          color: "rgba(200,216,232,0.45)", marginBottom: "6px",
        }}>
          Official Email
        </label>
        <input
          type="email"
          placeholder="yourname@krmangalam.edu.in"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px", boxSizing: "border-box",
            background: "rgba(255,255,255,0.05)",
            border: "1.5px solid rgba(255,255,255,0.10)",
            borderRadius: "10px", color: "#c8d8e8", fontSize: "14px",
            outline: "none", marginBottom: "14px",
          }}
          onFocus={e => e.target.style.borderColor = "rgba(232,180,74,0.5)"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.10)"}
        />

        {otpSent && (
          <>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.6px", textTransform: "uppercase",
              color: "rgba(200,216,232,0.45)", marginBottom: "6px",
            }}>
              One-Time Password
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={{
                width: "100%", padding: "10px 14px", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1.5px solid rgba(255,255,255,0.10)",
                borderRadius: "10px", color: "#c8d8e8", fontSize: "20px",
                letterSpacing: "8px", fontWeight: 600,
                outline: "none", marginBottom: "14px", textAlign: "center",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(232,180,74,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.10)"}
            />
          </>
        )}

        {/* Primary button */}
        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            style={{
              width: "100%", padding: "11px 0", marginBottom: "10px",
              background: "rgba(232,180,74,0.15)",
              border: "1.5px solid rgba(232,180,74,0.35)",
              borderRadius: "10px", color: "#e8b34ae9",
              fontSize: "14px", fontWeight: 600, cursor: "pointer",
              transition: "all .2s",
            }}
            onMouseEnter={e => {
              e.target.style.background = "rgba(228, 161, 26, 0.87)";
              e.target.style.color = "#ffffffff";
            }}
            onMouseLeave={e => {
              e.target.style.background = "rgba(232,180,74,0.15)";
              e.target.style.borderColor = "rgba(232,180,74,0.35)";
              e.target.style.color = "#e8b44a";
            }}
          >
            Send OTP
          </button>
        ) : (
          <button
            onClick={handleVerifyOtp}
            style={{
              width: "100%", padding: "11px 0", marginBottom: "10px",
              background: "rgba(80,200,120,0.13)",
              border: "1.5px solid rgba(80,200,120,0.32)",
              borderRadius: "10px", color: "#50c878",
              fontSize: "14px", fontWeight: 600, cursor: "pointer",
              transition: "all .2s",
            }}
            onMouseEnter={e => {
              e.target.style.background = "rgba(80,200,120,0.22)";
              e.target.style.borderColor = "rgba(80,200,120,0.5)";
            }}
            onMouseLeave={e => {
              e.target.style.background = "rgba(80,200,120,0.13)";
              e.target.style.borderColor = "rgba(80,200,120,0.32)";
            }}
          >
            Verify OTP
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "10px 0",
            background: "rgba(255,255,255,0.04)",
            border: "1.5px solid rgba(255,255,255,0.08)",
            borderRadius: "10px", color: "rgba(200,216,232,0.45)",
            fontSize: "13px", fontWeight: 500, cursor: "pointer",
            transition: "all .2s",
            
          }}
          onMouseEnter={e => {
            // e.target.style.background = "rgba(255,255,255,0.08)";
            e.target.style.background = "rgba(224,80,80,0.18)";
              e.target.style.borderColor = "rgba(224,80,80,0.45)";
            e.target.style.color = "rgba(200,216,232,0.75)";
          }}
          onMouseLeave={e => {
            e.target.style.background = "rgba(255,255,255,0.04)";
            e.target.style.color = "rgba(200,216,232,0.45)";
          }}
        >
          Cancel
        </button>

        {/* Footer note */}
        <p style={{
          margin: "14px 0 0", fontSize: "11.5px",
          color: "rgba(200,216,232,0.28)", textAlign: "center", lineHeight: 1.5,
        }}>
          OTP will be sent to your registered faculty email only
        </p>
      </div>
    </div>
  );
}