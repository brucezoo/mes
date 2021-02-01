var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=100,
    ajaxData={};

$(function(){
    resetParam();
    getQualityResumeList();
    bindEvent();
    $('#type_id').autocomplete({
        url: URLS['check'].templateList+"?"+_token,
        param:'name'
    });
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
            getQualityResumeList();
        }
    });
};

//重置搜索参数
function resetParam(){
    ajaxData={
        sales_order_code: '',
        sales_order_project_code:'',
        material_code: '',
        LGFSB: '',
        type: '',
        is_delete:''
    };
}

//获取品质履历列表
function getQualityResumeList(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['quality'].list+"?"+_token+urlLeft,
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
                noData('暂无数据',8);
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
            noData('获取品质履历列表失败，请刷新重试',8);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}

//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var viewUrl = `/QC/viewQualityResume?id=${item.id}`;
        var editUrl = `/QC/editQualityResume?id=${item.id}`;

        if (item.type == 2) {
            viewUrl = `/QC/viewComplaintById?id=${item.customercomplaint_id}`;
            editUrl = viewUrl;
        }

        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${tansferNull(item.code)}</td>            
                <td>${tansferNull(item.check_resource)}</td>
                <td>${tansferNull(item.sales_order_code)}/${tansferNull(item.sales_order_project_code)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td>${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.cn_name)}</td>
                <td>${tansferNull(item.check_time)}</td>
                <td class="right">
                  <button data-id="${item.id}" class="button pop-button view"><a href="${viewUrl}" style="color: #00a0e9;">查看</a></button>
                  <button data-id="${item.id}" class="button pop-button view"><a href="${editUrl}" style="color: #00a0e9;">编辑</a></button>
                  <button data-id="${item.id}" class="button pop-button delete">删除</button>
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

function bindEvent(){
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
            $('.el-muli-select-dropdown').slideUp().siblings('.el-muli-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if(!obj.hasClass('.searchModal')&&obj.parents(".searchModal").length === 0){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
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
        if(!$(this).hasClass('check_status')){
            var scroll = $(document).scrollTop();
            var width=$(this).width();
            var offset=$(this).offset();
            $(this).siblings('.el-select-dropdown').width(width).css({top: offset.top+33-layerOffset.top-scroll,left: offset.left-layerOffset.left});
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

    //搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        var parentForm=$(this).parents('#searchForm');
        var $itemJP=$('#type_id');
        var type_code=$itemJP.data('inputItem')==undefined||$itemJP.data('inputItem')==''?'':
            $itemJP.data('inputItem').name==$itemJP.val().trim().replace(/\（.*?）/g,"")?$itemJP.data('inputItem').code:'';

            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                $('.el-sort').removeClass('ascending descending');
                pageNo=1;
                ajaxData={
                    material_code: parentForm.find('#material_code').val().trim(),
                    LGFSB: parentForm.find('#LGFSB').val().trim(),
                    sales_order_code: parentForm.find('#sales_order_code').val().trim(),
                    sales_order_project_code:parentForm.find('#sales_order_project_code').val().trim(),
                    type: parentForm.find('#type').val().trim(),
                    is_delete: parentForm.find('#is_delete').val().trim()
                };
                getQualityResumeList();
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
        parentForm.find('#sales_order_code').val('');
        parentForm.find('#sales_order_project_code').val('');
        parentForm.find('#material_code').val('');
        parentForm.find('#LGFSB').val('');
        parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#is_delete').val('').siblings('.el-input').val('--请选择--');
        pageNo=1;
        resetParam();
        getQualityResumeList();
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

    //弹窗取消
    $('body').on('click','.cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    //弹窗取消
    $('body').on('click','.delete',function(e){
      e.stopPropagation();
      var id=$(this).attr('data-id');
      layer.confirm('确认删除当前品质履历?', {
        icon: 3, title: '提示', offset: '250px', end: function () {
          $('.uniquetable tr.active').removeClass('active');
        }
      }, function (index) {
        layer.close(index);
        var ids = [];
        ids.push(id);
        AjaxClient.get({
          url: URLS['quality'].delete + "?_token=" + TOKEN + "&id=" + id,
          dataType: 'json',
          beforeSend: function () {
            layerLoading = LayerConfig('load');
          },
          success: function (rsp) {
            LayerConfig('success', '删除成功');
            layer.close(layerLoading);
            getQualityResumeList();
          },
          fail: function (rsp) {
            LayerConfig('fail', rsp.message);
            layer.close(layerLoading);
          }
        })
      });
    });

    //导出功能
  $('body').on('click', '#searchQualityResume .export', function (e) {
    e.stopPropagation();
    var parentForm = $(this).parents('#searchForm');
    ajaxData = {
      material_code: parentForm.find('#material_code').val().trim(),
      LGFSB: parentForm.find('#LGFSB').val().trim(),
      sales_order_code: parentForm.find('#sales_order_code').val().trim(),
      sales_order_project_code:parentForm.find('#sales_order_project_code').val().trim(),
      type: parentForm.find('#type').val().trim(),
      is_delete: parentForm.find('#is_delete').val().trim(),
    }
    var urlLeft = '';
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    window.location.href = '/qualityResume/export?' + _token + urlLeft;
  })
};

function submitClaim(data) {
    AjaxClient.post({
        url: URLS['check'].storeQcClaim,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            if(rsp.results.RESPONSE_STATUS == 'SUCCESSED'){
                layer.confirm('索赔成功', {icon: 1, title:'提示',offset: '250px',end:function(){
                    $('.uniquetable tr.active').removeClass('active');
                }}, function(index){
                    layer.close(index);
                    getQualityResumeList();
                });
            }else {
                LayerConfig('fail','索赔失败！');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#claim_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

        }
    },this);
}
