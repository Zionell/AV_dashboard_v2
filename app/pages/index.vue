<script setup lang="ts">
import { LOGIN_CONTENT } from "~/assets/ts/constants";
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField, ButtonProps } from "@nuxt/ui";

definePageMeta({
	layout: "auth-layout",
});

const { signIn } = useAuth();

const fields: AuthFormField[] = [
	{
		name: "email",
		type: "email",
		label: "Email",
		placeholder: "Enter your email",
		required: true,
	},
	{
		name: "password",
		label: "Password",
		type: "password",
		placeholder: "Enter your password",
		required: true,
	},
];

const providers: ButtonProps[] = [
	{
		label: "Google",
		icon: "i-simple-icons-google",
		onClick: () => signIn("google"),
	},
];

const schema = z.object({
	email: z.string("Email is required").email("Invalid email"),
	password: z
		.string("Password is required")
		.min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

function onSubmit(payload: FormSubmitEvent<Schema>) {
	console.log("Submitted", payload);
}
</script>

<template>
	<UDashboardPanel id="auth">
	<section
		class="grid grid-cols-[2fr_1.5fr] place-items-center gap-16 min-h-screen p-12"
	>
		<NuxtImg
			class="h-full object-contain"
			src="/images/auth-image.png"
			placeholder
			alt="Picture"
			loading="lazy"
		/>

		<UPageCard class="w-full max-w-md">
			<UAuthForm
				:schema="schema"
				:title="LOGIN_CONTENT.title"
				icon="i-lucide-user"
				:fields="fields"
				:providers="providers"
				@submit="onSubmit"
			>
				<template #footer>
					{{ LOGIN_CONTENT.linkLabel }}
					<ULink as="button" class="text-primary font-medium">
						{{ LOGIN_CONTENT.linkText }}
					</ULink>
				</template>
			</UAuthForm>
		</UPageCard>
	</section>
	</UDashboardPanel>
</template>
