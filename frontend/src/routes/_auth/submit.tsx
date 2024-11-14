import * as React from 'react'
import { createFileRoute, useBlocker, useNavigate, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { createPostSchema } from '@/share/types';
import { postSubmit } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FieldInfo } from '@/components/FieldInfo';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_auth/submit')({
  component: Submit,
})

function Submit() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const navigate = useNavigate();
    const form = useForm({
      defaultValues: {
        title: "",
        content: "",
        url: "",
      },
      validatorAdapter: zodValidator(),
      validators: {
        onChange: createPostSchema,
      },
      onSubmit: async ({ value }) => {
        const res = await postSubmit(value.title, value.url, value.content);
        if (res.success) {
          await queryClient.invalidateQueries({ queryKey: ["posts"] });
          router.invalidate();
          await navigate({ to: "/post", search: { id: res.data.postId } });
          return;
        } else {
          if (!res.isFormError) {
            toast.error("Failed to create post", { description: res.message });
          }
          form.setErrorMap({
            onSubmit: res.isFormError ? res.message : "Unexpeted error",
          });
        }
      },
    });
  
    const shouldBlock = form.useStore(
      (state) => state.isDirty && !state.isSubmitting,
    );
    useBlocker({
      condition: shouldBlock,
      blockerFn: () => window.confirm("Are you sure you want to leave?"),
    });
  
    return (
      <div className="w-full">
        <Card className="max-w-lg mx-auto mt-12 border-border/25">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
            <CardDescription>
              Leave url blank to submit a question for discussion. If there is no
              url, text will appear at the top of the thread. If there is a url,
              text is optional.
            </CardDescription>
          </CardHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="grid gap-4"
          >
            <CardContent>
              <div className="grid gap-4">
                <form.Field
                  name="title"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Title</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />
                <form.Field
                  name="url"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>URL</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />
                <form.Field
                  name="content"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Content</Label>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />
                <form.Subscribe
                  selector={(state) => [state.errorMap]}
                  children={([errorMap]) =>
                    errorMap.onSubmit ? (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        {errorMap.onSubmit.toString()}
                      </p>
                    ) : null
                  }
                />
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="w-full"
                    >
                      {isSubmitting ? "..." : "Submit"}
                    </Button>
                  )}
                />
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    );
}
