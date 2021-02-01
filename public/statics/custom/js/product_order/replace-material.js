var id,
  LayerLoading,
  LayerModal,
  inData = [],
  mattr = [],
  wtattr = [],
  qty = 0,
  total_workhour = 0,
  po_number = '',
  submitTrue=false,
  wo_number = '',
  factory_id = '',
  results='',
  labelImage = [],
  inspur_material_code, inspur_sales_order_code
item_no = '', sales_order_project_code = '',
  sales_order_code = '',
  maattrbutes = [],
  inmaattrbutes = [],
  inReplaceMaterial=[],
  wtattrbutes = [],
  outData = [], group_routing_package = [],
  ajaxData = {};

$(function () {
  id = getQueryString('id');
  $(".viewRouing").attr('data-id', id)
  let state = getQueryString('state');
  if (state == '1') {
    $('.pop-button.attrview').hide();
    $('.pop-button.printAttr').hide();
  }
  if (id != undefined) {
    getworkOrderView(id);
  } else {
    layer.msg('url缺少链接参数，请给到参数', {
      icon: 5,
      offset: '250px'
    });
  }
  bindEvent();
});

function getworkOrderView(id) {
  AjaxClient.get({
    url: URLS['order'].workOrderShow + _token + "&work_order_id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      $('#wo_number').val(rsp.results.wo_number);
      $('#wt_number').val(rsp.results.wt_number);
      tmp = JSON.parse(rsp.results.in_material);
      results=rsp.results;
      group_routing_package = JSON.parse(rsp.results.group_routing_package);
      qty = rsp.results.qty;
      inspur_material_code = rsp.results.inspur_material_code;
      inspur_sales_order_code = rsp.results.inspur_sales_order_code;
      sales_order_code = rsp.results.sales_order_code;
      sales_order_project_code = rsp.results.sales_order_project_code;
      wo_number = rsp.results.wo_number;
      factory_id = rsp.results.factory_id;
      po_number = rsp.results.po_number;
      total_workhour = rsp.results.total_workhour;
      item_no = rsp.results.item_no;
      outData = JSON.parse(rsp.results.out_material);
      var mattr = outData[0].material_attributes;
      mattr.forEach(function (e1, i1) {
        maattrbutes.push(e1.name + ':' + e1.value + (e1.unit ? e1.unit : ''));
      });

      showInItem(rsp.results.in_material);
      showOutItem(rsp.results.out_material);
      $('.pop-button.attrview').data('modalData', rsp.results);
      $('#qrcode').html('');
      //二维码
      var qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 110,
        height: 110,
      });
      var material_code_arr = [];
      JSON.parse(rsp.results.in_material).forEach(function (item) {
        material_code_arr.push(item.item_no)
      });
      JSON.parse(rsp.results.out_material).forEach(function (item) {
        material_code_arr.push(item.item_no)
      });
      var margin = ($("#qrcode").height() - $("#qrCodeIco").height()) / 2; //控制Logo图标的位置
      $("#qrCodeIco").css("margin", margin);
      var unit = $('.unit').text();
      makeCode(rsp.results.wo_number, rsp.results.wt_number, rsp.results.po_number, rsp.results.item_no, rsp.results.qty, total_workhour, unit, qrcode);

      if (sales_order_code.length > 0) {
        getLabel(sales_order_code, sales_order_project_code, material_code_arr.join());
      }

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取工单详情失败，请刷新重试', {
        icon: 5
      });
    }
  }, this)
}

function getLabel(sale_order_code, line_project_code, material_code_str) {
  AjaxClient.get({
    // url: URLS['order'].getList + _token + "&sale_order_code=" + sale_order_code+ "&line_project_code=" + line_project_code+ "&material_code_str=" + material_code_str,
    url: URLS['order'].getList + _token + "&sale_order_code=10000001&line_project_code=000010&material_code_str=640301000245",
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      labelImage = rsp.results;
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      layer.msg('获取洗标失败，请刷新重试', {
        icon: 5
      });
    }
  }, this)
}
//二维码
function makeCode(wo_number, wt_number, po_number, item_no, qty, unit, total_workhour, qrcode) {
  var elText = "工单：" + wo_number + "\r\n 工艺单：" + wt_number + "\r\n 销售订单号：" + po_number + "\r\n 物料编号：" + item_no + "\r\n 工单数量：" + qty + "\r\n 单位：" + unit + "\r\n 工时：" + total_workhour;
  qrcode.makeCode(elText);
}

