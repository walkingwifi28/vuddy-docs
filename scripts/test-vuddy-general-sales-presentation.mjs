import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(
    new URL(
        "../pages/service-introduction-materials/vuddy/index.html",
        import.meta.url,
    ),
    "utf8",
);

function hasClass(tag, expectedClass) {
    const match = tag.match(
        /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))/i,
    );
    const classes = match?.slice(1).find((value) => value !== undefined);

    return classes?.split(/\s+/).includes(expectedClass) ?? false;
}

const voidElements = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);

function extractTopLevelSlides(source) {
    const tags = [...source.matchAll(/<\/?([a-z][\w:-]*)\b[^>]*>/gi)];
    const containerIndex = tags.findIndex(
        ([tag, name]) =>
            !tag.startsWith("</") &&
            name.toLowerCase() === "div" &&
            hasClass(tag, "slides"),
    );

    assert.notEqual(containerIndex, -1, 'Reveal ".slides" container not found');

    const stack = ["div"];
    const slides = [];
    let slideStart;

    for (const tagMatch of tags.slice(containerIndex + 1)) {
        const tag = tagMatch[0];
        const name = tagMatch[1].toLowerCase();
        const closing = tag.startsWith("</");
        const selfClosing = /\/\s*>$/.test(tag) || voidElements.has(name);

        if (selfClosing) {
            continue;
        }

        if (!closing) {
            if (stack.length === 1 && name === "section") {
                slideStart = tagMatch.index;
            }
            stack.push(name);
            continue;
        }

        assert.equal(
            name,
            stack.at(-1),
            `Reveal ".slides" container is malformed near ${tag}`,
        );

        const closesDirectSlide =
            name === "section" && stack.length === 2 && slideStart !== undefined;
        stack.pop();

        if (closesDirectSlide) {
            slides.push(
                source.slice(slideStart, tagMatch.index + tag.length),
            );
            slideStart = undefined;
        }

        if (stack.length === 0) {
            return slides;
        }
    }

    assert.fail('Reveal ".slides" container closing tag not found');
}

function assertContainsTerms(source, terms, label) {
    const missing = terms.filter((term) => !source.includes(term));

    assert.deepEqual(missing, [], `${label} missing terms: ${missing.join(", ")}`);
}

test("スライド抽出は属性とクラスの追加を許容して閉じタグで範囲を区切る", () => {
    const source = `
        <div class="reveal">
            <div data-kind="deck" class="theme-light slides compact">
                <article><section>not direct</section></article>
                <section><div><section>nested</section></div></section>
            </div>
            <section>outside</section>
        </div>
    `;

    assert.deepEqual(extractTopLevelSlides(source), [
        "<section><div><section>nested</section></div></section>",
    ]);
});

test("スライド抽出はコンテナ欠落や不正なタグ構造を明示する", () => {
    assert.throws(
        () => extractTopLevelSlides("<div><section></section></div>"),
        /container not found/,
    );
    assert.throws(
        () => extractTopLevelSlides('<div class="slides"><section></div>'),
        /container is malformed/,
    );
    assert.throws(
        () => extractTopLevelSlides('<div class="slides"><section></section>'),
        /closing tag not found/,
    );
});

test("統合資料は既存の17枚構成と配布機能を維持する", () => {
    const slides = extractTopLevelSlides(html);
    const invalidFooterCounts = slides.flatMap((slide, index) => {
        const count = slide.match(/VARISTA_logo\.png/g)?.length ?? 0;
        return count === 1 ? [] : [`slide ${index + 1}: ${count}`];
    });
    const footerFailures = invalidFooterCounts.join(", ");

    assert.equal(slides.length, 17);
    assert.match(html, /Reveal\.initialize\(/);
    assert.match(html, /class="pdf-download"/);
    assert.match(html, /Vuddy_logo-01\.png/);
    assert.equal(html.match(/VARISTA_logo\.png/g)?.length, 17);
    assert.deepEqual(
        invalidFooterCounts,
        [],
        `each slide must contain one VARISTA footer: ${footerFailures}`,
    );
});

const slideExpectations = [
    {
        number: 2,
        label: "導入メッセージ",
        terms: ["一方的", "選べる"],
    },
    {
        number: 3,
        label: "課題",
        terms: ["相手ごと", "知りたい情報", "反応", "説明", "次の行動"],
    },
    {
        number: 4,
        label: "解決策",
        terms: ["選べる", "分析", "CTA"],
    },
    {
        number: 6,
        label: "視聴体験",
        terms: [
            "選ぶ",
            "理解",
            "行動",
            "サービス",
            "事例",
            "料金",
            "導入方法",
            "問い合わせ",
            "予約",
            "資料請求",
        ],
    },
    {
        number: 7,
        label: "主要機能",
        terms: [
            "動画内ボタン",
            "分岐シナリオ",
            "視聴分析",
            "URL",
            "QR",
            "Web配信",
        ],
    },
    {
        number: 8,
        label: "分析",
        terms: ["視聴完了率", "選択率", "遷移", "離脱", "CTA"],
    },
    {
        number: 9,
        label: "活用シーン",
        terms: [
            "法人営業",
            "ホームページ",
            "展示会",
            "交流会",
            "採用",
            "案内",
        ],
    },
    {
        number: 10,
        label: "導入メリット",
        terms: ["理解促進", "関心把握", "行動促進", "継続改善"],
    },
    {
        number: 11,
        label: "従来手法との比較",
        terms: [
            "一律",
            "動画",
            "資料",
            "Webページ",
            "Vuddy",
            "選択",
            "反応",
            "CTA",
            "改善",
        ],
    },
    {
        number: 12,
        label: "活用例",
        terms: ["配信", "視聴", "選択", "分析", "フォロー", "改善"],
    },
    {
        number: 17,
        label: "次の行動",
        terms: [
            "デモ",
            "活用相談",
            "相手",
            "伝えたい",
            "次の行動",
            "CTA",
        ],
    },
];

for (const { number, label, terms } of slideExpectations) {
    test(`スライド${number}は${label}の意図した内容をまとめて扱う`, () => {
        const slides = extractTopLevelSlides(html);
        const slide = slides[number - 1];

        assert.ok(slide, `slide ${number} not found`);
        assertContainsTerms(slide, terms, `slide ${number} (${label})`);
    });
}

test("統合資料は名刺用途だけを前提とする旧見出しを除外する", () => {
    const oldHeadings = [
        "導入メリットは、名刺交換後の関係づくりにあります",
        "想定活用例：名刺交換後のフォローを改善する場合",
    ];
    const remaining = oldHeadings.filter((heading) => html.includes(heading));

    assert.deepEqual(
        remaining,
        [],
        `old headings still present: ${remaining.join(", ")}`,
    );
});
