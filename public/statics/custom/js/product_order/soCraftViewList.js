/*
*
* pageNo,pageSize  分页参数
* ajaxData 存放搜索参数
* selectDate 根据参数调用日期组件
* order_mode : 1(截止日期) 2（开始日期） 3（优先级）
* status： 0（未发布）1(已发布)2（已拆完）3（已排完）
*
* */
var pageNo=1,
    pageSize=15,
    ajaxData={order_mode: '', status: ''},
    count_down,
    m = 180,
    close=1,
    selectDate = ['start_date','end_date'];

var pOrderList = [];

$(function(){
    setAjaxData();
    getPo();
    bindEvent();
    getSelectDate(selectDate);
});
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            pageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
        }catch (e) {
            resetParam();
        }
    }
}

// 重置搜索参数
function resetParam() {
    ajaxData = {
        sales_order_code: '',
        sales_order_project_code: '',
        number: '',
        priority: '',
        end_date: '',
        start_date: '',
        order_mode: '',
        status: ''
    }
}

//周期性定时器
function countDown(){
    var n = 10;
    $('.showMsg').css('display','inline-block').html('刷新倒计时: '+n+'s');
    count_down = setInterval(function(){
        n--;
        m--;
        $('.showMsg').html('刷新倒计时: '+n+'s');
        if(n == 0 ){
            getPo(n);
        };
        if(m <= 0){
            clearInterval(count_down);
            $('.showMsg').hide();
        }
    },1000);
}

// 获取生产订单
function getPo(n){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    console.log(ajaxData);
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['pro'].released+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
            clearInterval(count_down);
        },
        success:function (rsp) {
            layer.close(layerLoading);
            ajaxData.pageNo=pageNo;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var pageTotal = rsp.paging.total_records;
            if(rsp.results && rsp.results.length){
                pOrderList = rsp.results;
                createPro($('.table_tbody'),rsp.results);
            }else{
                $('.table_tbody').html('<tr><td class="nowrap" colspan="10" style="text-align: center;">暂无数据</td></tr>');
            }
            if(pageTotal>pageSize){
                bindPagenationClick(pageTotal,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取待处理订单列表失败');
        },
        complete: function(){
            $('#searchReleased_from .submit').removeClass('is-disabled');
            if(n == 0){
                countDown();
            }
        }
    });
}

//停止刷新
$('body').on('click','.stop-refresh',function (e) {
    e.stopPropagation();
    clearInterval(count_down);
    $('.showMsg').hide();
    $('.stop-refresh').hide();
});

