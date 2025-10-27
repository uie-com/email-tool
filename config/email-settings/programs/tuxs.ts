import { Settings } from "@/domain/schema";
import { ValuePart } from "@/domain/values/valueCollection";

const hide = true;

export const TUXS: Settings<ValuePart<any>> = {
  "Program:TUXS": {
    settings: {
      // PROGRAM

      // TEMPLATE
      Template: { value: "/tuxs", part: 1 },

      // INTERNAL
      "Email Name": { value: "{Email Type}", part: 1 },

      // SENDING
      "Send Type": { value: "CAMPAIGN", hide },
      "List ID": { value: "{LoA ID}", hide },

      // AIRTABLE
      "Calendar Table ID": { value: "tbl6T80hI7yrFsJWz", hide },
      "Session Title": {
        value: "{Airtable Session Query}&fields[]=Title",
        fetch: "airtable",
      },
      Description: {
        value: "{Airtable Session Query}&fields[]=Description",
        fetch: "airtable",
      },
      "Session Type": {
        value: "{Airtable Session Query}&fields[]=Topic Type",
        fetch: "airtable",
      },

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

      // STYLES
      "Global Styles": {
        value: " ul [ margin-bottom: 1.5rem !important; ] ",
        part: 1,
      },

      // FOOTER
      "Footer Email Reason": {
        value: `You're receiving this email because you're a member of Leaders of Awesomeness.`,
      },
      "Footer Contact": {
        value: `If you have questions about the community, contact us at <a href="mailto:hello@centercentre.com" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.`,
      },
      "Footer Tag": { value: `LOA` },
    },

    // ** TUXS EMAILS **

    "Session Type:Job Search Topic": {
      settings: {
        "Segment ID": {
          value: "1659",
        },
      },
    },
    "Session Type:Metrics Topic": {
      settings: {
        "Segment ID": {
          value: "1529",
        },
      },
    },
    "Session Type:Research Topic": {
      settings: {
        "Segment ID": {
          value: "1478",
        },
      },
    },
    "Session Type:Win Topic": {
      settings: {
        "Segment ID": {
          value: "1544",
        },
      },
    },
    "Session Type:Vision Topic": {
      settings: {
        "Segment ID": {
          value: "1481",
        },
      },
    },
    "Session Type:AI Topic": {
      settings: {
        settings: {
          "Segment ID": {
            value: "1508",
          },
        },
      },

      "Email Type:Today": {
        settings: {
          Template: { value: "/today.html", part: 2 },
          Subject: { value: "Today: {Session Title}" },
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/1DEU65xOzfjHrHfB8TCotSoeDN4ERclAcqYynn0yUpWw/edit",
          },
          "Stripo Link": {
            value: "https://my.stripo.email/editor/v5/727662/email/9491072",
            hide,
          },

          Preview: {
            value: "{Airtable Session Query}&fields[]=Preview",
            fetch: "airtable",
            part: 0,
          },
        },
        // Banner Settings
        "Session Type:Job Search Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/95fddc5d-1565-4ace-8067-ce00e6f3e236.png?id=39120976",
            },
          },
        },
        "Session Type:Metrics Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/7bab398d-0da2-4fa8-8db2-e3722476bbb5.png?id=39120977",
            },
          },
        },
        "Session Type:Research Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/799c6af9-72d1-4c02-9b3e-48c6a05462d2.png?id=39120975",
            },
          },
        },
        "Session Type:Win Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/661e13f2-952e-4f64-ae67-7455592fc53d.png?id=39120979",
            },
          },
        },
        "Session Type:Vision Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/ef883949-c485-4551-bcac-7e63d185b3a0.png?id=39120978",
            },
          },
        },
        "Session Type:AI Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/07/02/67ff76ea-642b-4721-aff9-aacc587b25e8.png?id=40219538",
            },
          },
        },
      },

      "Email Type:Recording": {
        settings: {
          Template: { value: "/recording.html", part: 2 },
          Subject: { value: "Recording: {Session Title}" },
          Questions: { value: "**Questions From the Session:**" },
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/1V7suWAFtLFw4OKAAP8dcOE0hRRNdFBtGqxJg1nl-IGY/edit",
          },
          "Stripo Link": {
            value: "https://my.stripo.email/editor/v5/727662/email/9491094",
            hide,
          },

          Preview: {
            value: "{Airtable Session Query}&fields[]=Preview",
            fetch: "airtable",
            part: 0,
          },
        },
        // Banner Settings
        "Session Type:Job Search Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/43e4647c-9c6d-44ed-974a-9afaa9cf867c.png?id=39120942",
            },
          },
        },
        "Session Type:Metrics Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/0c8125fe-ab98-4700-a44c-93d259f42026.png?id=39120940",
            },
          },
        },
        "Session Type:Research Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/66bdae7d-f06e-4efe-8166-9a75ca75870a.png?id=39120943",
            },
          },
        },
        "Session Type:Win Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/1936e392-5619-4048-b663-1e3a691df378.png?id=39120939",
            },
          },
        },
        "Session Type:Vision Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/46e37013-49b9-4334-a5c7-67965201938d.png?id=39120941",
            },
          },
        },
        "Session Type:AI Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/07/02/51156b8b-bb19-4889-a941-87d93b2be818.png?id=40219554",
            },
          },
        },
      },

      "Email Type:New Topic": {
        settings: {
          Template: { value: "/new-topic.html", part: 2 },
          Subject: { value: "This Monday: {Session Title}" },
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/1AyFiVg5h6LxHYHYQ_NBdAiCAKPGVCDh2g95bh-dwAgk/edit",
          },
          "Stripo Link": {
            value: "https://my.stripo.email/editor/v5/727662/email/9490112",
            hide,
          },

          Preview: {
            value: "{Airtable Session Query}&fields[]=Preview",
            fetch: "airtable",
            part: 0,
          },
        },
        // Banner Settings
        "Session Type:Job Search Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/bbcd6fc6-290a-4e6b-a8e7-ecf802100916.png?id=39120554",
            },
          },
        },
        "Session Type:Metrics Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/33d64055-b14d-48df-8765-970f1cd15b23.png?id=39120556",
            },
          },
        },
        "Session Type:Research Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/9557c441-0626-45d4-95bf-15d762f9b12c.png?id=39120557",
            },
          },
        },
        "Session Type:Win Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/44ab5264-62d7-47cb-bf51-6b1634ff07f6.png?id=39120553",
            },
          },
        },
        "Session Type:Vision Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/05/02/9c31bc20-2032-4d9e-9d7f-ebb6969c9f54.png?id=39120555",
            },
          },
        },
        "Session Type:AI Topic": {
          settings: {
            Banner: {
              value:
                "https://content.app-us1.com/O8aW3/2025/07/02/c736a2f2-be3c-450f-8abd-e683b3c4049e.png?id=40219568",
            },
          },
        },
      },

      "Email Type:Upcoming Topics": {
        settings: {
          Template: { value: "/upcoming-topics.html", part: 2 },
          Banner: {
            value:
              "https://content.app-us1.com/O8aW3/2025/05/02/667ec838-028d-4112-8be2-fe1effc217f9.png?id=39120670",
          },
          "Segment ID": {
            value: "1875",
          },
          Subject: {
            value:
              "Upcoming: {Upcoming Session #1 Title}, {Upcoming Session #2 Title}, {Upcoming Session #3 Title}",
          },
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/1NLFu-FcTj4MFt5fHP-TDROtWwvziAH9zOueZ54GqgIo/edit",
          },
          "Stripo Link": {
            value: "https://my.stripo.email/editor/v5/727662/email/9623518",
            hide,
          },

          Preview: {
            value:
              "Every week, join me for a free, live discussion about UX Strategy.",
          },

          "Session Entries": {
            value: `<table cellpadding="0" cellspacing="0" width="100%" bgcolor="#0C6D77" style="background-color: #0c6d77; border-radius: 10px; border-collapse: separate">
            <tbody>
            {Session Entry (Iterate x{Number of Upcoming Sessions})}
            </tbody>
            </table>`,
            hide,
          },

          "Session Entry": {
            value: `<tr>
                <td align="left" esd-tmp-menu-font-family="&#39;open sans&#39;,&#39;helvetica neue&#39;,helvetica,arial,sans-serif" esd-tmp-divider="0|solid|#000000" esd-tmp-menu-color="#ffffff" esd-tmp-menu-padding="0|10" esd-tmp-menu-font-size="16px" esd-tmp-menu-font-weight="bold" class="esd-block-menu">
                  <table cellspacing="0" width="100%" cellpadding="0">
                    <tbody>
                      <tr>
                        <td valign="left" id="esd-menu-id-0" class="esd-block-menu-item" style="text-align:center;width:28%;min-width:125px;max-width:130px">
                          <span class="es-button-border" style="border-width:0px;background:#9b0e5b;border-radius:5px">
                            <a target="_blank" href="[Upcoming Session #1 Event Link]" class="es-button es-button-1724857678642" style="font-weight:bold;padding:10px 20px;font-size:24px;border-radius:5px;white-space:nowrap;background:#0196a7;font-family:&quot;open sans&quot;, &quot;helvetica neue&quot;, helvetica, arial, sans-serif;color:#ffffff !important;text-decoration:none">
                              RSVP
                            </a>
                          </span>
                        </td>
                        <!-- Left Column -->
                        <td align="left" valign="top" id="esd-menu-id-1" class="esd-block-menu-item" style="padding:20px 20px 20px 0px;width:100%;max-width:300px">
                          <a target="_blank" href="[Upcoming Session #1 Event Link]" style="line-height:28px;text-decoration:none;color:#ffffff;font-size:17px;font-family:&quot;open sans&quot;, &quot;helvetica neue&quot;, helvetica, arial, sans-serif;display:inline-block">
                            [Upcoming Session #1 Date (dddd, MMMM D)] at Noon [Upcoming Session #1 Date (z)] ([Upcoming Session #1 Date (GMT)(HH.mm z)])
                            <br>
                            <strong>
                              [Upcoming Session #1 Title].
                            </strong>
                          </a>
                        </td>
                        <!-- Right Column -->
                      </tr>
                    </tbody>
                  </table>
                </td>
            </tr>`,
            hide,
          },
        },
      },

      "Email Type:Onboarding Topics": {
        settings: {
          Template: { value: "/upcoming-topics.html", part: 2 },
          Banner: {
            value:
              "https://content.app-us1.com/O8aW3/2025/05/02/667ec838-028d-4112-8be2-fe1effc217f9.png?id=39120670",
          },
          Subject: { value: "FREE Talk UX Strategy sessions for you to join." },
          "Source Reference Doc": {
            value:
              "https://docs.google.com/document/d/1NLFu-FcTj4MFt5fHP-TDROtWwvziAH9zOueZ54GqgIo/edit",
          },
          "Stripo Link": {
            value: "https://my.stripo.email/editor/v5/727662/email/9496120",
            hide,
          },

          Preview: {
            value:
              "Every week, join me for a free, live discussion about UX Strategy.",
          },

          "Send Type": { value: "AUTOMATION", hide },

          "Is Excluded From QA Review": {
            value: "Is Excluded From QA Review",
            hide,
          },
          "Is Excluded From QA Checklist": {
            value: "Is Excluded From QA Checklist",
            hide,
          },

          "Is Ongoing Automation": { value: "Is Ongoing Automation", hide },

          "Session Entries": {
            value: `<table cellpadding="0" cellspacing="0" width="100%" bgcolor="#0C6D77" style="background-color: #0c6d77; border-radius: 10px; border-collapse: separate">
            <tbody>
            {Session Entry (Iterate x{Number of Upcoming Sessions})}
            </tbody>
            </table>`,
            hide,
          },

          "Session Entry": {
            value: `<tr>
                <td align="left" esd-tmp-menu-font-family="&#39;open sans&#39;,&#39;helvetica neue&#39;,helvetica,arial,sans-serif" esd-tmp-divider="0|solid|#000000" esd-tmp-menu-color="#ffffff" esd-tmp-menu-padding="0|10" esd-tmp-menu-font-size="16px" esd-tmp-menu-font-weight="bold" class="esd-block-menu">
                  <table cellspacing="0" width="100%" cellpadding="0">
                    <tbody>
                      <tr>
                        <td valign="left" id="esd-menu-id-0" class="esd-block-menu-item" style="text-align:center;min-width:130px;max-width:130px">
                          <span class="es-button-border" style="border-width:0px;background:#9b0e5b;border-radius:5px">
                            <a target="_blank" href="[Upcoming Session #1 Event Link]" class="es-button es-button-1724857678642" style="font-weight:bold;padding:10px 20px;font-size:24px;border-radius:5px;white-space:nowrap;background:#0196a7;font-family:&quot;open sans&quot;, &quot;helvetica neue&quot;, helvetica, arial, sans-serif;color:#ffffff !important;text-decoration:none">
                              RSVP
                            </a>
                          </span>
                        </td>
                        <!-- Left Column -->
                        <td align="left" valign="top" id="esd-menu-id-1" class="esd-block-menu-item" style="padding:20px 20px 20px 0px;min-width:300px;max-width:300px">
                          <a target="_blank" href="[Upcoming Session #1 Event Link]" style="line-height:28px;text-decoration:none;color:#ffffff;font-size:17px;font-family:&quot;open sans&quot;, &quot;helvetica neue&quot;, helvetica, arial, sans-serif;display:inline-block">
                            [Upcoming Session #1 Date (dddd, MMMM D)] at Noon [Upcoming Session #1 Date (z)] ([Upcoming Session #1 Date (GMT)(HH.mm z)])
                            <br>
                            <strong>
                              [Upcoming Session #1 Title].
                            </strong>
                          </a>
                        </td>
                        <!-- Right Column -->
                      </tr>
                    </tbody>
                  </table>
                </td>
            </tr>`,
            hide,
          },
        },
      },

      // ** TUXS SETTINGS **

      // Topic settings
      "Session Type: Job Search Topic": {
        settings: {
          "Primary Color": { value: "#00a1b3" },
          "Accent Color": { value: "#eb621d" },
          "Banner Topic": { value: "UX Job Search" },
        },
      },
      "Session Type: Metrics Topic": {
        settings: {
          "Primary Color": { value: "#9b0e5b" },
          "Accent Color": { value: "#00a1b3" },
          "Banner Topic": { value: "UX Metrics" },
        },
      },
      "Session Type: Research Topic": {
        settings: {
          "Primary Color": { value: "#662547" },
          "Accent Color": { value: "#00a1b3" },
          "Banner Topic": { value: "UX Research" },
        },
      },
      "Session Type: Win Topic": {
        settings: {
          "Primary Color": { value: "#00a1b3" },
          "Accent Color": { value: "#8c9b29" },
          "Banner Topic": { value: "UX Influence" },
        },
      },
      "Session Type: Vision Topic": {
        settings: {
          "Primary Color": { value: "#00a1b3" },
          "Accent Color": { value: "#9b0e5b" },
          "Banner Topic": { value: "UX Vision" },
        },
      },
      "Session Type: AI Topic": {
        settings: {
          "Primary Color": { value: "#00a1b3" },
          "Accent Color": { value: "#bc2123" },
          "Banner Topic": { value: "UX AI" },
        },
      },

      // DST Banner overrides
      "Is DST": {
        settings: {},
      },
    },
  },
};
