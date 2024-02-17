<script lang="ts">
	import client from '$lib/api/index';
	import { onMount } from 'svelte';
	import type { Tag } from '../../../../app';
	import { toast } from '@zerodevx/svelte-toast';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Check, CheckCircle } from 'lucide-svelte';

	let allTags: Tag[] = [];
	let orphanTags: Tag[] = [];
	let similarityThreshold: number = 75;
	let lengthThreshold: number = 15;

	type TagResponse = Promise<
		| {
				data:
					| {
							items: Tag[] | undefined;
							page: number | undefined;
							size: number | undefined;
							pages: number | undefined;
							total: number | undefined;
					  }
					| undefined;
				response: Response;
		  }
		| undefined
	>;

	const getTags = async (page: number, size: number): TagResponse => {
		// TODO: Type this properly
		return client.GET('/tag/', { params: { query: { size, page } } }).then((response) => {
			console.log(response);
			if (!response.data) return;
			allTags = [...allTags, ...response.data.items];
			// console.log(allTags);
			if ((response.data.page || 1) < (response.data.pages || 1)) {
				return getTags(page + 1, size);
			}
		});
	};

	const getOrphanTags = async () => {
		return client.GET('/tag/orphans').then((response) => {
			if (!response.data) return;
			return response.data;
		});
	};

	type Match = { name: string; tags: Tag[] };

	const putTagInMatchStructure = (tag: Tag, match: (tag: Tag) => string, matchedTags: Match[]) => {
		let tagMatch = matchedTags.find((m) => m.name === match(tag));
		if (tagMatch) {
			tagMatch.tags = [...tagMatch.tags, tag];
		} else {
			matchedTags = [
				...matchedTags,
				{
					name: match(tag),
					tags: [tag]
				}
			];
		}
		return matchedTags;
	};

	let matchWhitespace = (tag: Tag) => {
		return tag.tag.trimStart().trimEnd();
	};

	const findWhitespaceTagsFromMatchStructure = (m: Match) => {
		return m.tags.length > 1 || m.name !== m.tags[0].tag;
	};

	// let makeWhitespaceEquivClasses = (tags: Tag[], match: (t: Tag) => string) => {
	// 	tags.reduce((accumulator: Match[], currentTag: Tag) => {
	// 		const matchName = match(currentTag);
	// 		accumulator.find((a) => a);
	// 	}, []);

	// 	products.reduce((group, product) => {
	// 		const { category } = product;
	// 		group[category] = group[category] ?? [];
	// 		group[category].push(product);
	// 		return group;
	// 	}, {});
	// };

	const putAllTags = (allTags: Tag[], match: (tag: Tag) => string) => {
		let matchedTags: Match[] = [];

		allTags.forEach((tag) => {
			matchedTags = putTagInMatchStructure(tag, match, matchedTags);
		});
		return matchedTags;
	};
	let whitespaceTags: Match[] = [];
	let similarTags: Match[] = [];

	/**
	 * Split a string into an array of bigrams, case insensitive.
	 * e.g.: "ASDF" -> ["as","sd","df"]
	 * @param s: A string
	 */
	const makeBigrams = (s: string): string[] => {
		let sArray = s.toLowerCase().split('');
		return sArray
			.map((el, ind, arr) => {
				if (ind + 1 == arr.length) return '';
				return el + arr[ind + 1];
			})
			.slice(0, s.length - 1);
	};

	// String simlarity algorithm 'Strike A Match'
	// https://stackoverflow.com/questions/653157/a-better-similarity-ranking-algorithm-for-variable-length-strings
	// http://www.catalysoft.com/articles/StrikeAMatch.html

	/**
	 * Take an array of tags and convert it to an array of bigrams
	 * @param tags
	 */
	const makeBigramArray = (tags: Tag[]): string[][] => {
		return tags.map((tag) => makeBigrams(tag.tag));
	};

	/**
	 * Take two bigrams and then compute the number of similar elements as
	 * a ratio of the total length. E.g.:
	 * p1 = "as","sd","df" (length = 4)
	 * p2 = "th","hd","df" (length = 4)
	 * one element in common (df) so the similarity is 2 * 1 / 8  = 0.25
	 * @param p1
	 * @param p2
	 */
	const findSimilarBigrams = (p1: string[], p2: string[]): number => {
		let length = p1.length + p2.length + 2;
		let matches: number = p1
			.map((bigram1) => (p2.find((bigram2) => bigram1 === bigram2) ? 1 : 0))
			.reduce((acc: number, a: number) => acc + a, 0);
		return (2 * matches) / length;
	};

	const findSimilarTags = (t1: Tag, t2: Tag): number => {
		let p1 = makeBigrams(t1.tag);
		let p2 = makeBigrams(t2.tag);
		return findSimilarBigrams(p1, p2);
	};

	const matchSimilarTags = (tags: Tag[]): Match[] => {
		let matchedTags: Match[] = [];
		let bigrams = makeBigramArray(tags);
		for (let i = 0; i < bigrams.length; i++) {
			let foundTags: Tag[] = [];
			for (let j = 0; j < bigrams.length; j++) {
				// TODO: This n^2 loop could be more efficient because it's symmetric
				// At some point, change it so that it doesn't double up.
				// if (i == j) continue;
				let nearness = findSimilarBigrams(bigrams[i], bigrams[j]);
				if (nearness > similarityThreshold / 100) foundTags.push(tags[j]);
			}

			if (foundTags.length > 1)
				matchedTags.push({
					name: tags[i].tag,
					tags: foundTags
				});
		}
		return matchedTags;
	};

	onMount(() => {
		getTags(1, 100).then(() => {
			// console.log(allTags);
			whitespaceTags = putAllTags(allTags, matchWhitespace);
			similarTags = matchSimilarTags(allTags);
			// console.log(whitespaceTags);
		});
	});

	const mergeTags = (tag_id: number, tag2_id: number) => {
		client
			.PUT('/tag/{tag_id}/merge/{tag2_id}', {
				params: { path: { tag_id, tag2_id } }
			})
			.then((response) => {
				if (!response) {
					toast.push('Something bad happened');
					return;
				} else {
					toast.push(`Merged (Tag id=${tag_id}) into (Tag id=${tag2_id})`);
				}
			});
	};

	const mergeAllTags = (match: Match) => {
		let to_tag = match.tags.find((t) => t.tag === match.name);
		if (!to_tag) return;
		match.tags.forEach((tag) => {
			if (!to_tag) return;
			if (tag.tag_id == to_tag.tag_id) return;
			mergeTags(to_tag.tag_id, tag.tag_id);
		});
	};

	const deleteTag = (tag: Tag) => {
		return client
			.DELETE('/tag/{tag_id}', { params: { path: { tag_id: tag.tag_id } } })
			.then((response) => {
				if (!response) {
					toast.push('Tag unable to be deleted');
					return;
				}
				toast.push(`Tag '${tag.tag}' with id ${tag.tag_id} successfully deleted`);
				allTags = allTags.filter((t) => t.tag_id !== tag.tag_id);
				orphanTags = orphanTags.filter((t) => t.tag_id !== tag.tag_id);
			});
	};

	$: {
		similarityThreshold;
		similarTags = matchSimilarTags(allTags);
	}

	/// Display functions
	const renderTagWhitespace = (t: Tag): string => {
		return t.tag.replaceAll(' ', '_');
	};
