var wo_number,work_order_id,in_flag=1,out_flag=1,id=0,edit='',production_order_id=0,operation_order_id=0,scrollTop=0;
var print_str='',print_str_qrcode='',line_depot_id,line_depot_code,depot_name,out_line_depot_id,out_line_depot_code,out_depot_name;
var new_in_material = [];
var item_no = [];
var array_arr = [];
var in_material={};
var out_material={},
    sales_order_code,
    sales_order_project_code ,
    routing_node_id ,
    po_number,
    factory_id,
    pageNo=1,
    pageSize=50,
    pageNoItem=1,
    pageSizeItem=50,
	depot_id;
var workId = '', brenchId='';
var isChecked = [];
var flag = 0;
var changeRea = '';
var gys_is_checked = [];
$(function () {
	document.getElementById('chioce').checked = false;
    id = getQueryString('id');
    edit = getQueryString('type');
    if(id==null){
        $('#work_order_form').focus();
        $('#start_time').val(getCurrentDateZore);
        $('#end_time').val(getCurrentTime);
        $('#start_time_input').text(getCurrentDateZore);
        $('#end_time_input').text(getCurrentTime);
        $('.total_consume_qty').show();
		layui.use(['laydate'], function () {
			var form = layui.form
				, layer = layui.layer
				, layedit = layui.layedit
				, laydate = layui.laydate; 
			laydate.render({
				elem: '#BUDAT'
				,min: -5 //7天前
				,max: 5 //7天后
				,value: getCurrentDateNow()
				,done: function (value) {
				}
			});
		});

    }else {
        $('.total_consume_qty').hide();
        getBusteWorkForm(id);
    }
    bindEvent();
});

// 自动带出原因
function reason(m_id, i_id, id, yb_id) {
	let shopId = window.sessionStorage.getItem('work');
	let yb_str = [];
	if(yb_id != '' && yb_id != undefined) {
		console.log(yb_id);
		yb_str = yb_id.split(",");
	}

			let data = JSON.parse(changeRea);
			var _eles = $("#material" + m_id + i_id);
	console.log($("#material" + m_id + i_id).val(), $("#material" + m_id + i_id).text());
			for(let i=0; i<isChecked.length; i++) {
				if(isChecked[i].id == id) {
					var is_checked = isChecked[i].ids;
				}
			}
			data.forEach(function (item) {

				// 预报工  带出的原因
				if(yb_str.length != 0) {
					if (yb_str.includes(String(item.preselection_id))) {
						console.log(_eles.text());
						_eles.append(`<span class="cause_item">
									<div style="display: inline-block">${item.preselection_name}-${item.preselection_code}</div>
								</span>`);
						_eles.find('.cause_item:last-child').data("spanData", item);
					}
				}



				if (is_checked.includes(String(item.preselection_id))) {
					_eles.append(`<span class="cause_item">
									<div style="display: inline-block">${item.preselection_name}-${item.preselection_code}</div>
								</span>`);
					_eles.find('.cause_item:last-child').data("spanData", item);
				}


				if ($('.isFlag').hasClass('is3002') == true) {
					if (item.preselection_id == 41) {
						_eles.append(`<span class="cause_item">
									<div style="display: inline-block">${item.preselection_name}-${item.preselection_code}</div>
								</span>`);
						_eles.find('.cause_item:last-child').data("spanData", item);
					}
				}

			})
}

// 清除原因
$('body').on('click', '.clear', function () {
	var _ele = $("#material" + $(this).attr('data-id') + $(this).attr('data-ids'));
	console.log(_ele);
	layer.confirm('确定清除所有差异原因吗!', {
		btn: ['确定',] //按钮
	}, function (index) {
		layer.close(index);
		_ele.html('');
		flag = 1;
		layer.msg('清除成功！', { time: 3000, icon: 1 });
	}, function () {

	});

})


//  选择负责人

function getOpt() {

	$('body').on('change', '#chioce', function () {
		if (document.getElementById('chioce').checked == true) {
			let data = JSON.parse(window.sessionStorage.getItem('workId'));
			$('#sel').css('display','block');
			$('#sels').css('display','none');
			// if(data != null) {
				for (let i = 0; i < data.length; i++) {
					let str = `
							<option value="${data[i].emplyee_id}">${data[i].emplyee_name}</option>
						`;
					$('#selects').append(str);
				}
			// }
			
			layui.use(['laydate', 'form', 'layedit'], function () {
				var form = layui.form
					, layer = layui.layer
					, layedit = layui.layedit
					, laydate = layui.laydate;
				form.render();
			})
		
		} else {
			$('#sels').css('display', 'block');
			$('#sel').css('display', 'none');
		}

	
		
	})
	
}

function chioces() {
			AjaxClient.get({
				url: '/WorkDeclareOrder/getWorkShopEmployee' + "?" + _token + "&workshop_id=" + workId,
				dataType: 'json',
				success: function (rsp) {
					if(rsp.code == 200) {	
						window.sessionStorage.setItem('workId',JSON.stringify(rsp.results) );
					}
				},
				fail: function (rsp) {
					console.log(rsp);
				}
			}, this);
		
}


//获取bom分组
function getEmployee(id,employee_id) {
    AjaxClient.get({
        url: URLS['work'].select + "?" + _token + "&workbench_id=" + id,
        dataType: 'json',
        success: function (rsp) {
			window.sessionStorage.setItem('brenchId', JSON.stringify(rsp.results));
			if(document.getElementById('chioce').checked == false) {
				$('#sels').css('display', 'block');
				$('#sel').css('display', 'none');
				let data = JSON.parse(window.sessionStorage.getItem('brenchId'));
				$('#select').html('');
				for (let i = 0; i < data.length; i++) {
					let str = `
						<option value="${data[i].emplyee_id}">${data[i].emplyee_name}</option>
					`;
					$('#select').append(str);
				}
				
				getOpt();
				layui.use(['laydate', 'form', 'layedit'], function () {
					var form = layui.form
						, layer = layui.layer
						, layedit = layui.layedit
						, laydate = layui.laydate;
					form.render();
				})
			}
            if (rsp.results && rsp.results.length) {
                BOMGroup = rsp.results;
                var lis = '', innerhtml = '';
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.emplyee_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.emplyee_name}</li>`;
                });
                innerhtml = `
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.employee').find('.el-select-dropdown-list').html(innerhtml);
            }
            if(employee_id){
                $('.el-select-dropdown-item[data-id='+employee_id+']').click();
                $('.update').show();
            }
        },
        fail: function (rsp) {
            console.log('获取物料清单分组失败');
        }
    }, this);
}
function gitArr() {
    var arr = $('#work_order_form').val();
    wo_number = arr.substr(arr.indexOf('WO'),15);
    $('#JsBarcode').JsBarcode(wo_number);
    return wo_number

}
function getSearch(){
    $.when(gitArr())
        .done(function(gitArr){
            if(gitArr){
                getWorkOrderform(wo_number)

            }
        }).fail(function(gitArr){
    }).always(function(){
    });
}