// 生成订单列表
function createPro(ele, data){
    var editurl=$('#order_edit').val(),
        order_view=$('#order_view').val();
    var viewurl=$('#order_released').val();
    var flag=false;
    data.forEach(function(item){
        var status = item.status,editBtn='',pubBtn='';
        switch (status){
            case 0:
                // editBtn=`<a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.product_order_id}"><button class="button pop-button edit">编辑</button></a>`;
                pubBtn =`<button class="button pop-button publish" data-id="${item.product_order_id}">发布</button>`;
                break;
            case 1:
                editBtn='';
                pubBtn=`<button class="button pop-button notpublish" data-id="${item.product_order_id}">撤销发布</button>`;
                break;
            default:
                editBtn='';
                pubBtn='';
        }
        var priority = '';
        if  (item.ctime>1556812800&&item.ctime<1557071999&&item.status != 0){flag=true}else{flag=false}
        if (item.priority == 1){priority = `<span class="low">&nbsp;&nbsp;低&nbsp;&nbsp;</span>`;}
        else if (item.priority == 2){priority = `<span class="midden">&nbsp;&nbsp;中&nbsp;&nbsp;</span>`;}
        else if (item.priority == 3){priority = `<span class="hight">&nbsp;&nbsp;高&nbsp;&nbsp;</span>`;}
        else if (item.priority == 4){priority = `<span class="danger">紧急</span>`;}
        else{priority = `<span class="nothing">无</span>`;}
        var online = '';
        if (item.status == 3) {
            if(moment(item.schedule_end_date).isAfter(item.end_date)) {
                online = `<table class="plan_table table-online">
                        <tr>
                            <th class="right">开始</th><td>${item.start_date}</td>
                            <th class="right">结束</th><td>${item.end_date}</td>
                        </tr>
                        <tr style="background-color: #aaa;">
                            <th class="td_bottom right">排单开始</th><td class="td_bottom">${item.schedule_start_date}</td>
                            <th class="td_bottom right">排单结束</th><td class="td_bottom">${item.schedule_end_date}</td>
                        </tr>
                    </table>`;
            } else {
                online = `<table class="plan_table table-online">
                        <tr>
                            <th class="right">开始</th><td>${item.start_date}</td>
                            <th class="right">结束</th><td>${item.end_date}</td>
                        </tr>
                        <tr>
                            <th class="td_bottom right">排单开始</th><td class="td_bottom">${item.schedule_start_date}</td>
                            <th class="td_bottom right">排单结束</th><td class="td_bottom">${item.schedule_end_date}</td>
                        </tr>
                    </table>`;
            }
        } else {
            online = `<table class="plan_table">
                        <tr>
                            <th class="right">开始</th><td>${item.start_date}</td>
                            <th class="right">结束</th><td>${item.end_date}</td>
                        </tr>
                        <tr></tr>
                    </table>`;
        }
        var prohtml=`<tr>
            <td><span class="el-checkbox_input el-checkbox_item" data-id="${item.product_order_id}"><span class="el-checkbox-outset"></span></span></td>
            <td>${item.sales_order_code}${item.sales_order_project_code!=0?"/"+item.sales_order_project_code:''}</td>
            <td>${item.number}</td>
            <td>${item.item_no}</td>
            <td>${item.version==null?'':(item.version)+'.0'}</td>
            <td style="max-width:300px;min-width:50px;word-break: break-all;">${item.material_name}</td>
            <td align="center">${item.qty}</td>
            <td align="center">${item.unit_name}</td>
            <td style="padding: 0;">
                ${online}
            </td>
            <td align="center">${priority}</td>
            <td align="center">${item.status == 0?`未发布`:(item.status == 1?`已发布`:(item.status == 2?`已拆完`:`已排完`))}</td>
            <td align="center">
            <div class="progress pos-rel" style="margin-bottom: 0;border-radius: 16px;height: 13px;" data-percent="${item.schedule}">
            <div class="progress-bar" style="width:${item.schedule};background-color: #83af21"></div>
            </div></td>
            <td>${item.ctime!=0?formatTimeNow(item.ctime*1000):''}</td>            
            <td class="right nowrap">
                <button class="button pop-button viewProcess" data-sales-order-code="${item.sales_order_code}" data-sales-order-project-code="${item.sales_order_project_code}">查看工艺</button>
            </td>
            </tr>`;
        ele.append(prohtml);
        ele.find('tr:last-child').data("trData",item);
    });
}
function formatTimeNow(time){
    var cur=new Date(time);
    var hour=cur.getHours()<10? '0'+cur.getHours():cur.getHours();
    var min=cur.getMinutes()<10? '0'+cur.getMinutes():cur.getMinutes();
    var sec=cur.getSeconds()<10? '0'+cur.getSeconds():cur.getSeconds();
    var dateStr=cur.getFullYear()+'/'+Number(cur.getMonth()+1)+'/'+cur.getDate()+' '+hour+':'+min+':'+sec;
    return dateStr;
}

