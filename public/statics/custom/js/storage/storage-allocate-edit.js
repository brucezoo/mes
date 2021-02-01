var layerModal,
layerLoading,
ajaxData={},
pageNo=1,
pageSize=5,
materialData=[],
ids=[],
id,
initData=null,
pageNoItem = 1,
pageSizeItem = 50;

$(function(){
	bindEvent();
    getStorageInve();
    id=getQueryString('id');
    if(id!=undefined){
    	getAllocateView(id);
    }else{
    	layer.msg('url链接缺少参数，请给到id参数',{
    		icon: 5,
    		offset: '250px'
    	});
    }
});

$('body').on('click', '.select', function (e) {
    e.stopPropagation();
    showCause($(this).attr('data-id'))
});
$('body').on('click', '#viewCause .cause_submit', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
    var _ele = $("#stockreason_id");
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
    var _ele = $("#stockreason_id"), arr_couse = [];

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
                      <span class="el-checkbox_input el-checkbox_input_check is-checked has_stockreason" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
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
                      <span class="el-checkbox_input el-checkbox_input_check has_stockreason" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
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
                      <span class="el-checkbox_input el-checkbox_input_check has_stockreason" id="check_input${item.preselection_id}" data-id="${item.preselection_id}">
                      <span class="el-checkbox-outset"></span>
                      </span>
                  </td>
              </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData", item);
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
        getStorageInve();
    }
});
}

//查看调拨信息
function getAllocateView(id){
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
        url: URLS['allocate'].show+_token+"&id="+id+urlLeft,
        dataType:'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            initData=rsp.results[0];
            getPlants();
			getDepot();
			getSubarea();
			getLocateBin();
            $('#code').val(rsp.results[0].code);
            $('#plant_id').val(rsp.results[0].plant_name);
            $('#depot_id').val(rsp.results[0].depot_name);
            $('#subarea_id').val(rsp.results[0].subarea_name);
            $('#bin_id').val(rsp.results[0].bin_name);
            $('#remark').val(rsp.results[0].remark);
            showAddItem(rsp.results[0].groups);
            materialData=rsp.results[0].groups;

            if(rsp.results[0].stockreason.length)
            {
                rsp.results[0].stockreason.forEach(function (items, index) {
                    $('#stockreason_id').append(`<span data-stockreason_id="${items.id}">
                            <div style="display: inline-block">${items.name}-${items.description}</div>
                        </span>`);
                })

            }

            if(rsp.results[0].stockreason.length)
            {
                $("#stockreason_id").find('span').each(function (item2) {
                    var stockreason_id = $(this).attr('data-stockreason_id');
                    var _ele = $(this);
                    rsp.results[0].stockreason.forEach(function(item1,index){
                        if(stockreason_id==item1.id)
                        {
                            _ele.data("spanData", item1);
                        }

                    })
                })
            }

        },
        fail:function (rsp) {
            layer.close(layerLoading);
            layer.msg("获取信息失败",{icon:5,offset:'250px'});
        }
    },this);
}

//添加项
function showAddItem(data) {
    var ele = $('.storage_blockquote .item_table .t-body');
    ele.html("");
    if(data.length){
        data.forEach(function (item,index) {
            var delBtn=`<button type="button" id="edit-bom-btn" data-id="${item.id}" class="bom-info-button bom-info-del bom-item-del bom-del">删除</button>`,
                editBtnFlag = '',
                editStyleFlag = '';
                var soAndSpo='';
            if(item.sale_order_code!=""||item.sales_order_project_code!=""){
              soAndSpo=item.sale_order_code+'/'+item.sales_order_project_code;
            }else{
              soAndSpo=''
            }
            var tr =  `
            <tr class="ma-tritem" data-id="${item.id}">
                  <td>${soAndSpo}</td>
                  <td>${tansferNull(item.po_number)}</td>
                  <td>${tansferNull(item.wo_number)}</td>
                  <td>${tansferNull(item.material_item_no)}</td>
                  <td>${tansferNull(item.material_name)}</td>
                  <td>${tansferNull(item.lot)}</td>
                  <td><input type="number" class="el-input bom-ladder-input usage_number" style="width:100px;" value="${tansferNull(item.quantity)}"></td>
                  <td>${tansferNull(item.unit_text)}</td>
                  <td>${tansferNull(item.plant_name)}</td>
                  <td>${tansferNull(item.depot_name)}</td>
                  <td>${tansferNull(item.subarea_name)}</td>
                  <td>${tansferNull(item.bin_name)}</td>
                  <td><input class="el-textarea bom-textarea remark" value="${tansferNull(item.remark)}"></td>
                  <td class="tdright">
                    ${delBtn}
                  </td>
            </tr>`;
            ele.append(tr);
            ele.find('tr:last-child').data("trData",item);
        });
    }else{
        var tr =`<tr>
                   <td class="nowrap" colspan="11" style="text-align: center;">暂无数据</td>
                </tr>`;
        ele.append(tr);
    }
}

