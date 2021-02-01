var layerModal,
    layerLoading,
    pageNo=1,
    itemPageNo=1,
    pageSize=20,
    push_type=1,
  chargeData = [],
  ajaxData={},
ajaxItemData={};
$(function () {
    setAjaxData();
    resetParamItem();
    if(!itemPageNo){
        itemPageNo=1;
    }
    $('.el-tap[data-status='+push_type+']').addClass('active').siblings('.el-tap').removeClass('active');
    getPickingList(push_type);
    getChargeData();
    bindEvent();
    $('#storage_wo').autocomplete({
        url: URLS['work'].storageSelete+"?"+_token+"&is_line_depot=1",
        param:'depot_name'
    });
    
});
function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}
//重置搜索参数
function resetParamItem(){
    ajaxItemData={
        type: '',
        auditing_operator: '',
        repairstatus: '',
        sub_id: ''
    };
}
function setAjaxData() {
    var ajaxDataStr = sessionStorage.getItem('audit_for_qc_picking_list');
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(ajaxDataStr);
            delete ajaxData.pageNo;
            delete ajaxData.push_type;
            pageNo=JSON.parse(ajaxDataStr).pageNo;
            push_type=JSON.parse(ajaxDataStr).push_type;
        }catch (e) {
            resetParam();
        }
    }
    // var ajaxDataStr = window.location.hash;
    // if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
    //     try{
    //         ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
    //         delete ajaxData.pageNo;
    //         delete ajaxData.push_type;
    //         pageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
    //         push_type=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).push_type;
    //     }catch (e) {
    //         resetParam();
    //     }
    // }
}
function bindPagenationClick(totalData,pageSize,push_type){
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
            getPickingList(push_type);
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        sale_order_code:'',
        sale_order_project_code:'',
        work_order_code: '',
        product_order_code: '',
        inspur_sales_order_code: '',
        inspur_material_code: '',
        employee_name  : '',
        start_time: '',
        end_time: '',
        line_depot_id: '',
        status: '',
        auditing_operator: '',
        creator_name: '',
        repairstatus: '',
        LGFSB:''
    };
}

//获取列表
function getPickingList(push_type){
    var urlLeft='&type=7';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    var  url = URLS['work'].export+"?"+_token+urlLeft+"&push_type="+push_type;
    $('#exportExcel').attr('href',url)
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['work'].QCPageIndex+"?"+_token+urlLeft+"&push_type="+push_type,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layerLoading = LayerConfig('load');
            }
            ajaxData.pageNo=pageNo;
            ajaxData.push_type=push_type;
            sessionStorage.setItem('audit_for_qc_picking_list',JSON.stringify(ajaxData));
            // window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData=rsp.paging.total_records;
            var _html=createHtml(rsp);
            $('.table_page').html(_html);
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize,push_type);
            }else{
                $('#pagenation.unpro').html('');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',19);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    },this)
}

//生成未排列表数据
function createHtml(data){
    var viewurl=$('#workOrder_view').val();
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){
          trs+= `
            <tr>
            <td>${tansferNull(item.code)}</td>
            <td>${tansferNull(item.product_order_code)}</td>
            <td>${tansferNull(item.work_order_code)}</td>
            <td>${tansferNull(item.sale_order_code)}/${tansferNull(item.sale_order_project_code)}</td>
            <td>${tansferNull(item.line_depot_name)}</td>
            <td>${tansferNull(item.factory_name)}</td>
            <td>${tansferNull(item.workbench_code)}</td>
            <td>${item.push_type == 0 ?
                `<span style="display: inline-block;border: 1px solid red;color: red;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">线边</span>`
                :item.push_type == 1 ?
                    `<span style="display: inline-block;border: 1px solid green;color: green;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">SAP</span>`
                    :item.push_type == 2 ?
                        `<span style="display: inline-block;border: 1px solid #debf08;color: #debf08;width: 36px;height: 20px;border-radius: 3px;line-height: 20px;text-align: center">车间</span>`:
                        ''
                }
            </td>			
            <td>${tansferNull(item.employee_name)}</td>
            <td>${tansferNull(item.cn_name?item.cn_name:item.creator_name)}</td>
            <td>${tansferNull(item.auditing_operator?item.auditing_operator:item.auditing_operator_name)}</td>
            <td>${tansferNull(item.repairstatus==1?'已审核':'未审核')}</td>
            <td>${tansferNull(item.type==2?checkReturnStatus(item.status):checkPickingStatus(item.status))}</td>
            <td>${tansferNull(checkType(item.type))}</td>
            <td>${tansferNull((Number(item.feeding_ratio)*100)).toFixed(2)}%</td>
            <td>${tansferNull(item.send_depot)}</td>
            <td>${tansferNull(item.ctime)}</td>
            <td class="right">
              ${item.type==7?`<a class="button pop-button view" href="${viewurl}?id=${item.material_requisition_id}&status=${item.repairstatus}">审核</a>`:''}
            </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="17" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">销售订单/行项</th>
                        <th class="left nowrap tight">线边仓</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">发送至</th>
                        <th class="left nowrap tight">责任人</th>
                        <th class="left nowrap tight">开单人</th>
                        <th class="left nowrap tight">审核人</th>
                        <th class="left nowrap tight">审核状态</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">类型</th>
                        <th class="left nowrap tight">补料比例</th>
                        <th class="left nowrap tight">采购仓储</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro"></div>`;
    return thtml;
}