function reRelease(id){
    let count = 0;
    let layState = '';
    let timeSure = setInterval(function(){
        if(count == 26) {
            layState = layer.msg('由于工艺路线复杂，生成工单耗时较长，请耐心等待，稍后刷新！', {
                icon: 6,
                time: 5000 
            }, function(){
                getPo();
            });
            
        } else if(count == 0) {
            clearInterval(layState);
        }
        count++;
    }, 1000);
    
    AjaxClient.get({
        url: URLS['order'].reRelease+"?"+_token+"&production_order_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            count = 0;
            clearInterval(timeSure);
            layer.close(layerLoading);
            layer.msg("重新发布成功", {icon: 1,offset: '250px',time: 1500});
            getPo();
        },
        fail: function(rsp){
            count = 0;
            clearInterval(timeSure);
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null){
                LayerConfig('fail', rsp.message);
            }
            console.log('重新发布失败');
        }
    })
}
// 发布PO
function release(id){
    let count = 0;
    let layState = '';
    let timeSure = setInterval(function(){
        if(count == 26) {
            layState = layer.msg('由于工艺路线复杂，生成工单耗时较长，请耐心等待，稍后刷新！', {
                icon: 6,
                time: 5000 
            }, function(){
                getPo();
            });
            
        } else if(count == 0) {
            clearInterval(layState);
        }
        count++;
    }, 1000);
    
    AjaxClient.get({
        url: URLS['order'].release+"?"+_token+"&production_order_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            count = 0;
            clearInterval(timeSure);
            layer.close(layerLoading);
            layer.msg("发布成功", {icon: 1,offset: '250px',time: 1500});
            getPo();
        },
        fail: function(rsp){
            count = 0;
            clearInterval(timeSure);
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null){
                LayerConfig('fail', rsp.message);
            }
            console.log('发布失败');
        }
    })
}

// 撤销发布PO
function cancelRelease(id){
    AjaxClient.get({
        url: URLS['order'].cancelRelease+"?"+_token+"&production_order_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.msg("撤回发布成功", {icon: 1,offset: '250px',time: 1500});
            getPo();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null){
                LayerConfig('fail', rsp.message);
            }
            console.log('撤回发布失败');
        }
    })
}

