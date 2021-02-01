var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=50,
    ids=[],
    ajaxData={}
    pageNoItem = 1,
    pageSizeItem = 50;
$(function(){
	resetParam();
	getInventoryData();
	bindEvent();
	batchaudit();//批量审核
})

$('body').on('click', '.select', function (e) {
    e.stopPropagation();
    showCause($(this).attr('data-id'))
});
$('body').on('click', '.viewCause .cause_submit', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
    var data_id = $(this).attr('data_id');
    var _ele = $("#stockreason_id_"+data_id);

    _ele.html('');
    var stockreason_arr = [];
    // _ele.find('span').each(function (item) {
    //     stockreason_arr.push($(this).data('spanData').id)
    // });

    $('#practice_table_'+data_id+' .table_tbody tr').each(function (item) {
        if ($(this).find('.el-checkbox_input_check').hasClass('is-checked')) {
            let itemc = $(this).data('trData');
            _ele.append(`<span>
                            <div style="display: inline-block">${itemc.name}-${itemc.description}</div>
                        </span>`);
            _ele.find('span:last-child').data("spanData", itemc);
            stockreason_arr.push(itemc.id)
        }
    })

    //调用ajax将新数据写入

    var stockreason_id = stockreason_arr.join();

    AjaxClient.post({
        url: '/StorageCheck/storageCheckstockreason',
        data: {'stockreason_id':stockreason_id,'check_id':data_id,_token: TOKEN},
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
        },
        complete: function(){
            $('.submit.submit').removeClass('is-disabled');
        }
    },this);



});

//清空所有数据
function resetAllData(){
    //常规信息
    var basicForm = $('#addSBasic_form');
    basicForm.find('#code').val('');
    basicForm.find('#personInCharge').val('');
    basicForm.find('#workorder_code').val('');
    basicForm.find('#indent_code').val('');
    basicForm.find('#ownerval').val('--请选择--');
    basicForm.find('#remark').val('');
    basicForm.find('.storage_table.item_table .t-body').
    html(`<tr>
      <td class="nowrap" colspan="15" style="text-align: center;">暂无数据</td>
    </tr>`);
    basicForm.find('.storage-add-new-item').addClass('is-disabled');
}

$('body').on('click', '.btn-group:not(".disabled") .cancle', function (e) {
    e.stopPropagation();
    layer.close(layerModal);
});
function showCause(id) {
    var _ele = $("#stockreason_id_"+id), arr_couse = [];

    _ele.find('span').each(function (item) {
        if($(this).data('spanData'))
        {
            arr_couse.push($(this).data('spanData'))
        }

    });
    layerModal = layer.open({
        type: 1,
        title: '选择原因',
        offset: '100px',
        area: ['500px', '510px'],
        shade: 0.1,
        shadeClose: false,
        resize: true,
        content: `<form class="viewAttr formModal viewCause">
                  <input type="hidden" id="itemId" value="${id}">
                  <div class="table_page">
                      <div class="wrap_table_div" style="overflow-y: scroll;height: 400px;">
                          <table class="sticky uniquetable commontable" id="practice_table_${id}">
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
                      <button type="button" class="el-button el-button--primary cause_submit" style="width:60px;height:30px;font-size:16px;" data_id="${id}">确定</button>
                  </div>
              </div>
              </form>`,
        success: function (layero, index) {
            getSpecialCauseData(arr_couse,id)
        }
    })
}
function getSpecialCauseData(arr_couse,id) {
    $("#practice_table_"+id+" .table_tbody").html('');
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
                createHtmlItem($("#practice_table_"+id+" .table_tbody"), rsp.results, arr_couse)
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

//批量审核
function batchaudit()
{
	$("#storage_initial_auditing").click(function(){
	  var ids=[];
	  $("#table_storage_table").find(".table_tbody").find("tr").each(function(){
   	    var chkchass = $(this).find(".el-checkbox_input").attr("class");
   	    if(chkchass.indexOf("is-checked")>=0)
   	    {
          ids.push($(this).find(".el-checkbox_input").attr("id"));
   	    }

       });
	  //调用接口提交
	  if(ids.length<=0)
	  {
        alert("请选择要审核的数据");
        return;
	  }
      if(confirm("确认审核选中的数据？"))
      {
	   batchAuditCheck(ids);
	  }
	});
}

//批量审核
function batchAuditCheck(ids){
     var arr = [];
	 ids.forEach(function(item,index){
	 	arr.push({id:item})
     }) 
     var id = JSON.stringify(arr)
     var data = {
     	_token:TOKEN,
     	ids:id
     };
	AjaxClient.post({
		url: URLS['check'].batchAudit,
		data:data,
		dataType: 'json',
		beforeSend: function(){
			layer.close(layerLoading);
		},
		success: function(rsp){
			layer.close(layerLoading);
			getInventoryData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time:1500});
		}
	},this)
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
			getInventoryData();
		}
	});
}

