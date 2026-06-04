"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { getInvitationById } from "@/lib/db/invitations/queries";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string(),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  username: z.string().min(6, "Username must be at least 6 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function useRegisterState({ inviteId }: { inviteId?: string }) {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpData, setOtpData] = useState<{
    phone: string;
    email: string;
    otp: string;
  } | null>(null);
  const [pendingRegistrationData, setPendingRegistrationData] =
    useState<RegisterFormValues | null>(null);
  const [verifiedStatus, setVerifiedStatus] = useState<boolean>(false);
  const [prefilledFromInvite, setPrefilledFromInvite] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<any>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      role: "reader",
    },
  });

  // fetch invite details when invite id present
  useEffect(() => {
    if (!inviteId) return;

    (async () => {
      try {
        const res = await getInvitationById(inviteId);
        if (res.error || !res.data) {
          console.error("Failed to fetch invite", res.error);
          return;
        }
        const invite = res.data;
        setInviteDetails(invite);

        const values: Partial<RegisterFormValues> = {
          name: invite.name || "",
          phone: invite.phone || "",
          email: invite.email || "",
          role: (invite.role as any) || "writer",
        };

        form.reset({ ...form.getValues(), ...values });
        setPrefilledFromInvite(true);
      } catch (err) {
        console.error("Failed to fetch invite", err);
      }
    })();
  }, [inviteId]);

  return {
    showOtpModal,
    setShowOtpModal,
    otpData,
    setOtpData,
    pendingRegistrationData,
    setPendingRegistrationData,
    verifiedStatus,
    setVerifiedStatus,
    prefilledFromInvite,
    inviteDetails,
    form,
  };
}
