var consume = JSON.parse(window.sessionStorage.getItem('consume'));
var  replace = '';
var cb_str = '';
var zr_str = '';
var str = '';
var dat = {
	page_no : 1,
	page_size : 10,
	ids : '',
}
var t = [];
var tbody = $('#tbody');
var save = {
	code: '',
	employee_id: '',
	costcenter_id: '',
	type: '',
	order_code: '',
	creator: '',
	remark: '',
	items: [],
	_token: '8b5491b17a70e24107c89f37b1036078'
}
var pageNoItem = 1;
var pageSizeItem = 50;

$('body').on('click', '.el-checkbox_input_check', function () {
    $(this).toggleClass('is-checked');
});
$('body').on('click', '.select', function (e) {
    e.stopPropagation();
    showCause($(this).attr('data-id'))
});
$('body').on('click', '#viewCause .cause_submit', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
    var material_id = $("#itemId").val();
    var _ele = $("#material" + material_id);
    _ele.html('');
    $('#practice_table .table_tbody tr').each(function (item) {
        if ($(this).find('.el-checkbox_input_check').hasClass('is-checked')) {
            let itemc = $(this).data('trData');
            _ele.append(`<span>
                            <div style="display: inline-block">${itemc.name}-${itemc.description}</div>
                        </span>`);
            _ele.find('span:last-child').data("spanData", itemc);
        }
    })
});
$('body').on('click', '.btn-group:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
});
function showCause(id) {
    var _ele = $("#material" + id), arr_couse = [];

    _ele.find('span').each(function (item) {
        arr_couse.push($(this).data('spanData'))
    });
    layerModal = layer.open({
        type: 1,
        title: '选择原因',
        offset: '100px',
        area: ['500px', '510px'],
        shade: 0.1,
        shadeClose: false,
        resize: true,
        content: `<form class="viewAttr formModal" id="viewCause">
                  <input type="hidden" id="itemId" value="${id}">
                  <div class="table_page">
                      <div class="wrap_table_div" style="overflow-y: scroll;height: 400px;">
                          <table id="practice_table" class="sticky uniquetable commontable">
                              <thead>
                              <tr>
                                  <th class="left nowrap tight" style="font-size:18px;">名称</th>
                                  <th class="left nowrap tight" style="font-size:18px;">备注</th>
                                  <th class="right nowrap tight" style="font-size:18px;">操作</th>
                              </tr>
                              </thead>
                              <tbody class="table_tbody"></tbody>
                          </table>
                      </div>
                      <div id="pagenationItem" class="pagenation bottom-page"></div>
                  </div>
                  <div class="el-form-item">
                  <div class="el-form-item-div btn-group">
                      <button type="button" class="el-button cancle" style="width:60px;height:30px;font-size:16px;">取消</button>
                      <button type="button" class="el-button el-button--primary cause_submit" style="width:60px;height:30px;font-size:16px;">确定</button>
                  </div>
              </div>
              </form>`,
        success: function (layero, index) {
            getSpecialCauseData(arr_couse)
        }
    })
}
function getSpecialCauseData(arr_couse) {
    $('#practice_table .table_tbody').html('');
    var urlLeft = '';

    urlLeft += "&page_no=" + pageNoItem + "&page_size=" + pageSizeItem;
    AjaxClient.get({
        url: '/StorageInveController/stockreasonList' + '?' + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var totalData = rsp.paging.total_records;
            if (rsp.results && rsp.results.length) {
                createHtmlItem($('#practice_table .table_tbody'), rsp.results, arr_couse)
            } else {
                noData('暂无数据', 9)
            }
            if (totalData > pageSizeItem) {
                bindPagenationClickItem(totalData, pageSizeItem);
            } else {
                $('#pagenationItem').html('');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取列表失败，请刷新重试', 4);
        }
    })
}
function bindPagenationClickItem(totalData, pageSize) {
    $('#pagenationItem').show();
    $('#pagenationItem').pagination({
        totalData: totalData,
        showData: pageSize,
        current: pageNoItem,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            pageNoItem = api.getCurrent();
            getSpecialCauseData();
        }
    });
}
function createHtmlItem(ele, data, arr_couse) {
    data.forEach(function (item, index) {
        if (arr_couse.length > 0) {
            var index_arr = 0;
            arr_couse.forEach(function (itemc, index) {
                if (item.id == itemc.id) {
                    var tr = ` <tr>
                  <td>${item.name}</td>
                  <td>${item.description}</td>
                  <td class="right">
                      <span class="el-checkbox_input el-checkbox_input_check is-checked" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
                      <span class="el-checkbox-outset"></span>
                      </span>
                  </td>
              </tr>`;
                    index_arr = index + 1;
                    ele.append(tr);
                    ele.find('tr:last-child').data("trData", item);
                }
            });
            // console.log(arr_couse.length-1);
            if (index_arr == 0) {
                var tr = ` <tr>
                  <td>${item.name}</td>
                  <td>${item.description}</td>
                  <td class="right">
                      <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
                      <span class="el-checkbox-outset"></span>
                      </span>
                  </td>
              </tr>`;
                ele.append(tr);
                ele.find('tr:last-child').data("trData", item);
            }

        } else {
            var tr = ` <tr>
                  <td>${item.name}</td>
                  <td>${item.description}</td>
                  <td class="right">
                      <span class="el-checkbox_input el-checkbox_input_check" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
                      <span class="el-checkbox-outset"></span>
                      </span>
                  </td>
              </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData", item);
        }

    })
}

consume.forEach(function(item,index) {
	if(index == 0) {
		str = item;
	}else {
		str = str + ',' + item;
	}
	dat.ids = str;
})

// 初始化
function start() {
	layui.use(['form', 'layedit', 'laydate'], function () {
		var form = layui.form
			, layer = layui.layer
			, layedit = layui.layedit
			, laydate = layui.laydate;
	});
}

// 成本中心
function getCostCenter() {
	AjaxClient.get({
		url: '/OtherOutstoreController/GetcostcenterList?' + _token,
		dataType: 'json',
		success: function (rsp) {
			let data = rsp.field;
			getReplace(data);
		},
		fail: function (rsp) {
			layer.msg('获取成本中心列表失败', { icon: 5, offset: '250px', time: 1500 });
		}
	}, this)
}

function getReplace(data) {
	for(let i=0; i<data.length; i++) {
		cb_str += `
			<option value="${data[i].costcenter_id}">${data[i].CostCenterShortText}</option>
		`;		
	}
	$('#cb').append(cb_str);

	layui.use(['form', 'layedit', 'laydate'], function () {
		var form = layui.form
		form.render();
	});
}


//获得负责人
function getChargeData() {
	AjaxClient.get({
		url: '/basedata/employeeShow?' + _token,
		dataType: 'json',
		success: function (rsp) {
			let data = rsp.results;
			getZr(data);
			start();
		},
		fail: function (rsp) {
		
		}
	}, this);
}

function getZr(data) {
	data.forEach(function(item) {
		zr_str += `
			<option value="${item.id}">${item.name}</option>
		`;
	});
	$('#zr').append(zr_str);

	layui.use(['form', 'layedit', 'laydate'], function () {
		var form = layui.form
		form.render();
	});
}


// 获取信息
information();
function information() {
	AjaxClient.get({
		url: '/OtherOutstoreController/GetComsumeBase?' + _token,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			let item = rsp.results.original.results;
			$('#gh_code').val(item.ghcode);
			$('#zr').append(`<option value="${item.employee_id}">${item.employee_name}</option>`);
			$('#cb').append(`<option value="${item.costcenter_id}">${item.costcenter_name}</option>`);
			$('#gh').append(`<option value="${item.costcenter_type}">${item.costcenter_type == 1 ? '共耗' : '冲销'}</option>`);
			start();

			layui.use(['form', 'layedit', 'laydate'], function () {
				var form = layui.form
				form.render();
			});
		},
		fail: function (rsp) {
			layer.close(layerLoading);
		}
	}, this);
}


getCount();
//  获取界面数据
function getCount() {
	AjaxClient.get({
		url: '/storageinve/pagecheckIndexids' + '?' + _token,
		dataType: 'json',
		data: dat,
		success: function (rsp) {
			getPage(rsp.paging.total_records);
		},
		fail: function (rsp) {
			
		}
	}, this);
}

function getPage(count) {

	layui.use(['laypage', 'layer'], function () {
		var laypage = layui.laypage
			, layer = layui.layer;
		laypage.render({
			elem: 'demo2'
			, count: count
			, theme: '#1E9FFF'
			, jump: function (obj) {
				dat.page_no = obj.curr;
				getDataList();
			}
		});

	});
}

function getDataList() {
	tbody.html('');
	AjaxClient.get({
		url: '/storageinve/pagecheckIndexids' + '?' + _token,
		dataType: 'json',
		data: dat,
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			layer.close(layerLoading);
			let data = rsp.results;
			data.forEach(function (item) {
				let tr = getTr(item);
				tbody.append(tr);
			});
		},
		fail: function (rsp) {
			console.log(rsp);
			layer.close(layerLoading);
		}
	}, this);
}

function getTr(item) {
 
	t.push(item);
	let tr = `
		<tr>
			<td>${item.sale_order_code}</td>
			<td>${item.sales_order_project_code}</td>
			<td>${item.po_number}</td>
			<td>${item.wo_number}</td>
			<td>${item.material_item_no}</td>
			<td>${item.material_name}</td>
			<td>${item.quantity}</td>
			<td>${item.unit}</td>
			<td>${item.lot}</td>
			<td>${item.factory_name}</td>
			<td>${item.depot_name}</td>
			<td>${item.inve_age}</td>
			<td>
				<button type="button" datas-id="${JSON.stringify(item)}"  data-id="${item.id}" class="del layui-btn layui-btn-danger layui-btn-sm"><i class="layui-icon"></i></button>
			</td>
		</tr>
	`;
	return tr;
}


// 删除 
$('body').on('click', '.del', function() {

	let id = $(this).attr('data-id');
	$(this).parent().parent().remove();
	consume.splice(consume.indexOf(id),1);   
	save.items.splice(save.items.indexOf(id),1); 
})

// 保存
$('body').on('click', '#save', function() {
		var arr_couse = [];
		$('.stockreason_id').find('span').each(function (item) {
			arr_couse.push($(this).data('spanData').id)
		});
		var str = arr_couse.join();

		save.code= $('#gh_code').val();
		save.employee_id= $('#zr').val();
		save.costcenter_id= $('#cb').val();
		save.type= $('#gh').val();
		save.order_code= '1';
		save.creator= '1';
		save.remark= '';
		save.stockreason_id = str;
		save.items = JSON.stringify(t);
	AjaxClient.post({
		url: '/OtherOutstoreController/Consumeadd',
		dataType: 'json',
		data:save,
		success: function (rsp) {
			layer.open({
				content:'保存成功,点击确定按钮进行推送！',
				closeBtn : 0,
				yes: function(index) {
					let id = rsp.results;
					AjaxClient.post({
						url: '/sap/synctPropellingMovement',
						dataType: 'json',
						data: {
							code: save.code,
							_token: '8b5491b17a70e24107c89f37b1036078'
						},
						success: function (rsp) {

							layer.confirm('推送成功！', {
								btn: ['确定'],
								closeBtn: 0,
								btn1: function (index) {
									layer.close(index);
									window.location.href = "/Consume/consume";
								}	
							});
							
						},
						fail: function (rsp) {
							layer.msg(rsp.message, { time: 4000, icon: 5 });
						}
					}, this);
					layer.close(index);
				}
			})			
		},
		fail: function (rsp) {
			layer.msg('保存失败！', { time: 3000, icon: 5 });
		}
	}, this);
})