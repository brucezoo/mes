var layerModal,
  layerLoading,
  pageAdminNo = 1,
  pageSize = 20,
  adminIds = [],
  id = '',
  adminNames = [],
  ajaxAdminData = {
    order: 'desc',
    sort: 'id'
  };
$(function () {
  $("#zwb_upload").bindUpload({
    url: "/Image/uploadPicture",
    callbackPath: "#showImg",
    num: 10,
    type: "jpg|png|gif|svg",
    size: 3,
    owner: "majoranomalies"
  });
  id = getQueryString('id');
  AjaxClient.get({
    url: URLS['quality'].view + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var callInput = $('#showImg');
      var qualityResumeMsg = rsp.results[0],
        key_persons = qualityResumeMsg.key_persons,
        id = qualityResumeMsg.id,
        names_str = qualityResumeMsg.names_str,
        cn_name = qualityResumeMsg.cn_name,
        question_description = qualityResumeMsg.question_description,
        cause = qualityResumeMsg.cause,
        temp_way = qualityResumeMsg.temp_way,
        final_method = qualityResumeMsg.final_method,
        result_final_method = qualityResumeMsg.result_final_method;
      //填充明细
      qualityResumeMsg.majoranomalies_picture.forEach(function (item) {
        callInput.find('.listBox').append('<li>' +
          '<img data-id="' + item.picture_id + '" data-image_id="' + item.id + '"  src="/storage/' + item.image_path + '"/>' +
          '<span data-id="' + item.picture_id + '" data-path="' + item.image_path + '" class="delete"></span>' +
          '</li>');
      })

      $('#choose_admin').val(names_str);
      $('#choose_admin_id').val(key_persons)
      $('#create_name').val(cn_name);
      $('#questionDescription').val(question_description);
      $('#tempWay').val(temp_way);
      $('#cause').val(cause);
      $('#finalWay').val(final_method);
      $('#resultFinalMethod').val(result_final_method);
      $('#abnormal_id').val(id);

      // 基础数据
      $('#baseinfo-sales_order_code').val(qualityResumeMsg.sales_order_code);
      $('#baseinfo-sales_order_project_code').val(qualityResumeMsg.sales_order_project_code);
      $('#baseinfo-code').val(qualityResumeMsg.code);
      $('#baseinfo-material_code').val(qualityResumeMsg.material_code);
      $('#baseinfo-material_name').val(qualityResumeMsg.material_name);

      callInput.find(".delete").bind("click", function () {
        var id = $(this).attr('data-id');
        var path = $(this).attr('data-path');
        var that = this
        AjaxClient.get({
          url: URLS['check'].destroyPicture + "?" + _token + "&id=" + id + "&image_path=" + path,
          dataType: 'json',
          beforeSend: function () {
            layerLoading = LayerConfig('load');
          },
          success: function (rsp) {
            layer.close(layerLoading);
            $(that).parent().hide(100);
          },
          fail: function (rsp) {
            layer.close(layerLoading);
          }
        }, this);
      });
    },
    fail: function (rsp) {

    }
  }, this);
})

//保存申请信息
$('body').on('click', '.save', function () {
  var drawings = []
  if ($('#showImg .listBox li').length > 0) {
    $('#showImg .listBox li').each(function () {
      drawings.push({
        drawing_id: $(this).find('img').attr('data-id') ? $(this).find('img').attr('data-id') : '',
        picture_id: $(this).find('img').attr('data-image_id') ? $(this).find('img').attr('data-image_id') : ''
      })
    })
  }
  // console.log(abnormalApplyMsg);
  var key_persons = $('#choose_admin_id').val(),
    question_description = $('#questionDescription').val().trim(),
    temp_way = $('#tempWay').val().trim(),
    cause = $('#cause').val().trim(),
    result_final_method = $('#resultFinalMethod').val().trim(),
    final_method = $('#finalWay').val().trim(),
    id = $('#abnormal_id').val();
  // console.log(JSON.stringify(abnormalApplyMsg));

  AjaxClient.post({
    url: URLS['quality'].update + '?' + _token + '&key_persons=' + key_persons + '&question_description=' + question_description +
      '&temp_way=' + temp_way + '&cause=' + cause + '&final_method=' + final_method + '&result_final_method=' + result_final_method + '&ids=' + id + '&drawings=' + JSON.stringify(drawings),
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      layer.msg("保存成功", { icon: 1, offset: '250px', time: 2500 });
      window.location.href = '/QC/qualityResumeList';
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      if (rsp && rsp.message != undefined && rsp.message != null) {
        LayerConfig('fail', rsp.message);
      }
    }
  }, this);
})

//责任单位确定按钮
$('body').on('click', '#chooseAdmin .submit', function () {
  layer.close(layerModal);
  $('#choose_admin').val(adminNames.join(','));
  $('#choose_admin_id').val(adminIds.join(','));
})

//选择责任单位触发弹框事件
$('body').on('click', '.pop-button.choose-admin', function () {
  chooseAdminModal();
});

//搜索责任单位
$('body').on('click', '#chooseAdmin .choose-admin', function () {
  if (!$(this).hasClass('is-disabled')) {
    var ele = $('#chooseAdmin');
    ajaxAdminData.cn_name = ele.find('#name').val().trim();
    pageAdminNo = 1;
    getAdminList();
  }
});

