+++
title = "hugo-theme-hello-friend-ai という折り返すほど長いパスからのデプロイ"
slug = "long-title-no-cover"
description = "サムネイルがなく、タイトルが収まらない行。日付が下に落ちるしかなくなる場合です。"
date = "2026-01-10"
type = ["posts","post"]
tags = ["hugo"]
categories = ["Development"]
[author]
  name = "Jane Doe"
+++

一覧の行は、タイトルと、右端の日付と、その下の抜粋でできています。カバー画像が
あれば、タイトルはサムネイルと日付が残した幅を取るよう指示されています。カバー
画像がなければ指示されず、これほど長いタイトルは日付を次の行へ押し出し、
`space-between` がそれを末尾ではなく先頭に置いていました。

このページは、その行が毎回組まれ、確認されるために存在します。
