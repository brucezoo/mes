
$(function () {
    function getCookie(name)
    {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    }
    // uid可以是自己网站的用户id，以便针对uid推送以及统计在线人数
    function websocketInit() {
        var employeeId = getCookie("employeeId"),
            WEB_PUSH_HOST = getCookie("WEB_PUSH_HOST");

        if (!employeeId || !WEB_PUSH_HOST) return;

        var socket = io(WEB_PUSH_HOST);

        // socket连接后以uid登录
        socket.on('connect', function () {
            socket.emit('login', employeeId);
        });
        // 后端推送来消息时
        socket.on('new_msg', function (msg) {
            var msgArr = msg.split('###');
            layer.confirm(msgArr[0], {
                icon: 3,
                btn: ['处理', '取消'],
                closeBtn: 0,
                title: false,
                offset: '250px'
            },function(index){
                if (msgArr[1]) {
                    window.open(location.origin + msgArr[1],"_blank");
                } else {
                    layer.close(index);
                }
            });
        });
    }

    websocketInit();
});
