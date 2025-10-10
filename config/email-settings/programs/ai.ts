import { Settings } from "@/domain/schema";
import { ValuePart } from "@/domain/values/valueCollection";
import {
  CONTENT,
  MESSAGE,
  TODAYS_SESSION,
  VESSEL,
  BEFORE_WEEK,
} from "../shared-emails";

const hide = true;

export const AI: Settings<ValuePart<any>> = {
  "Program:AI": {
    settings: {
      // PROGRAM
      "Program Name": { value: "UX & Design in an AI World", hide },
      "Program Website": { value: "https://maven.com/centercentre/uxai" },

      // INTERNAL
      "Email Name": { value: "{Cohort} ", part: 1 },

      // TEMPLATE
      "Link Color": { value: "#bd1f23", hide },
      "Accent Color": { value: "{Link Color}", hide },

      // AIRTABLE
      "Calendar Table ID": { value: "tblIeMVp4rvvRmRMS", hide },
      "Topic Table ID": { value: "tblZzIH3lvJAedhmO", hide },

      "Airtable Session Query": {
        value:
          '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"',
        hide,
      },
      "Airtable Settings Query": {
        value:
          '{Airtable URL}/{Settings Table ID}?filterByFormula=SEARCH("{Program}", %7BProgram%7D)',
        hide,
      },

      "Airtable Topic Query": {
        value:
          '{Airtable URL}/{Topic Table ID}?filterByFormula=SEARCH("{Topic}", %7BName%7D)',
        hide,
      },
      Description: {
        value: "{Airtable Topic Query}&fields[]=Description",
        fetch: "airtable",
      },
      "Syllabus QA Link": {
        value: "{Airtable Session Query}&fields[]=Syllabus QA Link",
        fetch: "airtable",
      },

      // TEMPLATE
      Template: { value: "/maven", part: 1 },

      // SENDING
      "Send Type": { value: "POSTMARK", hide },

      // BANNER
      Banner: {
        value:
          "https://zetcej.stripocdn.email/content/guids/CABINET_eae08862e26e62912ef001504503b9b01b0613bbf814f27a0cf4313905ba5d67/images/uxinai.png",
      },
      "Banner Alt": { value: "UX in an AI World" },
      "Promo Banner": {
        value:
          "https://content.app-us1.com/O8aW3/2025/06/04/83f01f0d-0e49-4d7e-bfac-8b61142dc247.png?id=39727400",
      },
      "Promo Banner Alt": {
        value: "UX & Design in an AI World; Host Jared Spool",
      },
    },

    "Topic: Topic 1": {
      settings: {
        "Number of Lecture Videos": { value: "six" },
        "Length of Lecture Videos": { value: "2 hours" },
      },
    },
    "Topic: Topic 2": {
      settings: {
        "Number of Lecture Videos": { value: "six" },
        "Length of Lecture Videos": { value: "50 minutes" },
        "Last Session Verb": { value: "we kicked off our" },
      },
    },
    "Topic: Topic 3": {
      settings: {
        "Number of Lecture Videos": { value: "eight" },
        "Length of Lecture Videos": { value: "2 hours" },
        "Last Session Verb": { value: "we continued our" },
      },
    },

    // ** EMAILS **
    ...TODAYS_SESSION,
    "Email Type:Today's Session": {
      settings: {
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1DF5Hu423GZIyl1i_9RWAXh61uZh2ucg_04-eyEFsbtE/edit?tab=t.0#heading=h.kd8hz0t7fi3s",
        },
        "Stripo Link": {
          value: "https://my.stripo.email/editor/v5/727662/email/10536320",
          hide,
        },

        // DRIVE
        "Uses Collab Notes": { value: "", hide },

        // SENDING
        Subject: { value: "Today is Session {Topic(#)} of {Program Name}" },

        // Footer Override
        "Footer Tag": { value: `UXAI CO {Cohort(#) }`, hide },
      },
    },

    ...BEFORE_WEEK,
    "Email Type:Before Week": {
      settings: {
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1y61qBC4I-lBlXmSe2WyOdVYrf9VOnQ_J9yKALTUEscI/edit?tab=t.0#heading=h.kd8hz0t7fi3s",
        },

        // Footer Override
        "Footer Tag": { value: `UXAI CO {Cohort(#) }`, hide },

        // INTERNAL
        "Email Name": { value: "Before {Week}", part: 2 },

        // TEMPLATE
        "Stripo Link": {
          value: "https://my.stripo.email/editor/v5/727662/email/10536123",
          hide,
        },

        // SENDING
        Subject: {
          value: "{Program Name} Online Course {Week}",
        },
      },
      "Is First Session Of Program": {
        "Week:Week 1": {
          settings: {
            "Source Reference Doc": {
              value:
                "https://docs.google.com/document/d/1Q4uyiKv3qX_JyPYQYVzh7H2McNIKeJB9eKJk-fbbkU4/edit?tab=t.0#heading=h.kd8hz0t7fi3s",
            },
            // TEMPLATE
            "Stripo Link": {
              value: "https://my.stripo.email/editor/v5/727662/email/10536131",
              hide,
            },
          },
        },
      },
    },

    // ** EMAILS **
    "Email Type:Lightning Talk": {
      settings: {
        "Send Type": { value: "CAMPAIGN", hide },
        "Email Name": { value: "Lightning Talk", part: 1 },
        Template: { value: "/ai/lightning-talk.html", part: 1 },
        "Send To": { value: "LoA", hide },

        Subject: { value: "TODAY: {Title}" },
        Preview: { value: "⚡️ Going live for a free Lightning Talk on Maven" },

        "Stripo Link": {
          value: "https://my.stripo.email/editor/v5/727662/email/9792363",
          hide,
        },
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1US3XMScU1sF2qrRTTCVMT8iLmEdSaoSINo1gkny1Yvk/edit?tab=t.0",
        },
      },
    },

    ...VESSEL,
    ...CONTENT,
    ...MESSAGE,

    // ** SETTINGS **
    "Cohort:Cohort 4": {
      settings: {
        "Automation ID": { value: "369", hide },
      },
    },
    "Cohort:Cohort 5": {
      settings: {
        "Automation ID": { value: "370", hide },
      },
    },
    "Cohort:Cohort 6": {
      settings: {
        "Automation ID": { value: "371", hide },
      },
    },
  },
};