function getBusteWorkForm(id) {
    AjaxClient.get({
        url: URLS['work'].show+"?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
			console.log(rsp);
            layer.close(layerLoading);
            work_order_id = rsp.results[0].workOrder_id;
            production_order_id = rsp.results[0].production_id;
            operation_order_id = rsp.results[0].operation_id;
            routing_node_id = rsp.results[0].routing_node_id;
            line_depot_id=rsp.results[0].line_depot_id;
            getEmployee(rsp.results[0].workOrder_shift_id,rsp.results[0].employee_id)
            $('#work_order_form').attr("readonly","readonly");
            $('.storage').hide();
            if(rsp.results[0].type==1){
                $('#work_order_form').hide()
            }
            if(rsp.results[0].status==2){
                $('.submit').hide();
                $('.submit_SAP').hide();
                $('.print').show();
            }
            if(rsp.results[0].status==1){
                $('.submit').hide();
                $('.submit_SAP').show();
            }
            var arr = [];
            if(rsp.results[0].is_teco==1){
                $('#is_teco').addClass('is-checked')
            }
            rsp.results[0].out_materials.forEach(function (item) {
                arr.push({
                    "CHARG":item.lot,
                    "BATHN":item.GMNGA
                })
            });
            if(rsp.results[0].sales_order_code==''){
                print_str_qrcode = {
                    "HEADER":{
                        "SURNO":rsp.results[0].code,
                        "SURST":"01",
                        "CDAT":rsp.results[0].ctime.substr(0,10),
                        "WERKS":rsp.results[0].planfactory_code,
                        "INTYP":"E"
                    },
                    "LINE":{
                        "PNO":rsp.results[0].production_number,
                        "PLN":"",
                        "LGORT":rsp.results[0].plan_LGPRO,
                        "BISMT":rsp.results[0].inspur_material_code,
                        "LCORD":rsp.results[0].inspur_sales_order_code,
                        "MATNR":rsp.results[0].out_materials[0].material_item_no,
                        "PLNTN":rsp.results[0].out_materials[0].GMNGA,
                        "MEINS":rsp.results[0].out_materials[0].commercial,
                        "BATLS":arr,
                    }
                };
                print_str = "生产单号："+rsp.results[0].production_number
                    + "</br> 物料号：" + rsp.results[0].out_materials[0].material_item_no
                    + "</br> 物料名称：" + rsp.results[0].out_materials[0].material_name
                    + "</br>批次号：" + rsp.results[0].out_materials[0].lot
                    + "</br>完工时间：" + rsp.results[0].end_time.substr(0,11)
                    + "</br> 数量：" + rsp.results[0].out_materials[0].GMNGA+"（"+rsp.results[0].out_materials[0].commercial+"）"
                    + "</br> 工厂：" + rsp.results[0].planfactory_code
                    + "</br> 地点：" + rsp.results[0].plan_LGPRO
                    + "</br> 下道委外加工商：" + rsp.results[0].NEXT_LIFNR
                    + "</br> 浪潮物料号：" + tansferNull(rsp.results[0].inspur_material_code)
                    + "</br> 浪潮销售订单号：" + tansferNull(rsp.results[0].inspur_sales_order_code)
                    + "</br> 报工单号：" + tansferNull(rsp.results[0].code);

            }else {
                print_str_qrcode = {
                    "HEADER":{
                        "SURNO":rsp.results[0].code,
                        "SURST":"01",
                        "CDAT":rsp.results[0].ctime.substr(0,10),
                        "WERKS":rsp.results[0].planfactory_code,
                        "INTYP":"E"
                    },
                    "LINE":{
                        "PNO":rsp.results[0].production_number,
                        "PLN":"",
                        "LGORT":rsp.results[0].plan_LGPRO,
                        "inspur_material_code":rsp.results[0].inspur_material_code,
                        "inspur_sales_order_code":rsp.results[0].inspur_sales_order_code,
                        "MATNR":rsp.results[0].out_materials[0].material_item_no,
                        "PLNTN":rsp.results[0].out_materials[0].GMNGA,
                        "KDAUF":rsp.results[0].sales_order_code,
                        "KDPOS":rsp.results[0].sales_order_project_code,
                        "MEINS":rsp.results[0].out_materials[0].commercial,
                        "BATLS":arr,
                    }
                };
                print_str = "销售订单号："+rsp.results[0].sales_order_code
                    + "</br>销售行项号："+rsp.results[0].sales_order_project_code
                    + "</br>生产单号："+rsp.results[0].production_number
                    + "</br> 物料号：" + rsp.results[0].out_materials[0].material_item_no
                    + "</br> 物料名称：" + rsp.results[0].out_materials[0].material_name
                    + "</br>批次号：" + rsp.results[0].out_materials[0].lot
                    + "</br>完工时间：" + rsp.results[0].end_time.substr(0,11)
                    + "</br> 数量：" + rsp.results[0].out_materials[0].GMNGA+"（"+rsp.results[0].out_materials[0].commercial+"）"
                    + "</br> 工厂：" + rsp.results[0].planfactory_code
                    + "</br> 地点：" + rsp.results[0].plan_LGPRO
                    + "</br> 下道委外加工商：" + rsp.results[0].NEXT_LIFNR
                    + "</br> 浪潮物料号：" + tansferNull(rsp.results[0].inspur_material_code)
                    + "</br> 浪潮销售订单号：" + tansferNull(rsp.results[0].inspur_sales_order_code)
                    + "</br> 报工单号：" + tansferNull(rsp.results[0].code);

            }

            //二维码
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                width: 255,
                height: 255,
            });

            var margin = ($("#qrcode").height() - $("#qrCodeIco").height()) / 2; //控制Logo图标的位置
            $("#qrCodeIco").css("margin", margin);
            makeCode(JSON.stringify(print_str_qrcode), qrcode);

            if(rsp.results && rsp.results.length){
                if(!rsp.results[0].plan_LGPRO){
                    var textarea = "销售订单号："+rsp.results[0].sales_order_code
                        +"\r\n生产单号：" + rsp.results[0].production_number
                        +"\r\n工单："+rsp.results[0].workOrder_number
                        +"\r\n完工时间：" + rsp.results[0].end_time.substr(0,11)
                        +"\r\n计划工厂：" + rsp.results[0].planfactory_code
                        +"\r\n批次号：" + rsp.results[0].out_materials[0].lot
                        +"\r\n数量：" + rsp.results[0].out_materials[0].GMNGA
                        +"\r\n单位：" + rsp.results[0].out_materials[0].commercial
                        +"\r\n浪潮销售订单号：" + rsp.results[0].inspur_sales_order_code
                        +"\r\n下道委外加工商：" + rsp.results[0].NEXT_LIFNR
                        +"\r\n生产仓储地点：" + rsp.results[0].plan_LGPRO;
                        +"\r\n产成品生产仓储地点未找到";
                    $('#work_order_form').val(textarea);
                }else {
                    var textarea = "销售订单号："+rsp.results[0].sales_order_code
                        +"\r\n生产单号："+rsp.results[0].production_number
                        +"\r\n工单："+rsp.results[0].workOrder_number
                        +"\r\n完工时间：" + rsp.results[0].end_time.substr(0,11)
                        +"\r\n计划工厂：" + rsp.results[0].planfactory_code
                        +"\r\n批次号：" + rsp.results[0].out_materials[0].lot
                        +"\r\n数量：" + rsp.results[0].out_materials[0].GMNGA
                        +"\r\n单位：" + rsp.results[0].out_materials[0].commercial
                        +"\r\n浪潮物料号：" + rsp.results[0].inspur_material_code
                        +"\r\n浪潮销售订单号：" + rsp.results[0].inspur_sales_order_code
                        +"\r\n下道委外加工商：" + rsp.results[0].NEXT_LIFNR
                        +"\r\n生产仓储地点：" + rsp.results[0].plan_LGPRO;
                    $('#work_order_form').val(textarea);
                }
            }
            if(rsp.results[0].start_time=='1970-01-01 08:00:00'){
                $('#start_time').val(getCurrentDateZore);
                $('#end_time').val(getCurrentTime);
                $('#start_time_input').text(getCurrentDateZore);
                $('#end_time_input').text(getCurrentTime);
            }else {
                $('#start_time').val(rsp.results[0].start_time);
                $('#end_time').val(rsp.results[0].end_time);
                $('#start_time_input').text(rsp.results[0].start_time);
                $('#end_time_input').text(rsp.results[0].end_time);
            }
            if(rsp.results[0].BUDAT){
                $("#BUDAT").val(rsp.results[0].BUDAT)
            }
            if(rsp.results[0].stands.length>0){
                var workCenterHtml=''
                rsp.results[0].stands.forEach(function (item) {
                    if(item.code =='ZPP001' || item.code=='ZPP002'){
                    }else {
                        workCenterHtml+= `<div class="work_center_item" data-id="${item.param_item_id}" data-item_id="${item.id}" data-code="${item.code}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span>${item.name}: </span> <input class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"></div>`
                    }
                });
                $('#show_workcenter').html(workCenterHtml);
                $('#show_workcenter').show();
            }
            showInItemView(rsp.results[0].in_materials,rsp.results[0].status);
            showOutItemView(rsp.results[0].out_materials,rsp.results[0].status);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','获取报工单详情失败，请刷新重试')
        }
    }, this)
}
//二维码
function makeCode(str, qrcode) {
    qrcode.makeCode(str);
}
function checkHasOverDeclare(id) {
    AjaxClient.get({
        url: URLS['work'].checkHasOverDeclare +"?"+ _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.isover==0){
                submint(id);
            }
            if(rsp.results.isover==1){
                layer.confirm('当前工单已超报，是否继续报工？', {icon: 3, title:'提示',offset: '250px',end:function(){
                }}, function(index){
                    layer.close(index);
                    submint(id);
                });
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    }, this)
}
function submint(id) {
    AjaxClient.get({
        url: URLS['work'].submitBuste +"?"+ _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.RETURNCODE==0){
                LayerConfig('success','推送成功！');
                // window.location.reload();
                window.location.href = "/Buste/busteIndex";
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    }, this)
}
function updateEmployee(employee_id) {
    AjaxClient.get({
        url: URLS['work'].updateEmployee +"?"+ _token + "&id=" + id + "&employee_id=" + employee_id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','修改成功！',function () {
                window.location.reload()
            })
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message,function () {
                window.location.reload()
            })
        }
    }, this)
}
function bindEvent() {
    $("body").on('blur','.consume_num',function (e) {
        e.stopPropagation();
        if(edit!='edit'){
            var num = $(this).val()-$(this).parent().parent().find('.beath_qty').val();
            $(this).parent().parent().find('.difference_num').val(num.toFixed(3));
        }
    });
    $("body").on('blur','.rest_num',function (e) {
      e.stopPropagation();
      if(edit!='edit'){
        if($(this).parents('tr').find('.storage').text()){
          var num = Number($(this).parents('tr').find('.storage').text())-$(this).val();
          $(this).parents('tr').find('.consume_num').val(num.toFixed(3));
          var diffNum = $(this).parents('tr').find('.consume_num').val()-$(this).parents('tr').find('.beath_qty').val();
          $(this).parent().parent().find('.difference_num').val(diffNum.toFixed(3));
        }
      }
    });
    $("body").on('blur','.beath_qty',function (e) {
        e.stopPropagation();
        if(edit!='edit'){
            var num = $(this).parent().parent().parent().find('.consume_num').val()-$(this).val()
            $(this).parent().parent().parent().find('.difference_num').val(num.toFixed(3));
        }

    });
    $('body').on('click','.update',function (e) {
        e.stopPropagation();
        var employee_id = $('#employee_id').val();
        updateEmployee(employee_id);
    })
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
        var width=$(this).width();
        var offset=$(this).offset();
        $(this).siblings('.el-select-dropdown').width(width).css({top: offset.top+33,left: offset.left});
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

    $('body').on('click','.submit_SAP',function (e) {
        e.stopPropagation();

        layer.confirm('您将执行推送操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            checkHasOverDeclare(id);
        });

    });
    $('body').on('click','.submit',function (e) {
        e.stopPropagation();
        var flag = true;
        var str = '',overStr='';
		var count = 0;
		
        if(edit=='edit'){
            editBuste();
        }else {
            item_no.forEach(function (nitem) {
                $('#show_in_material .table_tbody tr').each(function (k,v) {
                    var trDataMt = $(v).data('trDataMt');
                    if(trDataMt.item_no==nitem.item_no){
                        count += Number($(v).find('.beath_qty').val());
                    }
                });
                if(nitem.item_no!='99999999'&&nitem.SCHGT!="X"){
                    if(count.toFixed(3)*1000==0){
                        str = nitem.item_no+'物料的定额总量等于0,是否强制报工！';
                        flag=false;
                        return false;
                    }
                }
                // if(nitem.qty<=nitem.total_consume_qty){
                //   overStr = nitem.item_no+'物料的已超耗,是否强制报工！';
                //       flag=false;
                //       return false;
                // }
            });
            if(flag){
                addBuste();
            }else {
              if(str){
                layer.confirm(str, {icon: 3, title:'提示',offset: '250px',end:function(){
                  $('.uniquetable tr.active').removeClass('active');
                }}, function(index){
                    layer.close(index);
                    addBuste()
                });
              }else if(overStr){
                layer.confirm(overStr, {icon: 3, title:'提示',offset: '250px',end:function(){
                  $('.uniquetable tr.active').removeClass('active');
                }}, function(index){
                    layer.close(index);
                    addBuste()
                });
              }                
            }
        }
    });
    $(window).scroll(function() {
        scrollTop = $(document).scrollTop();
        $('.line_depot,.depot').each(function (k,v) {
            var that = $(v);
            var width=$(v).width();
            var offset=$(v).offset();
            $(v).siblings('.el-select-dropdown').width(width*3).css({top: offset.top+33-scrollTop,left: offset.left})
        })
    });

    $('body').on('click','.line_depot,.depot',function (e) {
        e.stopPropagation();
        var that = $(this);
        var width=$(this).width();
        var offset=$(this).offset();
        $(this).siblings('.el-select-dropdown').width(width*3).css({top: offset.top+33-scrollTop,left: offset.left})
    });
    $('body').on('click','.table_tbody .delete',function () {
        var that = $(this);
        layer.confirm('您将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            that.parents().parents().eq(0).remove();
        });
    });
    $('body').on('blur','#work_order_form',function (e) {
        if(edit!='edit'){
            var arr = $('#work_order_form').val();
            wo_number = arr.substr(arr.indexOf('WO'),15);
            $('#JsBarcode').JsBarcode(wo_number);
            if(wo_number){
                $('#ready_qty').show();
                getBusteList(wo_number)
            }
		}

		AjaxClient.get({
			url: '/WorkDeclareOrder/checkDeclareOrder' + "?" + _token + "&wo_number=" + wo_number,
			dataType: 'json',
			success: function (rsp) {
				
			},
			fail: function (rsp) {
				layer.confirm(rsp.message, {
					btn: ['确定',]
				}, function () {
						layer.close(layer.index);
						$('#work_order_form').val('');
						window.location.reload();
				}, function () {

				});
			}
		}, this)
    });

    //产成品实报数量失去焦点事件
    $('body').on('keyup','#show_out_material .consume_num.deal',function (e) {
        var len = $("#show_out_material .table_tbody tr").length;
        var realNumber = Number($(this).val()).toFixed(3);
        var planNumber = Number($('#show_out_material .qty').text()).toFixed(3);

        if(len==1){
            $("#show_in_material .table_tbody tr").each(function () {
				var this_qty = Number($(this).find('.qty').text());
				var newQty = ((realNumber/planNumber)*this_qty).toFixed(3);
				
				/*----------------------  调用changeNum() 小数保留一位 ---------------------*/
						// var new_Qty = changeNum(newQty);
				/*-------------------------------------------*/

                $(this).find('.beath_qty.deal').val(newQty);
                $(this).find('.consume_num.deal').val(newQty);
                $(this).find('.difference_num.deal').val(0);
            })
        }


    });
    $('#start_time').on('click', function (e) {
        e.stopPropagation();
        if(edit!='edit'){
            var that = $(this);
			var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
			layui.use(['laydate'], function () {
				var form = layui.form
					, layer = layui.layer
					, layedit = layui.layedit
					, laydate = layui.laydate; 
					start_time = laydate.render({
						elem: '#start_time_input',
						max: max,
						format:'yyyy-MM-dd HH:mm:ss',
						type: 'time',
						show: true,
						closeStop: '#start_time',
						done: function (value, date, endDate) {
							that.val(value);
						}
					});
			})
        }
    });
    $('#end_time').on('click', function (e) {
        e.stopPropagation();
        if(edit!='edit'){
            var that = $(this);
			var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
			
			layui.use(['laydate'], function () {
				var form = layui.form
					, layer = layui.layer
					, layedit = layui.layedit
					, laydate = layui.laydate; 
					end_time = laydate.render({
						elem: '#end_time_input',
						min: min,
						format:'yyyy-MM-dd HH:mm:ss',
						max: getCurrentDate(),
						type: 'time',
						show: true,
						closeStop: '#end_time',
						done: function (value, date, endDate) {
							that.val(value);
						}
					});
				})
        }
    });

    $('body').on('click','.print',function (e) {
        e.stopPropagation();
        showPrintModal()

    });
    $('body').on('click', '#printWt', function (e) {
        $("#dowPrintWt").print();
    });
    $('body').on('click','.el-checkbox_input_check',function(){
        if(edit!='edit'){
            $(this).toggleClass('is-checked');
        }
    });
    $('body').on('click','.select',function(e){
       e.stopPropagation();
       showCause($(this).attr('data-id'),$(this).attr('data-inve-id'))
    });
    $('body').on('click','#viewCause .cause_submit',function(e){
       e.stopPropagation();
       layer.close(layerModal);
       var material_id = $("#itemId").val();
       var inve_id=$("#itemId").attr('data-inve-id');
       var _ele = $("#material"+material_id+inve_id);
       _ele.html('');
       $('#practice_table .table_tbody tr').each(function (item) {
           if($(this).find('.el-checkbox_input_check').hasClass('is-checked')){
			   let itemc = $(this).data('trData');
			   _ele.append(`<span class="cause_item">
                                <div style="display: inline-block">${itemc.preselection_name}-${itemc.preselection_code}</div>
                            </span>`);
			   _ele.find('.cause_item:last-child').data("spanData", itemc);
           }
       })
    });
}
function showCause(id,inve_id) {
	var _ele = $("#material" + id + inve_id),arr_couse = [];
	
	_ele.find('.cause_item').each(function (item) {
		arr_couse.push($(this).data('spanData').preselection_id)
	});
	

    layerModal = layer.open({
        type: 1,
        title: '选择原因',
        offset: '100px',
        area: ['500px', '500px'],
        shade: 0.1,
        shadeClose: false,
        resize: true,
        content: `<form class="viewAttr formModal" id="viewCause">
                    <input type="hidden" id="itemId" data-inve-id="${inve_id}" value="${id}">
                    <div class="table_page">
                        <div class="wrap_table_div" style="overflow-y: scroll;height: 400px;">
                            <table id="practice_table" class="sticky uniquetable commontable">
                                <thead>
                                <tr>
                                    <th class="left nowrap tight">名称</th>
                                    <th class="left nowrap tight">备注</th>
                                    <th class="right nowrap tight">操作</th>
                                </tr>
                                </thead>
                                <tbody class="table_tbody"></tbody>
                            </table>
                        </div>
                    <!--    <div id="pagenationItem" class="pagenation bottom-page"></div> -->
                    </div>
                    <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button cancle">取消</button>
                        <button type="button" class="el-button el-button--primary cause_submit">确定</button>
                    </div>
                </div>
                </form>`,
        success: function (layero, index) {

            getSpecialCauseData(arr_couse)
        }
    })
}
function bindPagenationClickItem(totalData,pageSize){
    $('#pagenationItem').show();
    $('#pagenationItem').pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageNoItem,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageNoItem=api.getCurrent();
            getSpecialCauseData();
        }
    });
}
function getSpecialCauseData(arr_couse){
    $('#practice_table .table_tbody').html('');
    var urlLeft='';

    urlLeft+="&page_no="+pageNoItem+"&page_size="+pageSizeItem;
    AjaxClient.get({
        url: URLS['specialCause'].pageIndex+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            if(rsp.results && rsp.results.length){

				// mao

				let shopId = window.sessionStorage.getItem('work');
				AjaxClient.get({
					url: '/Preselection/getWorkshopPreselection' + "?" + _token + "&workshop_id=" + shopId,
					dataType: 'json',
					success: function (rsp) {
						let data = rsp.results;
						// window.sessionStorage.setItem('case', JSON.stringify(data));
			
						createHtmlItem($('#practice_table .table_tbody'), data, arr_couse)
					},
					fail: function (rsp) {

					}
				}, this)

            }else{
                noData('暂无数据',9)
            }
            if(totalData>pageSizeItem){
                bindPagenationClickItem(totalData,pageSizeItem);
            }else{
                $('#pagenationItem').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取列表失败，请刷新重试',4);
        }
    })
}
function createHtmlItem(ele,data,arr_couse) {
    data.forEach(function (item,index) {
        if(arr_couse.length>0){
			var index_arr = 0;
			

            arr_couse.forEach(function (itemc,index) {
                if(item.preselection_id == itemc){
                    var tr = ` <tr>
                    <td>${item.preselection_name}</td>
                    <td>${item.preselection_code}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check is-checked" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
                    index_arr = index+1;
                    ele.append(tr);
                    ele.find('tr:last-child').data("trData",item);
                }
            });
            // console.log(arr_couse.length-1);
            if(index_arr==0){
                var tr = ` <tr>
                    <td>${item.preselection_name}</td>
                    <td>${item.preselection_code}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data("trData",item);
            }

        }else {
			// mao
            var tr = ` <tr>
                    <td>${item.preselection_name}</td>
                    <td>${item.preselection_code}</td>
                    <td class="right">
                        <span class="el-checkbox_input el-checkbox_input_check ${ flag == 0 ?  isChecked.includes(String(item.preselection_id)) == true ? 'is-checked' : '' : ''}" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        }

    })
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
            getBusteList();
        }
    });
}

//获取列表
function getBusteList(wo_number){
	window.sessionStorage.removeItem('workId');
	window.sessionStorage.removeItem('brenchId');
    var urlLeft='';

        urlLeft+='&workOrder_number='+wo_number;

    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['work'].pageIndex+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
			layer.close(layerLoading);		
            getWorkOrderform(wo_number);
            array_arr = [];
            rsp.results.forEach(function (item) {
                item.out.forEach(function (oitem) {
                    if(array_arr.length>0){
                        var flagf = true;
                        array_arr.forEach(function (a) {
                            if(a.name==oitem.item_no){
                                flagf = false;
                                a.GMNGA = (Number(a.GMNGA)+Number(oitem.GMNGA)).toFixed(3)
                            }
                        });
                    if(flagf){
                        array_arr.push({
                            name:oitem.item_no,
                            GMNGA:oitem.GMNGA,
                            qty:oitem.qty
                        })
                    }
                    }else {
                        array_arr.push({
                            name:oitem.item_no,
                            GMNGA:oitem.GMNGA,
                            qty:oitem.qty
                        })
                    }

                })
            });
            var str = '';
            array_arr.forEach(function (item) {
                if(Number(item.qty)<=Number(item.GMNGA)){
                    str+="物料"+item.name+"已完成报工。<br/>";
                }

            });
            $("#showNumber").html(str);
            $("#showNumber").show();


            var totalData=rsp.paging.total_records;
            var _html=createHtml(rsp);
            $('.table_page').html(_html);
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation.unpro').html('');
            }
            if(rsp.results.length>0){
                uniteTdCells('work_order_table');
			}
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',12);
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
			<td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${tansferNull(item.production_order_code)}</td>
			<td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}</td>
			<td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}">${item.out[0].qty}</td>
			<td data-content="${tansferNull(item.type == 1 ? item.sub_number : item.workOrder_number)}" width="200px;">${item.out[0].name}</td>
			<td >${item.out[0].GMNGA}</td>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.ISDD + item.ISDZ)}</td>
			<td>${tansferNull(item.IEDD + item.IEDZ)}</td>
			<td>${tansferNull(formatTime(item.ctime))}</td>
			<td>${tansferNull(item.status == 1 ? '未发送' : item.status == 2 ? '报工完成' : (item.status == 3 || item.status == 4) ? 'SAP报错' : '')}</td>
			<td style="color: ${item.type == 1 ? '#00b3fb' : '#000'}">${tansferNull(item.type == 1 ? '委外报工' : '工单报工')}</td>
			<td class="right">
		    <a class="button pop-button view" href="${viewurl}?id=${item.id}&type=edit">查看</a>	         
	        </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="12" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable   table-bordered">
                <thead>
                    <tr>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">计划数量</th>
                        <th class="left nowrap tight">产出品</th>
                        <th class="left nowrap tight">产出品数量</th>
                        <th class="left nowrap tight">报工单号</th>
                        <th class="left nowrap tight">开始执行</th>
                        <th class="left nowrap tight">执行结束</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">报工类型</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro"></div>`;
    return thtml;


}
function showPrintModal() {

    layerModal = layer.open({
        type: 1,
        title: '打印',
        offset: '200px',
        area: ['500px', '400px'],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="viewAttr formModal" id="viewattr">
	
					<div style="height: 40px;text-align: right;">
						<button data-id="" type="button" class="button pop-button" id="printWt">打印</button>
					</div>
					<div id="dowPrintWt" style="width: 13cm;height: 7cm;border: 1px;">
					    <div style="display: flex;">
					        <div id="formPrintWt" style="flex: 1;">${print_str}</div>
						    <div style="flex: 2;">
							    <div id="qrcodewt" style="width:280px; height:280px;">
								    <div id="qrCodeIcowt"></div>
							    </div>
						    </div>
                        </div>		
					</div>
                </form>`,
        success: function (layero, index) {
            //二维码
            var qrcodewt = new QRCode(document.getElementById("qrcodewt"), {
                width: 280,
                height: 280,
                correctLevel : QRCode.CorrectLevel.L
            });
            makeCode(JSON.stringify(print_str_qrcode), qrcodewt);
        },
        end: function () {
            $('.out_material .item_out .table_tbody').html('');
        }

    })
}
function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}
function getCurrentDateZore() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 00:00:00';
}
function getCurrentDateNow() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day ;
}
function getCurrentTime() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate(),
        _h = curDate.getHours(),
        _m = curDate.getMinutes(),
        _s = curDate.getSeconds();
    return _year + '-' + _month + '-' + _day +' ' + _h +':' + _m +':' + _s;
}
function getCurrentDateNow() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day ;
}
function editBuste() {
    var in_materials=[],out_materials=[];
    $('#show_in_material .table_tbody tr').each(function (k,v) {
        var $itemPo=$(v).find('.depot');
        var line_depot_id=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').id:'';
        var line_depot_code=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').code:'';
        in_materials.push({

            id:$(v).attr('data-item-id'),
            material_id:$(v).attr('data-id'),
            LGFSB:$(v).attr('data-LGFSB'),
            LGPRO:$(v).attr('data-LGPRO'),
            GMNGA:$(v).find('.consume_num').val(),
            lot:$(v).find('.batch').text(),
            unit_id:$(v).find('.unit').attr('data-unit'),
            material_spec:$(v).find('.material_spec').text(),
            qty:$(v).find('.qty').text(),
            line_depot_id:line_depot_id,
            line_depot_code:line_depot_code,
            MKPF_BKTXT:$(v).find('.MKPF_BKTXT').val(),
            MSEG_ERFMG:$(v).find('.difference_num').val(),
            is_spec_stock:$(v).attr('data-spec_stock'),
        })
    });

    $('#show_out_material .table_tbody tr').each(function (k,v) {
        var $itemPo=$(v).find('.line_depot');
        var line_depot_id=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').id:'';
        var line_depot_code=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
            $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').code:'';
        out_materials.push({
            id:$(v).attr('data-item-id'),
            material_id:$(v).attr('data-id'),
            LGFSB:$(v).attr('data-LGFSB'),
            LGPRO:$(v).attr('data-LGPRO'),
            GMNGA:$(v).find('.consume_num').val(),
            unit_id:$(v).find('.unit').attr('data-unit'),
            material_spec:$(v).find('.material_spec').text(),
            qty:$(v).find('.qty').text(),
            line_depot_id:line_depot_id,
            line_depot_code:line_depot_code,
            MKPF_BKTXT:'',
            MSEG_ERFMG:'',
            is_spec_stock:$(v).attr('data-spec_stock'),
        })
    });
    var workCenter = $('#show_workcenter .work_center_item');
    var workCenterArr=[];
    workCenter.each(function (k,v) {
        workCenterArr.push({
            id:$(v).attr('data-item_id'),
            standard_item_id:$(v).attr('data-id'),
            standard_item_code:$(v).attr('data-code'),
            value:$(v).find('.workValue').val()?$(v).find('.workValue').val():'',
        })
    });

    if($('#start_time').val().length<0 || $('#end_time').val()<0){
        LayerConfig('fail','请选择报工单执行时间！');
    }else {
        var data = {
            id:id,
            work_order_id:work_order_id,
            production_order_id:production_order_id,
            operation_order_id:operation_order_id,
            start_time: $('#start_time').val(),
            end_time: $('#end_time').val(),
            in_materials:JSON.stringify(in_materials),
            out_materials:JSON.stringify(out_materials),
            stands:JSON.stringify(workCenterArr),
            _token:TOKEN
        };
        AjaxClient.post({
            url: URLS['work'].update,
            data:data,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('success','成功！');
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail',rsp.message);

            }
        }, this)
    }
}

function addBuste() {
    // var employee_id = $('#employee_id').val();
	var employee_id = '';

	if(document.getElementById('chioce').checked == false) {
		employee_id = $('#select').val();
	} else {
		employee_id = $('#selects').val();
	}
    // if(!employee_id){
    //     LayerConfig('fail','请选择责任人！');
    // }else {
    var flag=true;
		var in_materials=[],out_materials=[];
        item_no.forEach(function (nitem) {
            // $('#show_in_material .table_tbody tr').each(function (k,v) {
            //     var count = 0;
            //     var qty = 0;
            //     var mater=''
            //     var trDataMt = $(v).data('trDataMt');
            //     if(trDataMt.item_no==nitem.item_no){
            //         qty=Number($(v).find('.qty').text());
            //         count=Number($(v).find('.beath_qty').val());
            //     }
            //     // console.log('qty------------'+qty);
            //     // console.log('beath_qty------------'+count);
            //     mater=trDataMt.item_no;
            //     if(count.toFixed(3)*1000>qty.toFixed(3)*1000){
            //       LayerConfig('fail',nitem.item_no+'物料的定额总量不能大于计划数量');
            //       flag=false;
            //       return false;
            //   }
            // });
            
        });

        $('#show_in_material .table_tbody tr').each(function (k,v) {
            var trData = $(v).data('trData');
            var trDataMt = $(v).data('trDataMt');
            // if(Number($(v).find('.beath_qty').val()).toFixed(3)*1000>Number($(v).find('.storage').text()).toFixed(3)*1000){
            //     LayerConfig('fail',trDataMt.item_no+'物料的额定数量不能大于库存数量')
            //     flag=false;
            //     return false;
            // }else 
            if(Number($(v).find('.consume_num').val()).toFixed(3)*1000>Number($(v).find('.storage').text()).toFixed(3)*1000){
                LayerConfig('fail',trDataMt.item_no+'物料的消耗数量不能大于库存数量')
                flag=false;
                return false;
            }else {
                if(trDataMt.item_no!=="99999999"){
                    var _ele = $(v).find('.MKPF_BKTXT'),arr_couse = [];

                    _ele.find('span').each(function (item) {
                        arr_couse.push($(this).data('spanData').preselection_id)
                    });
                    if(($(v).find('.consume_num').val()!=0&&(Number($(v).find('.qty').text()*1000) < (Number($(v).find('.deals').val()*1000)+Number($(v).find('.total-consume').text()*1000))))) {
                      if ($(v).find('.vals').text() == '') {
                        layer.alert(trDataMt.item_no + '消耗数量大于计划数量，请填写原因！');
                        flag = false;
                        return false;
                      }
                    }
                    if(Number($(v).find('.deals').val()*1000>Number($(v).find('.beath_qty').val()*1000))){
                      if ($(v).find('.vals').text() == '') {
                        layer.alert(trDataMt.item_no + '消耗数量大于额定领料数量，请填写原因！');
                        flag = false;
                        return false;
                      }
                    }
					
				
                    if($(v).find('.beath_qty').val()>0 || $(v).find('.consume_num').val()>0){

						var _str = '';
						var datas = $(v).find('.div_del');
						for (let i = 0; i < datas.length; i++) {
						
							if(i == 0) {
								_str = $(datas[i]).attr('data-id');
							}else {
								_str = _str + ',' + $(datas[i]).attr('data-id');
							}
						}
                        // if((!($(v).find('.length_for_robe').val())) && trDataMt.item_no.substring(0,4)=='3002'){
                        //     LayerConfig('fail',trDataMt.item_no+'物料的长度不能为空！')
                        //     flag=false;
                        //     return false;
                        //
                        // }else if((!($(v).find('.length_for_robe_difference').val())) && trDataMt.item_no.substring(0,4)=='3002'){
                        //     LayerConfig('fail',trDataMt.item_no+'物料的长度差异不能为空！')
                        //     flag=false;
                        //     return false;
                        // }
                        // else
                            // {
                            var str = arr_couse.join();
                            in_materials.push({
                                id:'',
                                material_id:$(v).attr('data-id'),
                                LGFSB:$(v).attr('data-LGFSB'),
                                LGPRO:$(v).attr('data-LGPRO'),
                                GMNGA:$(v).find('.consume_num').val(),
                                lot:$(v).find('.batch').text(),
                                batch_qty:$(v).find('.beath_qty').val(),
                                unit_id:$(v).find('.unit').attr('data-unit'),
                                qty:$(v).find('.qty').attr('data-qty'),
                                plan_qty:Number($(v).find('.qty').text()),
                                conversion:$(v).attr('data-conversion')?$(v).attr('data-conversion'):'',
                                MKPF_BKTXT:str,
                                diff_remark:$(v).find('.diff_remark').val(),
                                length_for_robe:$(v).find('.length_for_robe').val()?$(v).find('.length_for_robe').val():'',
                                unit_for_length:$(v).find('.unit_for_length').val()?$(v).find('.unit_for_length').val():'',
                                diff_for_robe:$(v).find('.length_for_robe_difference').val()?$(v).find('.length_for_robe_difference').val():'',
                                MSEG_ERFMG:$(v).find('.difference_num').val(),
                                is_spec_stock:$(v).attr('data-spec_stock')?$(v).attr('data-spec_stock'):'',
                                batch:trData.batch,
                                depot_id:trData.depot_id,
                                inve_id:trData.inve_id,
								storage_number:trData.storage_number,
								LIFNR: _str,
                            });
                        // }
                    }
                }
            }
		});
	
		var str = '';
        $('#show_out_material .table_tbody tr').each(function (k,v) {
            var trData = $(v).data('trData');

            if((!($(v).find('.length_for_robe').val())) && trData.item_no.substring(0,4)=='3002'){
                LayerConfig('fail',trData.item_no+'物料的长度不能为空！')
                flag=false;
                return false;

            }else
                {


				if (Number($(v).find('.ready_id').text()) + Number($(v).find('.consume_num').val()) > Number($(v).find('.qty').text())) {
					str += `${$(v).find('.item_item_no').text()}累计报工数量超出计划数量: ${(Number($(v).find('.ready_id').text()) 
						+ Number($(v).find('.consume_num').val()) - Number($(v).find('.qty').text())).toFixed(3)} <br/>`;
				}
                var $itemPo=$(v).find('.line_depot');
                var line_depot_id=$(v).find('.line_depot').attr('data-id');
                var line_depot_code=$(v).find('.line_depot').attr('data-code');
                // var line_depot_id=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
                //     $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').id:'';
                // var line_depot_code=$itemPo.data('inputItem')==undefined||$itemPo.data('inputItem')==''?'':
                //     $itemPo.data('inputItem').depot_name==$itemPo.val().trim().replace(/\（.*?）/g,"")?$itemPo.data('inputItem').code:'';
                out_materials.push({
                    id:'',
                    material_id:$(v).attr('data-id'),
                    LGFSB:$(v).attr('data-LGFSB'),
                    LGPRO:$(v).attr('data-LGPRO'),
                    GMNGA:$(v).find('.consume_num').val(),
                    length_for_robe:$(v).find('.length_for_robe').val()?$(v).find('.length_for_robe').val():'',
                    lot:$(v).find('.batch_out').val()?$(v).find('.batch_out').val():'',
                    unit_for_length:$(v).find('.unit_for_length').val()?$(v).find('.unit_for_length').val():'',
                    unit_id:$(v).find('.unit').attr('data-unit'),
                    qty:$(v).find('.qty').text(),
                    line_depot_id:line_depot_id,
                    line_depot_code:line_depot_code,
                    MKPF_BKTXT:'',
                    MSEG_ERFMG:'',
                    is_spec_stock:$(v).attr('data-spec_stock')?$(v).attr('data-spec_stock'):'',
                })
		}

		});

		if(str != '' && flag == true) {
				layer.confirm(str + '确定要继续报工吗？', {
				btn: ['确定', '取消'],
				closeBtn: 0
			}, function (index) {
				flag = true;
				layer.close(index);
				flag = true;
					var workCenter = $('#show_workcenter .work_center_item');
					var workCenterArr = [];
					workCenter.each(function (k, v) {
						workCenterArr.push({
							id: '',
							standard_item_id: $(v).attr('data-id'),
							standard_item_code: $(v).attr('data-code'),
							value: $(v).find('.workValue').val() ? $(v).find('.workValue').val() : '',
						})
					});
					if ($('#start_time').val().length < 0 || $('#end_time').val() < 0) {
						LayerConfig('fail', '请选择报工单执行时间！');
					} else {
						var data = {
							work_order_id: work_order_id,
							routing_node_id: routing_node_id,
							employee_id: employee_id,
							sale_order_code: sales_order_code,
							sales_order_project_code: sales_order_project_code,
							product_order_code: po_number,
							factory_id: factory_id,
							line_depot_id: depot_id,
							BUDAT: $('#BUDAT').val(),
							start_time: $('#start_time').val(),
							end_time: $('#end_time').val(),
							BUDAT: $('#BUDAT').val(),
							in_materials: JSON.stringify(in_materials),
							out_materials: JSON.stringify(out_materials),
							stands: JSON.stringify(workCenterArr),
							is_teco: $('#is_teco').hasClass('is-checked') ? 1 : 0,
							_token: TOKEN
						};
						if (flag) {
							AjaxClient.post({
								url: URLS['work'].WorkDeclareOrder,
								data: data,
								timeout: 60000,
								dataType: 'json',
								beforeSend: function () {
									layerLoading = LayerConfig('load');
								},
								success: function (rsp) {
									layer.close(layerLoading);
									layer.alert('工单保存成功！', {
										icon: 1, title: '提示', offset: '250px', end: function () {
										}
									}, function (index) {
										layer.close(index);
										window.location.href = "/Buste/busteIndex?id=" + rsp.results.insert_id + "&type=edit";
										// location.reload();
									});
								},
								fail: function (rsp) {
									layer.close(layerLoading);
									LayerConfig('fail', rsp.message);

								}
							}, this)
						}
					}
			}, function (index) {
				flag = false;
				layer.close(index);
			});
		}else {
			var workCenter = $('#show_workcenter .work_center_item');
			var workCenterArr = [];
			workCenter.each(function (k, v) {
				workCenterArr.push({
					id: '',
					standard_item_id: $(v).attr('data-id'),
					standard_item_code: $(v).attr('data-code'),
					value: $(v).find('.workValue').val() ? $(v).find('.workValue').val() : '',
				})
			});
			if ($('#start_time').val().length < 0 || $('#end_time').val() < 0) {
				LayerConfig('fail', '请选择报工单执行时间！');
			} else {
				var data = {
					work_order_id: work_order_id,
					routing_node_id: routing_node_id,
					employee_id: employee_id,
					sale_order_code: sales_order_code,
					sales_order_project_code: sales_order_project_code,
					product_order_code: po_number,
					factory_id: factory_id,
					line_depot_id: depot_id,
					BUDAT: $('#BUDAT').val(),
					start_time: $('#start_time').val(),
					end_time: $('#end_time').val(),
					BUDAT: $('#BUDAT').val(),
					in_materials: JSON.stringify(in_materials),
					out_materials: JSON.stringify(out_materials),
					stands: JSON.stringify(workCenterArr),
					is_teco: $('#is_teco').hasClass('is-checked') ? 1 : 0,
					_token: TOKEN
				};
				if (flag) {
					AjaxClient.post({
						url: URLS['work'].WorkDeclareOrder,
						data: data,
						timeout: 60000,
						dataType: 'json',
						beforeSend: function () {
							layerLoading = LayerConfig('load');
						},
						success: function (rsp) {
							layer.close(layerLoading);
							layer.alert('工单保存成功！', {
								icon: 1, title: '提示', offset: '250px', end: function () {
								}
							}, function (index) {
								layer.close(index);
								window.location.href = "/Buste/busteIndex?id=" + rsp.results.insert_id + "&type=edit";
								// location.reload();
							});
						},
						fail: function (rsp) {
							layer.close(layerLoading);
							LayerConfig('fail', rsp.message);

						}
					}, this)
				}
			}
		}
		

       
    // }
}

function getWorkOrderform(wo_number) {
    AjaxClient.get({
        url: URLS['order'].workOrderShow + _token + "&wo_number=" + wo_number+"&hasremoveschgt=1",
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
			window.sessionStorage.setItem('work', rsp.results.workshop_id);

			AjaxClient.get({
				url: '/Preselection/getWorkshopPreselection' + "?" + _token + "&workshop_id=" + rsp.results.workshop_id,
				dataType: 'json',
				success: function (rsp) {
					let data = rsp.results;
					changeRea = JSON.stringify(data);
				}
			})	


			if (rsp.results.length != 0) {
				workId = rsp.results.workshop_id;
			}
			chioces();
            layer.close(layerLoading);
            work_order_id = rsp.results.work_order_id;
            routing_node_id = rsp.results.routing_node_id;
            sales_order_code = rsp.results.sales_order_code;
            sales_order_project_code = rsp.results.sales_order_project_code;
            po_number = rsp.results.po_number;
            factory_id = rsp.results.factory_id;
            depot_id = rsp.results.depot_id;
            getWorkcenter(rsp.results.workcenter_id);
            getEmployee(rsp.results.workbench_id);
			brenchId = rsp.results.workbench_id;
            $('.submit').show();
            $('.print').hide();
             //
			 in_material = JSON.parse(rsp.results.in_material);
			//  生成补料单带回的原因id
			for(i=0; i<in_material.length; i++) {
				isChecked.push({ id: in_material[i].id, ids: in_material[i].reason_ids});
			}

             out_material = JSON.parse(rsp.results.out_material);
             var material_arr = [];
             item_no = [];
             in_material.forEach(function (item) {
                 material_arr.push(item.material_id);
                 item_no.push({'item_no':item.item_no,'SCHGT':item.SCHGT,'total_consume_qty':item.total_consume_qty,'qty':item.qty});
             });
            line_depot_id=rsp.results.line_depot_id,line_depot_code=rsp.results.line_depot_code,depot_name=rsp.results.depot_name;
            out_line_depot_id=rsp.results.out_line_depot_id,out_line_depot_code=rsp.results.out_line_depot_code,out_depot_name=rsp.results.out_depot_name;
            if(material_arr.length>0){
                getMaterialBatch(rsp.results.po_number,rsp.results.sales_order_code,rsp.results.wo_number,material_arr);
            }else {
                showOutItem();
            }

            if (rsp.results.operation_info) {
                let opName = rsp.results.operation_info.name;
                $('#operationName').html(opName);
                $('.op-infor').show();
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
        }
    }, this)
}

function getWorkcenter(id) {
    AjaxClient.get({
        url: URLS['order'].workcenter+"?"+_token+"&workcenter_id="+id,
        dataType: 'json',
        success:function (rsp) {
            var workCenterHtml=''
            rsp.results.forEach(function (item) {
                if(item.code =='ZPP001' || item.code=='ZPP002'){
                }else {
                    workCenterHtml+= `<div class="work_center_item" data-id="${item.param_item_id}" data-code="${item.code}" style="margin: 3px;margin-right: 40px;display: inline-block;"><span style="display: inline-block;width: 110px;">${item.name}: </span> <input class="workValue" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" type="number" min="0" value="${item.value}"></div>`
                }
            });
            $('#show_workcenter').html(workCenterHtml);
            $('#show_workcenter').show();
        },
        fail: function(rsp){
            console.log('获取车间列表失败');
        }
    });
}
function getMaterialBatch(po,so,wo,mt) {
    AjaxClient.get({
        url: URLS['order'].getMaterialBatch + _token + "&work_order_code=" + wo+ "&sale_order_code=" + so+ "&product_order_code=" + po+ "&material_ids=" + mt+"&line_depot_id="+line_depot_id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            new_in_material=[];
            in_material.forEach(function (item) {
                var batch_arr=[];
                var materials = rsp.results[item.material_id];
                if(materials){
                    if(materials.length>0){
                        materials.forEach(function (mater) {
                            batch_arr.push({
                                batch : mater.batch,
                                inve_id : mater.inve_id,
                                depot_id : mater.depot_id,
                                depot_code : mater.depot_code,
                                unit_name : mater.unit_name,
                                unit_id : mater.unit_id,
                                storage_number : mater.storage_number,
                                sale_order_code : mater.sale_order_code,
                                product_order_code : mater.product_order_code,
								conversion : mater.conversion,
								CHOSE_LIFNR: mater.CHOSE_LIFNR,
								MKPF_BKTXT: mater.MKPF_BKTXT,
								diff_remark: mater.diff_remark,
								LIFNR: mater.LIFNR,
                            })

                        })
                    }
                }else {
                    batch_arr.push({
                        batch : '',
                        inve_id : '',
                        depot_id : '',
                        depot_code : '',
                        unit_name : '',
                        unit_id : '',
                        storage_number : '',
                        sale_order_code : '',
                        product_order_code : '',
                        conversion : 0,
                    })
                }
                item.batchs=batch_arr;
                new_in_material.push(item);

            });
            showInItem(new_in_material);
            showOutItem();
            // getWorkOrderform(wo_number,rsp.results);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            // LayerConfig('fail','获取工单详情失败，请刷新重试')
        }
    }, this)
}

