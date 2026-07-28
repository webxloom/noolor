import { useRouter } from "next/navigation";
import { useToast } from "@/app/contexts/toast-context";
import {
  RegisterFormValues,
  ProfileUpdateFormValues,
} from "./use-register-state";
import { useRegisterVerification } from "./use-register-verification";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { updateProfileQuery } from "@/lib/db/profiles/profile-queries";

function generateEmail(fullName: string) {
  const username = fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const timestamp = Math.floor(Date.now() / 1000);
  return `${username}_${timestamp}@noolor.local`;
}

export function useRegisterSubmit(stateDetails: any, profileUser?: any) {
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

  const { handleVerification, otpVerification } = useRegisterVerification({
    inviteDetails,
    setVerifiedStatus,
    prefilledFromInvite,
  });

  const handleOTPAction = (
    action: string,
    phone?: string,
    email?: string,
    otp?: string,
    pendingData?: RegisterFormValues | ProfileUpdateFormValues,
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
      if (pendingRegistrationData) {
        // Check if this is a profile update (userDetails exists) or registration
        if (stateDetails.isProfileUpdate) {
          await completeProfileUpdate(pendingRegistrationData);
        } else {
          await completeRegistration(pendingRegistrationData);
        }
      }
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

  const updateProfile = async () => {
    const data = form.getValues();
    // Check if the phone number has changed and needs verification
    const { phone, email } = data;
    const hasPhoneChanged = profileUser?.phone !== phone;

    if (hasPhoneChanged) {
      const otp = await otpVerification(phone, email);

      // Open OTP modal for user to enter code
      handleOTPAction?.("send", phone, email, otp);
      // Store pending data for after OTP verification
      handleOTPAction?.("pending", phone, email, undefined, data);
    } else {
      // No phone change, update profile directly
      await completeProfileUpdate(data);
    }
  };

  const completeProfileUpdate = async (
    data: RegisterFormValues | ProfileUpdateFormValues,
  ) => {
    const supabase = createBrowserSupabaseClient();

    if (!profileUser) {
      addToast("User not found", "error");
      return;
    }

    try {
      // Update password in Supabase auth if password is provided and not empty
      if (data.password && data.password.trim()) {
        const { error: authError } = await supabase.auth.updateUser({
          password: data.password,
        });

        if (authError) {
          throw new Error(`Failed to update password: ${authError.message}`);
        }
      }

      // Update profile data in database
      const updates = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        contact_email: data.email?.trim() || null,
      };

      const { error } = await updateProfileQuery(
        supabase,
        profileUser.id,
        updates,
      );

      if (error) {
        throw error;
      }

      addToast("Profile updated successfully", "success");
      setPendingRegistrationData(null);
      setShowOtpModal(false);

      // Refresh the page to reflect changes
      window.location.reload();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Profile update failed.",
        "error",
      );
    }
  };

  return {
    onSubmit,
    handleOtpVerify,
    handleResendOtp,
    handleOTPAction,
    completeRegistration,
    updateProfile,
    completeProfileUpdate,
  };
}
