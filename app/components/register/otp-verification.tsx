"use client";
import React, { useRef, useState } from "react";

type Props = {
  onVerify?: (otp: string) => void;
  onResend?: () => void;
};

export default function OtpVerification({ onVerify, onResend }: Props) {
  const [values, setValues] = useState<string[]>(["", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusField = (idx: number) => {
    const el = inputsRef.current[idx];
    if (el) el.focus();
  };

  const handleChange = (idx: number, v: string) => {
    const digit = v.replace(/[^0-9]/g, "").slice(0, 1);
    const next = [...values];
    next[idx] = digit;
    setValues(next);
    if (digit && idx < 3) focusField(idx + 1);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const key = e.key;
    if (key === "Backspace") {
      if (values[idx]) {
        const next = [...values];
        next[idx] = "";
        setValues(next);
      } else if (idx > 0) {
        focusField(idx - 1);
      }
    } else if (key === "ArrowLeft" && idx > 0) {
      focusField(idx - 1);
    } else if (key === "ArrowRight" && idx < 3) {
      focusField(idx + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\s+/g, "");
    const digits = pasted
      .replace(/[^0-9]/g, "")
      .slice(0, 4)
      .split("");
    if (digits.length === 0) return;
    const next = ["", "", "", ""];
    digits.forEach((d, i) => (next[i] = d));
    setValues(next);
    const firstEmpty = digits.length >= 4 ? 3 : digits.length;
    focusField(firstEmpty);
  };

  const handleSubmit = async () => {
    const enteredOtp = values.join("");
    if (enteredOtp.length !== 4) return;
    try {
      setSubmitting(true);
      await onVerify?.(enteredOtp);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="otp-verification" style={{ maxWidth: 420 }}>
      <p style={{ marginBottom: 8 }}>
        Please enter the otp sent to your phone or email.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {values.map((val, i) => (
          <input
            key={i}
            ref={(el: HTMLInputElement | null) => {
              inputsRef.current[i] = el;
            }}
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            aria-label={`OTP digit ${i + 1}`}
            style={{
              width: 52,
              height: 52,
              textAlign: "center",
              fontSize: 20,
              borderRadius: 6,
              border: "1px solid #d1d5db",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={values.join("").length !== 4 || submitting}
          style={{ padding: "8px 12px" }}
        >
          {submitting ? "Verifying..." : "Verify"}
        </button>

        {onResend ? (
          <button
            onClick={onResend}
            type="button"
            disabled={submitting}
            style={{ padding: "8px 12px" }}
          >
            Resend
          </button>
        ) : null}
      </div>
    </div>
  );
}