//出料
function showOutItem() {
    var ele = $('#show_out_material .table_tbody');
    ele.html("");

    out_material.forEach(function (item, index) {
        var tempt = item.material_attributes;
        var inattrs = '';
        tempt.forEach(function (item) {
            inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
        });
        if(array_arr.length>0){
            array_arr.forEach(function (aitem) {

                if(item.item_no == aitem.name){
                    if(item.item_no.substring(0,4)=='3002'){
                        var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock?item.special_stock:''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                                        <td width="100px;" class="item_item_no">${tansferNull(item.item_no)}</td>
                                        <td width="150px;">${tansferNull(item.name)}</td>
                                        <td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>
                                        <td class="qty">${tansferNull(item.qty)}</td>
                                        <td class="ready_id">${tansferNull(aitem.GMNGA)}</td>
                                        <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
                                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(((item.qty*1000)-(aitem.GMNGA*1000))/1000<0?0:((item.qty*1000)-(aitem.GMNGA*1000))/1000)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe deal"></td>
                                        <td  class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>
                                        <td  class="firm" style="padding: 3px;">
                                            <div class="el-select-dropdown-wrap">
                                                    <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${out_line_depot_id}" value="${out_line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                                            </div>
                                        </td>
                                    </tr>`;
                        ele.append(tr);
                        ele.find('tr:last-child').data("trData", item);
                        ele.find('tr:last-child .consume_num.deal').keyup();
                    }else {
                        var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock?item.special_stock:''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                                        <td width="100px;" class="item_item_no">${tansferNull(item.item_no)}</td>
                                        <td width="150px;">${tansferNull(item.name)}</td>
                                        <td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>
                                        <td class="qty">${tansferNull(item.qty)}</td>
                                        <td class="ready_id">${tansferNull(aitem.GMNGA)}</td>
                                        <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
                                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(((item.qty*1000)-(aitem.GMNGA*1000))/1000<0?0:((item.qty*1000)-(aitem.GMNGA*1000))/1000)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                                        <td  class="firm" style="padding: 3px;"></td>
                                        <td  class="firm" style="padding: 3px;"></td>
                                        <td  class="firm" style="padding: 3px;">
                                            <div class="el-select-dropdown-wrap">
                                                    <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${out_line_depot_id}" data-code="${out_line_depot_code}" value="${out_line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                                            </div>
                                        </td>
                                    </tr>`;
                        ele.append(tr);
                        ele.find('tr:last-child').data("trData", item);
                        ele.find('tr:last-child .consume_num.deal').keyup();
                    }

                }

            })
        }else {
            if(item.item_no.substring(0,4)=='3002'){
                var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock?item.special_stock:''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                    <td width="100px;">${tansferNull(item.item_no)}</td>
                    <td width="150px;">${tansferNull(item.name)}</td>
                    <td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>
                    <td class="qty">${tansferNull(item.qty)}</td>
                    <td class="ready_qty">0</td>
                    <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
                    <td  class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(item.qty)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                    <td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe deal"></td>
                    <td  class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>
                    <td  class="firm" style="padding: 3px;">
                        <div class="el-select-dropdown-wrap">
                                <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${out_line_depot_id}" value="${out_line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                        </div>
                    </td>
                </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data("trData", item);
            }else {
                var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock?item.special_stock:''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                    <td width="100px;">${tansferNull(item.item_no)}</td>
                    <td width="150px;">${tansferNull(item.name)}</td>
                    <td><input type="text" style="width: 100px;height: 30px;" class="batch_out"></td>
                    <td class="qty">${tansferNull(item.qty)}</td>
                    <td class="ready_qty">0</td>
                    <td  class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial?item.bom_commercial:'')}</td>
                    <td  class="firm" style="padding: 3px;"><input type="number" min="0" value="${tansferNull(item.qty)}"  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" placeholder="" class="consume_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                    <td  class="firm" style="padding: 3px;"></td>
                    <td  class="firm" style="padding: 3px;"></td>
                    <td  class="firm" style="padding: 3px;">
                        <div class="el-select-dropdown-wrap">
                                <input type="text"  class="el-input line_depot" id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${out_line_depot_id}" value="${out_line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                        </div>
                    </td>
                </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data("trData", item);
            }
        }
        if(out_depot_name){
            $('#line_depot'+out_flag).val(out_depot_name+'（'+out_line_depot_code+'）').data('inputItem',{id:out_line_depot_id,out_depot_name:depot_name,code:out_line_depot_code}).blur();
        }
        $('#line_depot'+out_flag).autocomplete({
            url: URLS['work'].storageSelete+"?"+_token+"&is_line_depot=1",
            param:'depot_name',
            showCode:'depot_name'
        });
        out_flag++;

    })
}

/*------------------------------------------------------------------------------------------------------------ */
/******  保留一位小数，直接进位  *****/

// function changeNum(x) {

// 	var z;
// 	var y = String(x).indexOf(".") + 1;
// 	var count = String(x).length - y;
	

// 	if (y > 0) {
// 		var s = x - Number( String(x).slice(0, y - 1) );	
// 		if(s > 0) {
// 			if (count != 1) {
// 				var t = String(x);
// 				var l = t.slice(y, y + 1);
// 				z = t.slice(0, y - 1);
// 				if (l == '9') {
// 					z = Number(z) + 1;
// 				} else {
// 					l = Number(l) + 1;
// 					z = Number(z + '.' + String(l));
// 				}
// 			}
// 		} else {
// 			z = x;
// 		}
		
// 	} else {
// 		z = x;
// 	}

// 	return z;
// }

/*------------------------------------------------------------------------------------------------------------ */


//进料
function showInItem(data) {
    var _ele = $("#show_in_material .table_tbody");
    _ele.html("");
    data.forEach(function (item) {
        if(item.item_no!="99999999"&&item.SCHGT!="X") {
            if(item.item_no.substring(0,4)=='3002'){ // 3002棉泡
                item.batchs.forEach(function (bitem) {
                    var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock?item.special_stock:''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}" data-conversion="${tansferNull(bitem.conversion)}">
                    <td width="100px;">${tansferNull(item.item_no)}</td>
                    <td width="150px;">${tansferNull(item.name)}</td>
                    <td class="batch">${bitem.batch}</td>
                    <td class="qty ${tansferNull(item.item_no)}${bitem.conversion*1000000}" data-qty="${item.qty}">${bitem.conversion>0?(item.qty/bitem.conversion).toFixed(3):item.qty}</td>
                    <td><p><input type="number" min="0" max="${tansferNull(bitem.conversion>0?(bitem.storage_number/bitem.conversion).toFixed(3):bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${bitem.conversion>0?(item.qty/bitem.conversion).toFixed(3):item.qty}"  placeholder="" class="beath_qty deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></p></td>
                    <td>${tansferNull(bitem.sale_order_code)}</td>
                    <td>${tansferNull(bitem.product_order_code)}</td>
                    <td class="storage">${tansferNull(bitem.conversion>0?(bitem.storage_number/bitem.conversion).toFixed(3):bitem.storage_number)}</td>
                    <td><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="rest_num" style="line-height:20px;width: 100px;font-size: 10px;"></td>
					
					<!--  2019/12/4  夏凤娟：消耗数量若存在小数  将其改为只显示一位小数  方法：进位 -->
					<td style="padding: 3px;"><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal deals" value="${bitem.conversion > 0 ? (item.qty / bitem.conversion).toFixed(3) : item.qty}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
					<td style="padding: 3px;" class="total-consume">${item.total_consume_qty}</td>
                    <td class="unit"  data-unit="${item.bom_unit_id}">${bitem.conversion>0?'M':item.bom_commercial}</td>
                    <td style="padding: 3px;"><input type="number" min="0" readonly  class="difference_num deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                    <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe deal"></td>-->
                    <!--<td  class="firm" style="padding: 3px;"><input type="number" min="0" style="width: 100px;height: 30px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" class="length_for_robe_difference deal"></td>-->
                    <!--<td  class="firm" style="padding: 3px;"><input type="text" class="unit_for_length" style="width: 100px;height: 30px;" readonly value="M"></td>-->
                    <td style="padding: 3px;">
                        <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}${bitem.inve_id}" class="MKPF_BKTXT vals isFlag is3002" ></div>
						<button type="button" data-id="${item.material_id}" data-inve-id="${bitem.inve_id}" class="button pop-button select">选择</button>
						<!-- 清除原因 -->
						<button type="button" class="button pop-button clear" data-id = "${item.material_id}" data-ids = "${bitem.inve_id}">清除</button>
                    </td>
                    <td  class="firm" style="padding: 3px;"><textarea class="diff_remark" cols="20" rows="3">${tansferNull(bitem.diff_remark)}</textarea></td>
					<td>
						<div class="layui-inline">
								<div class="layui-input-inline">
									<div class="layui-input-inline">
										<div id="gys${bitem.inve_id}"  style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" ></div>
										<button type="button" data-id="${item.material_id}" data-ids="${bitem.inve_id}" class="button pop-button gys_select">选择</button>
									</div>
								</div>
						</div> 
					</td>
				</tr>`;
					_ele.append(tr);
					reason(item.material_id, bitem.inve_id, item.id, bitem.MKPF_BKTXT);
					edits(bitem.CHOSE_LIFNR, bitem.inve_id, item.material_id);
                    _ele.find('tr:last-child').data("trData", bitem).data("trDataMt", item);
                });
            }else {
                item.batchs.forEach(function (bitem) {
                    var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.special_stock?item.special_stock:''}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                    <td width="100px;">${tansferNull(item.item_no)}</td>
                    <td width="150px;">${tansferNull(item.name)}</td>
                    <td class="batch">${bitem.batch}</td>
                    <td class="qty ${tansferNull(item.item_no)}" data-qty="${item.qty}">${item.qty}</td>
                    <td><p><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.qty}"  placeholder="" class="beath_qty deal" value="" style="line-height:20px;width: 100px;font-size: 10px;"></p>${bitem.conversion>0?(item.qty/bitem.conversion).toFixed(3)+'M':''}</td>
                    <td >${tansferNull(bitem.sale_order_code)}</td>
                    <td >${tansferNull(bitem.product_order_code)}</td>
                    <td class="storage">${tansferNull(bitem.storage_number)}</td>
                    <td><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="rest_num" style="line-height:20px;width: 100px;font-size: 10px;"></td>
					
					<!--  2019/12/4  夏凤娟：消耗数量若存在小数  将其改为只显示一位小数  方法：进位 -->
					<td style="padding: 3px;"><input type="number" min="0" max="${tansferNull(bitem.storage_number)}" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal deals" value="${item.qty}" style="line-height:20px;width: 100px;font-size: 10px;"></td>				
					<td style="padding: 3px;" class="total-consume">${item.total_consume_qty}</td>
                    <td class="unit"  data-unit="${item.bom_unit_id}">${tansferNull(item.bom_commercial ? item.bom_commercial : '')}</td>
                    <td style="padding: 3px;"><input type="number" min="0" readonly  class="difference_num deal " value="" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                    <!--<td  class="firm" style="padding: 3px;"></td>-->
                    <!--<td  class="firm" style="padding: 3px;"></td>-->
                    <!--<td  class="firm" style="padding: 3px;"></td>-->
                    <td style="padding: 3px;">
                        <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="material${item.material_id}${bitem.inve_id}" class="MKPF_BKTXT vals isFlag" ></div>
                        <button type="button" data-id="${item.material_id}" data-inve-id="${bitem.inve_id}" class="button pop-button select">选择</button>
						<!-- 清除原因 -->
						<button type="button" class="button pop-button clear" data-id = "${item.material_id}" data-ids = "${bitem.inve_id}">清除</button>
						</td>
                    <td class="firm" style="padding: 3px;"><textarea class="diff_remark" cols="20" rows="3">${tansferNull(bitem.diff_remark)}</textarea></td>
					<td>
						<div class="layui-inline">
								<div class="layui-input-inline">
									<div class="layui-input-inline">
										<div id="gys${bitem.inve_id}"  style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" ></div>
										<button type="button" data-id="${item.material_id}" data-ids="${bitem.inve_id}" class="button pop-button gys_select">选择</button>
									</div>
								</div>
							</div> 
					</td>
				</tr>`;
					_ele.append(tr);
					reason(item.material_id, bitem.inve_id, item.id, bitem.MKPF_BKTXT);
					edits(bitem.CHOSE_LIFNR, bitem.inve_id, item.material_id);
                    _ele.find('tr:last-child').data("trData", bitem).data("trDataMt", item);
                });
            }
        }
    });
    uniteTdCells('show_in_material');
    uniteTdCellsitem('show_in_material');
}


