import { Settings } from "@/domain/schema";
import { ValuePart } from "@/domain/values/valueCollection";
import {
  CONFIRMATION,
  CONTENT,
  MESSAGE,
  RECEIPT,
  VESSEL,
} from "../shared-emails";

const hide = true;

export const WIN: Settings<ValuePart<any>> = {
  "Program:Win": {
    settings: {
      // PROGRAM
      "Program Name": {
        value: "How to Win Stakeholders & Influence Decisions",
        hide,
      },
      "Program Website": { value: "https://winstakeholders.com", hide },

      // AIRTABLE
      "Calendar Table ID": { value: "tblVtIK7hg8LOJfZd", hide },
      "Cohort Table ID": { value: "tblEQ09wfPRDZdXtN", hide },

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

      // TEMPLATE
      Template: { value: "/win", part: 1 },

      // INTERNAL
      "Email Name": { value: "{Cohort (3 Letters)} ", part: 1 },
      Pillar: { value: "{Topic}" },

      // STYLES
      "Link Color": { value: "#a5473d", hide },
      "Accent Color": { value: "#8c9a29", hide },
      "Link Text Decoration": { value: "none" },
      Font: { value: "arial", hide },

      // SENDING
      "Send Type": { value: "POSTMARK", hide },

      // FOOTER
      "Footer Email Reason": {
        value: `You're receiving this email because you're a member of the {Cohort (First Word)} cohort of the {Program Name} Online Course.`,
      },
      "Footer Tag": { value: `{Cohort (Caps)(3 Letters)}` },

      // BANNER
      Banner: {
        value:
          "https://content.app-us1.com/O8aW3/2025/05/05/9bc6efed-4308-42b8-8e92-c9a887702c61.png?id=39152002",
      },
      "Promo Banner": {
        value:
          "https://asset.uie.com/emails/img/75dfeb323db66460ccfb3d8e786d0508a1f9a7cf0a35805986272be70177b8ca.png",
        hide,
      },
    },

    // ** EMAILS **

    "Email Type:Homework": {
      settings: {
        "Email Name": { value: "{Topic} {Lab}", part: 2 },
        Subject: { value: "Win Program {Topic}. {Title}" },
        "Share Reviews By": { value: "Cohort" },
        "Last Session Phrase": { value: "This past week in our", hide },
        "Last Lab Phrase": { value: "this week's lab" },

        "Variation Variable": { value: "Cohort", hide },
        "Variation Values": { value: "{All Cohorts}", hide },
        "QA Email Name": {
          value: "{Program} {All Cohorts (3 Letters)(/)} {Topic} {Lab}",
          part: 0,
          hide,
        },
      },
      "Topic:Pillar 1": {
        settings: {
          "Share Reviews By": { value: "" },
          "Program Name": {
            value: "UX Leadership & Influence Program",
            hide,
          },
        },
      },
      "Topic:Pillar 2": {
        settings: {
          "Share Reviews By": { value: "" },
          "Program Name": {
            value: "UX Leadership & Influence Program",
            hide,
          },
        },
      },
      "Session Type:Live Lab 1": {
        settings: {
          Template: { value: "/homework-pillar-x-lab-1.html", part: 2 },
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/1sDODxhDrRbsuUEPpw0J9S4eoah5U3L6QQ18Y2E2h_YQ/edit",
          },
          "Stripo Link": {
            value: "https://my.stripo.email/editor/v5/727662/email/9490127",
            hide,
          },
        },
      },
      "Session Type:Live Lab 2": {
        settings: {
          Template: { value: "/homework-pillar-x-lab-2.html", part: 2 },
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/1VDqUYv84Js2kSDbKEcGKpLXbyi_-_43bZlfNNdXxnms/edit",
          },
          "Stripo Link": {
            value: "https://my.stripo.email/editor/v5/727662/email/9488844",
            hide,
          },
        },
      },
      "Session Type:Wrap Up": {
        settings: {
          "Email Name": { value: "Wrap Up", part: 2 },
          "QA Email Name": { value: "{Email Name}", hide },

          Template: { value: "/wrap-up.html", part: 2 },
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/1WRBaWwntGWSlp2Nla-OB6YLqh-L3hMPcGyLLFnvczxM/edit?tab=t.0#heading=h.izz3rfn15qfa",
          },
          "Stripo Link": {
            value: "https://my.stripo.email/editor/v5/727662/email/9496698",
            hide,
          },
        },
      },
      "Is First Session Of Program": {
        settings: {
          Template: { value: "/homework-pillar-1-lab-1.html", part: 2 },
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/1gOPtAZI3Yi4v6NwTr3JtoJ70iXiPjwZ7CIQcVDS5XRo/edit?tab=t.0#heading=h.hx6ixedf7q1z",
          },
          "Stripo Link": {
            value: "https://my.stripo.email/editor/v5/727662/email/9488843",
            hide,
          },
        },
      },
    },

    "Is Transition": {
      settings: {
        "Email Name": { value: " Transition", part: 3 },
        "QA Email Name": {
          value:
            "{Program} {All Cohorts (3 Letters)(/)} {Topic} {Lab} Transition",
          part: 0,
          hide,
        },

        "Session Note": {
          value: `<br><br>​<em>Note: Your sessions will now start two hours later, at <strong>{First Date (h:mma z)(:00)} ({First Date (HH.mm z)(GMT)})</strong> or <strong>{Second Date (h:mma z)(:00)} ({Second Date (HH.mm z)(GMT)})</strong>. You'll be joining the {New Sibling Cohort #1} and {New Sibling Cohort #2} cohorts for {Topic}. {Lab}.<br></em>`,
          hide,
        },
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1dx6wwS_Swm4zSsOMsI_lM0xrgc0HBwWolDdjufQohpg/edit?usp=sharing",
        },
      },
    },

    "Is After Break": {
      settings: {
        "Email Name": { value: " After Break", part: 3 },
        "Last Session Phrase": { value: "When we last met for our" },
        "Last Lab Phrase": { value: "our last lab" },

        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1iYTowt5OKZ8td4rK0dbfkEcyWepmPNbAwJrO8qE4xjk/edit?tab=t.0#heading=h.jv1g4dbv6278",
        },

        "QA Email Name": {
          value:
            "{Program} {All Cohorts (3 Letters)(/)} {Topic} {Lab} After Break",
          part: 0,
          hide,
        },

        "{Last Week} Session #1 Recording Link": {
          value: "{{Week (-{Break Length(+1)})} Session #1 Recording Link}",
          hide,
        },
      },
    },

    "Email Type:Before Break": {
      settings: {
        "Email Name": { value: "Before Break", part: 2 },
        Subject: { value: "Win Program: Break {Break Range}" },
        "Share Reviews By": { value: "Cohort" },
        Template: { value: "/before-break.html", part: 2 },
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1XpRHEBaYCzGyWJ-BH_eWtXhT4Mo1dlsQUNHo8q6QUtI/edit",
        },
        "Stripo Link": {
          value: "https://my.stripo.email/editor/v5/727662/email/9695433",
          hide,
        },

        "Variation Variable": { value: "Cohort", hide },
        "Variation Values": { value: "{All Cohorts}", hide },
        "QA Email Name": {
          value: "{Program} {All Cohorts (3 Letters)(/)} Before Break",
          hide,
        },
      },
      "Topic:Pillar 1": {
        settings: {
          "Share Reviews By": { value: "" },
          "QA Email Name": { value: "{Email Name}", hide },
          "Program Name": {
            value: "UX Leadership & Influence Program",
            hide,
          },
        },
      },
      "Topic:Pillar 2": {
        settings: {
          "Share Reviews By": { value: "" },
          "QA Email Name": { value: "{Email Name}", hide },
          "Program Name": {
            value: "UX Leadership & Influence Program",
            hide,
          },
        },
      },
      "Is Transition": {
        settings: {
          "Session Note": {
            value: `<em>Note: Your sessions will now start two hours later, at <strong>{{Week (+{Break Length(+1)})} Session #1 First Date (h:mma z)(:00)} ({{Week (+{Break Length(+1)})} Session #1 First Date (HH.mm z)(GMT)})</strong> or <strong>{{Week (+{Break Length(+1)})} Session #1 Second Date (h:mma z)(:00)} ({{Week (+{Break Length(+1)})} Session #1 Second Date (HH.mm z)(GMT)})</strong>. You'll be joining the {New Sibling Cohort #1} and {New Sibling Cohort #2} cohorts for {{Week (+{Break Length(+1)})} Session #1 Topic}. {{Week (+{Break Length(+1)})} Session #1 Lab}.</em><br/><br/>`,
            hide,
          },
          "Break Note": {
            value:
              "<br/><em>Note: When we return from break, you will join the larger program group.</em>",
            hide,
          },
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/1_Bnz3wAmMYH-JZ7MS6J3kuLsO1WbJh3fY-spccKqOec/edit?tab=t.0",
          },
          "QA Email Name": { value: "{Email Name}", hide },
        },
      },
    },

    "Email Type:First Lab Reminder": {
      settings: {
        "Email Name": { value: "First Reminder", part: 2 },
        Subject: { value: "Win Program: Upcoming live session!" },
        Template: { value: "/first-lab-reminder.html", part: 2 },
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1MXgQs2UXgDbbmf0ZvW9k6k5pGBECgs30A_uWNkjFI5Y/edit?usp=share_link",
        },
        "Stripo Link": {
          value: "https://my.stripo.email/editor/v5/727662/email/9046397",
          hide,
        },
        "Program Name": {
          value: "UX Leadership & Influence Program",
          hide,
        },
      },
    },

    "Email Type:Onboarding": {
      settings: {
        "Email Name": { value: "Onboarding", part: 2 },
        Subject: {
          value:
            "Let’s get started! How to Win Stakeholders & Influence Decisions Program.",
        },
        Template: { value: "/onboarding.html", part: 2 },
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1bzrNfDyBpN9TjA2qdqhurm57mlisKffNWZADlRcKdGw/edit",
        },
        "Stripo Link": {
          value: "https://my.stripo.email/editor/v5/727662/email/9540162",
          hide,
        },
        "Program Name": {
          value: "UX Leadership & Influence Program",
          hide,
        },
      },
    },

    "Email Type:Wrap Up": {
      settings: {
        "Email Name": { value: "Wrap Up", part: 2 },
        Subject: { value: "Program Off-Boarding, Support, and Next Steps." },
        Template: { value: "/wrap-up.html", part: 2 },
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1qNN47LexqXBO6HWVOiGewCGdTmgFYOepeKs11Jky4RA/edit?tab=t.0#heading=h.izz3rfn15qfa",
        },
        "Stripo Link": {
          value: "https://my.stripo.email/editor/v5/727662/email/9496698",
          hide,
        },
      },
    },

    "Email Type:Certificate": {
      settings: {
        "Email Name": { value: "Certificate", part: 2 },
        Subject: {
          value:
            "Your Certificate for The How to Win Stakeholders & Influence Decisions program",
        },
        Template: { value: "/win/certificate.html", part: 1 },
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1ak_mQJ_mBQkSi7gwoYJO2s5CHOUejvXvUnypv2CNCvo/edit",
        },
        "Stripo Link": {
          value: "https://my.stripo.email/editor/v5/727662/email/9496699",
          hide,
        },
      },
    },

    "Email Type:Extension Details": {
      settings: {
        "Email Name": { value: "Extension Details", part: 2 },
        Subject: {
          value:
            "Extend Your Access to Our How to Win Stakeholders and Influence Decisions Program.",
        },
        Template: { value: "/extension-details.html", part: 2 },
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1woSv4H2wFdyDgG_fjzglTO_7rdbbKZRQrQyfPqYNf38/edit?",
        },
        "Stripo Link": {
          value: "https://my.stripo.email/editor/v5/727662/email/9496700",
          hide,
        },
      },
    },

    ...CONTENT,
    "Email Type:Content": {
      settings: {
        "Link Color": { value: "#646E1A", hide },
        "Link Text Decoration": { value: "underline", hide },
      },
    },

    ...VESSEL,
    "Email Type:Vessel": {
      settings: {
        "Link Color": { value: "#646E1A", hide },
        "Link Text Decoration": { value: "underline", hide },
        Button: { value: "{Program Name}" },
      },
    },

    ...MESSAGE,

    ...RECEIPT,
    "Email Type:Receipt": {
      settings: {
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/u/0/d/12iiLZhO0Y_GIWi9oV3zOL3RQy-1Wgi1_kHX8UBoXjX0/edit",
        },
      },
      "Price Type:Team": {
        settings: {
          "Price Note": {
            value:
              "<em><strong>Please Note: </strong>This was a limited time offer of the special extra discounted price of <s>$2,397</s> <strong>$1,497</strong> for this program.</em>",
          },
          Price: { value: "$1,497.00" },
        },
      },
      "Price Type:Individual": {
        settings: {
          "Price Note": {
            value:
              "<em><strong>Please Note: </strong>This was a limited time offer of the special extra discounted price of <s>$2,697</s> <strong>$1,697</strong> for this program.</em>",
          },
          Price: { value: "$1,697.00" },
        },
      },
    },

    ...CONFIRMATION,
    "Email Type:Confirmation": {
      settings: {
        Template: { value: "/win/confirmation.html", part: 1 },
        "Link Decoration": { value: "underline" },
      },
    },

    // ** SETTINGS **
    "Session Type:Live Lab 1": {
      settings: {
        Lab: { value: "Lab 1" },
      },
    },
    "Session Type:Live Lab 2": {
      settings: {
        Lab: { value: "Lab 2" },
      },
    },

    "Week:Week 2": {
      settings: {
        "Week 1 Session #1 Recording Link": {
          value:
            '{Airtable URL}/{Cohort Table ID}?filterByFormula=SEARCH("{Cohort}", %7BCohort%7D)&fields[]=Pillar 1 Session Recordings',
          fetch: "airtable",
        },
      },
    },
    "Week:Week 3": {
      settings: {
        "Week 2 Session #1 Recording Link": {
          value:
            '{Airtable URL}/{Cohort Table ID}?filterByFormula=SEARCH("{Cohort}", %7BCohort%7D)&fields[]=Pillar 1 Session Recordings',
          fetch: "airtable",
        },
      },
    },
    "Week:Week 4": {
      settings: {
        "Week 3 Session #1 Recording Link": {
          value:
            '{Airtable URL}/{Cohort Table ID}?filterByFormula=SEARCH("{Cohort}", %7BCohort%7D)&fields[]=Pillar 2 Session Recordings',
          fetch: "airtable",
        },
      },
    },
    "Week:Week 5": {
      settings: {
        "Week 4 Session #1 Recording Link": {
          value:
            '{Airtable URL}/{Cohort Table ID}?filterByFormula=SEARCH("{Cohort}", %7BCohort%7D)&fields[]=Pillar 2 Session Recordings',
          fetch: "airtable",
        },
      },
    },

    "Cohort:April 2025": {
      settings: {
        "Automation ID": { value: "273", hide },
      },
    },
    "Cohort:January 2025": {
      settings: {
        "Automation ID": { value: "205", hide },
      },
    },
    "Cohort:February 2025": {
      settings: {
        "Automation ID": { value: "255", hide },
      },
    },
    "Cohort:March 2025": {
      settings: {
        "Automation ID": { value: "260", hide },
      },
    },
    "Cohort:May 2025": {
      settings: {
        "Automation ID": { value: "294", hide },
      },
    },
    "Cohort:June 2025": {
      settings: {
        "Automation ID": { value: "299", hide },
      },
    },
    "Cohort:July 2025": {
      settings: {
        "Automation ID": { value: "300", hide },
      },
    },
    "Cohort:August 2025": {
      settings: {
        "Automation ID": { value: "319", hide },
      },
    },
  },
};
