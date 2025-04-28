"use server";
import { Email } from "../schema";

const DEBUG = true;
export async function createTemplate(email: Email): Promise<any> {
    if (!email.values) return 'No email found.';
    if (!email.values.resolveValue("Subject")) {
        console.error("Subject is required and wasn't found.", email);
        return 'Subject is required and wasn\'t found.';
    }
    if (!email.HTML) {
        console.error("HTML is required and wasn't found.", email);
        return 'HTML is required and wasn\'t found.';
    }
    const emailName = email.values.resolveValue("Email Name");
    const emailHtml = email.HTML;

    if (DEBUG) console.log("Creating template " + emailName, emailHtml);
    const res = await postTemplate(emailName, emailHtml);
    console.log("Created template " + emailName, res);

    return res;
}

export async function createCampaign(email: Email, token: string): Promise<any> {
    if (!email.values) return 'No email found.';

    const name = email.values.resolveValue("Email Name");
    email.HTML = testTemplateHTML;

    const postCampaignResponse = await postCampaign({
        name: name,
    }); // Create an empty campaign object
    console.log("Created empty campaign", postCampaignResponse);
    const campaignID = postCampaignResponse['id'];

    const messageResponse = await postCampaignMessage(campaignID, {
        subject: 'Test Subject',
        // html: email.HTML ?? '',
        // text: 'Test plaintext alt',
        fromEmail: 'jared.m.spool@centercentre.com',
        replyToEmail: 'jared.m.spool@centercentre.com',
        preHeader: 'Test preheader text',
        fromName: 'Jared Spool',
        editorVersion: 3,
    }, token);
    console.log("Created campaign message", messageResponse);

    const upgradedMessageResponse = await putMessage(messageResponse['id'], { editorVersion: "3", }, token);
    const messageID = upgradedMessageResponse['id'];
    console.log("Upgraded message", upgradedMessageResponse);

    const templateResponse = await createTemplate(email);
    const templateID = templateResponse['template']['id'];
    console.log("Created template", templateResponse, templateID);


    const res = await populateCampaignMessageWithTemplate(campaignID + '', messageID + '', templateID, token);
    console.log("Populated campaign message", res);


    const usedTemplate = await getTemplate(templateID);
    const finalMessage = await getMessage(messageID);
    const finalCampaign = await getCampaign(campaignID);

    console.log("Final result: ", { usedTemplate, finalMessage, finalCampaign });

    return { usedTemplate, finalMessage, finalCampaign };

}

export async function testActiveCampaignToken(token: string): Promise<any> {
    return await get("https://campaigns-backend.cluster.app-us1.com/campaigns", undefined, token);
}

// Campaign calls
export async function postCampaign(payload: any): Promise<any> {
    return await post("https://centercentre.api-us1.com/api/3/campaign", {
        ...payload,
        type: "single",
    });
}


export async function putCampaign(id: string, payload: any): Promise<any> {
    return await put("https://centercentre.api-us1.com/api/3/campaigns/" + id + "/edit", payload);
}

export async function putCampaignInternal(id: string, payload: any, token: string): Promise<any> {
    return await put("https://campaigns-backend.cluster.app-us1.com/campaigns/" + id + "/edit", payload, undefined, token);
}

export async function getCampaign(id: string): Promise<any> {
    return await get("https://centercentre.api-us1.com/api/3/campaigns/" + id);
}

export async function delCampaign(id: string, token: string): Promise<any> {
    return await del("https://campaigns-backend.cluster.app-us1.com/campaigns/" + id + '/delete', undefined, token);
}

export async function testCampaign(payload: { campaignId: number, messageId: number, toEmail: string, subject: string }): Promise<any> {
    return await post("https://centercentre.activehosted.com/api/3/campaigns/test-send", payload);
}

// Template calls
export async function postTemplate(name: string, html: string): Promise<any> {
    return await post("https://centercentre.api-us1.com/api/3/templates", { 'template': { name: name, "ed_version": "3", "content": `{"html":"${JSON.stringify(html).slice(1, -1)}"}`, } });
}