function resetAll() {
    var parentForm=$('#searchForm');
    parentForm.find('#code').val('');
    parentForm.find('#sale_order_code').val('');
    parentForm.find('#sale_order_project_code').val('');
    parentForm.find('#work_order_code').val('');
    parentForm.find('#product_order_code').val('');
    parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
    parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
    pageNo = 1;
    resetParam();
}

//获得负责人
function getChargeData() {
  var dtd = $.Deferred();
  AjaxClient.get({
    url: URLS['work'].employeeShow +"?"+ _token,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      chargeData = rsp.results;
      dtd.resolve(rsp);
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      dtd.reject(rsp);
    }
  }, this);
  return dtd;
}

//
function createStorage(that) {
  var currentVal = that.val().trim();
  setTimeout(function () {
    var val = that.val().trim();
    if (currentVal == val) {
      var filterData = getFilterData(val, chargeData);
      var lis = '';
      if (filterData.length > 0) {
        for (var i = 0; i < filterData.length; i++) {
          lis += `<li data-id="${filterData[i].id}"  data-name="${filterData[i].name}" class="el-select-dropdown-item el-auto"><span>${filterData[i].surname}${filterData[i].name}</span></li>`;
        }
      } else {
        lis = '<li class="el-select-dropdown-item el-auto disable"><span>搜索不到该数据……</span></li>';
      }
      $('.el-form-item.charge').find('.el-select-dropdown-list').html(lis);
      // if ($('.el-form-item.charge').find('.el-select-dropdown').is(":hidden")) {
      //   $('.el-form-item.charge').find('.el-select-dropdown').slideDown("200");
      // }
    }
  }, 1000);
}

//删选负责人数据
function getFilterData(type, dataArr) {
  return dataArr.filter(function (e) {
    var name = e.surname + e.name;
    return name.indexOf(type) > -1;
  });
}

