import { User, PenTool, Library } from "lucide-react";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export default function RegisterForm({
  form,
  onSubmit,
  prefilledFromInvite,
}: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>I am joining as a...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <FormItem className="relative">
                    <FormControl>
                      <RadioGroupItem
                        value="reader"
                        className="peer sr-only"
                        disabled={prefilledFromInvite}
                      />
                    </FormControl>
                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                      <User className="mb-3 h-6 w-6" />
                      <span className="font-medium">Reader</span>
                    </FormLabel>
                  </FormItem>
                  <FormItem className="relative">
                    <FormControl>
                      <RadioGroupItem
                        value="writer"
                        className="peer sr-only"
                        disabled={prefilledFromInvite}
                      />
                    </FormControl>
                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                      <PenTool className="mb-3 h-6 w-6" />
                      <span className="font-medium">Writer</span>
                    </FormLabel>
                  </FormItem>
                  <FormItem className="relative">
                    <FormControl>
                      <RadioGroupItem
                        value="publication"
                        className="peer sr-only"
                        disabled={prefilledFromInvite}
                      />
                    </FormControl>
                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                      <Library className="mb-3 h-6 w-6" />
                      <span className="font-medium">Publication</span>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    disabled={prefilledFromInvite}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="9876543210"
                    {...field}
                    disabled={prefilledFromInvite}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="john_doe" {...field} />
                </FormControl>
                <FormDescription>
                  Must be at least 6 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormDescription>
                  Must be at least 6 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@example.com"
                  {...field}
                  disabled={prefilledFromInvite && !!field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {prefilledFromInvite && (
          <div className="text-sm text-muted-foreground">
            Your role, name, phone and email (if provided) have been prefilled
            from the invitation. Please choose a username and password to
            complete registration.
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
          size="lg"
        >
          {form.formState.isSubmitting
            ? "Creating account..."
            : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
