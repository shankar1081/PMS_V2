const generateEmailTemplate = (type, params) => {
    let html;
    switch (type) {
      case "projectSave":
        html =
          "<html><style>body{padding:0;margin:0}" +
          'html{-webkit-text-size-adjust:none;-ms-text-size-adjust:none}@media only screen and(max-device-width:680px),only screen and(max-width:680px){*[class="table_width_100"]{width:96%!important}*[class="border-right_mob"]{border-right:1px solid #dddddd}*[class="mob_100"]{width:100%!important}*[class="mob_center"]{text-align:center!important}*[class="mob_center_bl"]{float:none!important;display:block!important;margin:0px auto}.iage_footer a{text-decoration:none;color:#929ca8}img.mob_display_none{width:0px!important;height:0px!important;display:none!important}img.mob_width_50{width:40%!important;height:auto!important}}.table_width_100{width:680px}</style><div id="mailsub" class="notification" align="center"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width: 320px;"><tr><td align="center" bgcolor="#eff3f8"><table width="680" border="0" cellspacing="0" cellpadding="0"><tr><td><table border="0" cellspacing="0" cellpadding="0" class="table_width_100" width="100%"' +
          'style="max-width: 680px; min-width: 300px;"><tr><td></td></tr><tr><td align="center" bgcolor="#ffffff"><table width="90%" border="0" cellspacing="0" cellpadding="0"><div style="height: 30px; line-height: 30px; font-size: 10px;"></div><tr><td><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr><tr style="background:black; padding:20px"><td style=" padding:20px;"><img src="http://knowledgew.com/klogo.png"' +
          'width="200" alt="KWILS"/></td><td><font face="Arial, Helvetica, sans-seri; font-size: 13px;"' +
          'size="3" color="white">NOTIFICATION - Project Logged In</font></td></tr></table></td></tr><tr><td align="center" bgcolor="#fbfcfd"><table width="90%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center"><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr><tr><td><div style="line-height: 24px;"><font face="Arial, Helvetica, sans-serif" size="4" color="#57697e"' +
          'style="font-size: 15px;"><span style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #57697e;"><p>Hi&nbsp;<b></b>,</p><p>Greetings from&nbsp;<b>Knowledgeworks!!!</b></p><p>You are receiving this auto-generated email from KWILS regarding new Project Created:</p>' +
          "<p><b>Project Name&nbsp;</b>" +
          params.projectName +
          "<br><b>Source Language&nbsp;:&nbsp;</b>" +
          params.sourceLanguage +
          "<br><b>Target Language&nbsp;:&nbsp;</b>" +
          params.targetLanguage +
          "<br><b>Created by&nbsp;:&nbsp;</b>" +
          params.userName +
          "<br>" +
          "<br><b>No of Files&nbsp;:&nbsp;</b>" +
          params.filesLength +
          "<br>";
        html =
          html +
          '</tbody></table><p><b>Regards,</b><br>Team KWILS</p></span></font></div><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr></table><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr><tr><td class="iage_footer" align="center" bgcolor="#ffffff"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px;flaot:left;width:100%; text-align:center;"><font face="Arial, Helvetica, sans-serif" size="3" color="#96a5b5" style="font-size: 13px;"><span style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #96a5b5;"> © VPKW. ALL Rights Reserved. </span></font></td></tr></table></td></tr></table></td></tr><tr><td></td></tr></table></td></tr></table></div></html>';
        break;

      case "finalSave":
        html =
          "<html><style>body{padding:0;margin:0}" +
          'html{-webkit-text-size-adjust:none;-ms-text-size-adjust:none}@media only screen and(max-device-width:680px),only screen and(max-width:680px){*[class="table_width_100"]{width:96%!important}*[class="border-right_mob"]{border-right:1px solid #dddddd}*[class="mob_100"]{width:100%!important}*[class="mob_center"]{text-align:center!important}*[class="mob_center_bl"]{float:none!important;display:block!important;margin:0px auto}.iage_footer a{text-decoration:none;color:#929ca8}img.mob_display_none{width:0px!important;height:0px!important;display:none!important}img.mob_width_50{width:40%!important;height:auto!important}}.table_width_100{width:680px}</style><div id="mailsub" class="notification" align="center"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width: 320px;"><tr><td align="center" bgcolor="#eff3f8"><table width="680" border="0" cellspacing="0" cellpadding="0"><tr><td><table border="0" cellspacing="0" cellpadding="0" class="table_width_100" width="100%"' +
          'style="max-width: 680px; min-width: 300px;"><tr><td></td></tr><tr><td align="center" bgcolor="#ffffff"><table width="90%" border="0" cellspacing="0" cellpadding="0"><div style="height: 30px; line-height: 30px; font-size: 10px;"></div><tr><td><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr><tr style="background:black; padding:20px"><td style=" padding:20px;"><img src="http://knowledgew.com/klogo.png"' +
          'width="200" alt="VPKW"/></td><td><font face="Arial, Helvetica, sans-seri; font-size: 13px;"' +
          'size="3" color="white">NOTIFICATION - Project Completed</font></td></tr></table></td></tr><tr><td align="center" bgcolor="#fbfcfd"><table width="90%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center"><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr><tr><td><div style="line-height: 24px;"><font face="Arial, Helvetica, sans-serif" size="4" color="#57697e"' +
          'style="font-size: 15px;"><span style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #57697e;"><p>Hi&nbsp;<b></b>,</p><p>Greetings from&nbsp;<b>Knowledgeworks!!!</b></p><p>You are receiving this auto-generated email from KWILS regarding Project Completion:</p>' +
          "<p><b>Project Name&nbsp;</b>" +
          params.prname +
          "<br>";
        html =
          html +
          '</tbody></table><p><b>Regards,</b><br>Team KWILS</p></span></font></div><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr></table><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr><tr><td class="iage_footer" align="center" bgcolor="#ffffff"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px;flaot:left;width:100%; text-align:center;"><font face="Arial, Helvetica, sans-serif" size="3" color="#96a5b5" style="font-size: 13px;"><span style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #96a5b5;"> � VPKW. ALL Rights Reserved. </span></font></td></tr></table></td></tr></table></td></tr><tr><td></td></tr></table></td></tr></table></div></html>';
        break;

      case "saveVendor":
        html =
          "<html><style>body{padding:0;margin:0}" +
          'html{-webkit-text-size-adjust:none;-ms-text-size-adjust:none}@media only screen and(max-device-width:680px),only screen and(max-width:680px){*[class="table_width_100"]{width:96%!important}*[class="border-right_mob"]{border-right:1px solid #dddddd}*[class="mob_100"]{width:100%!important}*[class="mob_center"]{text-align:center!important}*[class="mob_center_bl"]{float:none!important;display:block!important;margin:0px auto}.iage_footer a{text-decoration:none;color:#929ca8}img.mob_display_none{width:0px!important;height:0px!important;display:none!important}img.mob_width_50{width:40%!important;height:auto!important}}.table_width_100{width:680px}</style><div id="mailsub" class="notification" align="center"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width: 320px;"><tr><td align="center" bgcolor="#eff3f8"><table width="680" border="0" cellspacing="0" cellpadding="0"><tr><td><table border="0" cellspacing="0" cellpadding="0" class="table_width_100" width="100%"' +
          'style="max-width: 680px; min-width: 300px;"><tr><td></td></tr><tr><td align="center" bgcolor="#ffffff"><table width="90%" border="0" cellspacing="0" cellpadding="0"><div style="height: 30px; line-height: 30px; font-size: 10px;"></div><tr><td><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr><tr style="background:black; padding:20px"><td style=" padding:20px;"><img src="http://knowledgew.com/klogo.png"' +
          'width="200" alt="KWILS"/></td><td><font face="Arial, Helvetica, sans-seri; font-size: 13px;"' +
          'size="3" color="white">NOTIFICATION - Assignment of File</font></td></tr></table></td></tr><tr><td align="center" bgcolor="#fbfcfd"><table width="90%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center"><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr><tr><td><div style="line-height: 24px;"><font face="Arial, Helvetica, sans-serif" size="4" color="#57697e"' +
          'style="font-size: 15px;"><span style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #57697e;"><p>Hi&nbsp;<b></b>,</p><p>Greetings from&nbsp;<b>Knowledgeworks!!!</b></p><p>You are receiving this auto-generated email from KWILS regarding assignment of Task:</p>' +
          "<p><b>File Id&nbsp;</b>" +
          params.fileId +
          "<br><b>Service Type&nbsp;</b>" +
          params.serviceType +
          "<br><b>Created by&nbsp;:&nbsp;</b>" +
          params.name +
          "<br>";

        html =
          html +
          '</tbody></table><p><b>Regards,</b><br>Team KWILS</p></span></font></div><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr></table><div style="height: 40px; line-height: 40px; font-size: 10px;"></div></td></tr><tr><td class="iage_footer" align="center" bgcolor="#ffffff"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px;flaot:left;width:100%; text-align:center;"><font face="Arial, Helvetica, sans-serif" size="3" color="#96a5b5" style="font-size: 13px;"><span style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #96a5b5;"> ? VPKW. ALL Rights Reserved. </span></font></td></tr></table></td></tr></table></td></tr><tr><td></td></tr></table></td></tr></table></div></html>';

        break;
    }

    return html;
}

module.exports = {
    generateEmailTemplate
}