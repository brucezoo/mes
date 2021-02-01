var layerLoading,layerModal,
pageNo=1,
pageSize=20,
ajaxData={},
editurl='';
$(function () {
    resetParam();
    setAjaxData();
    getBOMGroup();
    getBomReleaseRecord();
    getBOMProcess();
    bindEvent();
    $('#item_material_id').autocomplete({
        url: URLS['bomAdd'].materialList+"?"+_token+"&page_no=1&page_size=10"
    });
    $('#replace_material_id').autocomplete({
        url: URLS['bomAdd'].materialList+"?"+_token+"&page_no=1&page_size=10"
    });


    var serech = localStorage.getItem('param');
    if(serech){
        var arr1 = serech.split('&'),param01 = {};
        arr1.forEach(function (item) {
            var arr = item.split('=');
            param01[arr[0]]  =  arr[1];
        });
        if(param01.code){
            $('#searchForm').find('#code').val(param01.code);
        }
        if(param01.name){
            $('#searchForm').find('#name').val(param01.name);
        }
        if(param01.creator_name){
            $('#searchForm').find('#creator_name').val(param01.creator_name);
        }
        if(param01.bom_group_id){
            $('#searchForm').find('#bom_group_id').val(param01.bom_group_id);
        }
        if(param01.item_material_id){
            AjaxClient.get({
                url:URLS['bomAdd'].materialShow+"?"+_token+"&material_id="+param01.item_material_id,
                dataType:'json',
                success:function(rsp){
                    $('#searchForm').find('#item_material_id').val(rsp.results.name).data('inputItem',rsp.results).blur();

                },
                fail:function(rsp){
                }
            },this)
        }
        if(param01.replace_material_id){
            AjaxClient.get({
                url:URLS['bomAdd'].materialShow+"?"+_token+"&material_id="+param01.replace_material_id,
                dataType:'json',
                success:function(rsp){
                    $('#searchForm').find('#replace_material_id').val(rsp.results.name).data('inputItem',rsp.results).blur();

                },
                fail:function(rsp){
                }
            },this)
        }
        if(param01.bom_process_id){
            AjaxClient.get({
                url:URLS['bomAdd'].practiceList+"?"+_token+"&operation_id="+param01.bom_process_id,
                dataType:'json',
                success:function(rsp){
                    $('#searchForm').find('#bom_process_id').val(rsp.results.id).siblings('.el-input').val(rsp.results.name);
                },
                fail:function(rsp){
                }
            },this)
        }

        if(param01.has_workhour){
            $('#searchForm').find('#has_workhour').val(param01.has_workhour);
            if (param01.has_workhour==1){
                $('#searchForm').find('.checks_workhour .el-input').val('是');
            }else if(param01.has_workhour==0){
                $('#searchForm').find('.checks_workhour .el-input').val('否');
            }else {
                $('#searchForm').find('.checks_workhour .el-input').val('--请选择--');
            }
        }
        pageNo = param01.page_no;
        ajaxData={
            code: param01.code,
            name: param01.name,
            item_material_id: param01.item_material_id,
            replace_material_id: param01.replace_material_id,
            // condition: param01.condition,
            bom_group_id: param01.bom_group_id,
            bom_process_id: param01.bom_process_id,
            // operation_id: param01.operation_id,
            has_workhour: param01.has_workhour,
            creator_name: param01.creator_name,
            order: 'asc',
            sort: 'code'
        };

        getBomList();
    }else {
        getBomList();
    }

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
function resetParam(){
    ajaxData={
        code: '',
        name: '',
        item_material_id: '',
        replace_material_id: '',
        condition: '',
        bom_group_id: '',
        bom_process_id: '',
        has_workhour: '',
        creator_name: '',
        is_base: '',
        order: 'asc',
        sort: 'code'
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
            getBomList();
        }
    });
}

