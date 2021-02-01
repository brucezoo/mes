var layerModal,ajaxData={},pageNo=1,material_arr=[],
    pageSize=20,layerLoading;
$(function () {
    laydate.render({
        elem: "#time",
        type: 'datetime',
        done: function(value, date, endDate){
        }
    });

    $('#employee').autocomplete({
        url: URLS['picking'].judge_person+"?"+_token+"&page_no=1&page_size=10",
        param:'name'
    });
    $('#employee').val('张晓祥').data('inputItem', {
        id: 43,
        name: '张晓祥'
    }).blur();

    $('#storage_wo').autocomplete({
        url: URLS['picking'].storageSelete+"?"+_token+"&is_line_depot=1",
        param:'depot_name'
    });
    $('#storage_wo').val('第一工厂裁剪车间（1102 ）').data('inputItem', {
        id: 22,
        code: '1102',
        name: '第一工厂裁剪车间',
        depot_name: '第一工厂裁剪车间'
    }).blur();
    $('#RankPlan').autocomplete({
        url: URLS['picking'].RankPlan+"?"+_token+"&page_no=1&page_size=10",
        param:'name',
        showCode:"name"

    });
    $('#workbench_code').autocomplete({
        url: URLS["picking"].benchList+"?"+_token+"&page_no=1&page_size=10",
        param:"name",
        showCode:"workbench_name"
    });

    getDeplants();
    getRankPlan();
    bindEvent();

});