</script>

<div class="border rounded my-3 p-2">
	<h3 class="text-xl flex gap-1 items-center">
		Whitespace Tags
		{#if whitespaceTags.filter(findWhitespaceTagsFromMatchStructure).length == 0}
			<CheckCircle class="text-green-500 w-4 h-4" />
		{/if}
	</h3>
	<table>
		<thead>
			<th>Tag Name</th>
			<th>Found Tags</th>
			<th>Fix</th>
		</thead>
		<tbody>
			{#each whitespaceTags.filter(findWhitespaceTagsFromMatchStructure) as match}
				<tr>
					<td>{match.name}</td>
					<td>
						{match.tags.map(renderTagWhitespace).join(', ')}
					</td>
					<td>
						<Button
							on:click={() => {
								mergeAllTags(match);
							}}>Fix</Button
						>
					</td>
				</tr>
			{:else}
				<tr><td colspan="3"> No whitespace-padded tags found </td></tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="border rounded my-3 p-2">
	<h3 class="text-xl flex gap-1 items-center">
		Long Tags
		{#if allTags.filter((t) => t.tag.length > lengthThreshold).length == 0}
			<CheckCircle class="text-green-500 w-4 h-4" />
		{/if}
	</h3>
	<div class="flex gap-2">
		Threshold:<input type="range" min="10" max="30" bind:value={lengthThreshold} />
		{lengthThreshold}
	</div>
	{#each allTags.filter((t) => t.tag.length > lengthThreshold) as tag}
		<Button>{renderTagWhitespace(tag)}</Button>
	{:else}
		<div>No long tags found</div>
	{/each}
</div>

<div class="border rounded my-3 p-2">
	{#await getOrphanTags()}
		Loading orphan tags
	{:then orphanTags}
		<h3 class="text-xl flex gap-1 items-center">
			Orphan Tags
			{#if orphanTags?.length == 0}
				<CheckCircle class="text-green-500 w-4 h-4" />
			{/if}
		</h3>
		{#if orphanTags && orphanTags.length > 0}
			{#each orphanTags as tag (tag.tag_id)}
				<Button variant="destructive" on:click={() => deleteTag(tag)}>
					Delete: {renderTagWhitespace(tag)}
				</Button>
			{/each}
		{:else}
			No orphan tags found
		{/if}
	{/await}
</div>

<div class="border rounded my-3 p-2">
	<h3 class="text-xl flex gap-1 items-center">
		Similar Tags
		{#if similarTags?.length == 0}
			<CheckCircle class="text-green-500 w-4 h-4" />
		{/if}
	</h3>
	<input type="range" min="0" max="100" bind:value={similarityThreshold} />
	{similarityThreshold}%
	<table>
		<thead>
			<th>Key</th>
			<th />
			<th>Matches</th>
		</thead>
		<tbody>
			{#each similarTags.sort((m, n) => m.name.localeCompare(n.name)) as t}
				<tr>
					<td>
						{t.name.replaceAll(' ', '_')}
					</td>
					<td
						><Button
							on:click={() => {
								mergeAllTags(t);
							}}
						>
							<ArrowLeft class="w-4 h-4 mr-1" /> Merge into
						</Button>
					</td>
					<td>
						<!-- {#each t.tags as j} -->
						{t.tags.map((t) => renderTagWhitespace(t)).join(', ')}
						<!-- {/each} -->
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
