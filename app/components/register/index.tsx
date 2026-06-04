import RegisterForm from "./register-form";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useRegisterState } from "@/app/hooks/register/use-register-state";
import { useRegisterSubmit } from "@/app/hooks/register/use-register-submit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import OtpVerification from "./otp-verification";

export default function Register({ inviteId }: { inviteId?: string }) {
  const stateDetails = useRegisterState(inviteId ? { inviteId } : {});
  const { form, prefilledFromInvite, showOtpModal, setShowOtpModal, otpData } =
    stateDetails;
  const { onSubmit, handleOtpVerify, handleResendOtp } =
    useRegisterSubmit(stateDetails);

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 bg-muted/20">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold">
          Join the Literary Commons
        </h1>
        <p className="text-muted-foreground">
          Create an account to track your reading, publish works, or manage your
          publication.
        </p>
      </div>

      <div className="w-full max-w-xl space-y-8 mt-6">
        <RegisterForm
          form={form}
          onSubmit={onSubmit}
          prefilledFromInvite={prefilledFromInvite}
        />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </div>

      {showOtpModal && (
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
      )}
    </div>
  );
}