function getBomReleaseRecord() {
    AjaxClient.get({
        url: URLS['bomList'].getBomReleaseRecord+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results.length>0){
                $('#show_all_hour_change').show();
                var num_str = {};
                rsp.results.forEach(function (item) {
                    // console.log(num_str.hasOwnProperty(item.bom_code.substr(0,2)))
                    if(!num_str.hasOwnProperty(item.bom_code.substr(0,2))){
                        num_str[item.bom_code.substr(0,2)] = []
                    }
                    num_str[item.bom_code.substr(0,2)].push(item)

                });

                for(var i in num_str){
                    var _div_html = '';

                    num_str[i].forEach(function (item) {
                        _div_html += `<div class="show_desc" data-admin_name="${item.admin_name}" data-ctime="${item.ctime}" data-description="${item.description}" data-version="${item.version}"><a href="/WorkHour/addWorkHour?id=${item.bom_id}">${item.bom_code}</a><i class="ace-icon fa  bigger-110  btn-close-bom-item" data-id="${item.release_record_id}">x</i></div>`
                    });
                    var _html = `<div class="work_hours_container work_hours_container_check">
                                    <div class="work_hours_container_second">${_div_html}</div>
                                </div>`;
                    $("#show_all_hour_change").append(_html);
                }



            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            LayerConfig('fail',rsp.message);

        },
    },this);
}
function deleteReleaseRecord(release_record_id) {
    AjaxClient.post({
        url: URLS['bomList'].deleteReleaseRecord,
        data:{
            release_record_id:release_record_id,
            _token:TOKEN
        },
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','删除成功！');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            LayerConfig('fail',rsp.message);
        },
    },this);
}

function getBomList(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    localStorage.setItem('param',urlLeft);
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['bomList'].list+"?"+_token+urlLeft,
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
                noData('暂无数据',11);
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
            noData('获取物料清单列表失败，请刷新重试',11);
        },
        complete: function(){
            $('#searchBomAttr_from .submit,#searchBomAttr_from .reset').removeClass('is-disabled');
        }
    },this);
}

//删除Bom
function deleteBOM(id,leftNum){
    AjaxClient.get({
        url: URLS['bomList'].bomDelete+"?"+_token+"&bom_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            if(leftNum==1){
                pageNo--;
                pageNo?null:(pageNo=1);
            }
            getBomList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message){
                LayerConfig('fail',rsp.message);
            }else{
                LayerConfig('fail','删除失败');
            }
            if(rsp.code==404){
                pageNo? null:pageNo=1;
                getBomList();
            }
        }
    },this);
}