export async function postHTMLTemplate(name: string, html: string): Promise<any> {
    return await post("https://centercentre.api-us1.com/api/3/templates", { 'template': { name: name, "content": html } });
}

export async function putTemplate(id: string, payload: any): Promise<any> {
    return await put("https://centercentre.api-us1.com/api/3/templates/" + id, payload);
}

export async function delTemplate(id: string): Promise<any> {
    return await del("https://centercentre.api-us1.com/api/3/templates/" + id);
}

export async function getTemplate(id: string): Promise<any> {
    return await get("https://centercentre.api-us1.com/api/3/templates/" + id);
}

export async function getTemplates(): Promise<any> {
    return await get("https://centercentre.api-us1.com/api/3/templates");
}

export async function postMessage(payload: { subject: string, html: string, text: string, email: string, reply2: string, preheader_text: string, fromname: string, ed_version: string }): Promise<any> {
    return await post("https://centercentre.api-us1.com/api/3/messages", {
        'message': payload
    });
}

export async function postCampaignMessage(campaignID: string, payload: { subject: string, fromEmail: string, replyToEmail: string, preHeader: string, fromName: string, editorVersion: number, html?: string, text?: string }, token: string): Promise<any> {
    return await post("https://campaigns-backend.cluster.app-us1.com/campaigns/" + campaignID + "/messages", payload, undefined, token);
}

export async function populateCampaignMessageWithTemplate(campaignID: string, messageID: string, templateID: string, token: string): Promise<any> {
    // console.log('url: ', "https://campaigns-backend.cluster.app-us1.com/campaigns/" + campaignID + "/messages/" + messageID + "/populate");
    return await put("https://campaigns-backend.cluster.app-us1.com/campaigns/" + campaignID + "/messages/" + messageID + "/populate", { "baseTemplateId": templateID }, undefined, token);
}

export async function putMessage(messageID: string, payload: any, token: string): Promise<any> {
    return await put("https://campaigns-backend.cluster.app-us1.com/messages/" + messageID, payload, undefined, token);
}

export async function getMessage(id: string): Promise<any> {
    return await get("https://centercentre.api-us1.com/api/3/messages/" + id);
}

export async function getMessages(): Promise<any> {
    return await get("https://centercentre.api-us1.com/api/3/messages");
}

export async function get(url: string, params?: URLSearchParams, token?: string) {
    if (!process.env.ACTIVECAMPAIGN_API_KEY) console.error("No API key found.");
    console.log('headers', {
        "content-type": "application/json",
        "accept": "application/json",
        "Api-Token": url.includes('centercentre') ? process.env.ACTIVECAMPAIGN_API_KEY ?? "" : '',
        "Authorization": url.includes('centercentre') ? '' : 'Bearer ' + token,
    });

    const res = await fetch(url + (params ?? ''), {
        method: "GET",
        headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "Api-Token": url.includes('centercentre') ? process.env.ACTIVECAMPAIGN_API_KEY ?? "" : '',
            "Authorization": url.includes('centercentre') ? '' : 'Bearer ' + token,
        },
    });
    if (!res.ok) {
        console.error("Error:", res);
        console.error("Response:", await res.text());
    }
    return await res.json();
}

