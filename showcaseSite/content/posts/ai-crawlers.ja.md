+++
title = "学習は断り、引用は断らない"
description = "このサイトの robots.txt を決める二つのスイッチ、それが書き出すもの、そしてできないこと"
date = "2026-03-05"
type = ["posts","post"]
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

モデルを学習させるためにこのページを読むクローラーと、誰かの質問に答えるために
読むクローラーは、目的だけが違う同じ HTTP リクエストです。前者はテキストがモデルの
内部に取り込まれ、リンクは戻ってきません。後者はページを引用した回答で終わります。
テーマはこれを一つではなく二つの問いとして扱います。

```toml
[params.ai]
  train = false
  cite  = true
```

どちらも既定値は `true` なので、何も設定しないサイトはこれまでどおりの
`robots.txt` を受け取ります。このサイトは両方を設定しており、だから生成される
ファイルは二つの部分に分かれます。

```
User-agent: *
Disallow:
Content-Signal: search=yes, ai-input=yes, ai-train=no

# Declined: fetched to train a model, with no link back.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: CCBot
Disallow: /
```

独立したグループを与えられるのは、断るものだけです。`robots.txt` では沈黙が許可を
意味します。取得系のクローラーを `Allow` の下に並べても、冒頭のワイルドカード
グループが既に述べていることを繰り返すだけで、間違いうる場所が一つ増えます。

`Content-Signal` の行は、同じ意思を三つのトークンで述べます。`search` は索引化
されてリンクとして表示されること、`ai-input` は回答を組み立てるために読まれる
こと、`ai-train` は学習の材料にされることです。これは標準ではなく Cloudflare の
提案であり、長さは一行です。

できないことが二つあります。`robots.txt` は要求にすぎません。従うものは従い、
残りは CDN の領分です。そして切り分けはトークンが許す範囲までしか正確に
なりません。`Google-Extended` は Gemini の学習と回答の根拠づけの両方を覆うため、
`cite` が何であれ `train = false` は Google の回答枠を手放すことになります。

問いのもう半分は `llms.txt` で、こちらは誰が読んでよいかではなく、どう読むかを
述べます。このサイトはそれを出力し、各ページの Markdown 版も併せて公開します。
