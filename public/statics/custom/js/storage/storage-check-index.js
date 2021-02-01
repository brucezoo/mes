var
	layerModal,
    layerLoading,
    pageNo=1,
    pageSize=50,
    ids=[],
    ajaxData={}
    ;
$(function(){
	resetParam();
	getInventoryData();
	bindEvent();
});
// $(document).ready(function(){
//     getCode('');
// });

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
		plant_name: '',
		depot_name: '',
		subarea_name: '',
		workshop_name: '',
		bin_name: '',
		depot_code: '',
	}
}

//获取实时库存列表
function getInventoryData(){
     $('.table_tbody').html('');
  var urlLeft='';
  var url='';
  var parentForm=$('#searchForm');

	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;
  }
  if(parentForm.find('#workshop_name').val().trim()){
    url=URLS['inve'].checkList;
  }else{
    url=URLS['inve'].list;
  }
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: url+_token+urlLeft,
		dataType:'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layerLoading = LayerConfig('load');
            }
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

// //获取编码
// function getCode(typecode){
//   var data={
//     _token: TOKEN,
//     type_code: typecode,
//     type: 13
//   };
//   AjaxClient.post({
//     url: URLS['check'].getCode,
//     data: data,
//     dataType: 'json',
//     beforeSend: function(){
//       layerLoading = LayerConfig('load');
//     },
//     success: function(rsp){
//       layer.close(layerLoading);
//       if(rsp&&rsp.results){
//         setting_id=rsp.results.encoding_setting_id;
//         automatic_number=rsp.results.automatic_number;
//         if(rsp.results.automatic_number=='1'){//自动生成允许手工改动
//           $('#code').val(rsp.results.code).attr('data-val',rsp.results.code);
//         }else if(rsp.results.automatic_number=='2'){//自动生成不允许手工改动
//
//           $('#code').val(rsp.results.code).attr({'readonly':'readonly','data-val':rsp.results.code});
//         }else{
//           $('#code').removeAttr('readonly');
//         }
//       }else{
//         console.log('获取库存调拨编码失败');
//       }
//     },
//     fail: function(rsp){
//       layer.close(layerLoading);
//       console.log('获取库存调拨编码失败');
//     }
//   },this);
// }

//生成列表数据
function createHtml(ele,data){
	var checkurl=$('#checkindex_check').val();
	ele.html('');
	data.forEach(function(item,index){
		var tr=`
		    <tr>
                <td>${tansferNull(item.sale_order_code?tansferNull(item.sale_order_code)+"/"+tansferNull(item.sales_order_project_code):'')}</td>
                <td>${tansferNull(item.material_item_no)}</td>
                <td>${tansferNull(item.material_name)}</td>
                <td>${tansferNull(item.quantity)}</td>
                <td>${tansferNull(item.unit_text)}</td>
                <td>${tansferNull(item.lot)}</td>
                <td>${tansferNull(item.plant_name)}</td>
                <td>${tansferNull(item.depot_name)}</td>
                <td>${tansferNull(item.workshop_name)}</td>				
                <td>${tansferNull(item.subarea_name)}</td>
                <td>${tansferNull(item.bin_name)}</td>
                <td>${tansferNull(item.inve_age)}（天）</td>
                <td>${tansferNull(item.lock_status?'已锁库存':'未锁库存')}</td>
                <td>${tansferNull(item.remark)}</td>		       
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
    		console.log($(this))
    		// ids.push($(this).attr("id"));
    		if(ids.indexOf(id)==-1){
    			ids.push(id);
    		}
	    }else{
	    	var index=ids.indexOf(id);
	    	ids.splice(index,1);
	    }
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
        getInventoryData();
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
    			plant_name: encodeURIComponent(parentForm.find('#plant_name').val().trim()),
    			depot_name: encodeURIComponent(parentForm.find('#depot_name').val().trim()),
    			subarea_name: encodeURIComponent(parentForm.find('#subarea_name').val().trim()),
    			workshop_name: encodeURIComponent(parentForm.find('#workshop_name').val().trim()),
          bin_name: encodeURIComponent(parentForm.find('#bin_name').val().trim()),
          depot_code: encodeURIComponent(parentForm.find('#depot_code').val().trim())
    		}
            
      getInventoryData();
    }
  });
  $('body').on('click', '#export_link', function (e) {
    e.stopPropagation();
      var parentForm=$('#searchForm');
      var urlLeft = '';
      console.log(parentForm.find('#material_item_no').val());
    ajaxData = {
      material_item_no: encodeURIComponent(parentForm.find('#material_item_no').val().trim()),
      material_name: encodeURIComponent(parentForm.find('#material_name').val().trim()),
      plant_name: encodeURIComponent(parentForm.find('#plant_name').val().trim()),
      depot_name: encodeURIComponent(parentForm.find('#depot_name').val().trim()),
      subarea_name: encodeURIComponent(parentForm.find('#subarea_name').val().trim()),
	  workshop_name: encodeURIComponent(parentForm.find('#workshop_name').val().trim()),
      bin_name: encodeURIComponent(parentForm.find('#bin_name').val().trim()),
      depot_code: encodeURIComponent(parentForm.find('#depot_code').val().trim()),
    }
    for (var param in ajaxData) {
      urlLeft += `&${param}=${ajaxData[param]}`;
    }
    let url = '/storagecheck/exportExcel?' + _token + urlLeft;
    $('#export_link').attr('href', url)
  });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
    	e.stopPropagation();
    	var parentForm=$(this).parents('#searchForm');
    	parentForm.find('#material_item_no').val('');
    	parentForm.find('#material_name').val('');
    	parentForm.find('#plant_name').val('');
    	parentForm.find('#depot_name').val('');
		parentForm.find('#subarea_name').val('');
		parentForm.find('#workshop_name').val('');		
    	parentForm.find('#bin_name').val('');
    	parentForm.find('#depot_code').val('');
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
		        // getInitData();
	        },
	        error: function(data) {
	        	layer.close(layerLoading);
	        	noData('导入失败',13);
	        }
	    	})
	  }
	});

}


