var layerLoading, layerModal,
    pageNo = $.cookie("pageNo")? $.cookie("pageNo") : 1,
    pageSize = 20,
    ajaxData = {},
    BOMGroup = [],
    BOMProcess = [],
    editurl = '',
    bomCheckedCode = [];
var scriptsArray = new Array();


$(function () {
    getBOMGroup();
    getBOMProcess();
    resetParam();
    setAjaxData();
    getBomList();
    bindEvent();
    $('#item_material_id').autocomplete({
        url: URLS['bomAdd'].materialList + "?" + _token + "&page_no=1&page_size=10"
    });
    $('#replace_material_id').autocomplete({
        url: URLS['bomAdd'].materialList + "?" + _token + "&page_no=1&page_size=10"
    });
});

function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
        }catch (e) {
            ajaxData = {};
        }
    }
}

//重置搜索参数
function resetParam() {
    ajaxData = {
        code: '',
        name: '',
        child_code: '',
        item_material_id: '',
        replace_material_id: '',
        condition: '',
        bom_group_id: '',
        creator_name: '',
        order: 'asc',
        sort: 'code',
        begin_time: '',
        end_time: '',
    };
}

function bindPagenationClick(totalData, pageSize) {
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData: totalData,
        showData: pageSize,
        current: pageNo,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            pageNo = api.getCurrent();
            getBomList();
        }
    });
}

function getBomList() {
    // console.log($.cookie("pageNo"));
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
    // console.log(urlLeft);
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['bomList'].list + "?" + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            var data = rsp.results;
            window.localStorage.setItem('bomlist', JSON.stringify(data));
            $.cookie("pageNo", pageNo, {
                expires: 7
            }); // 存储一个带7天期限的 cookie
            layer.close(layerLoading);
            var totalData = rsp.paging.total_records;
            if (rsp.results && rsp.results.length) {
                createHtml($('.table_tbody'), rsp.results);
            } else {
                noData('暂无数据', 13);
            }
            if (totalData > pageSize) {
                bindPagenationClick(totalData, pageSize);
            } else {
                $('#pagenation').html('');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (layerModal != undefined) {
                layer.close(layerModal);
            }
            noData('获取物料清单列表失败，请刷新重试', 13);
        },
        complete: function () {
            $('#searchBomAttr_from .submit,#searchBomAttr_from .reset').removeClass('is-disabled');
        }
    }, this);
}

//删除Bom
function deleteBOM(id, leftNum) {
    AjaxClient.get({
        url: URLS['bomList'].bomDelete + "?" + _token + "&bom_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            if (leftNum == 1) {
                pageNo--;
                pageNo ? null : (pageNo = 1);
            }
            getBomList();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message) {
                LayerConfig('fail', rsp.message);
            } else {
                LayerConfig('fail', '删除失败');
            }
            if (rsp.code == 404) {
                pageNo ? null : pageNo = 1;
                getBomList();
            }
        }
    }, this);
}