//重置搜索参数
function resetParam(){
	ajaxData={
		material_item_no: '',
		material_name: '',
		isaudit: '0',
	}
}

//获取实时库存列表
function getInventoryData(){
     $('.table_tbody').html('');
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;	
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['storeshow'].list+_token+urlLeft,
		dataType:'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
            layer.close(layerLoading);
            // if(layerModal!=undefined){
            //     layerLoading = LayerConfig('load');
            // }
            var totalData=rsp.paging.total_records;
            if(rsp.results && rsp.results.length){
                createHtml($('.table_tbody'),rsp.results)
            }else{
                noData('暂无数据',14)
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
		fail:function(rsp){
			layer.close(layerLoading);
            noData('获取实时列表失败，请刷新重试',13);		
		},
		complete:function(){
			$('#searchForm .submit').removeClass('is-disabled');			
		}
	},this);
}
$(document).ready(function(){
    getCode('');
})
//获取编码
function getCode(typecode){
  var data={
    _token: TOKEN,
    type_code: typecode,
    type: 13
  };
  AjaxClient.post({
    url: URLS['check'].getCode,
    data: data,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success: function(rsp){
      layer.close(layerLoading);
      if(rsp&&rsp.results){
        setting_id=rsp.results.encoding_setting_id;
        automatic_number=rsp.results.automatic_number;
        if(rsp.results.automatic_number=='1'){//自动生成允许手工改动
          $('#code').val(rsp.results.code).attr('data-val',rsp.results.code);
        }else if(rsp.results.automatic_number=='2'){//自动生成不允许手工改动
          
          $('#code').val(rsp.results.code).attr({'readonly':'readonly','data-val':rsp.results.code});
        }else{
          $('#code').removeAttr('readonly');
        }
      }else{
        console.log('获取库存调拨编码失败');
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);
      console.log('获取库存调拨编码失败');
    }
  },this);
}