function bindEvent(){
    $('#pull').on('click',function (e) {
        e.stopPropagation();
        Model();
    })

    // 批量发布
    $('.batch-release').on('click',function (e) {
        e.stopPropagation();
        var bathOPidList = [];

        if ($('body').find('.table_tbody')) {
            var _this = $('.table_tbody').find('tr');
            _this.each(function (index, item) {
                if ($(item).find(".el-checkbox_input").hasClass('is-checked')) {
                    let id = $(item).find(".el-checkbox_input").attr('data-id');
                    bathOPidList.push(id);
                }
            })
        }

        if (!bathOPidList.length) {
            layer.msg("请选择生产订单", {icon: 0,offset: '250px',time: 1500});
            return;
        }
        // var result="";
        // if (pOrderList.length) {
        //     pOrderList.forEach(function(item, index) {
        //         bathOPidList.push(item.product_order_id);
        //         // var res =  ValidRoutingBySAP(item.product_order_id);
        //         // if(res!="")
        //         //    result += res+";";
        //     });
        // }

        // if(result!="")
        // {
        //     if(result.indexOf("error")>=0 )
        //     {
        //         layer.msg("网路问题，发布失败。", {icon: 1,offset: '250px',time: 1500});
        //     }
        //     else
        //     {
        //         layer.msg("生产订单号【"+result+"】SAP工艺路线与MES工艺路线不匹配，请在SAP重下生产订单并同步到MES。", {icon: 1,offset: '250px',time: 1500});
        //     }
        //     return;
        // }
        
        AjaxClient.get({
            url: URLS['order'].batchRelease+"?"+_token+"&product_order_id_arr="+JSON.stringify(bathOPidList),
            dataType: 'json',
            beforeSend: function(){
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                layer.msg("系统正在处理，请稍后刷新列表！", {icon: 1,offset: '250px',time: 4000},function () {
                    getPo();
                });

                // countDown();
            },
            complete:function(){
                // $('.stop-refresh').show();
            },
            fail: function(rsp){
                layer.close(layerLoading);
                if (rsp && rsp.message != undefined && rsp.message != null){
                    LayerConfig('fail', rsp.message);
                }
                console.log('发布失败');
            }
        })
        
    });

    $('body').on('click','.item_close',function (e) {
        e.stopPropagation();
        var ele = $(this);
        var poID = $(this).attr('data-id');
        console.log(poID);
        layer.confirm('将执行开启操作', {icon: 3, title:'开启生产订单',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            
            AjaxClient.get({
                url: URLS['pro'].switchPO+"?"+_token+"&product_order_id="+poID,
                dataType: 'json',
                beforeSend: function(){
                    layerLoading = LayerConfig('load');
                },
                success: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('success','订单成功开启！')
                    ele.removeClass('item_close');
                    ele.addClass('item_open');
                    ele.css('color','#00a0e9');
                    ele.css('borderColor','#00a0e9');
                    ele.text('已开启')
                    close=0;
                },
                fail: function(rsp){
                    layer.close(layerLoading);
                    LayerConfig('fail',rsp.message);
                }
            })
            
        });

    });
    $('body').on('click','.item_open',function (e) {
        e.stopPropagation();
        var poID = $(this).attr('data-id');
        console.log(poID);
        var ele = $(this);
        layer.confirm('请确认领补退料完毕，清线完成，可以关闭生产订单', {icon: 3, title:'关闭生产订单',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            AjaxClient.get({
                url: URLS['pro'].switchPO+"?"+_token+"&product_order_id="+poID,
                dataType: 'json',
                beforeSend: function(){
                    layerLoading = LayerConfig('load');
                },
                success: function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('success','订单成功关闭！');
                    ele.removeClass('item_open');
                    ele.addClass('item_close');
                    ele.css('color','red');
                    ele.css('borderColor','red');
                    ele.text('已关闭')
                    close=1;
                },
                fail: function(rsp){
                    layer.close(layerLoading);
                    LayerConfig('fail', rsp.message);
                    console.log('开启失败');
                }
            })
            
        });

    });
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    // 下拉框点击事件
    $('body').on('click','.el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });
    // 下拉框item点击事件
    $('body').on('click','.el-select-dropdown-item:not(.el-auto)',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            var idval=$(this).attr('data-id');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    // 搜索
    $('body').on('click','#searchReleased_from:not(".is-disabled") .submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm = $(this).parents('#searchReleased_from');
            // 验证开始时间是否大于开始时间
            var start_data = parentForm.find('#start_date').val().trim();
            var end_data = parentForm.find('#end_date').val().trim();
            var d1 = new Date(start_data.replace(/\-/g, "\/"));
            var d2 = new Date(end_data.replace(/\-/g, "\/"));
            if(start_data!=""&&end_data!=""&&d1 > d2)
            {
                LayerConfig('fail','开始时间不能大于结束时间！');
                return false;
            }
            ajaxData = {
                sales_order_code : encodeURIComponent(parentForm.find('#sales_order_code').val().trim()),
                sales_order_project_code : encodeURIComponent(parentForm.find('#sales_order_project_code').val().trim()),
                number : encodeURIComponent(parentForm.find('#creator').val().trim()),
                priority: encodeURIComponent(parentForm.find('#priority').val().trim()),
                end_date: encodeURIComponent(parentForm.find('#end_date').val().trim()),
                start_date: encodeURIComponent(parentForm.find('#start_date').val().trim()),
                order_mode: encodeURIComponent(parentForm.find('#order_mode').val().trim()),
                status: encodeURIComponent(parentForm.find('#all_of').val().trim())
            };
            pageNo=1;
            getPo();
        }
    });

    // 搜索重置
    $('body').on('click','#searchReleased_from .reset',function (e) {
        e.stopPropagation();
        var parentForm = $(this).parents('#searchReleased_from');
        parentForm.find('#creator').val('');
        parentForm.find('#sales_order_code').val('');
        parentForm.find('#sales_order_project_code').val('');
        parentForm.find('#priority').val('');
        parentForm.find('#priorityShow').val('--请选择--');
        parentForm.find('#end_date').val('');
        parentForm.find('#start_date').val('');
        parentForm.find('#order_mode').val('');
        parentForm.find('#order_modeShow').val('--请选择--');
        parentForm.find('#all_of').val('');
        parentForm.find('#all_ofShow').val('--请选择--');
        $('.all-inmate-check').removeClass('is-checked');
        resetParam();
        getPo();
    });
    // 更多搜索条件下拉
    $('#searchReleased_from').on('click','.arrow:not(".noclick")',function(e){
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

    // 日期的提示信息
    var desc_show='';
    $('body').on('mouseenter', '#start_end .el-input', function () {
        var msg = $(this).attr('data-desc');
        if(msg!=''){
            desc_show = layer.tips(msg, this,
                {
                    tips: [2, '#20A0FF'], time: 0
                });
        }
    }).on('mouseleave', '#start_end .el-input', function () {
        layer.close(desc_show);
    })

    //重新发布，临时方案
    $('.uniquetable').on('click','.republish',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行重新发布操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            reRelease(id);
        });
    })
    //发布操作
    $('.uniquetable').on('click','.publish',function(){
        var id=$(this).attr("data-id");
        // var res =  ValidRoutingBySAP(id);
        // if(res!="")
        // {
        //   if(res == "error")
        //   {
        //     layer.msg("网路问题，发布失败。", {icon: 1,offset: '250px',time: 1500});
        //   }
        //   else
        //   {
        //     layer.msg("SAP工艺路线与MES工艺路线不匹配，请在SAP重下生产订单并同步到MES。", {icon: 1,offset: '250px',time: 1500});
        //   }
        //   return;
        // }
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行发布操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            release(id);
        });
    });
    //撤回发布操作
    $('.uniquetable').on('click','.notpublish',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行撤回发布操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            cancelRelease(id);
        });
    });

    $('body').on('click','#product_order_table .delete',function () {
        var id=$(this).attr("data-id");

        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            deleteProductOrder(id);
            layer.close(index);
        });
    });

    $('body').on('click','.formPullOrder:not(".disabled") .submit',function (e) {
        e.stopPropagation();
        var parentForm = $(this).parents('#addPullOrder_from'),
        order_no = parentForm.find('#order').val(),
        date = parentForm.find('#date').val(),
        start = date.substr(0,10),
        end = date.substr(13,10);
        location.href="pullOrderIndex?order_no="+order_no+"&startDate="+start+"&endDate="+end;

    });

    $('body').on('click', '.formPullOrder:not(".disabled") .cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });
}