function bindEvent() {

    $('body').on('click','.add_materials',function (e) {
        e.stopPropagation();
        showModal()

    });
    //排序
    $('.sort-caret').on('click',function(e){
        e.stopPropagation();
        $('.el-sort').removeClass('ascending descending');
        if($(this).hasClass('ascending')){
            $(this).parents('.el-sort').addClass('ascending')
        }else{
            $(this).parents('.el-sort').addClass('descending')
        }
        $(this).attr('data-key');
        ajaxData.order=$(this).attr('data-sort');
        ajaxData.sort=$(this).attr('data-key');
        getMateriel();
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
        var id = $(this).attr('data-id');
        if($(this).hasClass('plant')){
            getWorkShop(id);
        };
        if($(this).hasClass('shop')){
            getWorkCenter(id);
        };
        if($(this).hasClass('center')){
            getWorkBench(id);
        };
    });
    //搜索物料属性
    $('body').on('click','#searchForm .search:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            // $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo=1;
            ajaxData={
                item_no: encodeURIComponent(parentForm.find('#item_no').val().trim()),
                name: encodeURIComponent(parentForm.find('#name').val().trim()),
                creator_name: encodeURIComponent(parentForm.find('#creator_name').val().trim()),
                material_category_id: parentForm.find('#material_category_id').val(),
                template_id: parentForm.find('#template_id').val(),
                order: 'desc',
                sort: 'id'
            }
            getMateriel();
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
        parentForm.find('#item_no').val('');
        parentForm.find('#name').val('');
        parentForm.find('#creator_name').val('');
        parentForm.find('#material_category_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#template_id').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getMateriel();
    });
    $('body').on('click','.el-checkbox_input_item',function(e){
        $(this).toggleClass('is-checked');
        var trData=$(this).parent().parent().data("trData")
        if($(this).hasClass('is-checked')){
            if(material_arr.indexOf(trData)==-1){
                material_arr.push(trData);
            }
        }else{
            var index=material_arr.indexOf(trData);
            material_arr.splice(index,1);
        }
    });
    // $('body').on('click','#check_input_all',function(e){
    //     $(this).toggleClass('is-checked');
    //     if($(this).hasClass('is-checked')){
    //         $('#table_attr_table .table_tbody .tritem').each(function (k,v) {
    //
    //             $(this).find('.el-checkbox_input_item').addClass('is-checked');
    //             mr_arr.push($(v).attr('data-id'));
    //         });
    //
    //     }else{
    //         $('#work_order_table .table_tbody tr').each(function (k,v) {
    //             $(this).find('.el-checkbox_input_item').removeClass('is-checked');
    //             mr_arr.push($(v).attr('data-id'));
    //         });
    //         mr_arr=[];
    //     }
    // });

    $('body').on('click','.submit',function (e) {
        e.stopPropagation();
        layer.close(layerModal);
        var num = material_arr.length;
        $("#show_num").show();
        $("#show_num").text(num+'条');
        getBomUnit()
    });
    $('body').on('click','.save',function (e) {
        e.stopPropagation();
        var $storage_wo=$('#storage_wo');
        var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').depot_name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').id:'';

        var $employee=$('#employee');
        var employee=$employee.data('inputItem')==undefined||$employee.data('inputItem')==''?'':
            $employee.data('inputItem').name==$employee.val().replace(/\（.*?）/g,"").trim()?$employee.data('inputItem').id:'';

        var plant = $("#plant_id").val();
        var depot = $("#depot").val();
        var workbench_id = $("#workbench_code").val();
        var RankPlan = $("#RankPlan").val();
        var time = $("#time").val();
        if(plant==''){
            LayerConfig('fail','请填写厂区！')
        }
        // else if(workbench_id==''){
        //     LayerConfig('fail','请填写工位！')
        // }else if(RankPlan==''){
        //     LayerConfig('fail','请填写班次！')
        // }
        else if(storage_wo==''){
            LayerConfig('fail','请填写线边仓！')
        }
        else if(time==''){
            LayerConfig('fail','请填计划时间！')
        }else if(employee==''){
            LayerConfig('fail','请填写责任人！')
        }else {
            submitPicking({
                factory_id:plant,
                workbench_id:workbench_id,
                depot_code:depot,
                rank_plan_type_id:RankPlan,
                line_depot_id:storage_wo,
                plan_time:time,
                employee_id:employee,
                _token:TOKEN
            })
        }

    });
    $('body').on('click','.table-bordered .delete',function () {
        var that = $(this);
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            var trData=$(this).parent().data("trData")
            var index=material_arr.indexOf(trData);
            material_arr.splice(index,1);
            that.parents().parents().eq(0).remove();
        });
    });
    $('body').on('click','.table-bordered .copy',function () {
        var that = $(this);
        layer.confirm('您将执行复制操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            var tr = `<tr class="tritem" data-id="${that.attr('data-id')}">${that.parent().parent().eq(0).html()}</tr>`
            that.parent().parent().eq(0).after(tr);
            that.parent().parent().eq(0).next().data('trData',that.parent().parent().eq(0).data('trData'));
        });
    });

    $('body').on('click','.print',function (e) {
        e.stopPropagation();
        var $storage_wo=$('#storage_wo');
        var storage_wo=$storage_wo.data('inputItem')==undefined||$storage_wo.data('inputItem')==''?'':
            $storage_wo.data('inputItem').depot_name==$storage_wo.val().replace(/\（.*?）/g,"").trim()?$storage_wo.data('inputItem').depot_name:'';

        var $employee=$('#employee');
        var employee=$employee.data('inputItem')==undefined||$employee.data('inputItem')==''?'':
            $employee.data('inputItem').name==$employee.val().replace(/\（.*?）/g,"").trim()?$employee.data('inputItem').name:'';

        var plant = $("#plant_id").val();
        var depot = $("#depot").val();
        var workbench_id = $("#workbench_code").val();
        var RankPlan = $("#RankPlan").val();
        var time = $("#time").val();
        var data = {
                factory_id:plant,
                bench_no:workbench_id,
                send_depot:depot,
                rank_plan_type_id:RankPlan,
                line_depot_name:storage_wo,
                dispatch_time:time,
                employee_name:employee,
            };
        var arr = [];
        $('.storage_table .t-body tr').each(function (k,v) {
            if($(v).find('.unit_id').val()==''){
                LayerConfig('fail',$(v).data('trData').item_no+'物料，请填写单位！');
                flag = false;
                return false;
            }else if($(v).find('.real_qty').val()==''){
                LayerConfig('fail',$(v).data('trData').item_no+'物料，请填写数量！');
                flag = false;
                return false;
            }else {
                arr.push({
                    material_id:$(v).data('trData').material_id,
                    material_code:$(v).data('trData').item_no,
                    material_name:$(v).data('trData').name,
                    old_material_code:$(v).data('trData').old_code?$(v).data('trData').old_code:'',
                    demand_qty:$(v).find('.real_qty').val(),
                    demand_unit:$(v).find('.unit_id').siblings(".el-input").val(),
                })
            }
        });
        data.materials=arr;
        showPrintList(data);
        $("#print_list").show();
        $("#print_list").print();
        $("#print_list").hide();

    })
}
function showPrintList(formDate) {
    var materialsArr = [];
    var type_string = '领料';
    if (formDate.materials.length > 0) {
        materialsArr = formDate.materials;
        var newObj = {
            one:[],
            two:[],
            three:[]
        };
        materialsArr.forEach(function (item) {
            if(item.material_code.substr(0,4)=="6105" || item.material_code.substr(0,2)=="99"){
                newObj.one.push(item);
            }else if(item.material_code.substr(0,4)=="6113"){
                newObj.two.push(item)
            }else {
                newObj.three.push(item)
            }
        })
        var plan_start_time = formatTime(new Date()),
            employee_name = formDate.employee_name,
            send_depot = formDate.send_depot,
            line_depot_name = formDate.line_depot_name,
            product_order_code = '',
            workbench_name = formDate.bench_no,
            sales_order_code = '',
            sales_order_project_code = '',
            dispatch_time = formDate.dispatch_time,
            code = '';
        var tootle = Math.ceil(newObj.one.length / 3)+Math.ceil(newObj.two.length / 3)+Math.ceil(newObj.three.length / 3);
        var index = 1;
        for(var j in newObj){
            for (var i = 0; i < newObj[j].length;i = i + 3){
            var _table = `<table style="table-layout：fixed" class="show_border">
                        <thead>
                            <tr>
                                <th style="height: 30px;width:100px;">物料编码</th>
                                <th style="width:100px;">浪潮编码</th>
                                <th  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">物料名称</th>
                                <th>SAP需求数量</th>
                                <th>需求数量</th>
                                <th>BOM数量</th>
                                <th >备注</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="height: 30px; width:80px;word-wrap:break-word;word-break:break-all;" >${newObj[j][i].material_code}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].old_material_code}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i].material_name}</td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;"></td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;"></td>
                                <td style="width:60px;word-wrap:break-word;word-break:break-all;">${newObj[j][i].demand_qty}${tansferNull(newObj[j][i].demand_unit)}</td>
                                <td ></td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 1] ? newObj[j][i + 1].old_material_code : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 1] ? newObj[j][i + 1].material_name : ''}</td>
                                <td ></td>
                                <td ></td>
                                <td >${newObj[j][i + 1] ? newObj[j][i + 1].demand_qty+tansferNull(newObj[j][i + 1].demand_unit) : ''}</td>
                                <td ></td> 
                            </tr>
                            <tr>
                                <td style="height: 30px;width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].material_code : ''}</td>
                                <td  style="width:80px;word-wrap:break-word;word-break:break-all;">${newObj[j][i + 2] ? newObj[j][i + 2].old_material_code : ''}</td>
                                <td  style="width:300px;word-wrap:break-word;word-break:break-all;font-size: 7px;">${newObj[j][i + 2] ? newObj[j][i + 2].material_name : ''}</td>
                                <td ></td>
                                <td ></td>
                                <td >${newObj[j][i + 2] ? newObj[j][i + 2].demand_qty+tansferNull(newObj[j][i + 2].demand_unit) : ''}</td>
                                <td ></td> 
                            </tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
                            <tr><td  style="height: 30px;"></td><td ></td><td ></td><td ></td><td ></td><td ></td><td ></td></tr>
   
                        </tbody>
                      </table>`
            var print_html = `<div style="page-break-after: always;">
                                <div style="display: flex;">
                                    <div style="flex: 1"></div>
                                    <div style="flex: 9"><h3 style="text-align: center;">梦百合家居科技股份有限公司${type_string}单</h3></div>
                                    <div style="flex: 1">
                                        <p style="margin: 0;font-size: 5px;">白联：仓</p>
                                        <p style="margin: 0;font-size: 5px;">红联：财</p>
                                        <p style="margin: 0;font-size: 5px;">黄联：车</p>
                                        <p style="margin: 0;font-size: 5px;">${index}/${tootle}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}日期:</div>
                                            <div style="flex: 2;">${plan_start_time}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">仓库:</div>
                                            <div style="flex: 2;">${send_depot}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">单据编码:</div>
                                            <div style="flex: 2;">${code}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}部门:</div>
                                            <div style="flex: 2;">${line_depot_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">${type_string}人:</div>
                                            <div style="flex: 2;">${employee_name}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">工位:</div>
                                            <div style="flex: 2;">${tansferNull(workbench_name)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">销售订单号/行项号:</div>
                                            <div style="flex: 2;">${sales_order_code}/${sales_order_project_code}</div>
                                        </div>
                                    </div>
                                   
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">生产订单号:</div>
                                            <div style="flex: 2;">${product_order_code}</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;">配送时间:</div>
                                            <div style="flex: 2;">${dispatch_time}</div>
                                        </div>
                                    </div>
                                </div>
                                ${_table}
                                <div>
                                <div style="display: flex;height:40px;">
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">发货人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">${type_string}人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex;">
                                            <div style="flex: 1;height:40px;line-height: 40px;text-align: right;">审批人:</div>
                                            <div style="flex: 2;border-bottom: solid 1px black;height:40px;"></div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                        </div>`;
            index++;
            $('#print_list').append(print_html);
        }
        }

    }

}
function getBomUnit() {
    var material_ids = [];
    material_arr.forEach(function (item) {
        material_ids.push(item.material_id)
    });
    AjaxClient.get({
        url: URLS['picking'].getMaterialUnit+"?"+_token+"&materials="+material_ids,
        dataType:'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            material_arr.forEach(function (item) {
                if(rsp.results[item.material_id].length>0){
                    item.units = rsp.results[item.material_id]
                }else {
                    item.units = [];
                }
            });
            showList($('.item_table .t-body'));
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    },this)

}
function submitPicking(data) {
    var arr = [];
    var flag = true;
    $('.storage_table .t-body tr').each(function (k,v) {
        if($(v).find('.unit_id').val()==''){
            LayerConfig('fail',$(v).data('trData').item_no+'物料，请填写单位！');
            flag = false;
            return false;
        }else if($(v).find('.real_qty').val()==''){
            LayerConfig('fail',$(v).data('trData').item_no+'物料，请填写数量！');
            flag = false;
            return false;
        }else {
            arr.push({
                material_id:$(v).data('trData').material_id,
                material_code:$(v).data('trData').item_no,
                old_material_code:$(v).data('trData').old_code,
                demand_qty:$(v).find('.real_qty').val(),
                unit_id:$(v).find('.unit_id').val(),
                custom_inspur_sale_order_code:$(v).find('.old_sale_code').val()
            })
        }
    });
    if(arr.length>0){
        data.materials=arr;
        if(flag){
            AjaxClient.post({
                url: URLS['picking'].addPicking,
                data:data,
                dataType:'json',
                beforeSend: function(){
                    layerLoading = LayerConfig('load');
                },
                success:function (rsp) {
                    layer.close(layerLoading);
                    LayerConfig('success','添加成功',function(){
                        // window.location.href = '/WorkOrder/pickingList';
                    });
                },
                fail: function(rsp){
                    layer.close(layerLoading);
                    LayerConfig('fail',rsp.message)
                }
            },this)
        }
    }else {
        LayerConfig('fail','你生成的是空单，请去选择物料！');

    }

}
function showList(ele) {
    ele.html('');
    material_arr.forEach(function (item) {
        var _li = '';
        item.units.forEach(function (uitem) {
            _li += `<li data-id="${uitem.unit_id}" class=" el-select-dropdown-item">${uitem.unit_name}</li>`
        })
        var tr=`
            <tr class="tritem" data-id="${item.material_id}">
                <td>${item.item_no}</td>
                <td>${tansferNull(item.old_code)}</td>
                <td>
                    <input type="text" class="old_sale_code">
                </td>
                <td>${item.name}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${tansferNull(item.material_category_name)}</td>
                <td>${tansferNull(item.template_name)}</td>
                <td>${item.ctime}</td> 
                <td>${item.mtime}</td>
                <td>
                    <input type="number" style="line-height: 40px;" min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  class="el-input real_qty">
                </td>
                <td><div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select check_status">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id unit_id" value="">
                                            </div>
                                            <div class="el-select-dropdown" style="display: none;">
                                                <ul class="el-select-dropdown-list">
                                                    ${_li}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div></td>
                <td><i class="fa fa-copy copy" title="复制" data-id="" style="font-size: 2em;"></i></td>
                <td><i class="fa fa-trash oper_icon delete" title="删除" data-id="" style="font-size: 2em;"></i></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    })
}

function showModal(){
    var wwidth = $(window).width() - 80,
        wheight = $(window).height() - 80,
        mwidth = wwidth + 'px',
        mheight = wheight + 'px';
    layerModal = layer.open({
        type: 1,
        title: '物料列表',
        offset: '40px',
        area: [mwidth, mheight],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="addMGroup formModal formMateriel" autocomplete="off" id="addMCategory_from">
          <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
          <div class="el-item">
            <div class="el-item-show">
                <div class="el-item-align">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">物料编码</label>
                            <input type="text" id="item_no" class="el-input" placeholder="请输入物料编码" value="">
                        </div>
                    </div>
                  <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: 100px;">名称</label>
                        <input type="text" id="name" class="el-input" placeholder="请输入名称" value="">
                    </div>
                  </div>
                </div>
                <ul class="el-item-hide">
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">创建人</label>
                                <input type="text" id="creator_name" class="el-input" placeholder="请输入创建人" value="">
                            </div>
                        </div>
                        <div class="el-form-item template">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料模板</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="template_id" value="">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item category" style="width: 100%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料分类</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="material_category_id" value="">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                    <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                    <button type="button" class="el-button el-button--primary search">搜索</button>
                    <button type="button" class="el-button reset">重置</button>
                </div>
            </div>
          </div>
        </form>
    </div>
    <div class="table_page">
        <div class="wrap_table_div">
            <table id="table_attr_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th>
                            
                        </th>
                        <th>
                            <div class="el-sort">
                                物料编码
                                <span class="caret-wrapper">
                                    <i data-key="item_no" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="item_no" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                浪潮物料编码
                            </div>
                        </th>
                        <th>
                            名称
                        </th>
                        <th>
                            创建人
                        </th>
                        <th>
                            <div class="el-sort">
                                物料分类
                                <span class="caret-wrapper">
                                    <i data-key="category_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="category_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                物料模板
                                <span class="caret-wrapper">
                                    <i data-key="template_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="template_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                创建时间
                                <span class="caret-wrapper">
                                    <i data-key="ctime" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="ctime" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                修改时间
                                <span class="caret-wrapper">
                                    <i data-key="mtime" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="mtime" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody class="table_tbody"></tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation bottom-page"></div>
    </div>
    <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary ma-item-ok submit" >确定</button>
            </div>
          </div> 
        </form>`,
        success: function (layero, index) {
            getLayerSelectPosition($(layero));
            resetParam();
            getSearch();
            getMateriel();

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

        },
        end: function () {
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}

//生成下拉框数据
function selectHtmlModal(fileData,parent_id,flag){
    var innerhtml,selectVal,parent_id;
    var lis=selecttreeHtml(fileData,parent_id);
    innerhtml=`<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
        <input type="hidden" class="val_id" id="${flag=='category'?'material_category_id':'template_id'}" value="">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
            ${lis}
        </ul>
    </div>`;
    itemSelect=[];
    return innerhtml;
}
//获取物料模板列表
function getMaterielTemplateTree(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['template'].treeList+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
//获取物料分类列表
function getCategories(){
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['category'].selectList+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            dtd.reject(rsp);
        }
    },this);
    return dtd;
}
//重置搜索参数
function resetParam(){
    ajaxData={
        item_no: '',
        name: '',
        creator_name: '',
        template_id: '',
        material_category_id: 90,
        order: 'desc',
        sort: 'id'
    };
}
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
            getMateriel();
        }
    });
}
function getSearch(){
    $.when(getCategories(),getMaterielTemplateTree())
        .done(function(categoryrsp,templatersp){
            var categorylis='',templatelis='';
            if(categoryrsp&&categoryrsp.results&&categoryrsp.results.length){
                categorylis=selectHtmlModal(categoryrsp.results,categoryrsp.results[0].parent_id,'category');
                $('.el-form-item.category').find('.el-select-dropdown-wrap').html(categorylis);
            }
            if(templatersp&&templatersp.results&&templatersp.results.length){
                templatelis=selectHtmlModal(templatersp.results,templatersp.results[0].parent_id,'template');
                $('.el-form-item.template').find('.el-select-dropdown-wrap').html(templatelis);
            }
        }).fail(function(unitrsp,dataTypersp){
        console.log('获取物料分类或物料模板失败');
    }).always(function(){
        layer.close(layerLoading);
    });
}
//获取物料列表
function getMateriel(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['picking'].list+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
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
            noData('获取物料列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}
//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var flag = false;
        material_arr.forEach(function (mitem) {
            if(item.material_id==mitem.material_id){
                flag=true;
            }
        })
        var tr=`
            <tr class="tritem" data-id="${item.material_id}">
                <td>
                    <span class="el-checkbox_input el-checkbox_input_item ${flag?"is-checked":""}">
                        <span class="el-checkbox-outset"></span>
                    </span>
                </td>
                <td>${item.item_no}</td>
                <td>${tansferNull(item.old_code)}</td>
                <td>${item.name}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${tansferNull(item.material_category_name)}</td>
                <td>${tansferNull(item.template_name)}</td>
                <td>${item.ctime}</td> 
                <td>${item.mtime}</td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

//获取厂区列表
function getDeplants(){
    var urlLeft='&sort=id&order=asc';

    urlLeft+="&page_no="+1+"&page_size="+20;
    AjaxClient.get({
        url: URLS['picking'].plants+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var html=selectHtml(rsp.results);
            $('.el-form-item.plant .divwrap').html(html);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取厂区列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//生成厂区列表
function selectHtml(fileData){
    var innerhtml,lis='',selectName='',selectId='';
    fileData.forEach(function(item){
        lis+=`<li data-id="${item.id}" class=" el-select-dropdown-item plant">${item.name}</li>`;
    });
    innerhtml=`<div class="el-select-dropdown-wrap">
                    <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" readonly value="--请选择--" style="width:100%">
                        <input type="hidden" class="val_id" id="plant_id" value="">
                    </div>
                    <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                            <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                            ${lis}
                        </ul>
                    </div>
               </div>`;
    return innerhtml;
}
//获取车间列表
function getWorkShop(id){
    AjaxClient.get({
        url: URLS['picking'].shop+_token+"&factory_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var html=selectWorkShopHtml(rsp.results);
            $('.el-form-item.workshop .divwrap').html(html);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取车间列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//生成车间列表
function selectWorkShopHtml(fileData){
    var innerhtml,lis='',selectName='',selectId='';
    fileData.forEach(function(item){
        lis+=`<li data-id="${item.id}" class=" el-select-dropdown-item shop">${item.name}</li>`;
    });
    innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" readonly value="--请选择--" style="width:100%">
            <input type="hidden" class="val_id" id="shop_id" value="">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div></div>`;
    return innerhtml;
}
//获取工作中心列表
function getWorkCenter(id){
    AjaxClient.get({
        url: URLS['picking'].center+_token+"&workshop_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var html=selectWorkCenterHtml(rsp.results);
            $('.el-form-item.workcenter .divwrap').html(html);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取工作中心列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//生成工作中心列表
function selectWorkCenterHtml(fileData){
    var innerhtml,lis='',selectName='',selectId='';
    fileData.forEach(function(item){
        lis+=`<li data-id="${item.id}" class=" el-select-dropdown-item center">${item.name}</li>`;
    });
    innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" readonly value="--请选择--" style="width:100%">
            <input type="hidden" class="val_id" id="center_id" value="">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div></div>`;
    return innerhtml;
}
//获取工位列表
function getWorkBench(id){
    AjaxClient.get({
        url: URLS['picking'].bench+_token+"&workcenter_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var html=selectWorkBenchHtml(rsp.results);
            $('.el-form-item.workbench .divwrap').html(html);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取工位列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//生成工位列表
function selectWorkBenchHtml(fileData){
    var innerhtml,lis='',selectName='',selectId='';
    fileData.forEach(function(item){
        lis+=`<li data-id="${item.id}" class=" el-select-dropdown-item bench">${item.name}</li>`;
    });
    innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" readonly value="--请选择--" style="width:100%">
            <input type="hidden" class="val_id" id="workbench_code" value="">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div></div>`;
    return innerhtml;
}
//获取班次列表
function getRankPlan(){
    AjaxClient.get({
        url: URLS['picking'].rankPlan+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var html=selectRankPlanHtml(rsp.results);
            $('.el-form-item.RankPlan .divwrap').html(html);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取班次列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}
//生成班次列表
function selectRankPlanHtml(fileData){
    var innerhtml,lis='',selectName='',selectId='';
    fileData.forEach(function(item){
        lis+=`<li data-id="${item.id}" class=" el-select-dropdown-item RankPlan">${item.name}（${item.code}）</li>`;
    });
    innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" readonly value="--请选择--" style="width:100%">
            <input type="hidden" class="val_id" id="RankPlan" value="">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div></div>`;
    return innerhtml;
}


