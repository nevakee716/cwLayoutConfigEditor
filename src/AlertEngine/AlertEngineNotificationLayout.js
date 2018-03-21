var alertNotificationConfig = {
    "9999" : {
       avatarSrc : "http://www.pokepedia.fr/images/thumb/d/d6/Pok%C3%A9_ball_artwork.png/300px-Pok%C3%A9_ball_artwork.png",
       page : "cw_user2",
       tab: "tab0" 
    },
    default : {
       avatarSrc : "https://www.pokebip.com/fora/download/file.php?avatar=26125_1366205039.jpg",
       page : "cw_user2",
       tab: "tab0" 
    }
};

 /*jslint browser:true*/
 /*global cwAPI, jQuery, cwTabManager*/
 (function(cwApi, $) {
    'use strict';

    cwAPI.CwWorkflowNotificationManager.outputNotificationItem = function (id, output, title, date, sender, showDelete, read) {
        var avatarSrc;
        avatarSrc = cwApi.getEvolveNotificationImagePath();
        if (!cwApi.isNull(sender)) {
            avatarSrc = cwApi.cwUser.getUserPicturePathByUserName(sender.UserName);
        }
        output.push('<li>');
        if (!cwApi.isUndefined(read))
            if (!read) {
                output.push('<div class="notification-item unread">');
                output.push('<div class="badge">', $.i18n.prop('badge_new'), '</div>');
            } else {
                output.push('<div class="notification-item read">');
            } else {
            output.push('<div class="notification-item">');
        }
        output.push('<div class="avatar-wrap">');

        var config,splitTitle;
        if(title && title.indexOf("AlertEngine") !== -1){
            var splitTitle = title.split("#");
            if(alertNotificationConfig.hasOwnProperty(splitTitle[1])) {
                config = alertNotificationConfig[splitTitle[1]];
            } else {
                config = alertNotificationConfig.default;               
            }
            avatarSrc = config.avatarSrc;
        }
        
        output.push('<div class="avatar"><img src="', avatarSrc, '" alt="Avatar"></div>');
        output.push('</div>');
        output.push('<h4>');

        if(title && title.indexOf("AlertEngine") !== -1) {
            var profile = document.getElementById("tb-my-profile");
            var url = profile.hash.replace("cwview=user","cwview=" + config.page);
            if(config.tab) url += "&cwtabid=" + config.tab;
            output.push('<h4>');
            output.push('<a href="', url,'">',splitTitle[2],'</a>');
        } else {
            output.push('<a id="', cwAPI.CwWorkflowNotificationManager.getNotificationElementId(id), '" href="#">', title, '</a>');
        }

        output.push('</h4>');
        output.push('<span class="meta numericFont">', date, '</span>');

        if (showDelete) {
            output.push('<div class="actions">');
            output.push('<div id="', cwApi.CwDeleteNotification.getDeleteElementId(id), '" class="action single" title="', $.i18n.prop('notifications_deleteNotification'), '"><i class="fa ', cwApi.CwDeleteNotification.iconClass, '"></i></div>');
            output.push('</div>');
        }
        output.push('</div>');
        output.push('</li>');
    };

 }(cwAPI, jQuery));