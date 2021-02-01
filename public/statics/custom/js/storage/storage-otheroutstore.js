var layerLoading,
layerModal,
pageNo=1,
pageSize=50,
ids=[],
ajaxData={};
viewurl='',
editurl='',
$(function(){
	resetParam();
    getOwner();
	getOtherOutstoreList();
	bindEvent();
});

function bindPagenationClick(totalData,pageSize){
	$('#pagenation').show();
	$('#pagenation').pagination({
		totalData: totalData,
		showData:pageSize,
		current: pageNo,
		isHide: true,
		coping: true,
		homePage:'首页',
		endPage:'末页',
		prevContent:'上页',
		nextContent:'下页',
		jump: true,
		callback:function(api){
			pageNo=api.getCurrent();
			getOtherOutstoreList();
		}
	});
}

//重置搜索参数
function resetParam(){
	ajaxData={
        workorder_code: '',
		own_id: '',
		indent_code:'',
		start_time:'',
		end_time:'',
		status:''
	};
}

//获取其他入库单列表
function getOtherOutstoreList(){
     $('.table_tbody').html('');
	var urlLeft='';
	for(var param in ajaxData){
		urlLeft+=`&${param}=${ajaxData[param]}`;	
	}
	urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['otherOutstore'].list+_token+urlLeft,
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
                noData('暂无数据',9)
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
		fail:function(rsp){
			layer.close(layerLoading);
            noData('获取期初列表失败，请刷新重试',9);		
		},
		complete:function(){
			$('#searchForm .submit').removeClass('is-disabled');			
		}
	},this);
}

//删除其他入库单
function deleteOtherOutstore(id){
    AjaxClient.get({
        url: URLS['otherOutstore'].del+"id="+id+"&"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
            // if(leftNum==1){
            //     pageNo--;
            //     pageNo?null:(pageNo=1);
            // }
            getOtherOutstoreList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
            if(rsp.code==404){
                getOtherOutstoreList();
            }
        }
    },this);
}

//审核
function auditOutstore(id){
    var data={
        id: id,
        _token: TOKEN
    };
    AjaxClient.post({
        url: URLS['otherOutstore'].audit,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layer.close(layerLoading);
        },
        success: function(rsp){
            layer.close(layerLoading);
            getOtherOutstoreList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
            if(rsp.code==404){
                getOtherOutstoreList();
            }   
        }
    },this);
}

//反审
function reauditOutstoreData(id){
    var data={
        id: id,
        _token: TOKEN
    };
    AjaxClient.post({
        url: URLS['otherOutstore'].reaudit,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layer.close(layerLoading);
        },
        success: function(rsp){
            layer.close(layerLoading);
            getOtherOutstoreList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
            if(rsp.code==404){
                getOtherOutstoreList();
            }
        }
    })
}

//获得所属者
function getOwner(val){
  AjaxClient.get({
    url: URLS['otherOutstore'].owner+_token,
    dataType: 'json',
    success: function(rsp){
      layer.close(layerLoading);
      if(rsp.results&&rsp.results.length){
        var lis='',innerhtml='';
        rsp.results.forEach(function(item){
          lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`
        });
        innerhtml=`<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                   ${lis}`;
         $('.el-form-item.owner').find('.el-select-dropdown-list').html(innerhtml);
         if(val){
            $('.el-form-item.owner').find('.el-select-dropdown-item[data-id='+val+']').click();
        }
      }
    },
    fail: function(rsp){
      layer.msg('获取所有者列表失败', {icon: 5,offset: '250px',time: 1500});
    }
  },this)
}

//生成所属者列表
function selectHtml(fileData,typeid,value){
    var innerhtml,lis='',selectName='',selectId='';
   fileData.forEach(function(item){
        if(value!=undefined&&value==item.id){
            selectName=item.name;
            selectId=item.id;
        }
        lis+=`<li data-id="${item.id}" class="el-select-dropdown-item ${value!=undefined&&item.id==value?'selected':''}" class=" el-select-dropdown-item">${item.name}</li>`;
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

//生成列表数据
function createHtml(ele,data){
	var viewurl=$('#otherOutstore_view').val();
    ele.html('');
	editurl=$('#otherOutstore_edit').val();
	data.forEach(function(item,index){
		var tr=`
		    <tr>
                <td></td>
                <td>${tansferNull(item.createdate)}</td>
                <td>${tansferNull(item.code)}</td>
                <td>${tansferNull(item.indent_code)}</td>
                <td>${tansferNull(item.workorder_code)}</td>
                <td>${tansferNull(item.owner_name)}</td>
                <td>${tansferNull(item.employee_surname)}${tansferNull(item.employee_name)}</td>
                <td>${tansferNull(item.remark)}</td>
		        <td class="right nowrap">
                 <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
                 <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button edit">编辑</button></a>
                 <button data-id="${item.id}" class="button pop-button delete">删除</button>
                 <button data-id="${item.id}" class="button pop-button auditing">审核</button>
                 <button data-id="${item.id}" class="button pop-button reauditing">反审核</button></td>
	        </tr>
		`;
		ele.append(tr);
		ele.find('tr:last-child').data("trData",item);
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
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    }); 

    //点击删除
    $('.uniquetable').on('click','.button.pop-button.delete',function(){
        var id = $(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr .active').removeClass('active');
        }},function(index){
            layer.close(index);
            deleteOtherOutstore(id);
        });
    });
    //点击审核
    $('.uniquetable').on('click','.button.pop-button.auditing',function(){
        var id=$(this).attr("data-id");
        console.log($(this).attr("data-id"));
        layer.confirm('将执行审核操作?',{icon: 3, title:'提示',offset: '250px',end:function(){
        }},function(index){
            layer.close(index);
            auditOutstore(id);
        })
    })
    //点击反审
    $('.uniquetable').on('click','button.pop-button.reauditing',function(){
        var id=$(this).attr("data-id");
        layer.confirm('将执行反审操作?',{icon: 3, title:'提示',offset: '250px',end:function(){

        }},function(index){
            layer.close(index);
            reauditOutstoreData(id);
        })
    })
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
        getOtherOutstoreList();
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

    //搜索数据
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
                workorder_code: encodeURIComponent(parentForm.find('#workorder_code').val().trim()),
                own_id: parentForm.find('#owner_id').val(),
                indent_code: encodeURIComponent(parentForm.find('#indentCode').val().trim()),
                start_time: parentForm.find('#start_time_input').text().trim(),
                end_time: parentForm.find('#end_time_input').text().trim(),
                status: parentForm.find('#status').val()
            }
            getOtherOutstoreList();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#workorder_code').val('');
        parentForm.find('#owner_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#indentCode').val('');
        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getOtherOutstoreList();
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

    $('#start_time').on('click', function (e) {
      e.stopPropagation();
      var that = $(this);
      start_time = laydate.render({
          elem: '#start_time_input',
          // max: max,
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
          // max: getCurrentDate(),
          type: 'datetime',
          show: true,
          closeStop: '#end_time',
          done: function (value, date, endDate) {
              that.val(value);
          }
      });
  });
}

