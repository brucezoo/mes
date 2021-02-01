var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={},
    statusMap = {
        0: '未审核',
        1: '已审核'
    };


$(function(){
    resetParam();
    getToExamineList();
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
            getToExamineList();
        }
    });
};
//重置搜索参数
function resetParam(){
    ajaxData={
        declare_order_code: '',
        wo_number: '',
        po_number: '',
        sales_order_code: '',
        material_code: '',
        qc_judge_status: ''
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
function getToExamineList(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${encodeURIComponent(ajaxData[param])}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['toexamine'].list+"?"+_token+urlLeft,
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
                noData('暂无数据',14);
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
            noData('获取消息列表失败，请刷新重试',14);
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
                <td>${item.declare_order_code}</td>
                <td>${item.wo_number}</td>
                <td>${item.material_code}</td>
                <td>${item.material_name}</td>
                <td>${item.plan_qty}</td>
                <td>${item.factory_name}</td>
                <td>${item.workshop_name}</td>
                <td>${item.po_number}</td>
                <td>${item.sales_order_code}</td>
                <td>${item.sales_order_project_code}</td>
                <td>${formatDate(item.ctime)}</td> 
                <td>${item.qc_judge_status==1?'已审核':'未审核'}</td> 
                <td>${item.qc_judge_result}</td> 
                <td class="right">            
                    <button data-id="${item.id}" data-declare-order-code="${item.declare_order_code}" data-judge-status="${item.qc_judge_status}" class="button pop-button judge">${item.qc_judge_status == 0 ? '审核' : '反审' } </button>
                    <button data-id="${item.id}" class="button pop-button detail">详情</button>
                 </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
};

function bindEvent() {
    // 跳转报工详情页面
    $('body').on('click','.detail',function (e) {
        e.stopPropagation();
        var targetUrl = `/Buste/busteIndex?id=${$(this).attr('data-id')}`;
        window.open(targetUrl,"_blank");
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
        parentForm.find('#declare_order_code').val('');
        parentForm.find('#wo_number').val('');
        parentForm.find('#po_number').val('');
        parentForm.find('#sales_order_code').val('');
        parentForm.find('#material_code').val('');
        parentForm.find('#qc_judge_status').val('').siblings('.el-input').val('--请选择--');

        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getToExamineList();
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
                declare_order_code: parentForm.find('#declare_order_code').val().trim(),
                wo_number: parentForm.find('#wo_number').val().trim(),
                po_number: parentForm.find('#po_number').val().trim(),
                sales_order_code: parentForm.find('#sales_order_code').val().trim(),
                material_code: parentForm.find('#material_code').val().trim(),
                qc_judge_status: parentForm.find('#qc_judge_status').val().trim()
            }
            getToExamineList();
        }
    });

    // 审核/ 反审
    $('body').on('click', '.judge', function (e) {
        e.stopPropagation();
        var declare_order_code = $(this).attr('data-declare-order-code'),
            judgeStatus = $(this).attr('data-judge-status');

        // var $html = `<div class="el-form-item form-judge">
        //               <div class="el-form-item-div">
        //                   <label class="el-form-item-label" style="width: 104px;"><span class="mustItem">*</span>审核原因</label>
        //                   <input type="text" id="judge-result" class="el-input" placeholder="请输入审核原因" value="">
        //               </div>
        //           </div>`;
        layer.confirm(`将执行${judgeStatus==0 ? '审核': '反审'}操作?</br>`, {
            icon: 3, title: '提示', offset: '250px', end: function () {
                $('.uniquetable tr.active').removeClass('active');
            }
        }, function (index) {
            // var judgeResult = '';

            // if (judgeStatus == 0) {
            //     judgeResult = $('#judge-result').val().trim();

            //     if (!judgeResult) {
            //         LayerConfig('fail', '请输入审核原因');
            //         return;
            //     }
            // }

            layer.close(index);
            toexamineJudge(declare_order_code,judgeStatus);
        });
    });
}

function toexamineJudge(declare_order_code,judgeStatus) {
    var data = {
        _token: TOKEN,
        declare_order_code: declare_order_code,
        qc_judge_status: parseInt(judgeStatus)^1,
        // qc_judge_result: judgeResult
    };

    AjaxClient.post({
        url: URLS['toexamine'].judge,
        dataType: 'json',
        data: data,
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            getToExamineList();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
            getToExamineList();
        }
    }, this);
}