export async function post(url: string, payload: any, params?: URLSearchParams, token?: string) {
    if (!process.env.ACTIVECAMPAIGN_API_KEY) console.error("No API key found.");
    const res = await fetch(url + (params ?? ''), {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "Api-Token": url.includes('centercentre') ? process.env.ACTIVECAMPAIGN_API_KEY ?? "" : '',
            "Authorization": url.includes('centercentre') ? '' : 'Bearer ' + token,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        console.error("Error:", res);
        console.error("Response:", await res.text());
    }
    try {
        return JSON.parse(JSON.stringify(await res.json()));
    } catch (e) {
        // console.log("Error parsing response:", e, res);
        console.error("Couldn't parse response:", res);
        return JSON.parse(JSON.stringify(res));
    }
}

export async function put(url: string, payload: any, params?: URLSearchParams, token?: string) {
    if (!process.env.ACTIVECAMPAIGN_API_KEY) console.error("No API key found.");

    console.log('headers', {
        "content-type": "application/json",
        "accept": "application/json",
        "Api-Token": url.includes('centercentre') ? process.env.ACTIVECAMPAIGN_API_KEY ?? "" : '',
        "Authorization": url.includes('centercentre') ? '' : 'Bearer ' + token,
    });
    const res = await fetch(url + (params ?? ''), {
        method: "PUT",
        headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "Api-Token": url.includes('centercentre') ? process.env.ACTIVECAMPAIGN_API_KEY ?? "" : '',
            "Authorization": url.includes('centercentre') ? '' : 'Bearer ' + token,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        console.error("Error:", res);
        console.error("Response:", await res.text());
    }
    try {
        return JSON.parse(JSON.stringify(await res.json()));
    } catch (e) {
        // console.log("Error parsing response:", e, res);
        console.error("Couldn't parse response:", res);
        return JSON.parse(JSON.stringify(res));
    }
}

export async function del(url: string, params?: URLSearchParams, token?: string) {
    if (!process.env.ACTIVECAMPAIGN_API_KEY) console.error("No API key found.");

    console.log('headers', {
        "content-type": "application/json",
        "accept": "application/json",
        "Api-Token": url.includes('centercentre') ? process.env.ACTIVECAMPAIGN_API_KEY ?? "" : '',
        "Authorization": url.includes('centercentre') ? '' : 'Bearer ' + token,
    });
    const res = await fetch(url + (params ?? ''), {
        method: "DELETE",
        headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "Api-Token": url.includes('centercentre') ? process.env.ACTIVECAMPAIGN_API_KEY ?? "" : '',
            "Authorization": url.includes('centercentre') ? '' : 'Bearer ' + token,
        },
    });
    if (!res.ok) {
        console.error("Error:", res);
        console.error("Response:", await res.text());
    }
    try {
        return JSON.parse(JSON.stringify(await res.json()));
    } catch (e) {
        // console.log("Error parsing response:", e, res);
        console.log("Couldn't parse response:", res);
        return JSON.parse(JSON.stringify(res));
    }
}

const testTemplateHTML = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="format-detection" content="telephone=no">
    <title>Today: Finding Your Organization's Highest Value UX Work</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]--><!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail></w:DontUseAdvancedTypographyReadingMail>
    </w:WordDocument>
    </xml><![endif]--><!--[if !mso]><!-- -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:400,400i,700,700i"><!--<![endif]-->
    <style type="text/css">
        .rollover:hover .rollover-first {
            max-height: 0px !important;
            display: none !important;
        }

        .rollover:hover .rollover-second {
            max-height: none !important;
            display: block !important;
        }

        .rollover span {
            font-size: 0px;
        }

        u+.body img~div div {
            display: none;
        }

        #outlook a {
            padding: 0;
        }

        span.MsoHyperlink,
        span.MsoHyperlinkFollowed {
            color: inherit;
            mso-style-priority: 99;
        }

        a.p {
            mso-style-priority: 100 !important;
            text-decoration: none !important;
        }

        a[x-apple-data-detectors],
        #MessageViewBody a {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        .f {
            display: none;
            float: left;
            overflow: hidden;
            width: 0;
            max-height: 0;
            line-height: 0;
            mso-hide: all;
        }

        @media only screen and (max-width:600px) {
            *[class="gmail-fix"] {
                display: none !important
            }

            p,
            a {
                line-height: 150% !important
            }

            h1,
            h1 a {
                line-height: 120% !important
            }

            h2,
            h2 a {
                line-height: 120% !important
            }

            h3,
            h3 a {
                line-height: 120% !important
            }

            h4,
            h4 a {
                line-height: 120% !important
            }

            h5,
            h5 a {
                line-height: 120% !important
            }

            h6,
            h6 a {
                line-height: 120% !important
            }

            .bb p {}

            h1 {
                font-size: 30px !important;
                text-align: left
            }

            h2 {
                font-size: 24px !important;
                text-align: left
            }

            h3 {
                font-size: 20px !important;
                text-align: left
            }

            h4 {
                font-size: 24px !important;
                text-align: left
            }

            h5 {
                font-size: 20px !important;
                text-align: left
            }

            h6 {
                font-size: 16px !important;
                text-align: left
            }

            .d td a {
                font-size: 14px !important
            }

            .bc p,
            .bc a {
                font-size: 14px !important
            }

            .bb p,
            .bb a {
                font-size: 16px !important
            }

            .v .rollover:hover .rollover-second,
            .w .rollover:hover .rollover-second,
            .x .rollover:hover .rollover-second {
                display: inline !important
            }

            a.p,
            button.p {
                font-size: 18px !important;
                padding: 10px 20px 10px 20px !important;
                line-height: 120% !important
            }

            a.p,
            button.p,
            .t {
                display: inline-block !important
            }

            .o,
            .o .p,
            .q,
            .q td,
            .d {
                display: inline-block !important
            }

            .i table,
            .j table,
            .k table,
            .i,
            .k,
            .j {
                width: 100% !important;
                max-width: 600px !important
            }

            .adapt-img {
                width: 100% !important;
                height: auto !important
            }

            .d td {
                width: 1% !important
            }

            .h-auto {
                height: auto !important
            }

            .a .b,
            .a .b * {
                font-size: 28px !important;
                line-height: 150% !important
            }
        }

        @media screen and (max-width:384px) {
            .mail-message-content {
                width: 414px !important
            }
        }
    </style>
