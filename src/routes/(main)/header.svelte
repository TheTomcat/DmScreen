<script lang="ts">
	import * as config from '$lib/config';

	import {
		LogOut,
		Image,
		ImagePlus,
		LayoutList,
		Group,
		Pencil,
		FileText,
		Tag,
		Link,
		Cat,
		Swords,
		KeyRound,
		LogIn,
		Wrench,
		Settings2,
		ChevronDown,
		Heart
	} from 'lucide-svelte';

	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';

	import { page } from '$app/stores';

	// let menu = [
	// 	{title: 'Images', url: '', icon: }
	// ]
</script>

<nav class="flex justify-between py-8">
	<a href="/" class="title">
		<b>{config.title}</b>
	</a>

	<ul class="flex gap-8 list-none m-0 p-0 links">
		<li>
			<!-- <a href="/build">Build</a> -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button builders={[builder]} variant="ghost">Combat</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
					<!-- <DropdownMenu.Label>Manage</DropdownMenu.Label> -->
					<!-- <DropdownMenu.Separator /> -->
					<DropdownMenu.Group>
						<DropdownMenu.Item href="/build">
							<Swords class="mr-2 h-4 w-4" />
							<span>Build</span>
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</li>
		<li>
			<Button variant="ghost" href="/gallery">Gallery</Button>
		</li>
		<li>
			<Button variant="ghost" href="/session">Run</Button>
		</li>
		<li>
			<!-- <a href="/room">View</a> -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button builders={[builder]} variant="ghost"
						>Manage <ChevronDown class="h-4 w-4 ml-1" /></Button
					>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
					<DropdownMenu.Label>Manage</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<Image class="mr-2 h-4 w-4" />
								<span>Images</span>
							</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent sameWidth={true}>
								<DropdownMenu.Item href="/manager">
									<Pencil class="mr-2 h-4 w-4" />
									<span>Manage</span>
								</DropdownMenu.Item>
								<DropdownMenu.Item href="/library/images/new">
									<ImagePlus class="mr-2 h-4 w-4" />
									<span>Upload</span>
								</DropdownMenu.Item>
								<DropdownMenu.Item href="/library/images">
									<LayoutList class="mr-2 h-4 w-4" />
									<span>Table</span>
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
						<DropdownMenu.Item href="/library/messages">
							<FileText class="mr-2 h-4 w-4" />
							<span>Messages</span>
							<!-- <DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut> -->
						</DropdownMenu.Item>
						<DropdownMenu.Item href="/library/tags">
							<Tag class="mr-2 h-4 w-4" />
							<span>Tags</span>
							<!-- <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut> -->
						</DropdownMenu.Item>
						<DropdownMenu.Item href="/library/collections">
							<Group class="mr-2 h-4 w-4" />
							<span>Collections</span>
							<!-- <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut> -->
						</DropdownMenu.Item>
						<DropdownMenu.Item href="/library/favourites">
							<Heart class="mr-2 h-4 w-4" />
							<span>Favourites</span>
							<!-- <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut> -->
						</DropdownMenu.Item>
						<DropdownMenu.Item href="/library/entities">
							<Cat class="mr-2 h-4 w-4" />
							<span>Entities</span>
							<!-- <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut> -->
						</DropdownMenu.Item>
						<DropdownMenu.Item disabled={true}>
							<Link class="mr-2 h-4 w-4" />
							<span>Attributions</span>
							<!-- <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut> -->
						</DropdownMenu.Item>
					</DropdownMenu.Group>
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						<DropdownMenu.Item href="/session?reset">
							<KeyRound class="mr-2 h-4 w-4" />
							<span>Reset Room Key</span>
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</li>
	</ul>
	{#if $page.data.user && $page.data.user.name}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger let:builder>
				<Avatar.Root>
					<Avatar.Image src="/api/image/{$page.data.user.image}/thumb" alt={$page.data.user.name} />
					<Avatar.Fallback>{$page.data.user.fb.toUpperCase()}</Avatar.Fallback>
				</Avatar.Root>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56" align="end">
				<DropdownMenu.Item>
					<Wrench class="mr-2 h-4 w-4" />
					<span>Manage Assets</span>
					<!-- <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut> -->
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<Settings2 class="mr-2 h-4 w-4" />
					<span>User Settings</span>
					<!-- <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut> -->
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<form class="logout" action="/logout" method="POST">
						<!-- use:enhance> -->
						<Button type="submit" variant="link" class="p-0 h-auto">
							<LogOut class="mr-2 h-4 w-4" />
							Log out
						</Button>
						<!-- <span>Log Out</span> -->
					</form>
					<!-- <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut> -->
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{:else}
		<Button variant="ghost" href="/login">
			<LogIn class="mr-2 h-4 w-4" />Log In
		</Button>
	{/if}
</nav>

<!-- {#if $page.data}
	{JSON.stringify($page.data)}
{/if} -->

<style>
	@media (min-width: 768px) {
		nav {
			display: flex;
			justify-content: space-between;
		}
		.links {
			display: flex;
			/* gap: var(--size-7); */
			margin-block: 0;
		}
	}
</style>
