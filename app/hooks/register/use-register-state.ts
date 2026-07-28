"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { getInvitationById } from "@/lib/db/invitations/queries";
import { DashboardUser } from "../use-profile-session";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string(),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  username: z.string().min(6, "Username must be at least 6 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string(),
});

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().optional(),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  username: z.string(), // Read-only, no validation needed
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 6,
      "Password must be at least 6 characters if provided",
    ),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

export function useRegisterState({
  inviteId,
  userDetails,
}: {
  inviteId?: string;
  userDetails?: DashboardUser | null;
}) {
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

  // Determine if this is a profile update based on userDetails presence
  const isProfileUpdate = !!userDetails;
  const schema = isProfileUpdate ? profileUpdateSchema : registerSchema;

  const form = useForm<RegisterFormValues | ProfileUpdateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      ...(isProfileUpdate ? {} : { role: "reader" }),
    },
  });

  // fetch invite details when invite id present
  useEffect(() => {
    if (!inviteId && !userDetails) return;

    (async () => {
      try {
        let values: Partial<RegisterFormValues | ProfileUpdateFormValues> = {};
        if (userDetails) {
          // Profile update mode
          values = {
            name: userDetails.name || "",
            phone: userDetails.phone || "",
            email: userDetails.contact_email || "",
            username: userDetails.username || "",
            password: "", // Empty password means no change
          };
        } else if (inviteId) {
          // Registration mode
          const res = await getInvitationById(inviteId);
          if (res.error || !res.data) {
            console.error("Failed to fetch invite", res.error);
            return;
          }
          const invite = res.data;
          setInviteDetails(invite);

          values = {
            name: invite.name || "",
            phone: invite.phone || "",
            email: invite.email || "",
            role: (invite.role as any) || "writer",
          };
        }
        form.reset({ ...form.getValues(), ...values });
        setPrefilledFromInvite(true);
      } catch (err) {
        console.error("Failed to fetch invite", err);
      }
    })();
  }, [inviteId, userDetails]);

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
    isProfileUpdate,
  };
}
