<script lang="ts">
	import { Award } from 'lucide-svelte';

	interface Props {
		lang?: 'ja' | 'en';
	}

	let { lang = 'ja' }: Props = $props();

	const t = $derived(lang === 'ja'
		? {
			conference: '学会発表',
			articles: '記事',
			nov2025Venue: '第117回IPSJ-MBL研究会・第103回IPSJ-ITS研究会合同研究発表会（愛知県 日間賀島サービスセンター）、単著',
			award: '奨励発表賞受賞',
			oct2025Venue: '2025 IEEE International Symposium on Mixed and Augmented Reality（韓国 大田コンベンションセンター）、単著',
			demo: 'デモ発表',
			mar2025Venue: '第29回 一般社団法人 情報処理学会シンポジウム INTERACTION2025（学術総合センター内 一橋記念講堂）、単著',
			interactiveDemo: 'インタラクティブ発表（デモ）',
			video: 'デモ動画',
			morandiVenue: '一般社団法人 人工知能学会 第34回全国大会（2020）',
			coauthored: '共著: 3Dモデルの検討と制作、展示の制作',
			coauthors: '共著者: 小林 茂, 桑久保 亮太, 松井 茂, 大谷 芳之, 張 心祈, 仁泉 大輔'
		}
		: {
			conference: 'Conference Presentations',
			articles: 'Articles',
			nov2025Venue: 'The 117th IPSJ-MBL / The 103rd IPSJ-ITS Joint Workshop (Himakajima Service Center, Aichi), sole author',
			award: 'Encouragement Presentation Award',
			oct2025Venue: '2025 IEEE International Symposium on Mixed and Augmented Reality (Daejeon Convention Center, Korea), sole author',
			demo: 'Demo Presentation',
			mar2025Venue: 'The 29th IPSJ Symposium INTERACTION2025 (Hitotsubashi Hall, National Center of Sciences Building), sole author',
			interactiveDemo: 'Interactive Presentation (Demo)',
			video: 'Demo Video',
			morandiVenue: 'The 34th Annual Conference of the Japanese Society for Artificial Intelligence (2020)',
			coauthored: 'Co-author contribution: 3D model planning/production and exhibition production',
			coauthors: 'Co-authors: Shigeru Kobayashi, Ryota Kuwakubo, Shigeru Matsui, Yoshiyuki Ootani, Hsin-Chi Chang, Daisuke Ninsen'
		}
	);
</script>

<section id="publications" class="py-20">
	<h2 class="mb-12 text-center text-4xl font-bold">Publications</h2>

	<h3 class="mb-6 text-2xl font-bold">{t.conference}</h3>
	<ul class="space-y-6">
		<li class="border-b border-current pb-4">
			<div class="flex items-start gap-2">
				<span class="shrink-0 font-bold tabular-nums">2025.11</span>
				<div>
					<p class="font-bold"><a href="https://ipsj.ixsq.nii.ac.jp/records/2005731" target="_blank" rel="noopener noreferrer">スマートフォン単体によるARMesh制約付きUWB測位システムの設計と初期評価</a></p>
					<p class="mt-1 text-sm">{t.nov2025Venue}</p>
					<p class="mt-1 inline-flex items-center gap-1 text-sm font-bold text-muted-foreground">
						<Award size={14} />{t.award}
					</p>
				</div>
			</div>
		</li>
		<li class="border-b border-current pb-4">
			<div class="flex items-start gap-2">
				<span class="shrink-0 font-bold tabular-nums">2025.10</span>
				<div>
					<p class="font-bold"><a href="https://doi.org/10.1109/ISMAR-Adjunct68609.2025.00266" target="_blank" rel="noopener noreferrer">Distance-Adaptive AR Navigation through UWB-ARMesh Fusion</a></p>
					<p class="mt-1 text-sm">{t.oct2025Venue}</p>
					<p class="mt-1 text-sm">{t.demo}</p>
				</div>
			</div>
		</li>
		<li class="border-b border-current pb-4">
			<div class="flex items-start gap-2">
				<span class="shrink-0 font-bold tabular-nums">2025.03</span>
				<div>
					<p class="font-bold"><a href="https://www.interaction-ipsj.org/proceedings/2025/data/pdf/2B-25.pdf" target="_blank" rel="noopener noreferrer">XR環境におけるUWBタグを用いた位置情報に基づくUI表示とデバイス制御</a></p>
					<p class="mt-1 text-sm">{t.mar2025Venue}</p>
					<p class="mt-1 text-sm">{t.interactiveDemo}</p>
					<p class="mt-1 text-sm">
						<a href="https://www.interaction-ipsj.org/proceedings/2025/data/movie/2B-25.mp4" target="_blank" rel="noopener noreferrer">{t.video}</a>
					</p>
				</div>
			</div>
		</li>
		<li class="border-b border-current pb-4">
			<div class="flex items-start gap-2">
				<span class="shrink-0 font-bold tabular-nums">2020.06</span>
				<div>
					<p class="font-bold">モランディの部屋 鑑賞者が作者の作品世界をより深く鑑賞することを可能にする機械学習を活用した体験型展示</p>
					<p class="mt-1 text-sm">{t.morandiVenue}</p>
					<p class="mt-1 text-sm">{t.coauthored}</p>
					<p class="mt-1 text-sm">{t.coauthors}</p>
				</div>
			</div>
		</li>
	</ul>

	<h3 class="mb-6 mt-12 text-2xl font-bold">{t.articles}</h3>
	<ul class="space-y-2">
		<li>
			<a href="https://qiita.com/oOtanl" target="_blank" rel="noopener noreferrer">Qiita (@oOtanl)</a>
		</li>
	</ul>
</section>