</head>

<body data-new-gr-c-s-loaded="14.1120.0" class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
    <span style="height:0;mso-hide:all;display:none !important;color:#ffffff;line-height:0;visibility:hidden;width:0;opacity:0;font-size:0px">How do you ensure your contributions are considered essential to your organization?</span>
    <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#f6f6f6"></v:fill>
			</v:background>
		<![endif]-->
        <table cellpadding="0" width="100%" cellspacing="0" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6">
            <tr>
                <td valign="top" style="padding:0;Margin:0">
                    <table cellpadding="0" align="center" cellspacing="0" class="j" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#ffffff" align="center" cellspacing="0" cellpadding="0" class="bc" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                                    <tr>
                                        <td align="left" style="padding:20px;Margin:0">
                                            <table cellspacing="0" width="100%" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                                                        <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td style="padding:0;Margin:0">
                                                                    <table cellspacing="0" width="100%" cellpadding="0" class="d" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                        <tr class="links"><!-- Left Column -->
                                                                            <td valign="top" width="50%" id="esd-menu-id-0" align="left" class="p p-1724857678642" style="padding:0;Margin:0;border:0">
                                                                                <div style="vertical-align:middle;display:block">
                                                                                    <a href="https://leaders.centercentre.com/spaces/9297673/feed" target="_blank" style="mso-line-height-rule:exactly;text-decoration:none;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;display:block;color:#0196a7;font-size:16px;font-weight:bold">Leaders of Awesomeness</a>
                                                                                </div>
                                                                            </td><!-- Right Column -->
                                                                            <td id="esd-menu-id-1" align="right" valign="top" width="50%" class="p p-1724857678642" style="padding:0;Margin:0;border:0">
                                                                                <div style="vertical-align:middle;display:block">
                                                                                    <a href="https://leaders.centercentre.com/spaces/9297673/events" target="_blank" style="mso-line-height-rule:exactly;text-decoration:none;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;display:block;color:#0196a7;font-size:16px;font-weight:bold">RSVP to Community Events &gt;</a>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left" style="padding:0;Margin:0">
                                            <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="center" valign="top" style="padding:0;Margin:0;width:600px">
                                                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="center" style="padding:0;Margin:0;font-size:0px"><img width="600" title="says Going Live UX Influence; Today at Noon EST (16.00 GMT)" src="https://zetcej.stripocdn.email/content/guids/CABINET_9ab2739c1650d5e106863c0a4a896d9db0f982d3b2afb8be61033974d58f51b6/images/wininfluence.png" alt="says Going Live UX Influence; Today at Noon EST (16.00 GMT)" class="adapt-img" style="display:block;font-size:12px;border:0;outline:none;text-decoration:none" height="200"></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellspacing="0" cellpadding="0" align="center" class="i" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="bb" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                                    <tr>
                                        <td align="left" style="Margin:0;padding-top:5px;padding-right:20px;padding-bottom:5px;padding-left:20px">
                                            <table width="100%" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                                                        <table width="100%" bgcolor="#0196A7" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:10px;background-color:#f5f5f5" role="presentation">
                                                            <tr>
                                                                <td align="left" class="a" style="Margin:0;padding-top:20px;padding-right:15px;padding-bottom:10px;padding-left:30px">
                                                                    <h2 class="b" style="Margin:0;font-family:'Open Sans', sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:28px;font-style:normal;font-weight:normal;line-height:42px;color:#333333"><b>{Session Title}</b></h2>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:0;Margin:0">
                                                                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                        <tr class="links"><!-- Left Column -->
                                                                            <td align="left" valign="top" id="esd-menu-id-0" style="padding:0px 7.5px 25px 30px;Margin:0"><a target="_blank" href="https://leaders.centercentre.com/events/finding-your-organizations-highest-value-ux-work" style="mso-line-height-rule:exactly;text-decoration:none;color:#333333;font-size:17.25px;line-height:28px;font-weight:bold;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;display:inline-block">Today, March 31st at noon ET (16.00 GMT) with Extended Q&amp;A until 1:15pm ET </a></td><!-- Right Column -->
                                                                            <td valign="middle" id="esd-menu-id-1" bgcolor="transparent" style="padding:0px 30px 25px 7.5px;Margin:0;text-align:center"><span class="t msohide" style="border-style:solid;border-color:#2CB543;background:#8c9b28;border-width:0px;display:inline-block;border-radius:5px;width:auto;mso-hide:all"><a href="https://leaders.centercentre.com/events/finding-your-organizations-highest-value-ux-work" target="_blank" class="p p-1724857678642" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#FFFFFF;font-size:24px;padding:10px 20px;display:inline-block;background:#8c9b28;border-radius:5px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;font-weight:bold;font-style:normal;line-height:28.8px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #31CB4B;white-space:nowrap">JOIN</a></span></td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left" style="Margin:0;padding-top:5px;padding-right:20px;padding-bottom:5px;padding-left:20px">
                                            <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                                                        <table width="100%" bgcolor="#F5F5F5" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:10px;background-color:#f5f5f5" role="presentation">
                                                            <tr>
                                                                <td align="left" style="padding:30px;Margin:0">
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px">Hello %FIRSTNAME%,</p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"><br></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px">UX work has evolved into hyper-focused, low-level details like the user interface. Unfortunately, this keeps us from working on what could be the highest value to the organization's executives and senior managers. Those folks are focused on increasing the organization's revenue, reducing costs, or growing the audience — all things that could be improved by delivering substantially better experiences.<br></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"><br></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px">If you aren't working on things stakeholders care about most, you risk becoming invisible to them, and invisible work has no visible value. This could make you a target for possible staffing reductions. The trick becomes to deliver so much value to your organization that people cannot fathom living without your UX work.</p>
                                                                    <ul style="font-family:arial, 'helvetica neue', helvetica, sans-serif;padding:0px 0px 0px 40px;margin-top:15px;margin-bottom:15px">
                                                                        <li style="color:#333333;margin:0px 0px 15px;font-size:16px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif">
                                                                            <p style="Margin:0;mso-line-height-rule:exactly;mso-margin-bottom-alt:15px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px;mso-margin-top-alt:15px">How do you identify your organization's highest-value UX work?</p>
                                                                        </li>
                                                                        <li style="color:#333333;margin:0px 0px 15px;font-size:16px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif">
                                                                            <p style="Margin:0;mso-line-height-rule:exactly;mso-margin-bottom-alt:15px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px">Which improved experiences will have the most significant effect on your stakeholders' highest priorities?</p>
                                                                        </li>
                                                                        <li style="color:#333333;margin:0px 0px 15px;font-size:16px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif">
                                                                            <p style="Margin:0;mso-line-height-rule:exactly;mso-margin-bottom-alt:15px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px">How do you ensure your contributions are considered essential to your organization?</p>
                                                                        </li>
                                                                    </ul>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px">Join me as I explore how successful UX leaders ensure their teams consistently deliver high-value contributions to their organizations. Discover how you'll elevate your impact so your stakeholders can't imagine working without you.</p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"><br></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"><b><a href="https://leaders.centercentre.com/events/finding-your-organizations-highest-value-ux-work" target="_blank" style="mso-line-height-rule:exactly;text-decoration:underline;color:#333333;font-size:16px">RSVP for this Talk UX Strategy session!</a></b></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"><br></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"><b>Jared M. Spool</b>,</p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px">Your <b><a href="https://leaders.centercentre.com/spaces/5729226/content" target="_blank" style="mso-line-height-rule:exactly;text-decoration:underline;color:#333333;font-size:16px">Talk UX Strategy</a></b>&nbsp;Host</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left" style="Margin:0;padding-top:5px;padding-right:20px;padding-left:20px;padding-bottom:20px">
                                            <table cellspacing="0" width="100%" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                                                        <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#0196A7" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#f5f5f5;border-radius:10px" role="presentation">
                                                            <tr>
                                                                <td style="padding:0;Margin:0">
                                                                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                        <tr class="links"><!-- Left Column -->
                                                                            <td id="esd-menu-id-0" align="left" valign="top" style="padding:20px 7.5px 10px 30px;Margin:0"><a href="https://leaders.centercentre.com/events/finding-your-organizations-highest-value-ux-work" target="_blank" style="mso-line-height-rule:exactly;text-decoration:none;color:#333333;font-size:17.25px;font-weight:bold;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;display:inline-block;line-height:28px">Today, March 31st at noon ET (16.00 GMT) with Extended Q&amp;A until 1:15pm ET </a></td><!-- Right Column -->
                                                                            <td id="esd-menu-id-1" valign="middle" style="padding:20px 30px 10px 7.5px;Margin:0;text-align:center"><span class="t msohide" style="border-style:solid;border-color:#2CB543;background:#8c9b28;border-width:0px;display:inline-block;border-radius:5px;width:auto;mso-hide:all"><a target="_blank" href="https://leaders.centercentre.com/events/finding-your-organizations-highest-value-ux-work" class="p p-1724857678642" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#FFFFFF;font-size:24px;padding:10px 20px;display:inline-block;background:#8c9b28;border-radius:5px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;font-weight:bold;font-style:normal;line-height:28.8px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #31CB4B;white-space:nowrap">RSVP</a></span></td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left" style="padding:0;Margin:0;padding-right:20px;padding-left:30px;padding-bottom:20px">
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:'Open Sans', sans-serif;line-height:27px;letter-spacing:0;color:#333333;font-size:18px"><b>Can’t make it? Still RSVP and we’ll email you a recording!</b></p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left" style="padding:20px;Margin:0">
                                            <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                                                        <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="left" style="padding:0;Margin:0">
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#666666;font-size:14px">© Copyright 2025, Center Centre,&nbsp;Inc.</p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#333333;font-size:14px"><br></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#666666;font-size:14px"><em>You're receiving this email because you're a member of Leaders of Awesomeness.</em></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#333333;font-size:14px"><br></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#666666;font-size:14px"><em><i>If you have questions, contact us at </i><a href="mailto:hello@centercentre.com" style="mso-line-height-rule:exactly;text-decoration:underline;color:#666666;font-size:14px"><i><u>hello@centercentre.com</u></i></a><i>.</i></em></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#333333;font-size:14px"><br></p>
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#666666;font-size:14px">LoA</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table align="center" cellpadding="0" cellspacing="0" class="i" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table align="center" cellpadding="0" cellspacing="0" bgcolor="#ffffff" class="bb" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                                    <tr>
                                        <td align="left" bgcolor="#f4f4f4" style="padding:0;Margin:0;padding-right:20px;padding-left:20px;padding-top:20px;background-color:#f4f4f4">
                                            <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                                                        <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="left" style="padding:0;Margin:0">
                                                                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#333333;font-size:14px"><br></p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>`;