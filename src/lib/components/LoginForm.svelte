<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { loginFormSchema, type LoginFormSchema } from '$lib/formSchemas';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let form: SuperValidated<LoginFormSchema>;
	export let action: string = '';
</script>

<Form.Root method="POST" {form} schema={loginFormSchema} let:config {action}>
	<Form.Field {config} name="username">
		<Form.Item>
			<Form.Label>Username</Form.Label>
			<Form.Input placeholder="Enter your username" />
			<!-- <Form.Description>Enter your username</Form.Description> -->
			<Form.Validation />
		</Form.Item>
	</Form.Field>
	<Form.Field {config} name="password">
		<Form.Item>
			<Form.Label>Password</Form.Label>
			<Form.Input type="password" placeholder="Enter your password" />
			<!-- <Form.Description>Enter your password</Form.Description> -->
			<Form.Validation />
		</Form.Item>
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</Form.Root>
