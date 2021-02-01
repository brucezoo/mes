var layerModal,
    layerLoading,
    pageNo=1,
    status_type=0,
    itemPageNo=1,
    pageSize=20,
    ajaxData={},
    ajaxOutData={};
$(function () {
    var ajaxDataStr = window.location.hash;
    var key = sessionStorage.getItem('key');
    if(ajaxDataStr !== undefined && ajaxDataStr !== '' && key!='1'){
        sessionStorage.setItem('key', '1');
        window.location.reload();
    }else {
        if(status_type==1){
            $("#searchSTallo_from").hide();
            $("#searchOutsource_from").show();
            setAjaxOutData();
            getOutPickingList();
        }else {
            $("#searchSTallo_from").show();
            $("#searchOutsource_from").hide();
            setAjaxData();
            getPickingList();
        }
    }
    bindEvent();
});
$(window).load(function(){
    sessionStorage.removeItem('key');
});
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            pageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
        }catch (e) {
            resetParam();
        }
    }
}
function setAjaxOutData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.itemPageNo;
            itemPageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).itemPageNo;
        }catch (e) {
            resetOutParam();
        }
    }
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
            getPickingList();
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        work_order_code: '',
        product_order_code: '',
        type: '',
        status: ''
    };
}
//重置搜索参数
function resetOutParam(){
    ajaxOutData={
        code: '',
        work_order_code: '',
        po_number: '',
        EBELN: '',
        LIFNR: '',
        sales_order_code: '',
        status:''
    };
}

//获取粗排列表
function getPickingList(){
    var urlLeft='&push_type=2';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['work'].MaterialRequisition+"?"+_token+urlLeft+"&issuance=1",
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // if(layerModal!=undefined){
            //     layerLoading = LayerConfig('load');
            // }
            ajaxData.pageNo=pageNo;
            ajaxData.status_type=status_type;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData=rsp.paging.total_records;
            var _html=createHtml(rsp);
            $('.table_page').html(_html);
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation.unpro').html('');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',9);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    },this)
}

//生成未排列表数据
function createHtml(data){
	console.log(data);
    var viewurl=$('#workOrder_view').val();
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){
            trs+= `
			<tr>
			<td><input type="checkbox" lay-skin="primary " data-id="${item.material_requisition_id}" class="check"></td>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.product_order_code)}</td>
			<td>${tansferNull(item.work_order_code)}</td>
			<td>${tansferNull(item.workbench_code)}</td>
			<td>${tansferNull(item.send_depot_name)}</td>
			<td>${tansferNull(item.factory_name)}</td>
            				
            <td>${tansferNull(item.employee_name)}</td>
			<td>${tansferNull(item.type==2?checkReturnStatus(item.status):checkPickingStatus(item.status))}</td>
			<td>${tansferNull(item.ctime)}</td>
			<td>${tansferNull(item.time)}</td> <!-- 2019/12/3 辅助陶玲玲 增加发料时间 -->
			<td class="right">
	         <a class="button pop-button view" href="${viewurl}?id=${item.material_requisition_id}">编辑</a>       
	        </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="10" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
					<tr>
						<th class="left nowrap tight"><input type="checkbox" lay-skin="primary" id="all"></th>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">工位</th>
                        <th class="left nowrap tight">线边仓</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">领料人</th>
                        <th class="left nowrap tight">状态</th>
						<th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">发料时间</th>  <!-- 2019/12/3 辅助陶玲玲 增加发料时间 -->
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro"></div>`;
    return thtml;
}


//  全选
$('body').on('click', '#all', function () {
	all_checked = $('.table_tbody .check');
	if (document.getElementById('all').checked == true) {
		for (let i = 0; i < all_checked.length; i++) {
			all_checked[i].checked = true;
		}
	} else {
		for (let i = 0; i < all_checked.length; i++) {
			all_checked[i].checked = false;
		}
	}
})


// 反选
$('body').on('change', '.table_tbody .check', function () {
	all_checked = $('.table_tbody .check');
	if (this.checked == false) {
		document.getElementById('all').checked = false;
	} else {
		document.getElementById('all').checked = true;
		for (let i = 0; i < all_checked.length; i++) {
			if (all_checked[i].checked == false) {
				return document.getElementById('all').checked = false;
			}
		}
	}
})

$('body').on('click', '#allSend', function () {

	allChecked = $('.table_tbody .check');
	let arrSend = [];

	for (let i = 0; i < allChecked.length; i++) {
		if ($(allChecked[i]).prop('checked') == true) {
			arrSend.push($(allChecked[i]).attr('data-id'));
		}
	}

	if (arrSend.length == 0) {
		layer.alert('请先勾选，再进行一键发料！');
	} else {

		let str = '';
		arrSend.forEach(function (item, index) {
			if (index == 0) {
				str = item;
			} else {
				str = str + ',' + item;
			}
		})
		getTab(str);
	}

})