//生成列表数据
function createHtml(ele,data){
	var optionbutton = "";
	var checkurl=$('#checkindex_check').val();
    var data_id = $('.el-select-dropdown-wrap').find('.selected').attr('data-id');
	ele.html('');
	data.forEach(function(item,index){
		if(item.status=='1')
			optionbutton = `<button data-id="${item.check_id}" class="button pop-button reauditing" onclick="reauditCheckData(this)">反审核</button>`;
		else
			optionbutton = '&nbsp;';
		var tr=`
		    <tr>
                <td class="left norwap">
		        <span class="el-checkbox_input " id="${item.check_id}">
		           <span class="el-checkbox-outset"></span>
		           </span>
                </span>
		        </td>
                <td>${tansferNull(item.sale_order_code)}</td>
                <td>${tansferNull(item.sales_order_project_code)}</td>
                <td>${tansferNull(item.depot_name)}</td>
                <td>${tansferNull(item.material_item)}</td>
                <td>${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.unit_text)}</td>
                <td>${tansferNull(item.oquantity)}</td>
                <td><input type="number" data-id="${item.check_id}" onkeyup="value=value.replace(/\\-/g,'')" class="number_val deal" value="${tansferNull(item.nquantity)}" style="border: none;color: #393939;font-size: 12px;"></td>
                <td>${tansferNull(item.bquantity)}</td>
                <td>${tansferNull(item.sign)}</td><td>`;
                //如果有盘点差异才需要显示库存差异原因
				if(item.sign!='相同')
				{
                    tr+=`
						<div>
						<div class="el-form-item">
							<div class="el-form-item-div">
							<div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="stockreason_id_${item.check_id}" class="stockreason_id">`;
                    //如果已经有库存差异原因就显示一下
                    if(item.stockreason.length)
                    {
                        item.stockreason.forEach(function(item1,index){
                            tr+=`
                              <span data-stockreason_id="${item1.id}">
                                 <div style="display: inline-block" >${item1.name}-${item1.description}</div>
                              </span>
                            `;
                        })
                    }

                    tr+=` </div>`;
                    if(data_id!=1)
                    {
                        tr+=` <button type="button" data-id="${item.check_id}" class="button pop-button select">选择</button>`;
                    }

                    tr+=`</div>
							<p class="errorMessage" style="padding-left: 20px;"></p>
							</div>
							</div>
						`;
				}


        tr+=`</td><td>${tansferNull(item.remark)}</td>
                <td class="left nowrap">
                   ${optionbutton}
                </td>		       
	        </tr>
		`;
		ele.append(tr);
		ele.find('tr:last-child').data("trData",item);
        if(item.stockreason.length)
        {
            $("#stockreason_id_"+item.check_id).find('span').each(function (item2) {
                var stockreason_id = $(this).attr('data-stockreason_id');
                var _ele = $(this);
                item.stockreason.forEach(function(item1,index){
                    if(stockreason_id==item1.id)
                    {
                        _ele.data("spanData", item1);
                    }

                })
            })


        }


	});
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

	$('body').on('click','.el-checkbox_input',function(){
    	$(this).toggleClass('is-checked');
    	var id=$(this).attr("id")
    	if($(this).hasClass('is-checked')){
    		// ids.push($(this).attr("id"));	
    		if(ids.indexOf(id)==-1){
    			ids.push(id);
    		}	
	    }else{
	    	var index=ids.indexOf(id);
	    	ids.splice(index,1);
	    }
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

	//搜索期初数据
    $('body').on('click','#searchForm .submit',function(e){
    	e.stopPropagation();
    	e.preventDefault();
    	$('#searchForm .el-item-hide').slideUp(400,function(){
    		$('#searchForm .el-item-show').css('backageground','transparent');
    	});
    	$('.arrow .el-input-icon').removeClass('is-reverse');
    	if(!$(this).hasClass('is-disabled')){
    		$(this).addClass('is-disabled');
    		var parentForm=$(this).parents('#searchForm');
    		$('.el-sort').removeClass('ascending descending');
    		pageNo=1;
    		ajaxData={
    			material_item_no: encodeURIComponent(parentForm.find('#material_item_no').val().trim()),
    			material_name: encodeURIComponent(parentForm.find('#material_name').val().trim()),
    			isaudit: encodeURIComponent(parentForm.find('#is_audit').val().trim())
    		}
    		getInventoryData();
    	}
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
    	e.stopPropagation();
    	var parentForm=$(this).parents('#searchForm');
    	parentForm.find('#material_item_no').val('');
    	parentForm.find('#material_name').val('');
    	parentForm.find('#is_audit').val('0');
        parentForm.find('#is_auditShow').val('未审核');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getInventoryData();
    });

      //更多搜索条件下拉
    $('#searchForm').on('click','.arrow:not(".noclick")',function(e){
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that=$(this);
        that.addClass('noclick');
        if($(this).find('.el-icon').hasClass('is-reverse')){
            $('#searchForm .el-item-show').css('background','#fff');
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

    $("#fileInput").on("change", function(){
      console.log(999);
	  var formData = new FormData();
	  var ele=$("#fileInput")[0];
	  if(ele.files&&ele.files[0]){
	  	formData.append("import_file", ele.files[0]);
	  	$.ajax({
	        type: "POST",
	        url: URLS['check'].import+ _token,
	        enctype: 'multipart/form-data',
	        data: formData,
	        cache: false,
	        contentType: false,
	        processData: false,
	        dataType: "json",
	        beforeSend: function(){
	        	layerLoading = LayerConfig('load');
	        },
	        success: function(data) {
		        layer.close(layerLoading);
		        LayerConfig('success','导入成功');	
		        getInventoryData();        
	        },
	        error: function(data) {
	        	layer.close(layerLoading);
	        	noData('导入失败',13);
	        }
	    	})
	  }
	});

}

//反审
function reauditCheckData(obj){
	if(confirm("确认反审核该数据？"))
	{

		var id = $(obj).attr("data-id");
	    var data={
		    id: id,
		    _token: TOKEN
	     };
	    AjaxClient.post({
		 url: URLS['check'].reaudit+_token,
		 data: data,
		 dataType: 'json',
		 beforeSend: function(){
			layer.close(layerLoading);
		 },
		 success: function(rsp){
			layer.close(layerLoading);
			getInventoryData();   
		 },
		 fail: function(rsp){
			layer.close(layerLoading);
			layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
			if(rsp.code==404){
				getInventoryData();   
			}
		}
	    },this)
	}
   
}

$('body').on('blur', '.number_val', function (e) {
	e.stopPropagation();
	updateAmountInspection($(this).attr('data-id'), $(this).val())
});


function updateAmountInspection(id,value) {
    AjaxClient.post({
        url: URLS['check'].updateAmountInspection,
        dataType: 'json',
		data: { 'id': id,'real_quantity':value,_token:TOKEN},
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
			LayerConfig('success','修改成功！');
			getInventoryData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}

//全选
function selectpageall()
{
  var ischeck = $("#selectall").attr("class");
  if(ischeck.indexOf("is-checked") < 0)
  {
     $("#table_storage_table").find(".table_tbody").find("tr").each(function(){
   	    var chkchass = $(this).find(".el-checkbox_input").attr("class");
   	    if(chkchass.indexOf("is-checked")<0)
   	    {
           $(this).find(".el-checkbox_input").addClass("is-checked");
   	    }

       });
  }
  else
  {
  	$("#table_storage_table").find(".table_tbody").find("tr").each(function(){
   	    var chkchass = $(this).find(".el-checkbox_input").attr("class");
   	    if(chkchass.indexOf("is-checked")>=0)
   	    {
           $(this).find(".el-checkbox_input").removeClass("is-checked");
   	    }

       });
  }
}


