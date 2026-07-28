import { getInvitationByPhone } from "@/lib/db/invitations/queries";
import { checkExistingProfileQuery } from "@/lib/db/profiles/profile-queries";

export function useRegisterVerification({
  inviteDetails,
  setVerifiedStatus,
  prefilledFromInvite,
}: {
  inviteDetails?: any;
  setVerifiedStatus?: React.Dispatch<React.SetStateAction<boolean>>;
  prefilledFromInvite?: boolean;
}) {
  // User existing
  const checkUserExists = async (phone: string, username: string) => {
    // Check if phone number or username already exists and return specific error
    const existingProfileCheck = await checkExistingProfileQuery(
      phone,
      username,
    );

    if (existingProfileCheck.error) {
      throw new Error(existingProfileCheck.error);
    }
  };

  //   If invited, check verification status from invitation record
  const checkVerificationStatus = async (phone: string) => {
    // initialize verified status from invite if present
    const initialVerified = inviteDetails?.is_verified || false;
    setVerifiedStatus?.(initialVerified);

    // If not prefilled from invite, check invitation record for verification status
    if (!prefilledFromInvite) {
      const res = await getInvitationByPhone(phone);
      if (res.error) {
        throw new Error("Failed to check invitation status.");
      }
      if (res.data) {
        setVerifiedStatus?.(res.data.is_verified);
      }
    }
  };

  //   OTP Verification
  const otpVerification = async (phone: string, email: string) => {
    // Send OTP to the user's email for verification
    const otp = "1234"; // Replace with actual OTP generation logic/server
    const otpPayload = {
      to: email,
      subject: "Enter your OTP to complete registration",
      information: {
        otp: otp, // Replace with actual OTP generation logic/server
      },
      template: "otp_verification",
    };

    const otpRes = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(otpPayload),
    });

    if (!otpRes.ok) {
      throw new Error("Failed to send OTP for verification.");
    }

    return otp; // Return the generated OTP for further processing
  };

  // Verification Steps -----------------------------
  const handleVerification = async (
    phone: string,
    username: string,
    email: string,
    handleOTPAction?: (
      action: string,
      phone?: string,
      email?: string,
      otp?: string,
    ) => void,
  ) => {
    await checkUserExists(phone, username);

    await checkVerificationStatus(phone);

    const otp = await otpVerification(phone, email);

    // Open OTP modal for user to enter code
    handleOTPAction?.("send", phone, email, otp);
  };

  return {
    handleVerification,
    otpVerification,
  };
}