function bindEvent() {
  
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if(!obj.hasClass('.searchModal')&&obj.parents(".searchModal").length === 0){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });

    //输入框的相关事件
    $('body').on('focus', '.el-input:not([readonly])', function (e) {
      e.stopPropagation();
      if ($(this).attr('id') == 'employee') {
        var that = $(this);
        createStorage(that);
        $('.employee').show();
      }else if($(this).attr('id') == 'creator_name') {
        var that = $(this);
        createStorage(that);
        $('.creator').show();

      } else {
        $(this).parents('.el-form-item').find('.errorMessage').html("");
      }
    }).on('blur', '.basic_info .el-input:not([readonly])', function () {
      var name = $(this).attr('id'),
        id = $('itemId').val();
      validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name, id);
    }).on('input', '#employee', function () {
      var that = $(this);
      createStorage(that);
    }).on('input', '#creator_name', function () {
      var that = $(this);
      createStorage(that);
    });


    $('body').on('click', '.el-tap-wrap .el-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var _type = $(this).attr('data-status');
            push_type=_type;
            resetAll();
            getPickingList(push_type);
        }
    });
    $('#start_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
        start_time = laydate.render({
            elem: '#start_time_input',
            max: max,
            type: 'datetime',
            show: true,
            closeStop: '#start_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });
    $('#end_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
        end_time = laydate.render({
            elem: '#end_time_input',
            min: min,
            max: getCurrentDate(),
            type: 'datetime',
            show: true,
            closeStop: '#end_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });

    $('body').on('click','.choose_status',function(e){
        e.stopPropagation();
        var type = $(this).attr('data-id');
        var _html = chooseStatus(type);
        $('#show_status').html(_html);
    });
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });

    //下拉列表项点击事件
  $('body').on('click', '.el-select-dropdown-item:not(disabled)', function (e) {
    e.stopPropagation();
    $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
    $(this).addClass('selected');
    if ($(this).hasClass('el-auto')) {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-input');
      var idval = $(this).attr('data-id');
      var nameval = $(this).attr('data-name');
      ele.val($(this).text()).attr('data-id', idval);
      ele.val($(this).text()).attr('data-name', nameval);
    } else {
      var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
      var idval = $(this).attr('data-id');
      ele.find('.el-input').val($(this).text());
      ele.find('.val_id').val(idval);
    }
    $(this).parents('.el-select-dropdown').hide();
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
    $('body').on('click','.el-select',function(){
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
    $(document).keydown(function(event){
        if(event.keyCode == 13){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('backageground','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                var parentForm=$("#searchForm .submit").parents('#searchForm');
                $('.el-sort').removeClass('ascending descending');
                ajaxData={
                    code: encodeURIComponent(parentForm.find('#code').val().trim()),
                    work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
                    product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
                    type: encodeURIComponent(parentForm.find('#type').val().trim()),
                    status: encodeURIComponent(parentForm.find('#status').val().trim()),
                };
                pageNo=1;
                getPickingList(push_type);
            }
        }
    });
    //搜索
    $('body').on('click','#searchForm .submit',function(e){
        e.stopPropagation();
        e.preventDefault();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('backageground','transparent');
        });
        var $storage_wo=$('#storage_wo');
        var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').id:''; var $storage_wo=$('#storage_wo');

        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            var employee_name='',creator_name='';
            $('.el-sort').removeClass('ascending descending');
            if(parentForm.find('#employee').attr('data-name')){
              employee_name=parentForm.find('#employee').attr('data-name');
            }
            if(parentForm.find('#creator_name').attr('data-name')){
              creator_name=parentForm.find('#creator_name').attr('data-name');
            }
            ajaxData={
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                sale_order_code: encodeURIComponent(parentForm.find('#sale_order_code').val().trim()),
                sale_order_project_code: encodeURIComponent(parentForm.find('#sale_order_project_code').val().trim()),
                work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
                product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
                inspur_sales_order_code: encodeURIComponent(parentForm.find('#inspur_sales_order_code').val().trim()),
                inspur_material_code: encodeURIComponent(parentForm.find('#inspur_material_code').val().trim()),
                auditing_operator: encodeURIComponent(parentForm.find('#auditing_operator').val().trim()),
                repairstatus: encodeURIComponent(parentForm.find('#repairstatus').val().trim()),
                status: encodeURIComponent(parentForm.find('#status').val().trim()),
                employee_name: employee_name,
                creator_name: creator_name,
                start_time: parentForm.find('#start_time').val(),
                end_time: parentForm.find('#end_time').val(),
                line_depot_id: storage_wo,
                LGFSB:parentForm.find('#LGFSB').val()
            };
            pageNo=1;
            getPickingList(push_type);
        }
    });

    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#sale_order_code').val('');
        parentForm.find('#sale_order_project_code').val('');
        parentForm.find('#work_order_code').val('');
        parentForm.find('#product_order_code').val('');
        parentForm.find('#inspur_sales_order_code').val('');
        parentForm.find('#inspur_material_code').val('');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#storage_wo').val('');
        parentForm.find('#employee').val('');
        parentForm.find('#repairstatus').val('');
        parentForm.find('#auditing_operator').val('');
        parentForm.find('#creator_name').val('');
        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('#start_time').val('');
        parentForm.find('#end_time').val('');
        parentForm.find('#LGFSB').val('');
        pageNo=1;
        resetParam();
        getPickingList(push_type);
    });


}


function checkPickingStatus(status) {
    switch(status)
    {
        case 1:
            return '未发送';
            break;
        case 2:
            return '已推送';
            break;
        case 3:
            return '待入库';
            break;
        case 4:
            return '完成';
            break;
        default:
            break;
    }
}
function checkReturnStatus(status) {
    switch (status) {
        case 1:
            return '待推送';
            break;
        case 2:
            return '进行中';
            break;
        case 3:
            return '待出库';
            break;
        case 4:
            return '完成';
            break;
        case 5:
            return '反审完成';
            break;
        default:
            break;
    }
}

function checkType(type) {
    switch(type)
    {
        case 1:
            return '领料';
            break;
        case 2:
            return '退料';
            break;
        case 7:
            return '补料';
            break;
        default:
            break;
    }
}

function chooseStatus(type) {
    switch(Number(type))
    {
        case 1:
            return `<li data-id="1" class=" el-select-dropdown-item">未发送</li>
                    <li data-id="2" class=" el-select-dropdown-item">已推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">待入库</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        case 2:
            return `<li data-id="1" class=" el-select-dropdown-item">待出库</li>
                    <li data-id="2" class=" el-select-dropdown-item">待推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">进行中</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>
                    <li data-id="5" class=" el-select-dropdown-item">反审完成</li>`;
            break;
        case 7:
            return `<li data-id="1" class=" el-select-dropdown-item">未发送</li>
                    <li data-id="2" class=" el-select-dropdown-item">已推送</li>
                    <li data-id="3" class=" el-select-dropdown-item">待入库</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        default:
            break;
    }
}