function getTab(str) {
	AjaxClient.get({
		url: '/MaterialRequisition/batchShopdeliverylist' + "?" + _token + '&mr_id=' + str,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {

			layerModal = layer.open({
				type: 1,
				title: '发料列表',
				skin: 'layui-layer-rim', //加上边框
				area: ['1800px', '600px'], //宽高
				content: `
				<div style="overflow: hidden; overflow-y:scroll;">
					<div style="height: 500px;" style="">
						<table class="layui-table">
							<thead>
								<tr>
									<th>领料单号</th>
									<th>销售订单</th>
									<th>行项目</th>
									<th>批次</th>
									<th>物料编码</th>
									<th>物料名称</th>
									<th>接收车间</th>
									<th>发出车间</th>
									<th>需求数量</th>
									<th>发料数量</th>
									<th>库存数量</th>
									<th>计量单位</th>
								</tr> 
							</thead>
							<tbody  id="tbody_tr">
								
							</tbody>
						</table>
					</div>
				</div>
				<div>
					<button type="button" style="float:right; margin-right:20px;margin-top:10px;" class="el-button" id="ok">确定</button>
				</div>
			`
			});

			layer.close(layerLoading);
			$('#tbody_tr').html('');
			rsp.results.forEach(function (item) {
				let tr = getTr(item);
				$('#tbody_tr').append(tr);
			})


		},
		fail: function (rsp) {
			layer.alert(rsp.message);
			layer.close(layerLoading);
		}

	}, this)
}


function getTr(item) {
	let tr = `
		<tr data-id='${JSON.stringify(item)}'>
			<td>${item.mr_code}</td>
			<td>${item.sale_order_code}</td>
			<td>${item.sales_order_project_code}</td>
			<td>${item.batch}</td>
			<td>${item.material_code}</td>
			<td>${item.material_name}</td>
			<td>${item.line_depot_name}</td>
			<td>${item.depot_name}</td>
			<td>${item.actual_send_qty}</td>
			<td><input type="text" class = "fl_qty" value="${item.actual_send_qty}"></td>
			<td id="kc" data-id="${item.storage_validate_quantity}">${item.storage_validate_quantity}</td>
			<td>${item.bom_unit}</td>
		</tr>
	`;
	return tr;
}

$('body').on('click', '#ok', function () {

	let iAjax = [];
	let table = $('#tbody_tr tr');
	for (let i = 0; i < table.length; i++) {
		let item = JSON.parse($(table[i]).attr('data-id'));
		iAjax.push({
			mr_id: item.mr_id,
			status: item.status,
			type: item.type,
			batch_id: item.batch_id,
			actual_receive_qty: $(table[i]).find('.fl_qty').val(),
		});
	}

	AjaxClient.post({
		// url: '/OutWorkShop/batchOutdelivery' + "?" + _token + '&data=' + JSON.stringify(iAjax),
		url: '/MaterialRequisition/batchShopdelivery',
		dataType: 'json',
		data: {
			data: JSON.stringify(iAjax),
			_token: TOKEN
		},
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			layer.confirm('一键发料成功！', {
				btn: ['确定',], //可以无限个按钮
				closeBtn: 0
			}, function (index, layero) {
				layer.close(index);
				layer.close(layerModal);
				// getOutPickingList();
					getPickingList()
			});
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			layer.msg(rsp.message, { icon: 2, offset: '250px' });
		}
	}, this)
})








function check(id) {
    AjaxClient.get({
        url: URLS['work'].check +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                LayerConfig('success','成功！');

                getPickingList();

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});

            // layer.msg('获取工单详情失败，请刷新重试', 9);
        }
    }, this)
}
function returnAudit(id) {
    AjaxClient.get({
        url: URLS['work'].returnAudit +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                LayerConfig('success','成功！');

                getPickingList();

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});
        }
    }, this)
}

function deleteItem(id) {
    AjaxClient.get({
        url: URLS['work'].delete +"?"+ _token + "&material_requisition_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
                LayerConfig('success','删除成功！');
                getPickingList();

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','删除失败！错误日志为：'+rsp.message)
        }
    }, this)
}

function submint(id,type) {
    AjaxClient.get({
        url: URLS['work'].submit +"?"+ _token + "&id=" + id+ "&type=" + type,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results.RETURNCODE==0){
                LayerConfig('success','推送成功！');
                getPickingList();
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail','推送失败！错误日志为：'+rsp.message)
        }
    }, this)
}