function edits(lifnr, ivid, mid) {

	let ele = $('#gys' + ivid);
	if (lifnr != '' &&  lifnr != undefined) {
		let lifnrs = lifnr.split(",");

		AjaxClient.get({
			url: '/WorkDeclareOrder/getSupplierByIqc' + "?" + _token + '&material_ids=' + mid,
			dataType: 'json',
			beforeSend: function () {
				layerLoading = LayerConfig('load');
			},
			success: function (rsp) {
				layer.close(layerLoading);
				let tr = ''
				rsp.results.forEach(item => {
					if(lifnrs.indexOf(item.LIFNR) != -1) {
						ele.append(`<p class="layui-badge div_del layui-bg-blue" data-id="${item.LIFNR}">${item.NAME1}</p>`);
					}
				})

				$('.gys_tbody').append(tr);
			},
			fail: function (rsp) {
				layer.close(layerLoading);
				console.log(rsp);
			}
		}, this);

	}
}


/**
 *  供应商选择
 */

$('body').on('click', '.gys_select', function () {
	gys_is_checked = [];
	let id = $(this).attr('data-id');
	let invd = $(this).attr('data-ids');
	let span = $(this).parent().find('#gys' + invd).find('p');
	if (span.length != 0) {
		for (let i = 0; i < span.length; i++) {
			gys_is_checked.push($(span[i]).attr('data-id'));
		}
	}
	layerModal = layer.open({
		type: 1,
		title: '选择供应商',
		offset: '100px',
		area: ['500px', '500px'],
		shade: 0.1,
		shadeClose: false,
		resize: true,
		content: `
                <div class="table_page">
                        <div class="wrap_table_div" style="overflow-y: scroll;height: 400px;">
                            <table>
                                <thead>
                                <tr>
                                    <th class="left nowrap tight">供应商</th>
                                    <th class="right nowrap tight">操作</th>
                                </tr>
                                </thead>
                                <tbody class="gys_tbody"></tbody>
                            </table>
                        </div>
                    <div class="el-form-item">
						<div class="el-form-item-div btn-group">
							<button type="button" style="width:100px;height:30px;margin-top:8px;" class="el-button el-button--primary submits" data-ids="${invd}">确定</button>
						</div>
                	</div>
                </div>
                `,
		success: function (layero, index) {

			getGysList(id, gys_is_checked);
		}
	})
})


