var layerModal,layerLoading,
    pageNo = 1,
    pageSize = 20,
    checkedOrder = [],
    ajaxData={
        order: 'desc',
        sort: 'id',
    };

var string = '', str = '';

$(function () {
    getApplicationData();
    bindEvent()
});

//重置搜索参数
function resetParam(){
    ajaxData={
        order: 'desc',
        sort: 'id',
    };
}

//获取列表数据
function getApplicationData(){
    $('.table_tbody').html(' ');
    var urlLeft = "&page_no=" + pageNo + "&page_size=" + pageSize;
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    AjaxClient.get({
        url: URLS['application'].list + '?_token=' + TOKEN + urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData = rsp.paging.total_records;
            if (rsp.results && rsp.results.length) {
                createHtml($('.table_tbody'), rsp.results);
            } else {
                noData('暂无数据', 8);
            }
            if (totalData > pageSize) {
                bindPagenationClick(totalData, pageSize);
            } else {
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取数据失败，请刷新重试', 8);
        },
        complete: function(){

        }
    })
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
            getApplicationData();
        }
    });
};

function bindEvent(){
    // 臨時工藝文件選擇
    $('body').on('change', '#attachment', function (e) {
        e.stopPropagation();
        var $attachment = document.querySelector('#attachment');
        uploadOrderFiles($attachment.files);
        $('#attachment').replaceWith('<input id="attachment" name="attachment" type="file" class="file" data-preview-file-type="text">');
    });

    $('body').on('click', '.download-template', function (e) {
        e.stopPropagation();
        window.location.href = URLS['application']['downloadTemplate']+'?_token=' + TOKEN;
    });

    //checkbox 点击
    $('body').on('click', '.el-checkbox_input', function (e) {
        e.preventDefault();

        $(this).toggleClass('is-checked');
        var trData = $(this).parents('.tritem').attr('data-id');
        if ($(this).hasClass('is-checked')) {
            checkedOrder.push(trData);
        } else {
            var index = checkedOrder.indexOf(trData);
            index > -1 ? checkedOrder.splice(index, 1) : null;
        }
    });

    $('body').on('click', '.push-ids', function (e) {
        e.stopPropagation();
        if (!checkedOrder.length) {
            LayerConfig('fail','请至少选择一个订单！');
            return;
        }

        layer.confirm(`共${checkedOrder.length}个订单将执行推送操作?`, {icon: 3, title:'提示',offset: '250px',end:function(){

            }}, function(index){
            layer.close(index);
            pushFinishedproduct(checkedOrder.join(','));
        });
    });
}

function createHtml(ele, data) {
    ele.html('');
    data.forEach(function (item, index) {
        var tr = `
            <tr class="tritem" data-id="${item.id}">
                <td style="width:45px;">
                    <span class="el-checkbox_input ${checkedOrder.includes(item.id.toString()) ? 'is-checked': ''}">
                        <span class="el-checkbox-outset"></span>
                    </span>
                </td>
                <td>${tansferNull(item.inspectiontime)}</td>
                <td>${tansferNull(item.sales_order_code)}</td>
                <td>${tansferNull(item.sales_order_project_code)}</td>
                <td>${tansferNull(item.material_code)}</td>
                <td>${tansferNull(item.customer_code)}</td>
                <td>${tansferNull(item.customer)}</td>
                <td>${tansferNull(item.factoryarea)}</td>
                <td>${tansferNull(item.status)==1?'已推送':'未推送'}</td>
                <td>${tansferNull(item.applicant)}</td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
    });
}

// 订单导入
function uploadOrderFiles(files) {
    if (!files.length) {
        return;
    }

    var ajaxSubmitData = new FormData();
    ajaxSubmitData.append('_token', TOKEN);
    ajaxSubmitData.append('file', files[0]);

    AjaxClient.post({
        url: URLS['application'].excelImport,
        data: ajaxSubmitData,
        dataType: 'json',
        contentType: false,
        processData: false,
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','导入成功');
            checkedOrder = [];
            getApplicationData();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message || '导入失败，请检查数据！');
        }
    }, this);
}

// 推送订单
function pushFinishedproduct(ids) {
    AjaxClient.get({
        url: URLS['application'].pushFinishedproduct + '?_token=' + TOKEN + '&ids=' + ids,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success', '推送成功！');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message);
        }
    })
}


// 添加批量删除   2019/11/28
$('body').on('click', '.del-all', function() {

	string = '';
	//  后端要求将数组变换字符串  x，x，
	checkedOrder.forEach(function(item,index) {

		if(index == 0) {
			string = item;
		} else {
			string += ',' + item;
		}
	})
	
	AjaxClient.get({
		url: '/Inspectionapplication/deleteFinishedproduct' + '?_token=' + TOKEN + '&id=' + string,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);

			if(rsp.results.length == 0){
				LayerConfig('success', '批量删除成功！');
				getApplicationData();
			} else {
				str = '';
				rsp.results.forEach(function(item,index) {
					if(index == 0) {
						str = '{' + item.sales_order_code + '/' + item.sales_order_project_code + '}';
					} else {
						str += ',' + '{' + item.sales_order_code + '/' + item.sales_order_project_code + '}';
					}
					LayerConfig('fail', str + '已推送不可删除！');
				})
			}
			
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			LayerConfig('fail', '请勾选再删除！');
		}
	})

})