//获取实时库存列表
function getStorageInve(){
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['allocate'].inve+_token+urlLeft,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			var totalData=rsp.paging.total_records;
			if(rsp.results && rsp.results.length){
              createModalHtml($('#addAllocateItem .table_tbody'),rsp.results);
			}else{
              $('#addAllocateItem .table_tbody').html(`<tr><td colspan="11">暂无数据</td></tr>`);
			}
			if(totalData>pageSize){
				bindPagenationClick(totalData,pageSize);
			}else{
				$('#pagenation').html('');
			}
		},
		fail: function(rsp){
			layer.close(layerLoading);
			noData('获取调拨单列表失败，请刷新重试',9);
		},
		complete: function(){
			$('#searchForm .submit').removeClass('is-disabled');	
		}
	},this)
}

//添加调拨单
function addAllocate(data){
	AjaxClient.post({
		url: URLS['allocate'].store+_token,
		data: data,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			$('.submit.save').removeClass('is-disabled');
			LayerConfig('success','添加成功',function(){
				resetAllData();
			});
		},
		fail: function(rsp){
			layer.close(layerLoading);
			if(rsp&&rsp.message!=undefined&&rsp.message!=null){
				LayerConfig('fail',rsp.message);
			}
			if(rsp&&rsp.field!==undefined){
				showInvalidMessage(rsp.field,rsp.message);
			}
		},
		complete: function(){
            $('.submit.submit').removeClass('is-disabled');
        }
	},this);
}

//编辑仓库调拨
function editStorageAllocate(data){
	AjaxClient.post({
		url: URLS['allocate'].update+_token,
		data: data,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
            $('.submit.save').removeClass('is-disabled');
            LayerConfig('success','编辑成功',function(){
            });
		},
		fail: function(rsp){
			layer.close(layerLoading);
			console.log('编辑仓库期初失败');
			if(rsp&&rsp.message!=undefined&&rsp.message!=null){
				LayerConfig('fail',rsp.message);
			}
		},
	},this);
}