//获取bom分组
function getBOMGroup(){
    AjaxClient.get({
        url: URLS['bomGroup'].select+"?"+_token,
        dataType: 'json',
        success: function(rsp){
            if(rsp.results&&rsp.results.length){
                var lis='',innerhtml='';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.bom_group_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.bom_group').find('.el-select-dropdown-list').html(innerhtml);
            }    
        },
        fail: function(rsp){
            console.log('获取物料清单分组失败');
        }
    },this);
}
//获取工序
function getBOMProcess(){
    AjaxClient.get({
        url:URLS['bomList'].bomProcess+"?"+_token,
        dataType:'json',
        success:function(res){
            if(res.results&&res.results.list.length){
                var lis='',innerhtml='',lisName='--请选择--';
                var serech = localStorage.getItem('param');
                var arr1 = serech.split('&'),param01 = {};
                arr1.forEach(function (item) {
                    var arr = item.split('=');
                    param01[arr[0]]  =  arr[1];
                });
                res.results.list.forEach(function(item){
                    if (param01.operation_id==item.id){
                        lisName = item.name;
                    }
                    lis+=`<li data-id="${item.id}" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml=`
                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                    ${lis}`;
                $('.el-form-item.bom_process').find('.el-input').val(lisName);
                $('.el-form-item.bom_process').find('.el-select-dropdown-list').html(innerhtml);
            }
        },
        fail:function(res){
            console.log('获取bom工序失败');
        }
    },this)
}
//生成列表数据
function createHtml(ele,data){
    var editurl=$('#bom_edit').val();
    data.forEach(function(item,index){
        var condition='',release_id = '';

        if(item.release_version != ''){
            condition=`<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已发布</span>`;
        }else{
            condition=`<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">未发布</span>`;
        }
        if(item.release_version_bom_id == ""){
            release_id = item.bom_id;
        }else{
            release_id = item.release_version_bom_id;
        }
        var tr=`
            <tr class="tritem" data-id="${item.bom_id}">
                <td>${item.code}</td>
                <td>${item.bom_name}</td>
                <td>${item.bom_no}</td>
                <td>${item.qty}</td>
                <td>${tansferNull(item.bom_group_name)}</td>
                <td>${condition}</td>
                <td>${item.release_version!=''?'<span class="el-status el-status-success">'+item.release_version+'.0</span>':''}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${item.ctime}</td>
                <td>${item.is_base ? '标准件': '--'}</td>
                <td class="right">
                    <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${release_id}"><button data-id="${item.bom_id}" class="button pop-button edit">编辑工时</button></a>
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

function bindEvent() {
    $('body').on('click','#show_all_hour_change',function () {
        if($(this).hasClass('show_all_hour_change')){
            $(this).removeClass('show_all_hour_change')
            $(this).addClass('show_all_hour_change_show')
            $(this).find('.work_hours_container_check').addClass('work_hours_container_show')
            $(this).find('.work_hours_container_check').removeClass('work_hours_container')

        }else {
            $(this).addClass('show_all_hour_change')
            $(this).removeClass('show_all_hour_change_show')
            $(this).find('.work_hours_container_check').removeClass('work_hours_container_show')
            $(this).find('.work_hours_container_check').addClass('work_hours_container')


        }
    })
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
    $('body').on('click','.btn-close-bom-item',function (e) {
        e.stopPropagation();
        layer.close(show_desc);
        $(this).parent('.show_desc').remove();
        if($('.show_desc').length==0){
            $('.work_hours_container').hide()
        }
        var release_record_id = $(this).attr('data-id');
        deleteReleaseRecord(release_record_id);

    })
    var show_desc = '';
    $('body').on('mouseenter', '.show_desc', function () {
        var msg = '';
        msg += '发布人：'+$(this).attr('data-admin_name')+"<br>";
        msg += '时间：'+$(this).attr('data-ctime')+"<br>";
        msg += '描述：'+$(this).attr('data-description')+"<br>";
        msg += '版本：'+$(this).attr('data-version')+"<br>";
        if(msg!=''&&msg!= undefined){
            show_desc = layer.tips(msg, this,
                {
                    tips: [2, '#20A0FF'], time: 0
                });
        }
    }).on('mouseleave', '.show_desc', function () {
        layer.close(show_desc);
    })
    //下拉框点击事件
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
    //下拉框item点击事件
    $('body').on('click','.el-select-dropdown-item:not(.el-auto)',function(e){
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
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        var num=$('#table_bom_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
          deleteBOM(id,num);
          layer.close(index);
        });
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
    //搜索bom
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo=1;
            var $itemMaterial=parentForm.find('#item_material_id');
                // console.log($itemMaterial.data('inputItem'));
            var item_material_id=$itemMaterial.data('inputItem')==undefined||$itemMaterial.data('inputItem')==''?'':
            $itemMaterial.data('inputItem').name==$itemMaterial.val().trim()?$itemMaterial.data('inputItem').material_id:'';
            // console.log(item_material_id);
            var $replaceMaterial=parentForm.find('#replace_material_id');
            // console.log($replaceMaterial.data('inputItem'));
            var replace_material_id=$replaceMaterial.data('inputItem')==undefined||$replaceMaterial.data('inputItem')==''?'':
            $replaceMaterial.data('inputItem').name==$replaceMaterial.val().trim()?$replaceMaterial.data('inputItem').material_id:'';
            ajaxData={
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
                name: encodeURIComponent(parentForm.find('#name').val().trim()),
                creator_name: encodeURIComponent(parentForm.find('#creator_name').val().trim()),
                item_material_id: item_material_id,
                replace_material_id: replace_material_id,
                // condition: parentForm.find('#condition').val(),
                bom_group_id: encodeURIComponent(parentForm.find('#bom_group_id').val()),
                // operation_id:parentForm.find('#bom_process_id').val(),
                bom_process_id:encodeURIComponent(parentForm.find('#bom_process_id').val()),
                has_workhour:encodeURIComponent(parentForm.find('#has_workhour').val()),
                is_base: encodeURIComponent(parentForm.find('#is_base').val()),
                order: 'asc',
                sort: 'code'
            }
            if(parentForm.find('#has_workhour').val()!=''){
                ajaxData.has_workhour=parentForm.find('#has_workhour').val();
            }

            getBomList();

            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));

        }  
    });

    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400);
        setTimeout(function(){
            $('#searchForm .el-item-show').css('background','transparent');
        },400);
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#name').val('');
        parentForm.find('#creator_name').val('');
        parentForm.find('#item_material_id').val('').data('inputItem','').siblings('.el-select-dropdown').find('ul').empty();
        parentForm.find('#replace_material_id').val('').data('inputItem','').siblings('.el-select-dropdown').find('ul').empty();
        parentForm.find('#bom_group_id').val('').siblings('.el-input').val('--请选择--');
        // parentForm.find('#condition').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#bom_process_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#has_workhour').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#is_base').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getBomList();
    });
}



/******************** 辅助李浩 增加待维护工时列表 2019/12/4 ********************* */

var date = {
	page_no: '',
	page_size: '',
	bom_code: ''
}

$('body').on('click', '#sear', function() {

	date.bom_code = $('#sear_val').val();
	count();
})

count();
function count() {

	date.page_no = 1;
	date.page_size = 20;

	AjaxClient.get({
		url: '/Bom/getBomWaitList' + '?' + _token,
		data: date,
		dataType: 'json',
		success: function (rsp) {
			//    console.log(rsp);
		},
		fail: function (rsp) {
			page(rsp.total_records);
		}
	}, this)
}

function page(count) {

	layui.use(['laypage', 'layer'], function () {
		var laypage = layui.laypage
			, layer = layui.layer;
		laypage.render({
			elem: 'demo1'
			, count: count //数据总数
			, limit: 20
			, jump: function (obj) {
				date.page_no = obj.curr;
				date.page_size = 20;

				getListData();
			}
		});

	})
}

function getListData() {
	AjaxClient.get({
		url: '/Bom/getBomWaitList' + '?' + _token,
		data: date,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		success: function (rsp) {
			//    console.log(rsp);
			layer.close(layerLoading);
		},
		fail: function (rsp) {
			$('#t_body').html('');
			layer.close(layerLoading);
			var data = rsp.results;
			data.forEach(function(item) {
				var tr  = getTr(item);
				$('#t_body').append(tr);
			})
		}
	}, this)
}

function getTr(item) {
	var editurls = $('#bom_edit').val();
	let tr  = `
		<tr>
			<td>${item.bom_code}</td>
			<td>${item.bom_name}</td>
			<td>${item.version}</td>
			<td>${item.ctime}</td>
			<td>
				<a class="link_button" style="border: none;padding: 0;" href="${editurls}?id=${item.bom_id}&release=${item.release_record_id}"><button data-id="${item.bom_id}" class="button pop-button">编辑工时</button></a>
			</td>
		</tr>
	`;

	return tr;
}

$('body').on('click', '#put', function() {
	$('#a').attr('href', '/Bom/exportBomWait?_token = 8b5491b17a70e24107c89f37b1036078' + '&bom_code=' + $('#sear_val').val());
})