/**
 * Created at 15/10/10.
 * @Author Ling.
 * @Email i@zeroling.com
 */
var dataSource = require('./dataSource');
var catalogs = [], pointer = 0;

var src = {
    main: "http://www.attop.com/wk/learn.htm?id=7"
};

var sonFrame = document.createElement('iframe');
sonFrame.className = "son-frame";
sonFrame.src = src.main;
$('.top').append(sonFrame);

var $sonFrame = $(sonFrame);
$sonFrame.load(function (e) {
    if ( !judgeIsLogin(sonFrame.contentDocument) ) {
        //alert('先登录');
        return;
    }
    //logged in
    console.log('已经登录');
    console.log(sonFrame.contentWindow.location.href);
    //if (sonFrame.contentWindow.location.href && sonFrame.contentWindow.location.href.indexOf('learn.htm') === -1) {
    //    return sonFrame.contentWindow.location.href = src.main;
    //}
    setInterval(function () {
        var allTime = parseInt($('[title="总学习时间"]', sonFrame.contentDocument).text()),
            duration = parseInt($('[title="已学时间"]', sonFrame.contentDocument).text()),
            timeDelta = allTime - duration;
        if (Number.isNaN(allTime) && Number.isNaN(duration)) {
            //$('#fuck').click();
            return
        }
        $('#timeLeft').text(timeDelta);
    }, 2e3);
    if (sonFrame.contentWindow.location.href && sonFrame.contentWindow.location.href.indexOf('learn.htm') > -1) {
        for (var iter = 0; iter < 5; iter++) {
            answerQuestions();
        }
    }
});

$('#answer').on('click', answerQuestions);
$('#goPage').click(function (){
    sonFrame.contentWindow.location.href = src.main;
});
$('#reload').on('click', function () {
    sonFrame.contentWindow.location.reload();
});
$('#timerFuck').on('click', function () {
    for(var i = 0; i < 20; i++)
        sonFrame.contentWindow.submitCommon({bid:7, jid:catalogs[pointer].jid}, "getWkOnlineNum", "doGetWkOnlineNum");
});

//func definitions in closure
function judgeIsLogin (doc) {
    return !!$('.unick', doc).text();
}

//提交答题
function submitAdapter(bid, jid, pid, msg) {
    //adapter 偏函数
    return sonFrame.contentWindow.submitDot({bid: bid, jid: jid, pid: pid, msg: msg}, "doSubmitWkXt", "doCommonReturn");
}
sonFrame.contentWindow.submitAdapter = submitAdapter;

var _doCommonReturn = sonFrame.contentWindow.doCommonReturn;
sonFrame.contentWindow.doCommonReturn = function () {
    console.log('doCommonReturn', arguments);
    return _doCommonReturn.apply(this, arguments);
};

//提交评价
function submitComment(id, type) {
    return sonFrame.contentWindow.submitDot({id: id, type: type}, "doWkMediaPj", "doWkMediaPj")
}
sonFrame.contentWindow.submitComment = submitComment;

function answerQuestions () {
    if (!$('.on', sonFrame.contentDocument).attr('id')) {
        return setTimeout(arguments.callee, 500);
    }
    var jid = $('.on', sonFrame.contentDocument).attr('id').replace('j_','');
    //handle
    var result = dataSource.filter(function (item) {
        return item.jid === jid;
    });
    if (result && result.length) {
        var i = 0, len = result.length;
        setTimeout(function _submit() {
            if (i < len) {
                submitAdapter(7, result[i].jid, result[i].pid, result[i].msg);
                i++;
                setTimeout(_submit, 1);
            }
        }, 0);
    }

    $('p[name^="media_"]', sonFrame.contentDocument).each(function() {
        var self = $(this);
        var mediaId = self.attr('name') ? self.attr('name').replace('media_','') : false;
        mediaId && submitComment(mediaId, 3);
    });
}
