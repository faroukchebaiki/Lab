"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/neon-auth-client";
import type { UserProfileSettings } from "@/lib/user-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SettingsFormProps = {
  currentEmail: string;
  currentName: string;
  settings: UserProfileSettings;
};

export function SettingsForm({
  currentEmail,
  currentName,
  settings,
}: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [birthday, setBirthday] = useState(settings.birthday);
  const [occupation, setOccupation] = useState(settings.occupation);
  const [department, setDepartment] = useState(settings.department);
  const [phone, setPhone] = useState(settings.phone);
  const [location, setLocation] = useState(settings.location);
  const [bio, setBio] = useState(settings.bio);
  const [email, setEmail] = useState(currentEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePending, setProfilePending] = useState(false);
  const [emailPending, setEmailPending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);

  async function handleProfileSubmit() {
    setProfilePending(true);

    try {
      const normalizedName = name.trim();
      const normalizedBirthday = birthday.trim();
      const normalizedOccupation = occupation.trim();
      const normalizedDepartment = department.trim();
      const normalizedPhone = phone.trim();
      const normalizedLocation = location.trim();
      const normalizedBio = bio.trim();

      if (!normalizedName) {
        throw new Error("Name is required.");
      }

      if (normalizedName !== currentName) {
        const { error } = await authClient.updateUser({ name: normalizedName });

        if (error) {
          throw new Error(error.message || "Unable to update your name.");
        }
      }

      const response = await fetch("/api/settings/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birthday: normalizedBirthday,
          occupation: normalizedOccupation,
          department: normalizedDepartment,
          phone: normalizedPhone,
          location: normalizedLocation,
          bio: normalizedBio,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to update your profile.");
      }

      toast.success("Profile settings updated.");
      setName(normalizedName);
      setBirthday(normalizedBirthday);
      setOccupation(normalizedOccupation);
      setDepartment(normalizedDepartment);
      setPhone(normalizedPhone);
      setLocation(normalizedLocation);
      setBio(normalizedBio);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update your profile."
      );
    } finally {
      setProfilePending(false);
    }
  }

  async function handleEmailSubmit() {
    setEmailPending(true);

    try {
      const newEmail = email.trim();

      if (!newEmail) {
        throw new Error("Email is required.");
      }

      if (newEmail === currentEmail) {
        toast.message("Your email address is already up to date.");
        return;
      }

      const { error } = await authClient.changeEmail({
        newEmail,
        callbackURL: `${window.location.origin}/dashboard/settings`,
      });

      if (error) {
        throw new Error(error.message || "Unable to start the email change.");
      }

      toast.success("Email update started. Check your inbox to confirm it.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update your email."
      );
    } finally {
      setEmailPending(false);
    }
  }

  async function handlePasswordSubmit() {
    setPasswordPending(true);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("Please complete all password fields.");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("New password and confirmation do not match.");
      }

      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (error) {
        throw new Error(error.message || "Unable to change your password.");
      }

      toast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update your password."
      );
    } finally {
      setPasswordPending(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-border/80 bg-card/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Update how your information appears in the dashboard and keep your
            professional details together.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleProfileSubmit();
            }}
            className="space-y-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Name</Label>
                <Input
                  id="settings-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-birthday">Birthday</Label>
                <Input
                  id="settings-birthday"
                  name="birthday"
                  type="date"
                  value={birthday}
                  onChange={(event) => setBirthday(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-occupation">Occupation</Label>
                <Input
                  id="settings-occupation"
                  name="occupation"
                  value={occupation}
                  onChange={(event) => setOccupation(event.target.value)}
                  placeholder="Chemical Industrial Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-department">Department</Label>
                <Input
                  id="settings-department"
                  name="department"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="Production Laboratory"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-phone">Phone</Label>
                <Input
                  id="settings-phone"
                  name="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+213..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-location">Location</Label>
                <Input
                  id="settings-location"
                  name="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Plant or city"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-bio">Short Bio</Label>
              <textarea
                id="settings-bio"
                name="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder="Add a quick note about your role or responsibilities."
              />
            </div>

            <Button type="submit" disabled={profilePending}>
              <Save className="size-4" />
              {profilePending ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-4" />
              Email Settings
            </CardTitle>
            <CardDescription>
              Change your sign-in email. Neon may ask you to confirm the new
              address by email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleEmailSubmit();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="outline" disabled={emailPending}>
                {emailPending ? "Updating..." : "Update email"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Security
            </CardTitle>
            <CardDescription>
              Change your password and keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handlePasswordSubmit();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="settings-current-password">Current password</Label>
                <Input
                  id="settings-current-password"
                  name="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-new-password">New password</Label>
                <Input
                  id="settings-new-password"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-confirm-password">
                  Confirm new password
                </Label>
                <Input
                  id="settings-confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="outline" disabled={passwordPending}>
                {passwordPending ? "Updating..." : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