function Model(){


    var labelWidth=150,
        title='拉取订单';


    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formPullOrder" id="addPullOrder_from">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">销售订单</label>
                <input type="text" id="order"  data-name="销售订单" class="el-input" placeholder="销售订单" value="">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">时间段</label>
                <input type="text" id="date"  data-name="时间段" class="el-input" placeholder="时间段" value="">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit">确定</button>
            </div>
          </div>
                
    </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
            getDate('#date');
        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
};
function getDate(ele) {
    start = laydate.render({
            elem: ele,range:true,
            done: function (value, date, endDate) {

            }
        });
}

function deleteProductOrder(id) {
    AjaxClient.get({
        url: URLS['order'].orderDelete+"?"+_token+"&product_order_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);

            getPo();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message){
                LayerConfig('fail',rsp.message);
            }else{
                LayerConfig('fail','删除失败');
            }
            if(rsp.code==404){
                getPo();
            }
        }
    },this);
}

// 日历组件方法调用
function getSelectDate(ele) {
    ele.forEach(function (item,index) {
        laydate.render({
            elem: `#${item}`,
            done: function(value, date, endDate){
                $('#searchReleased_from .submit').removeClass('is-disabled');
            }
        });
    })
}

// 分页
function bindPagenationClick(total,size) {
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:total,
        showData:size,
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
            getPo();
        }
    });
}

//SAP工艺路线和MES比对
function ValidRoutingBySAP(data_id)
{
  var datares="";
  $.ajax({
      url:"/ProductOrder/ValidRoutingBySAP?"+_token+"&product_order_id="+data_id,
      type:"GET",
      async:false,
      dataType:"JSON",
      success:function(data){
        if(data.code!="200")
            datares = "error";
          else
            datares = data.results;
        }
  });
  return datares;
}

    // 全选
    $('body').on('click', '.all-inmate-check', function (e) {
        var ele = $(this);
        if (ele.hasClass('is-checked')) {
            $('.table_tbody').find('.el-checkbox_item').removeClass('is-checked');
            ele.removeClass('is-checked');
        } else {
            $('.table_tbody').find('.el-checkbox_item').addClass('is-checked');
            ele.addClass("is-checked");
        }
    });

    // 单选
    $('body').on('click', '.el-checkbox_item', function (e) {
        var ele = $(this);
        if (ele.hasClass('is-checked')) {
            ele.removeClass('is-checked');
        } else {
            ele.addClass("is-checked");
        }
    });