//获取厂区列表
function getPlants(val){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['depot'].plants+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                var lis='',innerhtml='';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.factory_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.factory_name}</li>`;
                });
                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.plant').find('.el-select-dropdown-list').html(innerhtml);
                if(initData&&initData.plant_id){
                  $('.el-form-item.plant').find('.el-select-dropdown-item[data-id='+initData.plant_id+']').click();
                }
            }   
        },
        fail: function(rsp){
            layer.msg('获取厂区列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//获取仓库列表
function getDepot(){
    AjaxClient.get({
        url: URLS['depot'].store+_token,
        dataType: 'json',
		success: function(rsp){
		        layer.close(layerLoading);
		        if(rsp.results&&rsp.results.length){
		            var lis='',innerhtml='';
		            rsp.results.forEach(function(item){
		                lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.depot_name}</li>`;
		            });
		            innerhtml=`
		                    <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
		                    ${lis}`;
		            $('.el-form-item.depot').find('.el-select-dropdown-list').html(innerhtml);
		            if(initData&&initData.depot_id){
		              $('.el-form-item.depot').find('.el-select-dropdown-item[data-id='+initData.depot_id+']').click();
		            }
		        }   
		    },
        fail: function(rsp){
            layer.msg('获取部门列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//获取分区列表
function getSubarea(){
    AjaxClient.get({
        url: URLS['subarea'].list+_token,
        dataType: 'json',
        success: function(rsp){
		        layer.close(layerLoading);
		        if(rsp.results&&rsp.results.length){
		            var lis='',innerhtml='';
		            rsp.results.forEach(function(item){
		                lis+=`<li data-id="${item.subarea_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.subarea_name}</li>`;
		            });
		            innerhtml=`
		                    <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
		                    ${lis}`;
		            $('.el-form-item.subarea').find('.el-select-dropdown-list').html(innerhtml);
		            if(initData&&initData.subarea_id){
		              $('.el-form-item.subarea').find('.el-select-dropdown-item[data-id='+initData.subarea_id+']').click();
		            }
		        }   
		    },
        fail: function(rsp){
            //layer.msg('获取分区列表失败', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

//获取仓位档案列表
function getLocateBin() {
    AjaxClient.get({
        url: URLS['locate'].bin+_token,
        dataType: 'json',
        success: function(rsp){
	        layer.close(layerLoading);
	        if(rsp.results&&rsp.results.length){
	            var lis='',innerhtml='';
	            rsp.results.forEach(function(item){
	                lis+=`<li data-id="${item.bin_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.bin_name}</li>`;
	            });
	            innerhtml=`
	                    <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
	                    ${lis}`;
	            $('.el-form-item.bin').find('.el-select-dropdown-list').html(innerhtml);
	            if(initData&&initData.bin_id){
	              $('.el-form-item.bin').find('.el-select-dropdown-item[data-id='+initData.bin_id+']').click();
	            }
	        }   
	    },
        fail: function (rsp) {
            layer.msg('获取仓位档案列表失败，请刷新重试', {icon: 2,offset: '250px'});
        }
    },this)
}

//生成厂区列表
function selectHtml(fileData,typeid,value){
    var innerhtml,lis='',selectName='',selectId='';
   fileData.forEach(function(item){
        if(value!=undefined&&value==item.factory_id){
            selectName=item.factory_name;
            selectId=item.factory_id;
        }
        lis+=`<li data-id="${item.factory_id}" class="el-select-dropdown-item ${value!=undefined&&item.factory_id==value?'selected':''}" class=" el-select-dropdown-item">${item.factory_name}</li>`;
    });
    innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" value="${selectName!=''?selectName:'--请选择--'}" style="width:100%">
            <input type="hidden" class="val_id" id="${typeid}" value="${selectId!=''?selectId:''}">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div></div>`;
        return innerhtml;
}

//生成仓库、仓区列表
function selectHtml(fileData,typeid,value){
    var innerhtml,lis='',selectName='',selectId='';
   fileData.forEach(function(item){
        if(typeid=='subarea_id'){
            if(value!=undefined&&value==item.subarea_id){
                selectName=item.subarea_name;
                selectId=item.subarea_id;
            }
            lis+=`<li data-id="${item.subarea_id}" class="el-select-dropdown-item ${value!=undefined&&item.subarea_id==value?'selected':''}" class=" el-select-dropdown-item">${item.subarea_name}</li>`;
        }else{
            if(value!=undefined&&value==item.id){
                selectName=item.depot_name;
                selectId=item.id;
            }
            lis+=`<li data-id="${item.id}" class="el-select-dropdown-item ${value!=undefined&&item.id==value?'selected':''}" class=" el-select-dropdown-item">${item.depot_name}</li>`;
        }
    });
    innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" value="${selectName!=''?selectName:'--请选择--'}" style="width:100%">
            <input type="hidden" class="val_id" id="${typeid}" value="${selectId!=''?selectId:''}">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div></div>`;
        return innerhtml;
}

//生成仓位列表
function selectHtml(fileData,typeid,value){
    var innerhtml,lis='',selectName='',selectId='';
   fileData.forEach(function(item){
        if(value!=undefined&&value==bin.id){
            selectName=item.bin_name;
            selectId=item.bin_id;
        }
        lis+=`<li data-id="${item.bin_id}" class="el-select-dropdown-item ${value!=undefined&&item.id==value?'selected':''}" class=" el-select-dropdown-item">${item.bin_name}</li>`;
    });
    innerhtml=`<div class="el-select-dropdown-wrap"><div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" value="${selectName!=''?selectName:'--请选择--'}" style="width:100%">
            <input type="hidden" class="val_id" id="${typeid}" value="${selectId!=''?selectId:''}">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div></div>`;
        return innerhtml;
}

//获取id
function getIds(data,flag){
    var ids=[];
        data.forEach(function(item){
            ids.push(item.id);
        });
    return ids;
}

//操作数组
function actArray(data,flag,id){
    var ids=getIds(data,flag);
    var index=ids.indexOf(Number(id));
    data.splice(index,1);
}

function addinformation(){
    var array = [];
    $('.ma-tritem').each(function(item){
      var data=$(this).data('trData');
        var obj = {
            sale_order_code: data.sale_order_code,
            sales_order_project_code : data.sales_order_project_code,
            po_number : data.po_number,
            wo_number : data.wo_number,
            material_id : data.material_id,
            remark:  $(this).find('.remark').val().trim(),
            unit_id: data.unit_id,
            lot: data.lot,
            plant_id: data.plant_id,
            depot_id: data.depot_id,
            subarea_id: data.subarea_id,
            bin_id: data.bin_id,
            inve_id: data.id,
            real_quantity: $(this).find('.usage_number').val().trim(),
            creator: 1
        }
        array.push(obj);
    });
    return array;
}

function createModalHtml(ele,data){
  ele.html('');
  data.forEach(function(item,index){
    var soAndSpo='';
    if(item.sale_order_code!=""||item.sales_order_project_code!=""){
      soAndSpo=item.sale_order_code+'/'+item.sales_order_project_code;
    }else{
      soAndSpo=''
    }

    var tr = `
    <tr>
    <td class="left norwap">
    <span class="el-checkbox_input material-check">
        <span class="el-checkbox-outset"></span>
    </span>
    </td>
    <td>${soAndSpo}</td>
    <td>${tansferNull(item.po_number)}</td>
    <td>${tansferNull(item.wo_number)}</td>
    <td>${tansferNull(item.material_item_no)}</td>
    <td>${tansferNull(item.material_name)}</td>
    <td>${tansferNull(item.lot)}</td>
    <td>${tansferNull(item.unit_text)}</td>
    <td>${tansferNull(item.plant_name)}</td>
    <td>${tansferNull(item.depot_name)}</td>
    <td>${tansferNull(item.subarea_name)}</td>
    <td>${tansferNull(item.bin_name)}</td>
    <td>${tansferNull(item.quantity)}</td>
    </tr>
    `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData",item);
  })
}

function createHtml(ele,data){
  ele.html('');
  data.forEach(function(item,index){
   var delBtn=`<button type="button" id="edit-bom-btn" data-id="${item.id}" class="bom-info-button bom-info-del bom-item-del bom-del">删除</button>`,
        editBtnFlag = '',
        editStyleFlag = '';
        var soAndSpo='';
        if(item.sale_order_code!=""||item.sales_order_project_code!=""){
          soAndSpo=item.sale_order_code+'/'+item.sales_order_project_code;
        }else{
          soAndSpo=''
        }
    var tr = `
    <tr class="ma-tritem">
    <td>${soAndSpo}</td>
    <td>${tansferNull(item.po_number)}</td>
    <td>${tansferNull(item.wo_number)}</td>
    <td>${tansferNull(item.material_item_no)}</td>
    <td>${tansferNull(item.material_name)}</td>
    <td>${tansferNull(item.lot)}</td>
    <td>${tansferNull(item.unit_text)}</td>
    <td>${tansferNull(item.plant_name)}</td>
    <td>${tansferNull(item.depot_name)}</td>
    <td>${tansferNull(item.subarea_name)}</td>
    <td>${tansferNull(item.bin_name)}</td>
    <td><input type="number" class="bom-ladder-input usage_number" style="width:100px;" value="${tansferNull(item.quantity)}"></td>
    <td><input class="el-textarea bom-textarea remark" name id cols="30" rows="3" value="${tansferNull(item.remark)}"></td>
    <td class="tdright">
    ${delBtn}
    </td>
    </tr>
    `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData",item);
  })
}

//清空所有数据
function resetAllData(){
  //常规信息
  var basicForm = $('#addSBasic_form');
  basicForm.find('#code').val('');
  basicForm.find('.el-form-item.plant .el-select-dropdown-item.kong').click();
  basicForm.find('.el-form-item.depot .el-select-dropdown-item.kong').click();
  basicForm.find('.el-form-item.subarea .el-select-dropdown-item.kong').click();
  basicForm.find('.el-form-item.bin .el-select-dropdown-item.kong').click();
  basicForm.find('#remark').val('');
  basicForm.find('.storage_table.item_table .t-body').
  html(`<tr>
      <td class="nowrap" colspan="11" style="text-align: center;">暂无数据</td>
    </tr>`);
  basicForm.find('.storage-add-new-item').addClass('is-disabled');
}

function bindEvent(){
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

  //添加项
    $('body').on('click','.storage-add-item:not(.is-disabled)',function () {   
      addAlloItemModal();
    });

    //删除项
    $('body').on('click','.bom-del',function(){
       var that=$(this);
       layer.confirm('将删除项?',{icon: 3,title:'提示',offset: '250px',end:function(){
       }},function(index){
        if(that.hasClass('bom-item-del')){
            var ele=that.parents('.ma-tritem'),
            id=that.attr('data-id');
            $(this).remove();
            ele.remove();
            actArray(materialData,'material',id);
        }
        layer.close(index);
       }); 
    });
    
    //保存
    $('body').on('click','.submit.save',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $('#addSBasic_form');
            var code = parentForm.find('#code').val().trim(),
                plant_id = parentForm.find('#plant_id').val().trim(),
                depot_id = parentForm.find('#depot_id').val().trim(),
                subarea_id = parentForm.find('#subarea_id').val(),
                bin_id = parentForm.find('#bin_id').val(),
                remark = parentForm.find('#remark').val().trim();
                var arr_couse = [];
                $('.stockreason_id').find('span').each(function (item) {
                    arr_couse.push($(this).data('spanData').id)
                });
                var str = arr_couse.join();
                editStorageAllocate({
                	id: id,
                    code: code,
                    plant_id: plant_id,
                    depot_id: depot_id,
                    subarea_id: subarea_id,
                    bin_id: bin_id,
                    remark: remark,
                    stockreason_id: str,
                    items: JSON.stringify(addinformation()),
                })           
        }
    })

    //checkbox 点击
    $('body').on('click','.el-checkbox_input:not(.noedit)',function (e) {
        e.preventDefault();
        $(this).toggleClass('is-checked');
        var ids=getIds(materialData,'material');
        var data=$(this).parents('tr').data('trData');
        if($(this).hasClass('is-checked') && !$(this).hasClass('has_stockreason')){
          materialData.push(data);
        }else{
          var index=ids.indexOf(Number(data.id));
          index>-1?materialData.splice(index,1):null;
        }
    });

    //搜索按钮物料
    $('body').on('click','.choose-search',function(){
      if($(this).hasClass('choose-material')){
        var parentForm=$('.addAllocateItem');  
          pageNo1=1;
          ajaxData={
            material_item_no: parentForm.find('#material_item_no').val(),
            material_name: parentForm.find('#material_name').val(),
          };
          getStorageInve();
        }
    });
    
    //保存添加项
    $('body').on('click','.submit',function () {
        if($(this).hasClass('ma-item-ok')){
            createHtml($('.storage_table.item_table .t-body'),materialData);//添加项
            layer.close(layerModal);
        }
    });
}

//添加项弹层
function addAlloItemModal(){
  var width=33;
   layerModal = layer.open({
        type: 1,
        title: '选择物料',
        offset: '100px',
        area: '1300px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="addAllocateItem formModal" id="addAllocateItem">
          <div class="selectMaterial_container">
            <div class="selectMaterial_table">
               <ul class="query-item-storage">
                    <li>
                        <div class="el-form-item" style="width: ${width}%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料编码</label>
                                <input type="text" id="material_item_no"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: ${width}%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 100px;">物料名称</label>
                                <input type="text" id="material_name"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: 10%;">
                            <div class="el-form-item-div btn-group">
                                <button style="margin-top: 8px;" type="button" class="el-button choose-search choose-material">搜索</button>
                            </div>
                        </div>
                    </li>
                </ul>
               <div class="table-container select_table_margin">
                  <div class="table-container table_page">
                        <div id="pagenation" class="pagenation" style="height: 22px;"></div>
                        <table class="bom_table">
                          <thead>
                            <tr>
                              <th class="thead"></th>
                              <th class="thead">销售订单号/行项号</th>
                              <th class="thead">生产订单号</th>
                              <th class="thead">工单号</th>
                              <th class="thead">物料编码</th>
                              <th class="thead">名称</th>
                              <th class="thead">批次</th>
                              <th class="thead">单位</th>
                              <th class="thead">厂区</th>
                              <th class="thead">仓库</th>
                              <th class="thead">分区</th>
                              <th class="thead">仓位</th>
                              <th class="thead">数量</th>
                            </tr>
                          </thead>
                          <tbody class="table_tbody">
                          </tbody>
                        </table>
                  </div>
               </div>
            </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary ma-item-ok submit">确定</button>
            </div>
          </div>       
    </form>`,
    success: function(layero, index){
          getStorageInve();
    },
    end: function(){
    }

    })
}