// checkbox 点击
$('body').on('click', '.el-checkbox_input:not(.noedit)', function (e) {
  var admin_name = $(this).attr('data-name'),
    admin_id = $(this).attr('data-id');
  $(this).toggleClass('is-checked');
  if ($(this).hasClass('is-checked')) {
    adminNames.push(admin_name);
    adminIds.push(admin_id);
  } else {
    var index = adminNames.indexOf(admin_name);
    if (index > -1) {
      adminNames.splice(index, 1);
    }
    var idIndex = adminIds.indexOf(admin_id);
    if (idIndex > -1) {
      adminIds.splice(idIndex, 1);
    }
  }
});

//添加生成图片功能
function createPicDetail(data) {
  if (data && data.length) {
    var preview = '';
    data.forEach(function (item) {
      var url = '/storage/' + item.image_path;
      if (item.image_path.indexOf('jpg') > -1 || item.image_path.indexOf('png') > -1 || item.image_path.indexOf('jpeg') > -1) {
        preview += `<li><img width="60" height="60" src="${url}" data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}" class='file-preview-image existAttch'></li>`;
      }
    });
    $(".listBox").append(preview);
  }
}

//分页事件
function bindPagenationClick(totalData, pageSize, pageno, flag) {
  $('#pagenation.' + flag).show();
  $('#pagenation.' + flag).pagination({
    totalData: totalData,
    showData: pageSize,
    current: pageno,
    isHide: true,
    coping: true,
    homePage: '首页',
    endPage: '末页',
    prevContent: '上页',
    nextContent: '下页',
    jump: true,
    callback: function (api) {
      pageno = api.getCurrent();
      if (flag == 'admin') {//责任单位弹框
        pageAdminNo = pageno;
        getAdminList();
      }
    }
  });
}

//生成责任单位弹框界面
function chooseAdminModal() {
  var tableHeight = $(window).height() - 280;
  layerModal = layer.open({
    type: 1,
    title: '选择责任人',
    offset: '100px',
    area: '650px',
    shade: 0.1,
    shadeClose: false,
    resize: false,
    move: false,
    content: `<form class="chooseAdmin formModal chooseModal" id="chooseAdmin">
         <ul class="query-item">
              <li style="margin-bottom: 10px;">
                  <div class="el-form-item" style="width: 400px;">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="font-size: 14px;margin-bottom: 0px;text-align: left;width:150px;">责任单位</label>
                          <input type="text" id="name" class="el-input" placeholder="请输入责任单位名称" value="">
                          <button style="margin-left:50px;" type="button" class="el-button choose-search choose-admin">搜索</button>
                      </div>
                  </div>
              </li>
          </ul>
         <div class="table_page">
              <div id="pagenation" class="pagenation admin"></div>
              <div class="table-wrap" style="max-height: ${tableHeight}px;overflow-y: auto;">
                  <table class="sticky uniquetable commontable">
                    <thead>
                      <tr>
                        <th>责任人</th>
                        <th>卡号</th>
                        <th class="right">选择</th>
                      </tr>
                    </thead>
                    <tbody class="table_tbody">
                    </tbody>
                  </table>
              </div>
        </div>
        <div class="el-form-item">
          <div class="el-form-item-div btn-group" style="margin-top: 10px;">
              <button type="button" class="el-button el-button--primary ma-item-ok submit">确定</button>
          </div>
        </div>       
  </form>`,
    success: function (layero, index) {
      //获取选中的责任单位
      getAdminList();
    },
    cancel: function (layero, index) {//右上角关闭按钮
    },
    end: function () {
      pageAdminNo = 1;
      ajaxAdminData = {
        sort: 'id',
        order: 'desc'
      };
      adminData = [];
    }
  })
}

//获取责任单位列表
function getAdminList() {
  var urlLeft = '';
  for (var param in ajaxAdminData) {
    urlLeft += `&${param}=${ajaxAdminData[param]}`;
  }
  urlLeft += "&page_no=" + pageAdminNo + "&page_size=" + pageSize;
  $('.table_tbody').html('');
  AjaxClient.get({
    url: URLS['check'].list + "?" + _token + urlLeft,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var totalData = rsp.paging.total_records;
      if (rsp.results && rsp.results.length) {
        createAdminHtml(rsp);
      } else {
        noData('暂无数据', 3);
      }
      if (totalData > pageSize) {
        bindPagenationClick(totalData, pageSize, pageAdminNo, 'admin');
      } else {
        $('#pagenation.admin').html('');
      }
    },
    fail: function (rsp) {
      layer.close(layerLoading);
      noData('获取责任单位列表失败，请刷新重试', 3);
    }
  }, this);
}

//生成责任单位列表
function createAdminHtml(rsp) {
  var ele = $('#chooseAdmin .table_tbody');
  ele.html('');
  // console.log(rsp);
  if (rsp && rsp.results && rsp.results.length) {
    rsp.results.forEach(function (item, index) {
      var admin_id = item.admin_id, adminExist = false;
      // console.log(adminIds);
      adminIds.forEach(function (val, i) {
        if (val == admin_id) {
          // console.log(admin_id);
          adminExist = true;
        }
      })
      var checkbox = `<span class="el-checkbox_input ${adminExist ? 'is-checked' : ''}" data-name="${item.cn_name}" data-id="${item.admin_id}">
                      <span class="el-checkbox-outset"></span>
                  </span>`;
      var tr = `
              <tr class="tritem" data-id="${item.admin_id}">
                  <td>${item.cn_name}</td>
                  <td>${item.card_id}</td>
                  <td class="right">${checkbox}</td>
              </tr>
          `;
      ele.append(tr);
      ele.find('tr:last-child').data("adminData", item);
    });
  } else {
    var tr = `<tr><td colspan="2" style="text-align: center;">暂无数据</td></tr>`;
    ele.append(tr);
  }
}