function getGysList(id, gys_arr) {

	AjaxClient.get({
		url: '/WorkDeclareOrder/getSupplierByIqc' + "?" + _token + '&material_ids=' + id,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			let tr = ''
			rsp.results.forEach(item => {
				tr += `<tr data-id="${item.LIFNR}" data-span="${item.NAME1}">
					<td>${item.NAME1}</td>
					<td class="right">
						<span class="el-checkbox_input el-checkbox_input_check  ${gys_arr.indexOf(item.LIFNR) != -1 ? 'is-checked' : ''}" id="gys${item.LIFNR}"  data-id="${item.LIFNR}">
		                    <span class="el-checkbox-outset"></span>
                        </span>
					</td>
				</tr>`;
			})

			$('.gys_tbody').append(tr);
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			console.log(rsp);
		}
	}, this);
}


$('body').on('click', '.submits', function () {

	let tr = $(this).parent().parent().parent().find('.gys_tbody tr'), gys_arr = [];
	let ids = $(this).attr('data-ids');
	$('#gys' + ids).html('');
	for (let i = 0; i < tr.length; i++) {
		if ($(tr[i]).find('#gys' + $(tr[i]).attr('data-id')).hasClass('is-checked')) {
			gys_arr.push($(tr[i]).attr('data-id'));
			$('#gys' + ids).append(`<p class="layui-badge div_del layui-bg-blue" data-id="${$(tr[i]).attr('data-id')}">${$(tr[i]).attr('data-span')}</p>`)
		}
	}
	layer.close(layerModal);

})




