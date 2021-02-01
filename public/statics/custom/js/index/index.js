
$(function () {
    /*************以上代码测试用********************/
    AjaxClient.get({
        url: URLS['index'].checkAb + "?" + _token+"&page_no=1"+"&page_size=20",
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var num =  rsp.paging.total_records;
            if(num>0){
                layer.confirm("你有"+num+"条异常未处理！", {
                    icon: 3,
                    btn: ['确定'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px'
                },function(index){
                    layer.close(index);
                    check
                });
            }else {
                check();
                remind();
                miningremind();
                claimPrompt();
            }


        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
});

function check() {
    AjaxClient.get({
        url: URLS['index'].checkComplaint + "?" + _token+"&page_no=1"+"&page_size=20",
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var results =  rsp.results;
            if (Array.isArray(results) && results.length) {
                layer.open({
                    type: 1,
                    title: '通知消息',
                    offset: '70px',
                    shade: 0.1,
                    area: '500px',
                    resize: false,
                    move: '.layui-layer-title',
                    moveOut: true,
                    content: `<div style="padding: 4px 20px;">
                        <table class="uniquetable commontable">
                            <thead>
                                <tr>
                                    <th>消息</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="customer-not-deal-message">
                            
                            </tbody>
                        </table>
                    </div>`,
                    success: function (layero, index) {
                        var $html = results.map(function (item) {
                            return `<tr>
                                <td>${item.message}</td>
                                <td><a class="el-button" href="${item.target_url}" target="_blank">处理</a></td>
                            </tr>`
                        });

                        $('#customer-not-deal-message').html($html);
                    },
                    end: function () {

                    }
                });
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}
// 质检获取被删除补料单
function remind() {
    AjaxClient.get({
        url: URLS['index'].feedingListremind + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);

            var results =  rsp.results;
            var html='';
            if(results&&results.length){
              results.forEach(function(item){
                html+=`<div><a href="/WorkOrder/auditPickingList?id=${item.id}">${item.creator_name}的${item.code}补料单被删除!</a></div>`
              })
            }

            if(results.length !=0){
                layer.confirm(html, {
                    icon: 3,
                    btn: ['确定'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px'
                },function(index){
                    // window.location.href="/WorkOrder/auditPickingList?id="+results.id;
                    layer.close(index);

                });
            }


        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

//  获取特采单审核
function miningremind() {
    AjaxClient.get({
        url: URLS['index'].specialminingTips + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var num =  rsp.results;
            if(num.length !=0){
                layer.confirm(num, {
                    icon: 3,
                    btn: ['确定'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px'
                },function(index){
                    layer.close(index);
                });
            }


        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

// 获取索赔单
function claimPrompt() {
    AjaxClient.get({
        url: URLS['index'].claimPrompt + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);

            var results =  rsp.results;
            var html='';
            if(results&&results.length){
                results.forEach(function(item){
                    html+=`<div><a href="/Claim/reviewClaim?id=${item.id}">${item.code}索赔单需要处理!</a></div>`
                })
            }

            if(results.length !=0){
                layer.confirm(html, {
                    icon: 3,
                    btn: ['确定'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px'
                },function(index){
                    // window.location.href="/WorkOrder/auditPickingList?id="+results.id;
                    layer.close(index);

                });
            }


        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}