function bindItemPagenationClick(totalData,pageSize){
    $('#item_pagenation').show();
    $('#item_pagenation').pagination({
        totalData:totalData,
        showData:pageSize,
        current: itemPageNo,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            itemPageNo=api.getCurrent();
            getOutPickingList();
        }
    });
}
//获取委外列表
function getOutPickingList(){
    var urlLeft='';
    for(var param in ajaxOutData){
        urlLeft+=`&${param}=${ajaxOutData[param]}`;
    }
    if(itemPageNo==undefined){
        itemPageNo=1;
    }
    urlLeft+="&page_no="+itemPageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['outsource'].pageIndex+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // if(layerModal!=undefined){
            //     layerLoading = LayerConfig('load');
            // }
            ajaxData.itemPageNo=itemPageNo;
            ajaxData.status_type=status_type;
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            var totalData=rsp.paging.total_records;
            var _html=createItemHtml(rsp);
            $('.table_page').html(_html);
            if(totalData>pageSize){
                bindItemPagenationClick(totalData,pageSize);
            }else{
                $('#item_pagenation.unpro').html('');
            }

        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取领料单列表失败，请刷新重试',9);
        },
        complete: function(){
            $('#searchForm .submitOutsource').removeClass('is-disabled');
        }

    },this)
}
//生成委外列表数据
function createItemHtml(data){
    var trs='';
    if(data&&data.results&&data.results.length){
        data.results.forEach(function(item,index){

            let halfFinishedProduct = '';
            let halfFinishedProductCode = '';
            
            if (item.material_list.length) {
                item.material_list.forEach(function(materItem) {
                    halfFinishedProduct += `<div><span>${materItem.name}</span></div>`;
                    halfFinishedProductCode += `<div><span>${materItem.item_no}</span></div>`;
                })
            }

            trs+= `
			<tr>
			<td>${tansferNull(item.sales_order_code)}</td>
			<td>${tansferNull(item.sales_order_project_code)}</td>
			<td>${tansferNull(item.po_number)}</td>
			<td>${tansferNull(item.sub_number)}</td>
			<td>${tansferNull(item.code)}</td>
			<td>${tansferNull(item.BANFN)}</td>
            <td>${tansferNull(item.BNFPO)}</td>
            
            <td>${tansferNull(item.LIFNR)}</td>
            <td>${tansferNull(item.EBELN)}</td>

			<td>${tansferNull(item.depot_name)}</td>
			<td>${tansferNull(item.employee_name)}</td>
			<td>${tansferNull(item.time)}</td>
			<td>${tansferNull(item.status==0?'未审核':item.status==1?'审核通过':'')}</td>
            <td>${tansferNull(item.type==1?'领料':item.type==2?'补料':item.type==3?'退料':'')}</td>
            <td>${halfFinishedProductCode}</td>
            <td style="max-width: 220px; word-break: break-all;">${halfFinishedProduct}</td>
			<td class="right">
			 ${item.status==0?`<button data-id="${item.id}" class="button pop-button out_item_audit">审核</button>`:''}
	         <a class="button pop-button view" href="/Outsource/editOutsourceOrder?id=${item.id}">查看</a>
	          ${item.status == 0 ?`<a class="button pop-button view" href="/Outsource/sendOutsourceOrder?id=${item.id}">${item.type==3?'实退':'实发'}</a>`:''}
	        </td>
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="17" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div" >
            <table id="work_order_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">销售订单号</th>
                        <th class="left nowrap tight">销售行项号</th>
                        <th class="left nowrap tight">生产订单号</th>
                        <th class="left nowrap tight">工单号</th>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">采购申请编号</th>
                        <th class="left nowrap tight">采购申请的项目编号</th>

                        <th class="left nowrap tight">供应商编码</th>
                        <th class="left nowrap tight">采购凭证编号</th>

                        <th class="left nowrap tight">车间</th>
                        <th class="left nowrap tight">员工</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">状态</th>                   
                        <th class="left nowrap tight">类型</th> 
                        <th class="left nowrap tight">物料编码</th> 
                        <th class="left nowrap tight">半成品详情</th>                  
                        <th class="right nowrap tight">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="item_pagenation" class="pagenation unpro"></div>`;
    return thtml;
}
function chooseStatus(type) {
    switch(Number(type))
    {
        case 1:
            return `<li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                    <li data-id="1" class=" el-select-dropdown-item">未接收</li>
                    <li data-id="2" class=" el-select-dropdown-item">待发料</li>
                    <li data-id="3" class=" el-select-dropdown-item">已发送</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        case 2:
            return `<li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                    <li data-id="1" class=" el-select-dropdown-item">未推送</li>
                    <li data-id="2" class=" el-select-dropdown-item">未接收</li>
                    <li data-id="3" class=" el-select-dropdown-item">待入库</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        case 7:
            return `<li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                    <li data-id="1" class=" el-select-dropdown-item">未接收</li>
                    <li data-id="2" class=" el-select-dropdown-item">待发料</li>
                    <li data-id="3" class=" el-select-dropdown-item">已发送</li>
                    <li data-id="4" class=" el-select-dropdown-item">完成</li>`;
            break;
        default:
            break;
    }
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
    $('body').on('click','.choose_status',function(e){
        e.stopPropagation();
        var type = $(this).attr('data-id');
        $('#searchForm').find('#status').val('').siblings('.el-input').val('--请选择--');
        var _html = chooseStatus(type);
        $('#show_status').html(_html);
    });

    $('body').on('click','.out_item_audit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行审核操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            outCheck(id);
        });

    });

    $('body').on('click', '.el-tap-wrap .el-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            var _type = $(this).attr('data-status');
            status_type=_type;
            if(status_type==1){
                $("#searchSTallo_from").hide();
                $("#searchOutsource_from").show();
                getOutPickingList();
            }else {
                $("#searchSTallo_from").show();
                $("#searchOutsource_from").hide();
                getPickingList();
            }
        }
    });
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
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

    //搜索
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
            ajaxData={
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                work_order_code: encodeURIComponent(parentForm.find('#work_order_code').val().trim()),
                product_order_code: encodeURIComponent(parentForm.find('#product_order_code').val().trim()),
                type: encodeURIComponent(parentForm.find('#type').val().trim()),
                status: encodeURIComponent(parentForm.find('#status').val().trim()),
            };
            pageNo=1;
            getPickingList();
        }
    });
    //搜索
    $('body').on('click','#searchForm .submitOutsource',function(e){
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
            ajaxOutData={
                code: encodeURIComponent(parentForm.find('#out_code').val().trim()),
                work_order_code: encodeURIComponent(parentForm.find('#out_work_order_code').val().trim()),
                po_number: encodeURIComponent(parentForm.find('#out_product_order_code').val().trim()),
                EBELN: encodeURIComponent(parentForm.find('#out_Ebeln').val().trim()),
                LIFNR: encodeURIComponent(parentForm.find('#supplierCode').val().trim()),
                sales_order_code: encodeURIComponent(parentForm.find('#salesOrderCode').val().trim()),
                status: encodeURIComponent(parentForm.find('#out_status').val().trim()),
            };
            itemPageNo=1;
            getOutPickingList();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('backageground', 'transparent');
        });
        var parentForm=$('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#work_order_code').val('');
        parentForm.find('#product_order_code').val('');
        parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        pageNo=1;
        resetParam();
        getPickingList();
    });
    //重置搜索框值
    $('body').on('click','#searchForm .resetOut',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('backageground', 'transparent');
        });
        var parentForm=$('#searchForm');
        parentForm.find('#out_code').val('');
        parentForm.find('#out_work_order_code').val('');
        parentForm.find('#out_product_order_code').val('');
        parentForm.find('#out_Ebeln').val('');
        parentForm.find('#supplierCode').val('');
        parentForm.find('#salesOrderCode').val('');
        pageNo=1;
        resetOutParam();
        getOutPickingList();
    });
    $('body').on('click','.item_submit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type');

        layer.confirm('您将执行推送操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            submint(id,type);
        });

    });
    $('body').on('click','.delete',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        layer.confirm('您将执行删除操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            deleteItem(id);
        });

    });
    $('body').on('click','.item_check',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行审核操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            check(id);
        });

    });
    $('body').on('click','.returnAudit',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');

        layer.confirm('您将执行审核操作！?', {icon: 3, title:'提示',offset: '250px',end:function(){
        }}, function(index){
            layer.close(index);
            returnAudit(id);
        });

    });

    //导出
    $('body').on('click', '.el-form-item-div .export', function (e) {
      var urlLeft='';
      for(var param in ajaxOutData){
          urlLeft+=`&${param}=${ajaxOutData[param]}`;
      }
      if(itemPageNo==undefined){
          itemPageNo=1;
      }
      let url = "/OutWorkShop/export?" + urlLeft;
      $('#exportExcel').attr('href', url)
    })
}
function outCheck(id) {
    AjaxClient.get({
        url: URLS['outsource'].check +"?"+ _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
                LayerConfig('success','成功！');
                getPickingList();

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px'});
        }
    }, this)
}

function checkPickingStatus(status) {
    switch(status)
    {
        case 1:
            return '未接收';
            break;
        case 2:
            return '待发料';
            break;
        case 3:
            return '已发送';
            break;
        case 4:
            return '完成';
            break;
        default:
            break;
    }
}
function checkReturnStatus(status) {
    switch(status)
    {
        case 1:
            return '未接收';
            break;
        case 2:
            return '未接收';
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

