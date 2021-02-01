var id, type, type_code, DWERKS, pageNoItem = 1, pageSizeItem = 50;
$(function () {
  id = getQueryString('id');

  if (id != undefined) {
    getOutsourceOrderItem(id);
  } else {
    layer.msg('url缺少链接参数，请给到参数', {
      icon: 5,
      offset: '250px'
    });
  }
  bindEvent();
});
function getOutsourceOrderItem(id) {
  AjaxClient.get({
    url: URLS['outsource'].OutWorkShop + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      $('#BNFPO').val(rsp.results[0].BNFPO);
      $('#partner_name').val(rsp.results[0].partner_name);
      $('#BANFN').val(rsp.results[0].BANFN);
      $('#EBELN').val(rsp.results[0].EBELN);
      $('#code').val(rsp.results[0].code);
      $('#employee').val(rsp.results[0].employee_name);
      status = rsp.results[0].status;
      if (rsp.results[0].status == 0) {
        $('.storage').show()
      }
      if (rsp.results[0].status == 1) {
        $('.return').show()
      }
      createOutsourceHtml($('.item_outsource_table .t-body'), rsp.results[0].groups);

    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail', '获取领料单失败！')
    }
  }, this);
}

function bindEvent() {
  $('body').on('click', '.review', function (e) {
    e.stopPropagation();
    reviewOutsourceWorkShop();
  })
}

function reviewOutsourceWorkShop() {
  AjaxClient.get({
    url: URLS['outsource'].outsourceWorkShopReview+"?"+_token+"&id="+id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('success','审核成功！');
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      LayerConfig('fail',rsp.message);
    }
  }, this);
}

function createOutsourceHtml(ele, data) {
  ele.html('');
  data.forEach(function (item) {
    var tr = `
            <tr class="tritem" data-id="${item.id}" data-material="${item.material_id}" data-unit="${item.unit_id}" data-rated="${item.rated}" data-depot="${item.depot_id}" data-inve="${item.inve_id}">
            <td  class="sale_order_code">${tansferNull(item.sale_order_code)}</td>
            <td  class="po_number">${tansferNull(item.po_number)}</td>
            <td  class="DMATNR">${tansferNull(item.material_code)}</td>
            <td  class="material_name">${tansferNull(item.material_name)}</td>
            <td>${tansferNull(item.attribute)}</td>
            <td  class="lot">${tansferNull(item.lot)}</td>
            <td  class="depot_name">${tansferNull(item.depot_name)}</td>
            <td  class="storage_validate_quantity">${tansferNull(item.storage_validate_quantity)}</td>
            <td  class="BNFPO">${tansferNull(item.rated)}</td>
            <td><input type="number" ${status==1?'readonly':''}  min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.qty}"  class="el-input demand_num" ></td>
            <td><input type="number" ${status==1?'readonly':''}  min="0" style="line-height: 40px;" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" value="${item.actual_send_qty}"  class="el-input actual_send_qty" ></td>
            <td  class="DMEINS">${tansferNull(item.unit_commercial)}</td>         
        </tr>
        `;
    ele.append(tr);
    ele.find('tr:last-child').data("trData", item);
  })
}
