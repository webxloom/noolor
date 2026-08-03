"use client";
import { useToast } from "@/app/contexts/toast-context";
import { findProfileByPhoneOrEmail } from "@/lib/db/profiles/profile-queries";
import { useState } from "react";
import { useRegisterVerification } from "./use-register-verification";
// Server-side admin actions are performed via an API route using the service role key.

export function useForgotPwdSubmit(stateDetails: any) {
  const { addToast } = useToast();
  const { otpVerification } = useRegisterVerification({});
  const { setShowOtpModal, setOtpData, otpData } = stateDetails;

  const [verifiedStatus, setVerifiedStatus] = useState({
    accountVerified: false,
    otpVerified: false,
  });
  const [forgotPwdState, setForgotPwdState] = useState({
    identifier: "", // phone or email
    newPassword: "",
    confirmPassword: "",
  });
  const { identifier, newPassword, confirmPassword } = forgotPwdState;
  const [isLoading, setIsLoading] = useState(false);
  const [userDetail, setUserDetail] = useState<{
    id: string;
    phone?: string;
    email?: string;
  } | null>(null);

  // Handle Input changes for identifier, newPassword, and confirmPassword
  const handleInputChange = (field: string, value: string) => {
    setForgotPwdState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSendOtp = async () => {
    if (!identifier.trim()) {
      addToast("Please enter your phone number or email", "error");
      return;
    }

    setIsLoading(true);
    try {
      // First, check if user exists
      const result = await findProfileByPhoneOrEmail(identifier.trim());

      if (result.error || !result.data) {
        addToast(
          result.error || "No account found with this phone or email",
          "error",
        );
        setUserDetail(null);
        setIsLoading(false);
        return;
      }

      // User found, set user details
      const contact = {
        id: result.data.id,
        phone: result.data.phone,
        email: result.data.contact_email || undefined,
      };
      setUserDetail(contact);

      setVerifiedStatus({ ...verifiedStatus, accountVerified: true });

      // Use the hook's otpVerification function
      const otp = await otpVerification(
        contact.phone,
        contact.email || `${contact.phone}@noolor.local`,
      );

      // Open OTP modal using hook's state management
      setOtpData({
        phone: contact.phone,
        email: contact.email || `${contact.phone}@noolor.local`,
        otp,
      });

      addToast(`OTP sent to ${contact.email || contact.phone}`, "success");
    } catch (error) {
      console.error("Error sending OTP:", error);
      addToast("Failed to send OTP. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (otp: string) => {
    if (otp === (otpData?.otp ?? "1234")) {
      setVerifiedStatus({ ...verifiedStatus, otpVerified: true });
      addToast("OTP verified successfully!", "success");
    } else {
      addToast("Invalid OTP. Please try again.", "error");
      throw new Error("Invalid OTP");
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      addToast("Please enter both password fields", "error");
      return;
    }

    if (newPassword.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (!userDetail) {
      addToast("User not found", "error");
      return;
    }

    setIsLoading(true);
    const userId = userDetail.id;
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password: newPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Failed to update password");
      }

      addToast("Password reset successful! You can now login.", "success");

      // Reset all states and close modal
      setShowOtpModal(false);
      setForgotPwdState({
        identifier: "",
        newPassword: "",
        confirmPassword: "",
      });
      stateDetails.setOtpData(null);
      setVerifiedStatus({ accountVerified: false, otpVerified: false });
    } catch (error) {
      console.error("Error resetting password:", error);
      addToast(
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForgotPwdState({
      identifier: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowOtpModal(false);
    stateDetails.setOtpData(null);
    setVerifiedStatus({ accountVerified: false, otpVerified: false });
  };

  return {
    verifiedStatus,
    forgotPwdState,
    handleInputChange,
    isLoading,
    userDetail,
    handleSendOtp,
    handleOtpVerify,
    handlePasswordReset,
    handleClose,
  };
}