//获取bom分组
function getBOMGroup() {
    AjaxClient.get({
        url: URLS['bomGroup'].select + "?" + _token,
        dataType: 'json',
        success: function (rsp) {
            if (rsp.results && rsp.results.length) {
                BOMGroup = rsp.results;
                var lis = '', innerhtml = '';
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.bom_group_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml = `
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.bom_group').find('.el-select-dropdown-list').html(innerhtml);
            }
        },
        fail: function (rsp) {
            console.log('获取物料清单分组失败');
        }
    }, this);
}

//获取工序
function getBOMProcess() {
    AjaxClient.get({
        url: URLS['bomList'].bomProcess + "?" + _token,
        dataType: 'json',
        success: function (res) {
            if (res.results && res.results.list.length) {
                BOMProcess = res.results.list;
                var lis = '', innerhtml = '';
                res.results.list.forEach(function (item) {
                    lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml = `
                    <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                    ${lis}`;
                $('.el-form-item.bom_process').find('.el-select-dropdown-list').html(innerhtml);
            }
        },
        fail: function (res) {
            console.log('获取bom工序失败');
        }
    }, this)
}

//生成列表数据
function createHtml(ele, data) {
    var viewurl = '/BomManagement/bomFormView',
        editurl = $('#bom_edit').val();
    data.forEach(function (item, index) {
        var condition = '', release_id = '',bomFrom = '';
        if(item.from == 1){
            bomFrom = 'MES';
        }else if(item.from == 2){
            bomFrom = 'ERP';
        }else if(item.from == 3){
            bomFrom = 'SAP';
        }

        if (item.release_version != '') {
            condition = `<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已发布</span>`;
        } else {
            condition = `<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">未发布</span>`;
        }
        if (item.release_version_bom_id == "") {
            // condition=`<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">已冻结</span>`;
            release_id = item.bom_id;
            // if(item.status==0){
            //     condition=`<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">已冻结</span>`;
            // }else{
            //     if(item.is_version_on){
            //         condition=`<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已发布</span>`;
            //     }else{
            //         condition=`<span style="padding: 2px;border: 1px solid #a8b52e;color: #a8b52e;border-radius: 4px;">已激活</span>`;
            //     }
            // }
        } else {
            // condition=`<span style="padding: 2px;border: 1px solid #a8b52e;color: #a8b52e;border-radius: 4px;">已激活</span>`;
            release_id = item.release_version_bom_id;
        }
        var btn = '';
        if (location.pathname.indexOf('lookTechnicsFile') >= 0) {
            $(".actions").hide();
            btn = `<button type="button" data-id="${item.release_version_bom_id}" class="button pop-button lookTechnicsFile">工单文件</button></button>`;
        } else {
            btn = `<a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${release_id}"><button data-id="${item.bom_id}" class="button pop-button view">查看</button></a>
            <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${release_id}"><button data-id="${item.bom_id}" class="button pop-button edit">编辑</button></a>
            <button type="button" data-id="${item.bom_id}" class="button pop-button delete">删除</button>`;
        }
        var tr = `
            <tr class="tritem" data-id="${item.bom_id}">
                <td>
                    <span class="el-checkbox_input el-checkbox_input_check bom-replace-check ${bomCheckedCode.includes(item.code) ? 'is-checked': ''}" data-code="${item.code}">
                        <span class="el-checkbox-outset"></span>
                    </span>
                </td>
                <td>${item.code}</td>
                <td>${item.bom_name}</td>
                <td>${item.bom_no}</td>
                <td>${item.qty}(${item.commercial})</td>
                <td>${tansferNull(item.bom_group_name)}</td>
                <td style="min-width: 55px;">${condition}</td>
                <td style="min-width: 70px">${item.release_version != '' ? '<span class="el-status el-status-success">' + item.release_version + '.0</span>' : ''}</td>
                <td>${tansferNull(item.big_material_type_name)}</td>
                <td>${tansferNull(item.material_type_name)}</td>
                <td>${bomFrom}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${item.ctime}</td>
                <td class="right">${btn}</td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
    });
}

function bindEvent() {
    $('#pull').on('click', function (e) {
        e.stopPropagation();
        Model();
    })
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
            $('#searchForm .el-item-hide').slideUp(400, function () {
                $('#searchForm .el-item-show').css('background', 'transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });
    //下拉框点击事件
    $('body').on('click', '.el-select', function () {
        if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        } else {
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });
    //下拉框item点击事件
    $('body').on('click', '.el-select-dropdown-item:not(.el-auto)', function (e) {
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if ($(this).hasClass('selected')) {
            var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });

    $('.uniquetable').on('click', '.lookTechnicsFile:not(".is-disabled")', function () {
        var self = $(this);
        var bomid = self.data('id');
        location.href="/BomManagement/bomgyView?id="+bomid;
        // self.addClass('is-disabled');
        // $('#viewBomCommon #code').val(self.parent().parent().find("td:eq(0)").text());
        // $.ajaxSetup({cache: true});
        // $.getScript('/statics/custom/js/bom/bom-view.js', function () {
        //     id = bomid = self.data('id');
        //     hoursFlag = null;
        //     getBomView(id);
        //     // timer1 - getBomView(...)     load success
        //     // timer2 - getBomRoute(...)    load success
        //     var timer1 = setInterval(function () {
        //         var bomRoutings = $(document).data('getBomRoutings');
        //         if (bomRoutings == undefined) {
        //             return;
        //         }
        //         clearInterval(timer1);
        //         $(document).removeData('getBomRoutings');
        //         if (bomRoutings.length == 0) {
        //             layer.alert("未匹配到工艺文件！");
        //             self.addClass("delete");
        //             return;
        //         }
        //         self.removeClass("delete");
        //         technicsFile(bomRoutings[0].routing_id);
        //     });

        // });
        // $(this).removeClass('is-disabled');

    });
    //更多搜索条件下拉
    $('#searchForm').on('click', '.arrow:not(".noclick")', function (e) {
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that = $(this);
        that.addClass('noclick');
        if ($(this).find('.el-icon').hasClass('is-reverse')) {
            $('#searchForm .el-item-show').css('background', '#e2eff7');
            $('#searchForm .el-item-hide').slideDown(400, function () {
                that.removeClass('noclick');
            });
        } else {
            $('#searchForm .el-item-hide').slideUp(400, function () {
                $('#searchForm .el-item-show').css('background', 'transparent');
                that.removeClass('noclick');
            });
        }
    });
    //搜索bom
    $('body').on('click', '#searchForm .submit:not(".is-disabled")', function (e) {
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('background', 'transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if (!$(this).hasClass('is-disabled')) {

            // 清除选择框选择
            bomCheckedCode = [];

            $(this).addClass('is-disabled');
            var parentForm = $(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo = 1;
            var $itemMaterial = parentForm.find('#item_material_id');
            var item_material_id = $itemMaterial.data('inputItem') == undefined || $itemMaterial.data('inputItem') == '' ? '' :
                $itemMaterial.data('inputItem').name == $itemMaterial.val().trim() ? $itemMaterial.data('inputItem').material_id : '';
            var $replaceMaterial = parentForm.find('#replace_material_id');
            var replace_material_id = $replaceMaterial.data('inputItem') == undefined || $replaceMaterial.data('inputItem') == '' ? '' :
                $replaceMaterial.data('inputItem').name == $replaceMaterial.val().trim() ? $replaceMaterial.data('inputItem').material_id : '';
            ajaxData = {
                code: parentForm.find('#code').val().trim(),
                name: parentForm.find('#name').val().trim(),
                child_code: parentForm.find('#child_code').val().trim(),
                creator_name: parentForm.find('#creator_name').val().trim(),
                item_material_id: item_material_id,
                replace_material_id: replace_material_id,
                condition: parentForm.find('#condition').val(),
                bom_group_id: parentForm.find('#bom_group_id').val(),
                operation_id: parentForm.find('#bom_process_id').val(),
                order: 'asc',
                sort: 'code'
            };
            if (parentForm.find('#has_workhour').val() != '') {
                ajaxData.has_workhour = parentForm.find('#has_workhour').val();
            }
            if (parentForm.find('#is_lzp').val() != '') {
                ajaxData.is_lzp = parentForm.find('#is_lzp').val();
            }
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            getBomList();
        }
    });

    //重置搜索框值
    $('body').on('click', '#searchForm .reset:not(.is-disabled)', function (e) {
        e.stopPropagation();
        $(this).addClass('is-disabled');

        // 重置搜索 清除选择数据
        bomCheckedCode = [];

        $('#searchForm .el-item-hide').slideUp(400);
        setTimeout(function () {
            $('#searchForm .el-item-show').css('background', 'transparent');
        }, 400);
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm = $(this).parents('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#name').val('');
        parentForm.find('#child_code').val('');
        parentForm.find('#creator_name').val('');
        parentForm.find('#item_material_id').val('').data('inputItem', '').siblings('.el-select-dropdown').find('ul').empty();
        parentForm.find('#replace_material_id').val('').data('inputItem', '').siblings('.el-select-dropdown').find('ul').empty();
        parentForm.find('#bom_group_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#bom_process_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#has_workhour').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#is_lzp').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#condition').val('').siblings('.el-input').val('--请选择--');

        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('#start_time').val('');
        parentForm.find('#end_time').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo = 1;
        resetParam();
        getBomList();
    });

    $('body').on('click', '.formPullOrder:not(".disabled") .submit', function (e) {
        e.stopPropagation();
        var parentForm = $(this).parents('#addPullOrder_from');
        item_no = parentForm.find('#order').val();
        if(item_no==""){
             $(this).addClass("is-disabled");
        }else{

            $(".el-button--primary").css("backgroundColor","#21A0FF");
            $(".el-button--primary").removeClass("is-disabled");
            pullErpMaterialAndBOM(item_no);
        }
    })

    $('body').on('click', '.formPullOrder:not(".disabled") .cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    })

    // 选择框
    $('body').on('click', '.el-checkbox_input_check', function (e) {
        e.stopPropagation();
        $(this).toggleClass('is-checked');

        var checkedCode = $(this).attr('data-code');

        if ($(this).hasClass('is-checked')) {
            bomCheckedCode.push(checkedCode);
        } else {
            bomCheckedCode.splice(bomCheckedCode.indexOf(checkedCode), 1);
        }
    })

    $('body').on('click', '.bom-replace-btn', function (e) {
        e.stopPropagation();

        if (!bomCheckedCode.length) {
            layer.msg('请选择物料！', { icon: 5, offset: '250px', time: 1500 });
            return false;
        }

        window.location.href = '/BomManagement/bomReplaceView?ids=' + bomCheckedCode.join(',');
    })

    $('#start_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
        start_time = laydate.render({
            elem: '#start_time_input',
            // max: max,
            type: 'date',
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
            // max: getCurrentDate(),
            type: 'date',
            show: true,
            closeStop: '#end_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });
}

$('#start_time').on('click', function (e) {
    e.stopPropagation();
    var that = $(this);
    var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
    start_time = laydate.render({
        elem: '#start_time_input',
        // max: max,
        type: 'date',
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
        // max: getCurrentDate(),
        type: 'date',
        show: true,
        closeStop: '#end_time',
        done: function (value, date, endDate) {
            that.val(value);
        }
    });
});

// 按钮 - 工艺文件
// @author guanghui.chen
function technicsFile(routing_id) {
    if (typeof(timer2) === 'number') {
        return;
    }
    getBomRoute(routing_id);
    var timer2 = setInterval(function () {
        if ($(document).data('isLoad') != true) {
            return;
        }
        clearInterval(timer2);
        var bomRouting = $(document).data('getBomRouting');
        $(document).removeData('getBomRouting');
        $(document).removeData('isLoad');
        $('#route_id').val(routing_id);
        $('.el-tap-preview-wrap span:eq(0)').addClass("active");
        previewModal();
        getPreview(bomRouting.control_info[0].routing_node_id, routing_id);
    });
}

//拉取物料
function Model() {
    var labelWidth = 150,
        title = '拉取物料编码';
    layerModal = layer.open({
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
                <label class="el-form-item-label" style="width: ${labelWidth}px;">物料编码</label>
                <input type="text" id="order"  data-name="物料编码" class="el-input" placeholder="物料编码" value="">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit" id="confirm">确定</button>
            </div>
          </div>
                
    </form>`,
        success: function (layero, index) {
            getLayerSelectPosition($(layero));
            getDate('#id');
        },
        end: function () {
            $('.table_tbody tr.active').removeClass('active');
        }
    });
};

function getDate(ele) {
    start = laydate.render({
        elem: ele, range: true,
        done: function (value) {

        }
    });
}

//确定
function pullErpMaterialAndBOM(item_no) {
    AjaxClient.post({
        url: URLS['bomList'].pullBomList + "?" + _token + "&item_no=" + item_no,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results.bom == 0 ) {
                if(rsp.results.material == 0){
                    layer.msg(rsp.results.message, {icon: 1});
                }
                if (rsp.results.material == -1){
                    layer.msg(rsp.results.message, {icon: 5});
                }
            }
            if(rsp.results.bom == 1){
                if(rsp.results.material > 0){
                    layer.msg(rsp.results.message, {icon: 1});
                }
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp.code == "2111"){
                layer.msg(rsp.message, {icon: 5});
            } else if(rsp.code == "808"){
                layer.msg(rsp.message, {icon: 5});
            }else{
                layer.msg("正在拉取中，请稍侯", {icon:5});
            }



        }

    }, this);

}
$('body').on('input','.el-item-show input',function(event){
    event.target.value = event.target.value.replace( /[`~!@#$%^&*()\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘’，。、]/im,"");
})


/******************* 增加 导出 导入  ******************/

//  导入
layui.use('upload', function () {
    var $ = layui.jquery
        , upload = layui.upload;

    upload.render({
        elem: '#test8'
        , url: '/Language/importSpecial'
        , auto: false
        , data: { '_token': '8b5491b17a70e24107c89f37b1036078' }
        //,multiple: true
        , accept: 'file'
        , bindAction: '#test9'
        , beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        }
        , done: function (rsp) {
            if (rsp.code == 202) {
                let data = rsp.results;
                let string = '';
                data.forEach(item => {
                    string = item + ',' + string;
                });
                layer.alert(string + '编码没有维护!');
            } else {
                layer.msg('上传成功！', { time: 3000, icon: 1 });
                getBomList();
            }

        }
        , error: function () {
            layer.msg('上传失败！', { time: 3000, icon: 5 });
        }
    });

})

// 获取 国家 数据
getTranslate();
function getTranslate() {
    AjaxClient.get({
        url: URLS['translate'].get + "?" + _token,
        dataType: 'json',
        fail: function (res) {
            let datas = res.results;
            for (let i = 0; i < datas.length; i++) {
                if(datas[i].name != '中文') {
                     let option = `
                        <option value="${datas[i].code}" >${datas[i].name}</option>
                    `;
                    $('#list').append(option);
                }
            }
        }
    }, this)
}


// 导出
$('#printOut').on('click', function() {
    var string = '';
	if ( $('#start_time').val() == '' || $('#bom_process_id').val() == '' || $('#end_time').val() == '' ) {
        layer.msg('请先按时间和工序进行搜索，再导出！', { time: 3000, icon: 5 });
    } else {
        // var data = JSON.parse(window.localStorage.getItem('bomlist'));
        
        if($('#list').val() == '') {
            layer.msg('请选择语言再导出！', { time: 3000, icon: 5 });
        } else {
            //  for(let i=0; i<data.length; i++) {
            //      string = string + data[i].release_version_bom_id + ',' ;
            // }
            
            $('#printOuta').attr('href', '/Language/exportSpecial?_token=8b5491b17a70e24107c89f37b1036078' +'&languageCode=' + $('#list').val()
				+ '&operation_id=' + $('#bom_process_id').val() + '&begin_time=' + $('#start_time').val() + '&end_time=' + $('#end_time').val() );
        }
    }
})

//点击导出按钮
$('body').on('click', '.el-form-item-div #exportBtn', function (e) {
    e.stopPropagation();

    var parentForm = $(this).parents('#searchForm');
    var operationId = parentForm.find('#bom_process_id').val().trim(),
        begin_time = parentForm.find('#start_time').val(),
        end_time = parentForm.find('#end_time').val();

    if (!operationId) {
        layer.msg('请选择工序！', { time: 3000, icon: 5 });
        return;
    }

    if (!begin_time) {
        layer.msg('请选择开始时间！', { time: 3000, icon: 5 });
        return;
    }

    if (!end_time) {
        layer.msg('请选择结束时间！', { time: 3000, icon: 5 });
        return;
    }

    var urlLeft = '';
    var ajaxData = {
        token: '8b5491b17a70e24107c89f37b1036078',
        operation_id: operationId,
        begin_time: begin_time,
        end_time: end_time
    };
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`
    }
    let url = "/BomRouting/exportByOperationId?" + urlLeft;
    $('#exportExcel').attr('href', url)
})

function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}

