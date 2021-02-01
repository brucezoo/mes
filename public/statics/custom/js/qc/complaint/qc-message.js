var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={
        is_end: 2
    },
    statusMap = {
        1: '未提示',
        2: '已提示'
    },
    typeMap = {
        1: '客诉提交',
        2: '发送相关部门',
        3: '回复',
        4: '打回',
        5: '提交审核',
        6: '审核结束'
    };


$(function(){
    resetParam();
    getMessage();
    bindEvent();
});
function bindPagenationClick(totalData,pageSize){
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageNo,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageNo=api.getCurrent();
            getMessage();
        }
    });
};
//重置搜索参数
function resetParam(){
    ajaxData={
        is_end: 2,
        type: ''
    };
}

// 格式化日趋
function formatDate(timestamp) {
    if (!timestamp) return '--';

    try {
        let date = new Date(timestamp * 1000);
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':')
    } catch (e) {
        return '--';
    }
}
//获取质检类别列表
function getMessage(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${encodeURIComponent(ajaxData[param])}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['deviationReply'].showMessage+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createHtml($('.table_tbody'),rsp.results);
            }else{
                noData('暂无数据',10);
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取消息列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);

};
//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>
                    <span class="el-checkbox_input" data-id="${item.id}">
                        <span class="el-checkbox-outset"></span>
                    </span>
                </td>
                <td>${item.send_name}</td>
                <td>${item.message}</td>
                <td>${typeMap[item.type] || ''}</td>
                <td>${statusMap[item.is_end] || '其它'}</td>
                <td>${formatDate(item.create_time)}</td> 
                <td>${formatDate(item.send_time)}</td> 
                <td class="right">            
                    ${item.is_end==2?``:`<button data-id="${item.id}" class="button pop-button end-single-message">关闭提示</button>`}
                    <button data-id="${item.id}" data-url="${item.target_url}" class="button pop-button redirect">跳转</button>                
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
};

function bindEvent() {
    // 跳转链接
    $('body').on('click','.redirect',function (e) {
        e.stopPropagation();
        var targetUrl = $(this).attr('data-url');
        targetUrl ? window.open(targetUrl,"_blank") : '';
    });

    $('body').on('click','#searchForm .el-select',function(){
        if($(this).find('.el-input-icon').hasClass('is-reverse')){
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        }else{
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });
    $('body').on('click','.el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    //更多搜索条件下拉
    $('#searchForm').on('click','.arrow:not(".noclick")',function(e){
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that=$(this);
        that.addClass('noclick');
        if($(this).find('.el-icon').hasClass('is-reverse')){
            $('#searchForm .el-item-show').css('background','#e2eff7');
            $('#searchForm .el-item-hide').slideDown(400,function(){
                that.removeClass('noclick');
            });
        }else{
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
                that.removeClass('noclick');
            });
        }
    });

    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#is_end').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getMessage();
    });
    // 搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            pageNo=1;
            ajaxData={
                is_end: parentForm.find('#is_end').val().trim(),
                type: parentForm.find('#type').val().trim()
            }
            getMessage();
        }
    });

    $('body').on('click','.el-checkbox_input',function(){
        $(this).toggleClass('is-checked');

        if ($(this).hasClass('all-inmate-check')) {
            if ($(this).hasClass('is-checked')) {
                $('.el-checkbox_input').addClass('is-checked');
            } else {
                $('.el-checkbox_input').removeClass('is-checked');
            }
        }
    });

    // 批量关闭提示
    $('body').on('click','.end-send-message',function (e) {
        e.stopPropagation();
        e.preventDefault();

        var id_batch = [];
        $('.el-checkbox_input.is-checked:not(".all-inmate-check")').each(function (index, $item) {
            var dataId = $($item).attr('data-id');
            if (dataId) {
                id_batch.push(dataId);
            }
        });

        if (!id_batch.length) {
            layer.msg('请至少选择一条消息！', {icon: 5});
            return;
        }

        endSendMessage(id_batch, false);
    });

    //关闭单个提示
    $('body').on('click','.end-single-message',function (e) {
        e.stopPropagation();
        e.preventDefault();

        endSendMessage([$(this).attr('data-id')], true);
    });

    // 关闭提示请求
    function endSendMessage(id_batch, single) {
        AjaxClient.post({
            url: URLS['complaint'].endSendMessage,
            dataType: 'json',
            data: {
                _token: TOKEN,
                id_batch: id_batch.join(',')
            },
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('success','操作成功');
                if (!single) {
                    $('.el-checkbox_input').removeClass('is-checked');
                    getMessage();
                }
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                layer.msg(rsp.message || '操作失败！', {icon: 5});
            }
        }, this);
    }
}
