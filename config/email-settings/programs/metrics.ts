import { Settings } from "@/domain/schema";
import { ValuePart } from "@/domain/values/valueCollection";
import {
  BEFORE_WEEK,
  CERTIFICATE,
  CONFIRMATION,
  CONTENT,
  MESSAGE,
  RECEIPT,
  TODAYS_SESSION,
  VESSEL,
} from "../shared-emails";

const hide = true;

export const METRICS: Settings<ValuePart<any>> = {
  "Program:Metrics": {
    settings: {
      // PROGRAM
      "Program Name": { value: "Outcome-Driven UX Metrics", hide },
      "Program Website": { value: "https://ux-metrics.centercentre.com", hide },

      // INTERNAL
      "Email Name": { value: "{Cohort} ", part: 1 },

      // AIRTABLE
      "Calendar Table ID": { value: "tblm2TqCcDcx94nA2", hide },
      "Topic Table ID": { value: "tbl9BuLUVFytMYJeq", hide },

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

      // TEMPLATE
      Template: { value: "/workshop", part: 1 },

      // SENDING
      "Send Type": { value: "POSTMARK", hide },

      // STYLES
      "Link Color": { value: "#006f74", hide },
      "Accent Color": { value: "#00a3b4", hide },

      // BANNER
      Banner: {
        value:
          "https://content.app-us1.com/O8aW3/2025/05/05/e39a43ca-d9bb-45e7-9d77-98b74c760132.png?id=39152004",
      },
      "Promo Banner": {
        value:
          "https://content.app-us1.com/O8aW3/2025/05/05/1f3fce1d-b0eb-403b-8208-22a6e5f973aa.png?id=39155955",
      },
      "Promo Banner Alt": {
        value:
          "Outcome-Driven UX Metrics; Online Course with Jared Spool at UXMetrics.cc",
      },
    },

    // ** EMAILS **
    ...TODAYS_SESSION,
    "Email Type:Today's Session": {
      settings: {
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1iRsenQPN-SaZggLQU5o2L4WOM1a5-GgZ/edit",
        },
      },
      "Topic:Topic 1": {
        settings: {
          "Source Collab Notes Doc": {
            value:
              "https://docs.google.com/document/d/1Dy_7_M6xvf9mTN5YD4r6s5tctHjmZb2-mr09-AdZE2g/edit?usp=share_link",
          },
        },
      },
      "Topic:Topic 2": {
        settings: {
          "Source Collab Notes Doc": {
            value:
              "https://docs.google.com/document/d/1o_regKE4wutOUuFYOPRjZKiP9uTYhuLZ5pd9QRWoDkY/edit?usp=share_link",
          },
        },
      },
      "Topic:Topic 3": {
        settings: {
          "Source Collab Notes Doc": {
            value:
              "https://docs.google.com/document/d/1xiwrFrUexIoAuPYNW-IWcLuERScEhZDk8ckKAfD6K6A/edit?usp=share_link",
          },
        },
      },
      "Topic:Topic 4": {
        settings: {
          "Source Collab Notes Doc": {
            value:
              "https://docs.google.com/document/d/1K4OKwuy7A1qNGdnAJuD4YVLylZQx_bdYCaElizTX3no/edit?usp=sharing",
          },
        },
      },
      "Topic:Topic 5": {
        settings: {
          "Source Collab Notes Doc": {
            value:
              "https://docs.google.com/document/d/1haVAUgRTKaFTYCKq30l33DxtB91y7pvoOiOOVHWEIV8/edit?usp=share_link",
          },
        },
      },
      "Topic:Topic 6": {
        settings: {
          "Source Collab Notes Doc": {
            value:
              "https://docs.google.com/document/d/1dBb7Z_Dw5xbauiFCxQpr1DFf_SyrECHBoZtTnHDNjQc/edit?usp=share_link",
          },
        },
      },
      "Topic:Topic 7": {
        settings: {
          "Source Collab Notes Doc": {
            value:
              "https://docs.google.com/document/d/1HyGA0Y8g1y-5qD7yosf49thbNJ7JNwWfmQfNeh-f4fw/edit?usp=share_link",
          },
        },
      },
      "Topic:Topic 8": {
        settings: {
          "Source Collab Notes Doc": {
            value:
              "https://docs.google.com/document/d/1LAl9W8OUmMTVSzRayc-0Q9Am0YZP9BZm9IW2rh8N6Pw/edit?usp=share_link",
          },
        },
      },
    },

    ...BEFORE_WEEK,
    "Email Type:Before Week": {
      settings: {
        "Source Reference Doc": {
          value:
            "https://docs.google.com/document/d/1AADtzEALemQO0GF3__aAdCPSecjvtM6w/edit",
        },
      },
      "Next Week:Week 2": {
        settings: {
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/16Qm909uACdtFuExBaIjbVPhxP8Zq2feJ/edit",
          },
        },
      },
      "Is First Session Of Program": {
        "Week:Week 1": {
          settings: {
            "Source Reference Doc": {
              value:
                "https://docs.google.com/document/d/1BeZMQwov2xBNC-qyIxrZJjOlnyxiUWDH/edit",
            },
          },
        },
      },
    },

    ...CERTIFICATE,
    "Email Type:Certificate": {
      settings: {
        "Source Reference Doc": {
          value: `https://docs.google.com/document/d/1QqwlIK0xIWQD4Ms9Tp2UQLW-4Zc7-r2tKUkwofrPGrc/edit`,
        },
      },
    },

    ...VESSEL,
    "Email Type:VESSEL": {
      settings: {
        "Segment ID": {
          value: "1479",
        },
      },
    },

    ...CONTENT,
    "Email Type:CONTENT": {
      settings: {
        "Segment ID": {
          value: "1666",
        },
      },
    },

    ...MESSAGE,

    ...RECEIPT,
    ...CONFIRMATION,

    // ** SETTINGS **
    "Cohort:Cohort 7": {
      settings: {
        "Automation ID": { value: "263", hide },
      },
    },
    "Cohort:Cohort 8": {
      settings: {
        "Automation ID": { value: "276", hide },
      },
    },
    "Cohort:Cohort 9": {
      settings: {
        "Automation ID": { value: "277", hide },
      },
    },
    "Cohort:Cohort 10": {
      settings: {
        "Automation ID": { value: "303", hide },
      },
    },
    "Cohort:Cohort 11": {
      settings: {
        "Automation ID": { value: "339", hide },
      },
    },
    "Cohort:Cohort 12": {
      settings: {
        "Automation ID": { value: "375", hide },
      },
    },
  },
};
