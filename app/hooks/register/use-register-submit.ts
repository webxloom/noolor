import { useRouter } from "next/navigation";
import { useToast } from "@/app/contexts/toast-context";
import { RegisterFormValues } from "./use-register-state";
import { useRegisterVerification } from "./use-register-verification";

function generateEmail(fullName: string) {
  const username = fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const timestamp = Math.floor(Date.now() / 1000);
  return `${username}_${timestamp}@noolor.local`;
}

export function useRegisterSubmit(stateDetails: any) {
  const { addToast } = useToast();
  const router = useRouter();

  const {
    inviteDetails,
    setVerifiedStatus,
    prefilledFromInvite,
    setShowOtpModal,
    setOtpData,
    setPendingRegistrationData,
    form,
    verifiedStatus,
    otpData,
    pendingRegistrationData,
  } = stateDetails;

  const { handleVerification } = useRegisterVerification({
    inviteDetails,
    setVerifiedStatus,
    prefilledFromInvite,
  });

  const handleOTPAction = (
    action: string,
    phone?: string,
    email?: string,
    otp?: string,
    pendingData?: RegisterFormValues,
  ) => {
    if (action === "send" && phone && email && otp) {
      setShowOtpModal(true);
      setOtpData({ phone, email, otp });
    } else if (action === "pending" && pendingData) {
      setPendingRegistrationData(pendingData);
    } else if (action === "close") {
      setShowOtpModal(false);
      setOtpData(null);
      setPendingRegistrationData(null);
    }
  };

  const completeRegistration = async (data: RegisterFormValues) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email || generateEmail(data.name),
          phone: data.phone,
          username: data.username,
          password: data.password,
          role: data.role,
          is_verified: verifiedStatus,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Registration failed");

      addToast("Account created successfully.", "success");
      setPendingRegistrationData(null);
      setShowOtpModal(false);
      router.push("/login");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Registration failed.",
        "error",
      );
    }
  };

  const handleOtpVerify = async (otp: string) => {
    if (otp === (otpData?.otp ?? "1234")) {
      if (pendingRegistrationData)
        await completeRegistration(pendingRegistrationData);
    } else {
      addToast("Invalid OTP. Please try again.", "error");
    }
  };

  const handleResendOtp = async () => {
    if (!otpData) return;
    try {
      const payload = {
        to: otpData.email,
        subject: "Your OTP",
        information: { otp: "1234" },
        template: "otp_verification",
      };
      const r = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("Failed to resend OTP");
      addToast("OTP resent.", "success");
    } catch (e) {
      addToast("Failed to resend OTP.", "error");
    }
  };

  const onSubmit = async () => {
    const data = form.getValues();
    const { phone, username, email } = data;
    // Start OTP verification flow before completing registration.
    try {
      await handleVerification(phone, username, email, handleOTPAction);
      // notify parent with pending data (so it can complete registration after OTP)
      handleOTPAction?.("pending", phone, email, undefined, data);
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "An error occurred during registration.";

      addToast(description, "error");
      setPendingRegistrationData?.(null);
    }
  };

  return {
    onSubmit,
    handleOtpVerify,
    handleResendOtp,
    handleOTPAction,
    completeRegistration,
  };
}