//进料
function showInItem(data) {
  var ele = $('.storage_blockquote .item_table .t-body');
  ele.html("");
  var data = JSON.parse(data);
  //console.log(data);
  data.forEach(function (item, index) {
    var imgHtml = ''; // tansferNull(item.drawings)
    if (item.drawings && item.drawings.length) {
      item.drawings.forEach(function (ditem) {
        imgHtml += `<div class="preview_draw_wrap" data-url="${ditem.image_path}">
				<p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
				<p>${ditem.code}</p>
				</div>`;
      })
    } else {
      imgHtml = '';
    }
    tempt = item.material_attributes;
    var inattrs = '';

    tempt.forEach(function (item) {
      inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
    })

    var tr = `
	<tr>  
	<td><button type="button" data-id="${tansferNull(item.work_roder_id)}" data-material='${JSON.stringify(item)}' class="el-button replace-material">替换</button></td>
	<td>${tansferNull(item.item_no)}</td>
	<td>${tansferNull(item.name)}</td>
	<td>${tansferNull(item.qty)}</td>
	<td>${tansferNull(item.bom_commercial)}</td>
	<td style= "line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
	<td>${imgHtml}</td>
	</tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", data);
  })
}

//出料
function showOutItem(data) {
  var data = JSON.parse(data);
  var ele = $('.storage_blockquote .item_table_out .t-body');
  ele.html("");

  data.forEach(function (item, index) {
    tempt = item.material_attributes;
    var inattrs = '';
    tempt.forEach(function (item) {
      inattrs += `<span style="display: inline-block;font-size: 12px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
    })
    var tr = `
	<tr>
	<td>${tansferNull(item.item_no)}</td>
	<td>${tansferNull(item.name)}</td>
	<td>${tansferNull(item.qty)}</td>
	<td>${tansferNull(item.bom_commercial)}</td>
	<td style="line-height:2em;padding: 3px;width: 400px;">${tansferNull(inattrs)}</td>
	<td>${tansferNull()}</td>
	<td style="display:none" class="unit">${tansferNull(item.unit?item.unit:'')}</td>
	</tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", data);
  })
}

//进料工艺属性
function createInModalHtml(ele, data) {
  ele.html('');
  //console.log(data);
  data.forEach(function (item, index) {
    temptWt = item.operation_attributes;
    var inattrsWt = [];
    temptWt.forEach(function (e4, i4) {
      inattrsWt.push(e4.name + ':' + e4.value + (e4.unit ? e4.unit : ''));
    })
    var tr = `
		<tr>
		<td>${tansferNull(item.item_no)}</td>
		<td>${tansferNull(item.name)}</td>
		<td style= "line-height:2em;">${tansferNull(inattrsWt.join('<br>'))}</td>
		</tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", data);
  })
}

//出料工艺属性
function createModalHtml(ele, data) {
  ele.html('');
  data.forEach(function (item, index) {
    var wtattrbutes = [];
    var wtattr = item.operation_attributes;
    wtattr.forEach(function (e5, i5) {
      wtattrbutes.push(e5.name + ':' + e5.value + (e5.unit ? e5.unit : ''));
    });
    tr = `
		<tr>
		<td>${tansferNull(item.item_no)}</td>
		<td>${tansferNull(item.name)}</td>
		<td style="line-height:2em;">${tansferNull(wtattrbutes.join('<br>'))}</td>
		</tr>`;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", data);
  })
}

