import type { Actor, GroupId } from "@/engine/types";

export const GROUP_BLURB: Record<GroupId, string> = {
  vatikim: "היו כאן ראשונים, ומרגישים שמגיע להם קודם",
  hadashim: "הגיעו לא מזמן, ואין להם עדיין כלום מוסכם",
  roim: "צריכים שטח ומים, ונעים בין המקומות",
  banaim: "רוצים לשנות דברים, ומהר",
  yeladim: "אף אחד לא שואל אותם",
  ovrim: "לא גרים כאן. רק עוברים",
};

/**
 * The screen before the village opens (§4). Names the six groups by what
 * moves them, not by role — and says what the child's own role is not:
 * nobody appointed it.
 */
export const ABOUT_TITLE = "הכפר, לפני שנכנסים";

export const ABOUT_VILLAGE_TEXT =
  "כפר קטן, בלי חומה ובלי שער. שש קבוצות גרות בו, חוץ מאחת שרק עוברת דרכו — " +
  "ולכל אחת יש דבר אחר שמטריד אותה.";

export const ABOUT_ME_TEXT =
  "אף אחד לא מינה אותך לשום דבר. אין לך תואר, ואין שום דבר שמונע ממישהו אחר " +
  "בכפר לעשות בדיוק את מה שאתה עושה. אתה פשוט מי שכולם באים אליו כשמשהו " +
  "נתקע — וזה יימשך רק כל עוד הם ממשיכים לבוא.";

export const ACTORS: Record<string, Actor> = {
  yotam: {
    id: "yotam",
    name: "יותם",
    groups: ["vatikim"],
    resident: true,
  },
  dana: {
    id: "dana",
    name: "דנה",
    groups: ["roim"],
    resident: true,
  },
  shira: {
    id: "shira",
    // A child, and the one who brings you water every morning.
    // Situation 3 exists to make her the one the rule bites.
    name: "שירה",
    groups: ["yeladim", "roim"],
    resident: true,
  },
  barak: {
    id: "barak",
    name: "ברק",
    groups: ["banaim"],
    resident: true,
  },
  michal: {
    id: "michal",
    name: "מיכל",
    groups: ["hadashim"],
    resident: true,
  },
  noam: {
    id: "noam",
    name: "נעם",
    groups: ["ovrim"],
    resident: false,
  },
};

export function actor(id: string): Actor {
  const a = ACTORS[id];
  if (!a) throw new Error(`Unknown actor: ${id}`);
  return a;
}
