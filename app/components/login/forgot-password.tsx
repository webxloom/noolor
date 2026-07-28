"use client";

// Hooks
import { useRegisterState } from "@/app/hooks/register/use-register-state";
import { useRegisterSubmit } from "@/app/hooks/register/use-register-submit";
import { useForgotPwdSubmit } from "@/app/hooks/register/use-forgot-pwd-submit";

// Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import OtpVerification from "../register/otp-verification";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function ForgotPasswordForm() {
  // Use register hooks for OTP management
  const stateDetails = useRegisterState({});
  const { showOtpModal, setShowOtpModal } = stateDetails;
  const { handleResendOtp } = useRegisterSubmit(stateDetails);
  const {
    verifiedStatus,
    forgotPwdState,
    handleInputChange,
    isLoading,
    userDetail,
    handleSendOtp,
    handleOtpVerify,
    handlePasswordReset,
    handleClose,
  } = useForgotPwdSubmit(stateDetails);

  const { accountVerified, otpVerified } = verifiedStatus;
  const { identifier, newPassword, confirmPassword } = forgotPwdState;
  const userContact = userDetail;

  return (
    <div className="mt-4 text-center">
      <button
        onClick={() => setShowOtpModal(true)}
        className="text-sm text-primary hover:underline font-medium"
      >
        Forgot Password?
      </button>

      {showOtpModal && (
        <Dialog open={showOtpModal} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            {/* Account & Otp Verified */}
            {accountVerified && otpVerified && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            )}

            {/* Account verified */}
            {accountVerified && !otpVerified && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We've sent a verification code to{" "}
                  {userContact?.email || userContact?.phone}
                </p>
                <OtpVerification
                  onVerify={handleOtpVerify}
                  onResend={handleResendOtp}
                />
              </div>
            )}

            {/* Account not verified */}
            {!accountVerified && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your phone number or email to get a verification code to
                  reset your password.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="identifier">Phone Number or Email</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter phone or email"
                    value={identifier}
                    onChange={(e) => {
                      handleInputChange("identifier", e.target.value);
                    }}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={!identifier.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? "Checking & Sending..." : "Send OTP"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