function bindEvent() {
  //点击弹框
  $('body').on('click', '.attrview', function (e) {
    viewWtattrModal();
  });
  //点击弹框
  $('body').on('click', '.printAttr', function (e) {
    viewWtModal();
  });

  $('body').on('click','.replace-div .delete',function () {
    $(this).parents().parents().eq(0).remove();
  });

  $('body').on('click','.replace-div .add',function () {
    var div = `<div class="material-div" style="display: flex; margin-top: 10px;">
      <div style='position: relative; margin-left: 10px; margin-right: 20px;'>
          <label class="el-form-item-label show-material top-material">物料编码<span style="color: red;">*</span></label>
		  <input type="text" class="el-input material_code" placeholder="请输入物料编码">
		  <p class="error wl"  style="display:none;"><span style="color:red;">物料编码不能为空！</span></p>
          <!-- <span class="fa fa-table" style="position: absolute; top: 13px; right: 10px; z-index: 9; color: #20a0ff; cursor: pointer;" @click="selectMaterialDialog"></span> -->
      </div>
      <div style='margin-right: 20px;'>
          <label class="el-form-item-label show-material top-material">数量<span style="color: red;">*</span></label>
		  <input type="number" class="el-input qty" placeholder="请输入数量">
		   <p class="error sl" style="display:none;"><span style="color:red;">数量不能为空！</span></p>
      </div>
      <div style='margin-right: 20px;'>
          <label class="el-form-item-label show-material top-material" style="display:block;">单位<span style="color: red;">*</span></label>
		  <input type="text" class="el-input bom-commerical" placeholder="请输入单位">
		  <p class="error dw"  style="display:none;"><span style="color:red;">单位不能为空！</span></p>
          <p class="error"><span style="color:red;">必须填写BOM单位，如果不清楚，及时联系工艺部！</span></p>
      </div>
      <div style='margin-right: 20px;'>
          <label class="el-form-item-label show-material">采购仓储</label>
          <input type="text" class="el-input LGFSB" placeholder="请输入采购仓储">
      </div>
      <div style='margin-right: 20px;'>
          <label class="el-form-item-label show-material top-material">生产仓储</label>
          <input type="text" class="el-input LGPRO" placeholder="请输入生产仓储">
      </div>
      <div style='margin-right: 20px;'>
          <label class="el-form-item-label show-material top-material">原因</label>
          <input type="text" class="el-input reason" placeholder="请输入原因">
      </div>
      <div style="display: flex;width:40px;margin-top:25px;">
          <i class="fa fa-plus-square oper_icon add" title="添加" style="font-size: 18px;color: #20a0ff;"></i>
          <i class="fa fa-minus-square oper_icon delete" title="删除" style="margin-right: 5px;font-size: 18px;"></i>
      </div>
    </div>`;
    $(this).parents().parents().eq(0).after(div);
  });

  $('body').on('click', '.save-inmaterial',function(e){
    e.stopPropagation();
    var initMaterial=JSON.parse($("#initMaterial").val());
	var newMaterial=[];
	var flag = 1;
	  $('.wl').css('display', 'none');
	  $('.sl').css('display', 'none');
	  $('.dw').css('display', 'none');

    $('.replace-div .material-div').each(function (k,v) {
      var material_code=$(v).find('.material_code').val();
      var qty=$(v).find('.qty').val();
      var bom_commerical=$(v).find('.bom-commerical').val();
      var reason=$(v).find('.reason').val();
      var LGFSB=$(v).find('.LGFSB').val();
      var LGPRO=$(v).find('.LGPRO').val();
      newMaterial.push({"material_code":material_code,"qty":qty,"commercial":bom_commerical,"exchange_reason":reason,'LGFSB':LGFSB,'LGPRO':LGPRO})
    })
    var data={
      'production_order_id':results.production_order_id,
      'work_order_id':results.work_order_id,
      'wo_number':results.wo_number,
      'operation_id':results.operation_id,
      'initial_material':JSON.stringify({'work_order_item_id':initMaterial.id,'material_code':initMaterial.material_code}),
      'new_material':JSON.stringify(newMaterial),
      'po_number':results.po_number,
      '_token':TOKEN
    }
    // if(submitTrue){
	  var _body = $('.replace-div .material-div');
	  newMaterial.forEach((item, index) => {
			  if (item.material_code == '') {
				  $(_body[index]).find('.wl').css('display', 'block');
				  flag = 0;
			  } else if (item.qty == '') {
				  $(_body[index]).find('.sl').css('display', 'block');
				  flag = 0;
			  } else if (item.commercial == '') {
				  $(_body[index]).find('.dw').css('display', 'block');
				  flag = 0;
			  }

	  })

	  if(flag ==  1) {
				  AjaxClient.post({
					  url: URLS['work'].replaceMaterial,
					  data: data,
					  dataType: 'json',
					  beforeSend: function () {
						  layerLoading = LayerConfig('load');
					  },
					  success: function (rsp) {
						  layer.close(layerLoading);
						  layer.close(layerModal);
						  layer.confirm('替换料操作成功', {
							  icon: 1, title: '提示', offset: '250px', end: function () {
							  }
						  }, function (index) {
							  layer.close(index);
							  getworkOrderView(id);
						  });
					  },
					  fail: function (rsp) {
						  layer.close(layerLoading);
						  layer.close(layerModal);
				  layer.close(layerModal);  
						  layer.close(layerModal);
				  layer.close(layerModal);  
						  layer.close(layerModal);
				  layer.close(layerModal);  
						  layer.close(layerModal);
				  layer.close(layerModal);  
						  layer.close(layerModal);
				  layer.close(layerModal);  
						  layer.close(layerModal);
				  layer.close(layerModal);  
						  layer.close(layerModal);
				  layer.close(layerModal);  
						  layer.close(layerModal);
						  if (rsp && rsp.message != undefined && rsp.message != null) {
							  LayerConfig('fail', rsp.message);
						  }
						  if (rsp && rsp.code == 404) {
							  getComplaint(id);
						  }

					  }
				  }, this);
	  }

	

      
    // }else{
    //   layer.msg('请确定输入正确的替换料!', {
    //     icon: 5,
    //     offset: '250px'
    //   });
    // }
    
  })

  $('body').on('blur','.material-div .material_code',function(e){
    e.stopPropagation();
    var that=$(this);
    var materialCode=$(this).val();
    that.parent().find('.addMaterial').remove();
    // /WorkOrder/checkAddMaterial?material_code=300105003029&_token={{TOKEN}}
    AjaxClient.get({
      // url: URLS['order'].getList + _token + "&sale_order_code=" + sale_order_code+ "&line_project_code=" + line_project_code+ "&material_code_str=" + material_code_str,
      url: URLS['order'].checkCode + _token + "&material_code="+materialCode+"&factory_id="+factory_id,
      dataType: 'json',
      beforeSend: function () {
        layerLoading = LayerConfig('load');
      },
      success: function (rsp) {
        layer.close(layerLoading);
        var results=rsp.results;
        that.parent().append(`<div style="width:200px;" class="addMaterial">${results.name}</div>`);
        that.parents('.material-div').find('.LGFSB').val(results.LGFSB);
        that.parents('.material-div').find('.LGPRO').val(results.LGPRO);
      },
      fail: function (rsp) {
        layer.close(layerLoading);
        layer.msg('获取物料信息失败', {
          icon: 5
        });
      }
    }, this)
    // if(inReplaceMaterial&&inReplaceMaterial.length){
    //   console.log(inReplaceMaterial)
    //   inReplaceMaterial.forEach(function(item,index){
    //     if(item==$(this).val()){
    //       layer.msg('输入的替换料重复，请确定输入的替换料是否正确!', {
    //         icon: 5,
    //         offset: '250px'
    //       });
    //       submitTrue=false;
    //     }else{
    //       inReplaceMaterial.push($(this).val());
    //       submitTrue=true;
    //     }
    //   })
    // }else{
    //   console.log(inReplaceMaterial)
    //   inReplaceMaterial.push($(this).val());
    // }
  })

  $('body').on('click', '.replace-material', function (e) {
    // 工单详情按钮
    e.stopPropagation();
    var material=$(this).attr('data-material');
    var materialJson=JSON.parse(material);
    if (results) {
      var title = `工单${results.wo_number}详情`;
      layerModal = layer.open({
        type: 1,
        title: title,
        offset: '50px',
        area: '1400px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="viewAttr formModal" id="workOrderDialog"><div class="wo-deinfo-wrap" style="max-height: 600px;overflow-y: auto;position: relative;">
                <input type="hidden" id="initMaterial" value='${material}'>
                <div class="block-div" style="display:flex;margin-left: 6px;">
                    <button type="button" class="el-button el-button--primary save-inmaterial" style="font-size: 14px;">保存</button>
                    <div style="overflow-x:auto;margin-top:5px;">原物料编码：${materialJson.material_code} 名称：${materialJson.name} 数量：${materialJson.qty} 单位：${materialJson.bom_commercial}</div>
                </div>
                <div class="replace-div" style="margin-top: 10px;">
                    <div class="material-div" style="display: flex; margin-top: 10px;">
                        <div style='position: relative; margin-left: 10px; margin-right: 20px;'>
                            <label class="el-form-item-label show-material top-material">物料编码<span style="color: red;">*</span></label>
							<input type="text"  required="required" class="el-input material_code" placeholder="请输入物料编码">
							<p class="error wl"  style="display:none;"><span style="color:red;">物料编码不能为空！</span></p>
                            <!-- <span class="fa fa-table" style="position: absolute; top: 13px; right: 10px; z-index: 9; color: #20a0ff; cursor: pointer;"></span> 
                            <p class="error"><span style="color:red;">必须填写BOM单位，如果不清楚，及时联系工艺部！</span></p>-->
                        </div>
                        <div style='margin-right: 20px;'>
                            <label class="el-form-item-label show-material top-material">数量<span style="color: red;">*</span></label>
							<input type="number" class="el-input qty" placeholder="请输入数量">
							 <p class="error sl" style="display:none;"><span style="color:red;">数量不能为空！</span></p>
                        </div>
                        <div style='margin-right: 20px;'>
                            <label class="el-form-item-label show-material top-material">单位<span style="color: red;">*</span></label>
							<input type="text" class="el-input bom-commerical" placeholder="请输入单位">
							<p class="error dw"  style="display:none;"><span style="color:red;">单位不能为空！</span></p>
                            <p class="error"><span style="color:red;">必须填写BOM单位，如果不清楚，及时联系工艺部！</span></p>
                        </div>
                        <div style='margin-right: 20px;'>
                            <label class="el-form-item-label show-material">采购仓储</label>
                            <input type="text" class="el-input LGFSB" placeholder="请输入采购仓储">
                        </div>
                        <div style='margin-right: 20px;'>
                            <label class="el-form-item-label show-material top-material">生产仓储</label>
                            <input type="text" class="el-input LGPRO" placeholder="请输入生产仓储">
                        </div>
                        <div style='margin-right: 20px;'>
                            <label class="el-form-item-label show-material top-material">原因</label>
                            <input type="text" class="el-input reason" placeholder="请输入原因">
                        </div>
                        <div style="margin-top:25px;">
                            <i class="fa fa-plus-square oper_icon add" title="添加" style="font-size: 18px;color: #20a0ff;"></i>
                            <!--<i class="fa fa-minus-square oper_icon delete" title="删除" style="margin-right: 10px;font-size: 18px;"></i>-->
                        </div>
                  </div>
                </div>
                
            </div>
          </form>`,
        success: function (layero, index) {
          
        },
        // cancel: function () {
        //   layer.close(layerModal)
        // },
        // end: function () {
        //   $("#qrCodeIco11").html('');
        // }
      });
    }
  })
}

function makeWOCode(po_number, sales_order_code, wo_number, qty, work_order_id, qrcode) {
    var elText = "生产订单号：" + po_number + "\r\n销售订单号：" + sales_order_code + "\r\n工单：" + wo_number + "\r\n工单数量[PCS]：" + qty + "\r\n工单Id：" + work_order_id;
    qrcode.makeCode(elText);
}

function viewWtattrModal() {
  var lableWidth = 100;
  layerModal = layer.open({
    type: 1,
    title: '查看工艺属性',
    offset: '100px',
    area: '850px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="viewAttr formModal" id="viewattr">
					<div class="in_material">
					  <h3 style="font-size: 14px; font-weight: bold;">消耗品</h3>
		                  <div class="table-container table_page">
	                        <table class="storage_table item_in">
	                          <thead>
	                            <tr>
	                              <th class="thead">消耗品编码</th>
	                              <th class="thead">名称</th>
	                              <th class="thead">工艺属性</th>
	                            </tr>
	                          </thead>
	                          <tbody class="table_tbody">
	                          </tbody>
	                        </table>
	                      </div>  
	                </div> 
                    <div class="out_material"> 
	                    <h3 style="font-size: 14px; font-weight: bold;">产成品</h3>      
	                        <div class="table-container table_page">
		                        <table class="storage_table item_out">
		                          <thead>
		                            <tr>
		                              <th class="thead">产成品编码</th>
		                              <th class="thead">名称</th>
		                              <th class="thead">工艺属性</th>
		                            </tr>
		                          </thead>
		                          <tbody class="table_tbody">
		                          </tbody>
		                        </table>
		                    </div>
                    </div>     
    </form>`,
    success: function (layero, index) {
      var _materialData = $('.pop-button.attrview').data('modalData');
      var _inData = JSON.parse(_materialData.in_material),
        _outData = JSON.parse(_materialData.out_material);
      createInModalHtml($('.in_material .item_in .table_tbody'), _inData);
      createModalHtml($('.out_material .item_out .table_tbody'), _outData);
    },
    end: function () {
      $('.out_material .item_out .table_tbody').html('');
    }
  })
}

function viewWtModal() {
  var wwidth = $(window).width() - 80,
    wheight = $(window).height() - 80,
    mwidth = wwidth + 'px',
    mheight = wheight + 'px';
  var lableWidth = 100;
  layerModal = layer.open({
    type: 1,
    title: '查看工艺',
    offset: '40px',
    area: [mwidth, mheight],
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="viewAttr formModal" id="viewattr">
	
					<div style="height: 40px;">
						<button data-id="" type="button" class="button pop-button" id="printWt">打印工艺单</button>
					</div>
					<div id="dowPrintWt" style="background-color: #F5FCFF">
						<div style="border-bottom: 1px solid #F0F1F1;display: flex;flex-direction: row;flex-wrap: wrap; justify-content: space-between;">
						<div style="flex: 9;">
							<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
								<div style="line-height: 50px;width:30%;margin-left: 10px;">销售订单号：${sales_order_code}</div>
								<div style="line-height: 50px;width:30%;margin-left: 10px;">生产订单号：${po_number}</div>
								<div style="line-height: 50px;width:30%;margin-left: 10px;">工单号：${wo_number}</div>
								<div style="line-height: 50px;width:30%;margin-left: 10px;">能力：${group_routing_package[0].abilitys[0].ability_name}</div>
								<div style="line-height: 50px;width:30%;margin-left: 10px;">工作中心：${group_routing_package[0].workcenters[0].name}</div>
								<div style="line-height: 50px;width:30%;margin-left: 10px;">浪潮销售订单号：${tansferNull(inspur_sales_order_code)}</div>
								<div style="line-height: 50px;width:30%;margin-left: 10px;">浪潮物料号：${tansferNull(inspur_material_code)}</div>
							</div>
						</div>
						<div style="flex: 1;">
							<div style="border: 1px #ccc solid;background: #fff;padding: 6px;border-radius: 4px;display: inline-block;">
								<div id="qrcodewt" style="width:110px; height:110px;margin-top: -50px;">
									<div id="qrCodeIcowt"></div>
								</div>
							</div>
						</div>
					</div>	
						<div id="formPrintWt"></div>
					</div>
					

    </form>`,
    success: function (layero, index) {
      // createPreview(group_routing_package);
      createGroupRouting(group_routing_package)

      //二维码
      var qrcodewt = new QRCode(document.getElementById("qrcodewt"), {
        width: 110,
        height: 110,
      });
      var margin = ($("#qrcodewt").height() - $("#qrCodeIcowt").height()) / 2; //控制Logo图标的位置
      $("#qrCodeIcowt").css("margin", margin);
      var unit = $('.unit').text();
      var wo_number = $('.wo_number').text();
      var wt_number = $('.wt_number').text();
      makeCode(wo_number, wt_number, po_number, item_no, qty, unit, total_workhour, qrcodewt);
    },
    end: function () {
      $('.out_material .item_out .table_tbody').html('');
    }

  })
}

function cpreviewAttr(data, flag) {
  var bgColor = '',
    str = '';
  if (flag == 'in') {
    bgColor = 'ma_in';
  } else {
    bgColor = 'ma_out';
  }
  data.forEach(function (mitem) {
    var ma_attr = '',
      ma_attr_container = '';
    if (mitem.attributes && mitem.attributes.length) {
      mitem.attributes.forEach(function (aitem) {
        if (aitem.from == 'erp') {
          aitem.commercial = "null";
        }
        ma_attr += `<tr><td>${aitem.name}</td><td style="word-break: break-all;">${aitem.value}${aitem.bom_commercial == 'null' ? '' : [aitem.bom_commercial]}</td></tr>`;
      });
      ma_attr_container = `<table>${ma_attr}</table>`;
    } else {
      ma_attr = `<span>暂无数据</span>`;
      ma_attr_container = `<div style="color:#999;margin-top: 20px;">${ma_attr}</div>`;
    }
    str += `<div class="route_preview_material ${bgColor}" style="width: 32%">
              <div class="pre_code">${mitem.material_code}(${mitem.material_name})</div>
              <div class="pre_attr">${ma_attr_container}</div>
              <div class="pre_unit"><span>${mitem.use_num}</span><p>${mitem.bom_commercial}</p></div>
              <div class="pre_unit" style="width: 100px"><span>描述</span><p>${mitem.desc}</p></div>
          </div>`;
  });
  return str;
}

function createGroupRouting(data) {
  var ele = $("#formPrintWt");

  data.forEach(function (item) {
    var material_in = getFilterPreviewData(item.material, 1);
    material_out = getFilterPreviewData(item.material, 2);
    var material_in_html = '';
    material_in.forEach(function (initem) {
      var title = `
						<span style="display: inline-block;font-size: 13px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >物料：${initem.material_name}</span>
						<span style="display: inline-block;font-size: 13px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >编码：${initem.material_code}</span>
						<span style="display: inline-block;font-size: 13px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >数量：${initem.qty}</span>
						<span style="display: inline-block;font-size: 13px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >单位：${initem.bom_commercial}</span>
						`;
      var inattrs = '';
      initem.attributes.forEach(function (item) {
        inattrs += `<span style="display: inline-block;font-size: 7px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
      })
      material_in_html += `<div style="width:400px;margin:2px;border: 1px solid #3FEE89;padding: 2px;">
									<div style="border-bottom: 1px solid #41f68c;background-color: #e2e2e2;" class="title_bg_print">${title}</div>
									<div>${inattrs}</div>
									<div style="height: 30px;margin-left: 10px;">
										<span style="display:inline-block;font-size: 7px;">批次：<div style="width: 60px;height: 25px;border: 1px solid #ccc;display:inline-block;vertical-align: middle;"></div></span>
										<span style="display:inline-block;font-size: 7px;">领料数量：<div style="width: 60px;height: 25px;border: 1px solid #ccc;display:inline-block;vertical-align: middle;"></div></span>
										<span style="display:inline-block;font-size: 7px;">消耗数量：<div style="width: 60px;height: 25px;border: 1px solid #ccc;display:inline-block;vertical-align: middle;"></div></span>
									</div>
								</div>`
    });
    var material_out_html = '';
    material_out.forEach(function (outitem) {
      var title = `
						<span style="display: inline-block;font-size: 13px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >物料：${outitem.material_name}</span>
						<span style="display: inline-block;font-size: 13px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >编码：${outitem.material_code}</span>
						<span style="display: inline-block;font-size: 13px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >数量：${outitem.qty}</span>
						<span style="display: inline-block;font-size: 13px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >单位：${outitem.bom_commercial}</span>
						`;
      var inattrs = '';
      outitem.attributes.forEach(function (item) {
        inattrs += `<span style="display: inline-block;font-size: 7px;border-radius: 2px;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;border: 1px solid #f0f0f0" >${item.name}：${item.value}</span>`;
      })
      material_out_html += `<div style="width:400px;margin:2px;border: 1px solid #EA5456;">
									<div style="border-bottom: 1px solid #f15456;background-color: #e2e2e2;" class="title_bg_print">${title}</div>
									<div>${inattrs}</div>
									<div style="height: 30px;margin-left: 10px;">
										<span style="display:inline-block;font-size: 7px">产成数量：<div style="width: 60px;height: 25px;border: 1px solid #ccc;display:inline-block;vertical-align: middle;"></div></span>
									</div>
								</div>`
    })
    var step_drawings_html = '';
    if (item.step_drawings && item.step_drawings.length) {
      item.step_drawings.forEach(function (ditem) {
        step_drawings_html += `<div style="text-align: center;margin: 10px;" data-url="${ditem.image_path}">
				 <p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
				 <p style="cursor: pointer;">${ditem.code}</p>
				 </div>`
      });
    }

    if (item.composing_drawings && item.composing_drawings.length) {
      item.composing_drawings.forEach(function (ditem) {
        step_drawings_html += `<div style="text-align: center;margin: 10px;" data-url="${ditem.image_path}">
				 <p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
				 <p style="cursor: pointer;">${ditem.code}</p>
				 </div>`
      });
    }
    if (labelImage && labelImage.length) {
      labelImage.forEach(function (ditem) {
        step_drawings_html += `<div style="text-align: center;margin: 10px;" data-url="${ditem.image_path}">
						 <p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" src="/storage/${ditem.image_path}" alt="" width="370" height="170"></p>
						 <p style="cursor: pointer;">洗标：${tansferNull(ditem.image_code)}--物料：${tansferNull(ditem.material_code)}</p>
						 </div>`
      });
    }
    var _thml = `
					<div style="border-bottom: 1px solid #F0F1F1;">
						<h4 style="color: #0510FB;">步骤${item.index}：${item.name}</h4>
						<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
							<div style="flex: 1;color: #3DC08A;">消耗品</div>
							<div style="flex: 11;">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									${material_in_html}
								</div>
							</div>
						</div>
						<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
							<div style="flex: 1;color: #EA5456">产成品</div>
							<div style="flex: 11">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									${material_out_html}
								</div>
							</div>
						</div>
						<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
							<div style="flex: 1;color: #a3ea4f">标准工艺</div>
							<div style="flex: 11">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									<div style="border: 1px solid #a3ea4f;width: 800px;min-height: 30px;margin: 2px;padding: 5px;">${tansferNull(item.description)}</div>
								</div>
							</div>
						</div>
						<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
							<div style="flex: 1;color: #c449ea">特殊工艺</div>
							<div style="flex: 11">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									<div style="border: 1px solid #c449ea;width: 800px;min-height: 30px;margin: 2px;padding: 5px;">${tansferNull(item.comment)}</div>
								</div>
							</div>
						</div>
						<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
							<div style="flex: 1;color: #00a4ed;">图片</div>
							<div style="flex: 11">
								<div style="display: flex;flex-direction: row;flex-wrap: wrap; justify-content: flex-start;">
									${step_drawings_html}
								</div>
							</div>
						</div>

					</div>
					`;
    ele.append(_thml);
  })
}

function getFilterPreviewData(dataArr, type) {
  if (Object.prototype.toString.call(dataArr) == "[object Array]") {
    return dataArr.filter(function (e) {
      return e.type == type;
    });
  } else {
    dataArr = objToArray(dataArr);
    return dataArr.filter(function (e) {
      return e.type == type;
    });
  }

}

function objToArray(array) {
  var arr = []
  for (var i in array) {
    arr.push(array[i]);
  }
  return arr;
}