"use client";

// Hooks
import { useRegisterState } from "@/app/hooks/register/use-register-state";
import { useRegisterSubmit } from "@/app/hooks/register/use-register-submit";
import { useProfileSession } from "@/app/hooks/use-profile-session";

// Components
import OtpVerification from "@/app/components/register/otp-verification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import ProfileForm from "@/app/components/user-dashboard/forms/profile-form";
import Link from "next/link";

export default function ProfilePage() {
  const { profileUser } = useProfileSession();

  // Form state
  const stateDetails = useRegisterState(
    profileUser ? { inviteId: undefined, userDetails: profileUser } : {},
  );
  const { form, showOtpModal, setShowOtpModal, otpData } = stateDetails;
  const { updateProfile, handleOtpVerify, handleResendOtp } = useRegisterSubmit(
    stateDetails,
    profileUser,
  );

  if (showOtpModal) {
    return (
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OTP Verification</DialogTitle>
            <DialogDescription>
              Enter the 4-digit code sent to {otpData?.email ?? "your email"}
            </DialogDescription>
          </DialogHeader>

          <div>
            <OtpVerification
              onVerify={handleOtpVerify}
              onResend={handleResendOtp}
            />
          </div>

          <DialogFooter />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/dashboard" className="text-sm text-blue-500 hover:underline">
        &larr; Back to Dashboard
      </Link>
      <ProfileForm form={form} onSubmit={updateProfile} />
    </div>
  );
}
