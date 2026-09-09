/**
 * פרק 1 — אין כללים.
 *
 * Four situations (§9). The first two present a gap and invite a rule; the
 * third and fourth collide with whatever was written. Situation 3 is the
 * chapter's pinch: the rule lands on שירה, who brings the child water every
 * morning. Situation 4 turns a path rule against a shelter someone needs.
 */

import type { Situation } from "@/engine/types";

export const CHAPTER_1_TITLE = "אין כללים";

export const CHAPTER_1_INTRO =
  "הגעת לכפר לפני שבוע. אין כאן ראש כפר, אין מועצה, ואין שום כלל כתוב. " +
  "אף אחד לא מינה אותך לכלום. פשוט, כשמשהו נתקע, מתחילים לבוא אליך.";

export const CHAPTER_1: Situation[] = [
  {
    id: "c1s1",
    chapter: 1,
    title: "הבאר של יותם",
    speakerGroup: "vatikim",
    text:
      "יותם חפר באר לפני שנים, לבד, והיא בקצה השדה שלו. הבוקר הוא ראה את דנה " +
      "ממלאת ממנה דלי בשביל העדר. «היא אפילו לא שאלה», הוא אומר. דנה עומדת שם " +
      "עם הדלי ולא מבינה מה הבעיה — «יש שם מים לכולם, ולעדר שלי נגמרו».",
    subject: "mayim",
    act: "took-without-asking",
    justification: "needed-more",
    power: "victim-stronger",
    actorId: "dana",
    victimId: "yotam",
    scarce: false,
    someoneHarmed: false,
    firstOffence: true,
    invitesRule: true,
    lesson:
      "עד עכשיו לא היה כאן שום כלל, ולכן לא היה גם מה להפר. ברגע שכתבת אחד, " +
      "יש בכפר משהו שאפשר להצביע עליו — וזה עובד לשני הכיוונים.",
    noRuleOutcome: {
      text:
        "לא החלטת כלום. דנה הולכת עם הדלי, יותם נשאר ליד הבאר. " +
        "למחרת בבוקר הוא מגלגל עליה אבן גדולה.",
      rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
      trust: [
        { group: "vatikim", delta: -1 },
        { group: "roim", delta: 0 },
      ],
    },
    overrideOutcome: {
      text: "החלטת אחרת ממה שכתוב אצלך בספר. יותם מסתכל עליך ולא אומר כלום.",
      rights: [{ protection: "shivyon", group: "vatikim", move: "strain" }],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text:
          "דנה מחזירה את הדלי ושואלת. יותם מהנהן, קצת מופתע שבכלל שאלו אותו. " +
          "בערב הוא מספר לשניים אחרים שהיה כאן משהו שהוסדר.",
        rights: [],
        trust: [
          { group: "vatikim", delta: 1 },
          { group: "roim", delta: 0 },
        ],
      },
      forbidden: {
        text:
          "דנה מרוקנת את הדלי בחזרה לבאר ומובילה את העדר משם. " +
          "אחר הצהריים ראו אותה מחפשת מים בערוץ היבש, רחוק.",
        rights: [{ protection: "shayachut", group: "roim", move: "strain" }],
        trust: [
          { group: "vatikim", delta: 1 },
          { group: "roim", delta: -1 },
        ],
      },
      "by-turn": {
        text:
          "קבעתם סדר: יותם ראשון, אחר כך העדר. זה עובד. " +
          "לוקח לכולם יותר זמן, ואף אחד לא נשאר בלי.",
        rights: [],
        trust: [
          { group: "vatikim", delta: 0 },
          { group: "roim", delta: 0 },
        ],
      },
      "share-equally": {
        text:
          "הבאר פתוחה לכולם בשווה. דנה ממלאת בלי לשאול, וגם עוד שניים אחריה. " +
          "יותם עומד מהצד ומסתכל על הבאר שהוא חפר.",
        rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
        trust: [
          { group: "vatikim", delta: -1 },
          { group: "roim", delta: 1 },
        ],
      },
    },
  },

  {
    id: "c1s2",
    chapter: 1,
    title: "הדוכן על השביל",
    speakerGroup: "yeladim",
    text:
      "ברק בנה דוכן עץ בדיוק על השביל הצר שיורד לבאר. הוא עשה את זה ביומיים, " +
      "יפה, והוא גאה בזה. הילדים שיורדים לשאוב מים צריכים עכשיו להקיף מסביב " +
      "לגבעה. שירה אומרת לך את זה בשקט, כי היא לא בטוחה שמותר להתלונן.",
    subject: "shvil",
    act: "blocked",
    justification: "nobody-said-no",
    power: "victim-weaker",
    actorId: "barak",
    victimId: "shira",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: true,
    lesson:
      "שים לב מי סיפר לך על זה, ומי לא. ברק היה בטוח שמותר כי אף אחד לא אמר לו " +
      "שאסור. הילדים לא אמרו כלום כי הם לא היו בטוחים שמישהו יקשיב.",
    noRuleOutcome: {
      text:
        "הדוכן נשאר. הילדים מקיפים את הגבעה, וזה לוקח להם רבע שעה בכל כיוון. " +
        "אחרי שבוע הם פשוט מפסיקים לרדת לבאר לבד.",
      rights: [{ protection: "shayachut", group: "yeladim", move: "strain" }],
      trust: [{ group: "yeladim", delta: -1 }],
    },
    overrideOutcome: {
      text: "החלטת אחרת ממה שכתוב אצלך בספר. שירה שואלת אותך למה כתבת את זה בכלל.",
      rights: [{ protection: "shivyon", group: "yeladim", move: "strain" }],
      trust: [{ group: "yeladim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text:
          "ברק לא שאל אף אחד לפני שבנה, אז הוא מזיז את הדוכן שני מטרים הצידה. " +
          "לוקח לו יום שלם. השביל חופשי.",
        rights: [],
        trust: [
          { group: "yeladim", delta: 1 },
          { group: "banaim", delta: -1 },
        ],
      },
      forbidden: {
        text:
          "הדוכן יורד. ברק מפרק אותו לבד, לוקח את הקרשים ולא אומר מילה. " +
          "השביל חופשי לגמרי, וכלום לא ייבנה עליו יותר.",
        rights: [{ protection: "shayachut", group: "banaim", move: "strain" }],
        trust: [
          { group: "yeladim", delta: 1 },
          { group: "banaim", delta: -1 },
        ],
      },
      "by-turn": {
        text:
          "הדוכן פתוח רק בבקרים, ואחר הצהריים הוא מקופל והשביל פנוי. " +
          "מסורבל, אבל שני הצדדים מקבלים משהו.",
        rights: [],
        trust: [{ group: "yeladim", delta: 0 }],
      },
      "share-equally": {
        text:
          "השביל שייך לכולם בשווה, אז הדוכן נשאר וגם המעבר נשאר — " +
          "ברק מצמצם אותו לחצי. עכשיו הוא צר, אבל אפשר לעבור.",
        rights: [],
        trust: [
          { group: "yeladim", delta: 0 },
          { group: "banaim", delta: 0 },
        ],
      },
    },
  },

  {
    id: "c1s3",
    chapter: 1,
    title: "שירה והעז",
    speakerGroup: "vatikim",
    text:
      "השבוע יבש. בבאר נשאר מעט, ויותם סימן עד איפה מותר לרדת. " +
      "הבוקר שירה מילאה משם דלי בלי לשאול — העז שלה חולה כבר שלושה ימים ולא " +
      "שותה מכלום אחר. זו לא הפעם הראשונה שהיא לוקחת. " +
      "שירה היא זו שמביאה לך מים כל בוקר לפני שאתה בכלל קם.",
    subject: "mayim",
    act: "took-without-asking",
    justification: "needed-more",
    power: "equal",
    actorId: "shira",
    victimId: "yotam",
    scarce: true,
    someoneHarmed: true,
    firstOffence: false,
    invitesRule: false,
    lesson:
      "כלל הוא לא הבעת עמדה. הוא הבטחה, וההבטחה נבדקת בדיוק ברגע שבו " +
      "לא נוח לקיים אותה.",
    noRuleOutcome: {
      text:
        "אין שום כלל שנוגע בזה. שירה ממשיכה למלא, ויותם מפסיק לספור. " +
        "עד סוף השבוע ארבעה אנשים לוקחים מתחת לסימן.",
      rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    overrideOutcome: {
      text:
        "החלטת לא להפעיל את הכלל שלך הפעם. שירה מודה לך והולכת עם הדלי. " +
        "יותם שותק, ואחר כך שואל בקול אם הכלל חל גם עליו או רק על מי שאתה בוחר.",
      rights: [
        { protection: "shivyon", group: "vatikim", move: "strain" },
        { protection: "shivyon", group: "yeladim", move: "strain" },
      ],
      trust: [{ group: "vatikim", delta: -1 }],
    },
    outcomes: {
      "ask-first": {
        text:
          "הכלל שכתבת חל עליה. שירה מחזירה את המים ומבקשת רשות. " +
          "יותם אומר לא — נשאר מעט. היא הולכת בלי להסתכל עליך, " +
          "ומחר בבוקר לא מחכה לך שם דלי.",
        rights: [],
        trust: [
          { group: "yeladim", delta: -1 },
          { group: "vatikim", delta: 1 },
        ],
      },
      forbidden: {
        text:
          "הכלל שכתבת חל עליה. לשירה אסור לגעת בבאר בכלל. " +
          "היא לא מתווכחת. אחרי יומיים העז מתה, והיא לא מספרת לך.",
        rights: [{ protection: "shayachut", group: "yeladim", move: "break" }],
        trust: [
          { group: "yeladim", delta: -2 },
          { group: "vatikim", delta: 1 },
        ],
      },
      "by-turn": {
        text:
          "הכלל שכתבת חל עליה. שירה מחכה לתור שלה — שלושה ימים. " +
          "היא מחכה. העז לא.",
        rights: [{ protection: "shayachut", group: "yeladim", move: "strain" }],
        trust: [
          { group: "yeladim", delta: -1 },
          { group: "vatikim", delta: 1 },
        ],
      },
      "share-equally": {
        text:
          "הכלל שכתבת חל עליה. מחלקים את מה שנשאר שווה בשווה, וגם שירה מקבלת. " +
          "זה מספיק לעז, וזה לא מספיק לאף אחד אחר. יותם סופר בקול כמה נשאר.",
        rights: [{ protection: "kinyan", group: "vatikim", move: "strain" }],
        trust: [
          { group: "yeladim", delta: 1 },
          { group: "vatikim", delta: -1 },
        ],
      },
    },
  },

  {
    id: "c1s4",
    chapter: 1,
    title: "המחסה של מיכל",
    speakerGroup: "hadashim",
    text:
      "מיכל הגיעה לכפר לפני חודש וישנה מאז מתחת ליריעה. " +
      "ברק אומר שהוא יכול לבנות לה מחסה עד סוף השבוע, אבל המקום היחיד " +
      "שיש בו צל וקרקע ישרה הוא בדיוק על השביל. הוא בא לשאול אותך " +
      "לפני שהוא מתחיל, וזה חדש — עד עכשיו הוא לא שאל.",
    subject: "shvil",
    act: "blocked",
    justification: "needed-more",
    power: "victim-weaker",
    actorId: "barak",
    victimId: "michal",
    scarce: false,
    someoneHarmed: true,
    firstOffence: true,
    invitesRule: false,
    lesson:
      "כלל נכתב תמיד בתוך מצב אחד, ואחר כך פוגש מצבים שלא חשבת עליהם. " +
      "זה לא אומר שהוא היה כלל רע. זה אומר שכלל הוא דבר שחיים איתו.",
    noRuleOutcome: {
      text:
        "אין כלל על השביל, אז ברק בונה. מיכל ישנה בפנים כבר בלילה הראשון. " +
        "הילדים מקיפים שוב את הגבעה, ואף אחד לא שאל אותם.",
      rights: [{ protection: "shayachut", group: "yeladim", move: "strain" }],
      trust: [
        { group: "hadashim", delta: 1 },
        { group: "yeladim", delta: -1 },
      ],
    },
    overrideOutcome: {
      text:
        "החלטת לא להפעיל את הכלל שלך הפעם. המחסה נבנה. " +
        "שירה אומרת שכשזה היה הדוכן של ברק הכלל דווקא כן עבד.",
      rights: [{ protection: "shivyon", group: "yeladim", move: "strain" }],
      trust: [
        { group: "hadashim", delta: 1 },
        { group: "yeladim", delta: -1 },
      ],
    },
    outcomes: {
      "ask-first": {
        text:
          "ברק שאל, וזה בדיוק מה שהכלל דורש. " +
          "אתם עומדים שלושתכם על השביל ומחליטים איפה בונים. " +
          "המחסה עולה בקצה, והמעבר נשאר.",
        rights: [],
        trust: [
          { group: "hadashim", delta: 1 },
          { group: "banaim", delta: 1 },
        ],
      },
      forbidden: {
        text:
          "הכלל שכתבת אוסר לגעת בשביל, נקודה. ברק מוריד את הכלים. " +
          "מיכל נשארת מתחת ליריעה, וכשיורד הגשם הראשון היא לא בכפר בבוקר.",
        rights: [{ protection: "machse", group: "hadashim", move: "break" }],
        trust: [
          { group: "hadashim", delta: -2 },
          { group: "banaim", delta: -1 },
        ],
      },
      "by-turn": {
        text:
          "מחסה זה לא דבר שאפשר לעשות בתורות. ברק בונה חצי, מפרק, ובונה שוב. " +
          "אחרי שבוע הוא מוותר, ומיכל מקבלת גג חלקי.",
        rights: [{ protection: "machse", group: "hadashim", move: "strain" }],
        trust: [{ group: "hadashim", delta: -1 }],
      },
      "share-equally": {
        text:
          "השביל של כולם בשווה, אז המחסה עולה בצד אחד והמעבר נשאר בשני. " +
          "צר, אבל שניהם קיימים.",
        rights: [],
        trust: [
          { group: "hadashim", delta: 1 },
          { group: "yeladim", delta: 0 },
        ],
      },
    },
  },
];
