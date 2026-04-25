import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
};

const emptyValues: ProfileFormValues = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  phoneNumber: "",
};

type ProfileFormProps = {
  defaultValues?: Partial<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
  formId?: string;
};

export function ProfileForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save profile",
  disabled = false,
  formId = "profile-form",
}: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>({
    ...emptyValues,
    ...defaultValues,
  });

  const set =
    <K extends keyof ProfileFormValues>(key: K) =>
    (v: ProfileFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: v }));
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(values);
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-firstName`}>First name</Label>
          <Input
            id={`${formId}-firstName`}
            value={values.firstName}
            onChange={(e) => set("firstName")(e.target.value)}
            required
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-lastName`}>Last name</Label>
          <Input
            id={`${formId}-lastName`}
            value={values.lastName}
            onChange={(e) => set("lastName")(e.target.value)}
            required
            disabled={disabled}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${formId}-address`}>Street address</Label>
        <Input
          id={`${formId}-address`}
          value={values.address}
          onChange={(e) => set("address")(e.target.value)}
          required
          disabled={disabled}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor={`${formId}-city`}>City</Label>
          <Input
            id={`${formId}-city`}
            value={values.city}
            onChange={(e) => set("city")(e.target.value)}
            required
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-state`}>State</Label>
          <Input
            id={`${formId}-state`}
            value={values.state}
            onChange={(e) => set("state")(e.target.value)}
            required
            maxLength={2}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-postalCode`}>ZIP / Postal code</Label>
          <Input
            id={`${formId}-postalCode`}
            value={values.postalCode}
            onChange={(e) => set("postalCode")(e.target.value)}
            required
            disabled={disabled}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${formId}-phoneNumber`}>Phone</Label>
        <Input
          id={`${formId}-phoneNumber`}
          type="tel"
          value={values.phoneNumber}
          onChange={(e) => set("phoneNumber")(e.target.value)}
          required
          disabled={disabled}
        />
      </div>
      <Button type="submit" className="w-full" disabled={disabled}>
        {submitLabel}
      </Button>
    </form>
  );
}