function uniteTdCellsitem(tableId) {
    var table = document.getElementById(tableId);
    for (let i = 0; i < table.rows.length; i++) {
        for (let c = 0; c < table.rows[i].cells.length; c++) {
            if (c == 0 || c == 1) { //选择要合并的列序数，去掉默认全部合并
                for (let j = i + 1; j < table.rows.length; j++) {
                    let cell1 = table.rows[i].cells[c].innerHTML;
                    let cell2 = table.rows[j].cells[c].innerHTML;
                    if (cell1 == cell2) {
                        table.rows[j].cells[c].style.display = 'none';
                        table.rows[j].cells[c].style.verticalAlign = 'middle';
                        table.rows[i].cells[c].rowSpan++;
                    } else {
                        table.rows[j].cells[c].style.verticalAlign = 'middle'; //合并后剩余项内容自动居中
                        break;
                    };
                }
            }
        }
    }
};
function uniteTdCells(tableId) {
    var table = document.getElementById(tableId);
    for (let i = 0; i < table.rows.length; i++) {
        var c=3;
        for (let j = i + 1; j < table.rows.length; j++) {
            let cell1 = table.rows[i].cells[c].getAttribute('class');
            let cell2 = table.rows[j].cells[c].getAttribute('class');
            if (cell1 == cell2) {
                table.rows[j].cells[c].style.display = 'none';
                table.rows[j].cells[c].style.verticalAlign = 'middle';
                table.rows[i].cells[c].rowSpan++;
            } else {
                table.rows[j].cells[c].style.verticalAlign = 'middle'; //合并后剩余项内容自动居中
                break;
            };
        }
    }
};
// 出料
function showOutItemView(data,status) {
    var ele = $('#show_out_material .table_tbody');
    ele.html("");
    data.forEach(function (item, index) {
        var tr = `<tr data-id="${item.material_id}"  data-spec_stock="${item.is_spec_stock}" data-item-id="${item.id}" data-declare="${item.declare_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                        <td width="100px;">${tansferNull(item.material_item_no)}</td>
                        <td width="150px;">${tansferNull(item.material_name)}</td>
                        <td>${tansferNull(item.lot)}</td>
                        <td class="qty"><p>${tansferNull(item.qty)}</p></td>
                        <td  class="unit"  data-unit="${item.unit_id}">${tansferNull(item.commercial?item.commercial:'')}</td>
                        <td  class="firm" style="padding: 3px;"><p><input type="number" readonly ${status!=1?'readonly="readonly"':''}  onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal" value="${item.GMNGA}" style="line-height:20px;width: 100px;font-size: 10px;"></p></td>
                        <td>${tansferNull(item.length_for_robe)}</td>
                        <td>${tansferNull(item.unit_for_length)}</td>
                        <td  class="firm" style="padding: 3px;">
                            <div class="el-select-dropdown-wrap">
                                     <input type="text"  class="el-input line_depot" readonly ${status!=1?'readonly="readonly"':''} id="line_depot${out_flag}" placeholder="请输入仓库" data-id="${item.line_depot_id}" value="${item.line_depot_code}" style="line-height:20px;width: 100px;font-size: 10px;">
                            </div>
                        </td>
                    </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", data);
        if(item.depot_name){
            $('#line_depot'+out_flag).val(item.depot_name+'（'+item.line_depot_code+'）').data('inputItem',{id:item.line_depot_id,depot_name:item.depot_name,code:item.line_depot_code}).blur();
        }
        $('#line_depot'+out_flag).autocomplete({
            url: URLS['work'].storageSelete+"?"+_token+"&is_line_depot=1",
            param:'depot_name',
            showCode:'depot_name'
        });
        out_flag++;
    })
}

//进料
function showInItemView(data,status) {
    var ele = $('#show_in_material .table_tbody');
	ele.html("");
    data.forEach(function (item, index) {
      var _html='';
      if(item.MKPF_BKTXT_ARR){
        item.MKPF_BKTXT_ARR.forEach(function(mritem){
          _html+=mritem.name+'-'+mritem.description+'&#10;';
        })
      }
        var tr = `<tr data-id="${item.material_id}" data-spec_stock="${item.is_spec_stock}" data-item-id="${item.id}" data-declare="${item.declare_id}" data-LGFSB="${item.LGFSB}" data-LGPRO="${item.LGPRO}">
                        <td width="100px;">${tansferNull(item.material_item_no)}</td>
                        <td width="150px;">${tansferNull(item.material_name)}</td>
                        <td class="batch">${tansferNull(item.lot)}</td>
                        <td class="qty ${tansferNull(item.material_item_no)}"><p>${tansferNull(item.qty)}</p></td>
                        <td class="batch_qty"><input type="number" min="0" readonly class="batch_qty deal" value="${tansferNull(item.batch_qty)}" style="line-height:20px;width: 100px;font-size: 10px;"><p>${item.conversion>0?(item.batch_qty/item.conversion).toFixed(3)+'M':''}</p></td>
                        <td class="storage">${tansferNull(item.sale_order_code)}</td>
                        <td class="storage">${tansferNull(item.product_order_code)}</td>
                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" readonly onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')"  placeholder="" class="consume_num deal" value="${item.GMNGA}" style="line-height:20px;width: 100px;font-size: 10px;"><p>${item.length_for_robe?item.length_for_robe+'M':''}</p></td>
                        <td  class="unit" data-unit="${item.unit_id}">${tansferNull(item.commercial)}</td>
                        <td  class="firm" style="padding: 3px;"><input type="number" min="0" readonly  class="difference_num deal" value="${item.MSEG_ERFMG}" style="line-height:20px;width: 100px;font-size: 10px;"></td>
                        <!--<td>${tansferNull(item.length_for_robe)}</td>-->
                        <!--<td>${tansferNull(item.diff_for_robe)}</td>-->
                        <!--<td>${tansferNull(item.unit_for_length)}</td>-->
                        <td  class="firm" style="padding: 3px;"><textarea name="" readonly id="" class="MKPF_BKTXT" cols="20" rows="3">${_html}</textarea></td>
						<td  class="firm" style="padding: 3px;"><textarea name="" readonly id="" class="diff_remark" cols="20" rows="3">${item.diff_remark}</textarea></td>
						<td>${item.LIFNR_NAME}</td>
                    </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", data);
    });
    uniteTdCells('show_in_material');
    uniteTdCellsitem('show_in_material');
}


$('body').on('mouseover','#chioce' ,function(){
	layer.tips('点击切换全车间搜索责任人！', '#chioce', {
		tips: [4, '#78BA32']
	});
})