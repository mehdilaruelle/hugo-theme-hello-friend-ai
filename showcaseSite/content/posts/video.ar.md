+++
title = "مقطع مرئي مكان صورة متحركة"
description = "الاختصار video: تسجيل شاشة لا يزن ميغابايتات"
date = "2026-01-24"
type = ["posts","post"]
# Rooted on purpose: absURL resolved a leading slash against the domain root,
# so og:audio and og:video named a file outside the tree on a subpath site. A
# relative path never showed it. videos is here for the same reason.
audio = ["/video/demo.mp4"]
videos = ["/video/demo.mp4"]
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

الصورة المتحركة طريقة رديئة لنشر تسجيل شاشة: ثوانٍ قليلة من الحركة تبلغ عدة
ميغابايتات، ولا يستطيع القارئ إيقافها. القياس على تسجيل حقيقي مدته إحدى عشرة
ثانية بدقة 3840×2160:

| الملف | الحجم |
| --- | --- |
| `demo.gif` | 4248 Ko |
| `demo.mp4` | 366 Ko |
| `demo.webm` | 290 Ko |

يأخذ الاختصار `video` المسار دون امتداد، ويُخرج عنصر `<source>` لكل صيغة، فيأخذ
المتصفّح أول ما يستطيع تشغيله:

{{< video src="/video/demo" poster="/video/demo.jpg" width="640" height="360" alt="نمط اختبار يتكرّر" >}}

يبدأ من تلقاء نفسه، صامتًا، ويتكرّر — تمامًا كالصورة المتحركة التي يحلّ محلّها،
فتبقى قراءة المقالة كما هي، لكن مع أدوات تحكّم لم تكن للصورة المتحركة قطّ: فالتكرار
يستمرّ ما دامت الصفحة مفتوحة. ومرّر `controls="true"` لإلغاء التشغيل التلقائي
والتكرار، فينتظر المقطع أن يبدأه القارئ:

{{< video src="/video/demo" poster="/video/demo.jpg" width="640" height="360" controls="true" alt="نمط اختبار" >}}

`width` و`height` أهمّ هنا منهما مع الصورة: لا حجم ذاتيًّا للمقطع قبل تحميله،
فبدونهما تقفز الصفحة لحظة وصوله. و`poster` هو ما يملأ الإطار في تلك الأثناء.

لا يملك Hugo اختصارًا جاهزًا لهذا. فيه `youtube` و`vimeo`، لكنهما يُضمّنان مشغّل
طرف آخر؛ ولا شيء فيه لملف تستضيفه بنفسك.
